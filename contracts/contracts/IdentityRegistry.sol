// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title IdentityRegistry - Soulbound NFT Identity for OmnID
/// @notice Each OmnID identity is a non-transferable ERC-721 NFT on Base.
///         Personal data stored off-chain; only hashes live on-chain.
///         SSN commitment enforces uniqueness without storing the actual SSN.
///         The NFT cannot be transferred — only recovered via the recovery address.
contract IdentityRegistry is ERC721, ERC721Enumerable, AccessControl {
    using Strings for uint256;
    using Strings for address;

    // ──────────────────── Structs ────────────────────

    struct Identity {
        address owner;
        address recoveryAddress;
        bytes32 metadataHash;     // IPFS CID hash — actual data stored off-chain
        bytes32 ssnCommitment;    // keccak256(SSN) — ensures no duplicate SSNs
        bytes32 phoneHash;        // keccak256(phone number)
        bytes32 passkeyHash;      // passkey credential ID hash
        uint256 tokenId;          // NFT token ID
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }

    // ──────────────────── State ────────────────────

    mapping(address => Identity) private identities;
    address[] public identityList;
    mapping(address => bool) public hasIdentity;
    uint256 public identityCount;
    uint256 private _nextTokenId;

    // SSN uniqueness enforcement — no SSN may be used twice
    mapping(bytes32 => bool) public ssnUsed;

    // Linked OAuth / platform account hashes
    mapping(address => bytes32[]) public linkedAccounts;

    // Token ID → owner address (for recovery transfers)
    mapping(uint256 => address) private _tokenOwner;

    // Flag to allow recovery transfers (bypasses soulbound check)
    bool private _recoveryTransfer;

    // ──────────────────── Events ────────────────────

    event IdentityCreated(
        address indexed owner,
        uint256 indexed tokenId,
        bytes32 metadataHash,
        address recoveryAddress,
        bytes32 ssnCommitment,
        uint256 timestamp
    );

    event IdentityUpdated(
        address indexed owner,
        bytes32 oldMetadataHash,
        bytes32 newMetadataHash,
        uint256 timestamp
    );

    event RecoveryAddressSet(
        address indexed owner,
        address indexed recoveryAddress
    );

    event IdentityRecovered(
        address indexed oldOwner,
        address indexed newOwner,
        uint256 indexed tokenId,
        uint256 timestamp
    );

    event IdentityDeactivated(address indexed owner, uint256 timestamp);
    event IdentityReactivated(address indexed owner, uint256 timestamp);

    event AccountLinked(address indexed owner, bytes32 accountHash, uint256 timestamp);
    event AccountUnlinked(address indexed owner, bytes32 accountHash, uint256 timestamp);
    event PhoneHashSet(address indexed owner, uint256 timestamp);
    event PasskeySet(address indexed owner, uint256 timestamp);

    // ──────────────────── Constructor ────────────────────

    constructor() ERC721("OmnID", "OMNID") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _nextTokenId = 1; // Token IDs start at 1
    }

    // ──────────────────── Soulbound: Block Transfers ────────────────────

    /// @dev Override to make tokens soulbound (non-transferable).
    ///      Only allows minting (from=0), burning (to=0), and recovery transfers.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);

        // Allow: minting (from == 0), burning (to == 0), recovery (flag set)
        if (from != address(0) && to != address(0) && !_recoveryTransfer) {
            revert("OmnID: soulbound, cannot transfer");
        }

        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    // ──────────────────── Modifiers ────────────────────

    modifier onlyIdentityOwner() {
        require(hasIdentity[msg.sender], "No identity found");
        require(identities[msg.sender].active, "Identity is deactivated");
        _;
    }

    // ──────────────────── Functions ────────────────────

    /// @notice Create a new OmnID identity — mints a soulbound NFT
    /// @param metadataHash IPFS hash of identity metadata
    /// @param recoveryAddress Backup wallet that can recover this identity
    /// @param ssnCommitment keccak256(SSN) — used to enforce no duplicate registrations
    function createIdentity(
        bytes32 metadataHash,
        address recoveryAddress,
        bytes32 ssnCommitment
    ) external {
        require(!hasIdentity[msg.sender], "Identity already exists");
        require(recoveryAddress != address(0), "Recovery address required");
        require(recoveryAddress != msg.sender, "Recovery must differ from owner");
        require(ssnCommitment != bytes32(0), "SSN commitment required");
        require(!ssnUsed[ssnCommitment], "SSN already registered");

        ssnUsed[ssnCommitment] = true;

        uint256 tokenId = _nextTokenId++;

        // Mint the soulbound NFT
        _mint(msg.sender, tokenId);

        identities[msg.sender] = Identity({
            owner: msg.sender,
            recoveryAddress: recoveryAddress,
            metadataHash: metadataHash,
            ssnCommitment: ssnCommitment,
            phoneHash: bytes32(0),
            passkeyHash: bytes32(0),
            tokenId: tokenId,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });

        _tokenOwner[tokenId] = msg.sender;
        hasIdentity[msg.sender] = true;
        identityList.push(msg.sender);
        identityCount++;

        emit IdentityCreated(
            msg.sender,
            tokenId,
            metadataHash,
            recoveryAddress,
            ssnCommitment,
            block.timestamp
        );
    }

    /// @notice Link an OAuth or platform account (Google, Apple, Facebook, etc.)
    /// @param accountHash keccak256(provider + accountId)
    function linkAccount(bytes32 accountHash) external onlyIdentityOwner {
        require(accountHash != bytes32(0), "Invalid account hash");
        linkedAccounts[msg.sender].push(accountHash);
        identities[msg.sender].updatedAt = block.timestamp;
        emit AccountLinked(msg.sender, accountHash, block.timestamp);
    }

    /// @notice Unlink an OAuth or platform account
    /// @param accountHash The hash of the account to unlink
    function unlinkAccount(bytes32 accountHash) external onlyIdentityOwner {
        bytes32[] storage accts = linkedAccounts[msg.sender];
        for (uint256 i = 0; i < accts.length; i++) {
            if (accts[i] == accountHash) {
                accts[i] = accts[accts.length - 1];
                accts.pop();
                identities[msg.sender].updatedAt = block.timestamp;
                emit AccountUnlinked(msg.sender, accountHash, block.timestamp);
                return;
            }
        }
        revert("Account not found");
    }

    /// @notice Set phone hash for the identity
    function setPhoneHash(bytes32 _phoneHash) external onlyIdentityOwner {
        require(_phoneHash != bytes32(0), "Invalid phone hash");
        identities[msg.sender].phoneHash = _phoneHash;
        identities[msg.sender].updatedAt = block.timestamp;
        emit PhoneHashSet(msg.sender, block.timestamp);
    }

    /// @notice Set passkey hash for the identity
    function setPasskeyHash(bytes32 _passkeyHash) external onlyIdentityOwner {
        require(_passkeyHash != bytes32(0), "Invalid passkey hash");
        identities[msg.sender].passkeyHash = _passkeyHash;
        identities[msg.sender].updatedAt = block.timestamp;
        emit PasskeySet(msg.sender, block.timestamp);
    }

    /// @notice Update identity metadata (only owner)
    function updateMetadata(bytes32 newMetadataHash) external onlyIdentityOwner {
        bytes32 oldHash = identities[msg.sender].metadataHash;
        identities[msg.sender].metadataHash = newMetadataHash;
        identities[msg.sender].updatedAt = block.timestamp;

        emit IdentityUpdated(msg.sender, oldHash, newMetadataHash, block.timestamp);
    }

    /// @notice Change the recovery address (only owner)
    function setRecoveryAddress(
        address newRecoveryAddress
    ) external onlyIdentityOwner {
        require(newRecoveryAddress != address(0), "Invalid recovery address");
        require(newRecoveryAddress != msg.sender, "Recovery must differ from owner");

        identities[msg.sender].recoveryAddress = newRecoveryAddress;
        identities[msg.sender].updatedAt = block.timestamp;

        emit RecoveryAddressSet(msg.sender, newRecoveryAddress);
    }

    /// @notice Recover identity to a new wallet (only callable by recovery address)
    ///         Transfers the soulbound NFT to the new owner.
    function recoverIdentity(address oldOwner, address newOwner) external {
        require(hasIdentity[oldOwner], "No identity to recover");
        require(
            identities[oldOwner].recoveryAddress == msg.sender,
            "Not recovery address"
        );
        require(!hasIdentity[newOwner], "New owner already has identity");
        require(newOwner != address(0), "Invalid new owner");

        Identity storage id = identities[oldOwner];
        uint256 tokenId = id.tokenId;

        // Transfer the NFT (temporarily allow transfer)
        _recoveryTransfer = true;
        _transfer(oldOwner, newOwner, tokenId);
        _recoveryTransfer = false;

        identities[newOwner] = Identity({
            owner: newOwner,
            recoveryAddress: id.recoveryAddress,
            metadataHash: id.metadataHash,
            ssnCommitment: id.ssnCommitment,
            phoneHash: id.phoneHash,
            passkeyHash: id.passkeyHash,
            tokenId: tokenId,
            createdAt: id.createdAt,
            updatedAt: block.timestamp,
            active: id.active
        });

        // Transfer linked accounts
        linkedAccounts[newOwner] = linkedAccounts[oldOwner];
        delete linkedAccounts[oldOwner];

        _tokenOwner[tokenId] = newOwner;
        hasIdentity[newOwner] = true;
        hasIdentity[oldOwner] = false;
        delete identities[oldOwner];

        for (uint256 i = 0; i < identityList.length; i++) {
            if (identityList[i] == oldOwner) {
                identityList[i] = newOwner;
                break;
            }
        }

        emit IdentityRecovered(oldOwner, newOwner, tokenId, block.timestamp);
    }

    /// @notice Deactivate an identity (only owner)
    function deactivateIdentity() external {
        require(hasIdentity[msg.sender], "No identity found");
        require(identities[msg.sender].active, "Already deactivated");

        identities[msg.sender].active = false;
        identities[msg.sender].updatedAt = block.timestamp;

        emit IdentityDeactivated(msg.sender, block.timestamp);
    }

    /// @notice Reactivate an identity (only owner)
    function reactivateIdentity() external {
        require(hasIdentity[msg.sender], "No identity found");
        require(!identities[msg.sender].active, "Already active");

        identities[msg.sender].active = true;
        identities[msg.sender].updatedAt = block.timestamp;

        emit IdentityReactivated(msg.sender, block.timestamp);
    }

    // ──────────────────── On-Chain SVG Metadata ────────────────────

    /// @notice Returns fully on-chain SVG metadata for the OmnID NFT
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        address owner = ownerOf(tokenId);
        Identity memory id = identities[owner];
        uint256 linkedCount = linkedAccounts[owner].length;

        string memory svg = _buildSvg(tokenId, owner, linkedCount, id.active);

        string memory json = _buildJson(tokenId, linkedCount, id.active, svg);

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function _buildSvg(
        uint256 tokenId,
        address owner,
        uint256 linkedCount,
        bool active
    ) internal pure returns (string memory) {
        string memory part1 = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">',
            '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0891b2"/><stop offset="100%" style="stop-color:#06b6d4"/>',
            '</linearGradient></defs>',
            '<rect width="400" height="250" rx="16" fill="url(#bg)"/>',
            '<text x="24" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="white">Omn</text>',
            '<text x="68" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="#fbbf24">ID</text>'
        ));

        string memory part2 = string(abi.encodePacked(
            '<text x="340" y="40" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.6)">SOULBOUND</text>',
            '<text x="24" y="80" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">TOKEN ID</text>',
            '<text x="24" y="100" font-family="monospace" font-size="16" fill="white">#', tokenId.toString(), '</text>',
            '<text x="24" y="140" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">OWNER</text>',
            '<text x="24" y="160" font-family="monospace" font-size="10" fill="white">', _truncateAddress(owner), '</text>'
        ));

        string memory part3 = string(abi.encodePacked(
            '<text x="24" y="200" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">LINKED ACCOUNTS</text>',
            '<text x="24" y="220" font-family="monospace" font-size="16" fill="#fbbf24">', linkedCount.toString(), '</text>',
            '<text x="200" y="200" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">STATUS</text>',
            '<text x="200" y="220" font-family="monospace" font-size="16" fill="', active ? '#34d399' : '#f87171', '">', active ? 'ACTIVE' : 'INACTIVE', '</text>',
            '</svg>'
        ));

        return string(abi.encodePacked(part1, part2, part3));
    }

    function _buildJson(
        uint256 tokenId,
        uint256 linkedCount,
        bool active,
        string memory svg
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"name":"OmnID #', tokenId.toString(),
            '","description":"Soulbound identity NFT on the OmnID protocol.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '","attributes":[',
            '{"trait_type":"Linked Accounts","value":', linkedCount.toString(), '},',
            '{"trait_type":"Status","value":"', active ? 'Active' : 'Inactive', '"},',
            '{"trait_type":"Chain","value":"Base"}]}'
        ));
    }

    function _truncateAddress(address addr) internal pure returns (string memory) {
        string memory full = Strings.toHexString(addr);
        bytes memory b = bytes(full);
        bytes memory result = new bytes(13);
        for (uint i = 0; i < 6; i++) result[i] = b[i];
        result[6] = '.';
        result[7] = '.';
        result[8] = '.';
        for (uint i = 0; i < 4; i++) result[9 + i] = b[b.length - 4 + i];
        return string(result);
    }

    // ──────────────────── View Functions ────────────────────

    function getIdentity(address user) external view returns (Identity memory) {
        require(hasIdentity[user], "No identity found");
        return identities[user];
    }

    function isActiveIdentity(address user) external view returns (bool) {
        return hasIdentity[user] && identities[user].active;
    }

    function getIdentityAtIndex(uint256 index) external view returns (address) {
        require(index < identityList.length, "Index out of bounds");
        return identityList[index];
    }

    function getLinkedAccounts(address user) external view returns (bytes32[] memory) {
        return linkedAccounts[user];
    }

    function getLinkedAccountCount(address user) external view returns (uint256) {
        return linkedAccounts[user].length;
    }

    function getTokenIdOf(address user) external view returns (uint256) {
        require(hasIdentity[user], "No identity found");
        return identities[user].tokenId;
    }

    // ──────────────────── Required Overrides ────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
