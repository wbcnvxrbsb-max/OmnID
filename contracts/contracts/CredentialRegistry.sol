// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CredentialRegistry - Verifiable Credentials for OmnID
/// @notice Trusted issuers (platforms, OAuth providers) issue credentials to identity holders.
///         Credential types include OAUTH_GOOGLE, OAUTH_APPLE, OAUTH_FACEBOOK,
///         PLATFORM_VERIFIED (gig platform linkage), and PRO_SUBSCRIPTION.
///         Credentials can be verified by anyone, shared selectively, and revoked by issuers.
contract CredentialRegistry is AccessControl {
    // ──────────────────── Roles ────────────────────

    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // ──────────────────── External Contracts ────────────────────

    address public identityRegistry;

    // ──────────────────── Enums ────────────────────

    enum CredentialStatus {
        Active,
        Revoked,
        Expired
    }

    // ──────────────────── Structs ────────────────────

    struct Credential {
        uint256 id;
        address issuer;
        address holder;
        bytes32 credentialType; // keccak256("ENROLLMENT"), keccak256("COURSE_COMPLETE"), etc.
        bytes32 dataHash; // IPFS hash of credential details
        uint256 issuedAt;
        uint256 expiresAt; // 0 = never expires
        CredentialStatus status;
    }

    struct Issuer {
        address addr;
        string name;
        string description;
        bool approved;
        uint256 registeredAt;
        uint256 credentialsIssued;
    }

    // ──────────────────── State ────────────────────

    uint256 public nextCredentialId = 1;
    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) public holderCredentials;
    mapping(address => uint256[]) public issuerCredentials;
    mapping(address => Issuer) public issuers;
    address[] public issuerList;

    // ──────────────────── Events ────────────────────

    event IssuerRegistered(address indexed issuer, string name, uint256 timestamp);
    event IssuerApproved(address indexed issuer, uint256 timestamp);
    event IssuerRevoked(address indexed issuer, uint256 timestamp);

    event CredentialIssued(
        uint256 indexed credentialId,
        address indexed issuer,
        address indexed holder,
        bytes32 credentialType,
        uint256 expiresAt
    );

    event CredentialRevoked(
        uint256 indexed credentialId,
        address indexed issuer,
        uint256 timestamp
    );

    event CredentialShared(
        uint256 indexed credentialId,
        address indexed holder,
        address indexed verifier,
        uint256 timestamp
    );

    // ──────────────────── Constructor ────────────────────

    constructor(address _identityRegistry) {
        identityRegistry = _identityRegistry;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ──────────────────── Modifiers ────────────────────

    modifier requiresIdentity(address user) {
        (bool success, bytes memory data) = identityRegistry.staticcall(
            abi.encodeWithSignature("isActiveIdentity(address)", user)
        );
        require(success && abi.decode(data, (bool)), "No active identity");
        _;
    }

    modifier onlyApprovedIssuer() {
        require(issuers[msg.sender].approved, "Not an approved issuer");
        _;
    }

    // ──────────────────── Issuer Management ────────────────────

    /// @notice Register as a credential issuer (e.g., a school)
    function registerIssuer(
        string calldata name,
        string calldata description
    ) external {
        require(!issuers[msg.sender].approved, "Already registered");
        require(bytes(name).length > 0, "Name required");

        issuers[msg.sender] = Issuer({
            addr: msg.sender,
            name: name,
            description: description,
            approved: false,
            registeredAt: block.timestamp,
            credentialsIssued: 0
        });

        issuerList.push(msg.sender);
        emit IssuerRegistered(msg.sender, name, block.timestamp);
    }

    /// @notice Approve a registered issuer (admin only)
    function approveIssuer(
        address issuerAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(issuers[issuerAddress].registeredAt > 0, "Issuer not registered");
        issuers[issuerAddress].approved = true;
        _grantRole(ISSUER_ROLE, issuerAddress);

        emit IssuerApproved(issuerAddress, block.timestamp);
    }

    /// @notice Revoke an issuer's approval (admin only)
    function revokeIssuerApproval(
        address issuerAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        issuers[issuerAddress].approved = false;
        _revokeRole(ISSUER_ROLE, issuerAddress);

        emit IssuerRevoked(issuerAddress, block.timestamp);
    }

    // ──────────────────── Credential Management ────────────────────

    /// @notice Issue a credential to an identity holder
    function issueCredential(
        address holder,
        bytes32 credentialType,
        bytes32 dataHash,
        uint256 expiresAt
    )
        external
        onlyApprovedIssuer
        requiresIdentity(holder)
        returns (uint256 credentialId)
    {
        credentialId = nextCredentialId++;

        credentials[credentialId] = Credential({
            id: credentialId,
            issuer: msg.sender,
            holder: holder,
            credentialType: credentialType,
            dataHash: dataHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            status: CredentialStatus.Active
        });

        holderCredentials[holder].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);
        issuers[msg.sender].credentialsIssued++;

        emit CredentialIssued(
            credentialId,
            msg.sender,
            holder,
            credentialType,
            expiresAt
        );
    }

    /// @notice Revoke a credential (only the original issuer)
    function revokeCredential(uint256 credentialId) external {
        Credential storage cred = credentials[credentialId];
        require(cred.id != 0, "Credential not found");
        require(cred.issuer == msg.sender, "Not the issuer");
        require(
            cred.status == CredentialStatus.Active,
            "Credential not active"
        );

        cred.status = CredentialStatus.Revoked;
        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }

    /// @notice Record that a credential was shared with a verifier (holder only)
    function shareCredential(
        uint256 credentialId,
        address verifier
    ) external {
        Credential storage cred = credentials[credentialId];
        require(cred.holder == msg.sender, "Not the holder");

        emit CredentialShared(credentialId, msg.sender, verifier, block.timestamp);
    }

    // ──────────────────── View Functions ────────────────────

    /// @notice Verify a credential is valid (active + not expired + issuer approved)
    function verifyCredential(
        uint256 credentialId
    ) external view returns (bool valid, Credential memory credential) {
        credential = credentials[credentialId];
        require(credential.id != 0, "Credential not found");

        bool notRevoked = credential.status == CredentialStatus.Active;
        bool notExpired = credential.expiresAt == 0 ||
            credential.expiresAt > block.timestamp;
        bool issuerApproved = issuers[credential.issuer].approved;

        valid = notRevoked && notExpired && issuerApproved;
    }

    /// @notice Get all credential IDs for a holder
    function getCredentialsByHolder(
        address holder
    ) external view returns (uint256[] memory) {
        return holderCredentials[holder];
    }

    /// @notice Get all credential IDs issued by an issuer
    function getCredentialsByIssuer(
        address issuer
    ) external view returns (uint256[] memory) {
        return issuerCredentials[issuer];
    }

    /// @notice Get credential details by ID
    function getCredential(
        uint256 credentialId
    ) external view returns (Credential memory) {
        require(credentials[credentialId].id != 0, "Credential not found");
        return credentials[credentialId];
    }

    /// @notice Check if an address is an approved issuer
    function isApprovedIssuer(address addr) external view returns (bool) {
        return issuers[addr].approved;
    }

    /// @notice Get issuer details
    function getIssuer(
        address addr
    ) external view returns (Issuer memory) {
        return issuers[addr];
    }

    /// @notice Get total number of issuers
    function getIssuerCount() external view returns (uint256) {
        return issuerList.length;
    }

    /// @notice Get total number of credentials issued
    function getCredentialCount() external view returns (uint256) {
        return nextCredentialId - 1;
    }
}
