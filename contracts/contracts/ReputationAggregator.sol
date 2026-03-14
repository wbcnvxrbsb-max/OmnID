// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title ReputationAggregator - Portable Cross-Platform Reputation for OmnID
/// @notice Aggregates reputation scores from gig platforms (Instacart, Uber,
///         DoorDash, Lyft, TaskRabbit, Grubhub) into a single portable composite
///         score. Supports platform-to-platform reputation transfers with fee.
contract ReputationAggregator is AccessControl {
    // ──────────────────── Roles ────────────────────

    bytes32 public constant SOURCE_ROLE = keccak256("SOURCE_ROLE");

    // ──────────────────── External Contracts ────────────────────

    address public identityRegistry;

    // ──────────────────── Structs ────────────────────

    struct ReputationSource {
        address addr;
        string name;           // e.g., "Instacart", "Uber"
        string category;       // e.g., "Delivery", "Rideshare", "Services"
        uint256 weight;        // Weight in basis points (100 = 1%, 10000 = 100%)
        bool active;
        uint256 registeredAt;
    }

    struct Score {
        address source;
        uint256 value;             // 0-10000 representing 0.00 to 100.00
        string category;
        uint256 starRating;        // 10-50 representing 1.0-5.0 stars
        uint256 totalCompletedJobs;
        uint256 onTimeRate;        // Basis points (9500 = 95.00%)
        uint256 updatedAt;
    }

    struct CompositeReputation {
        uint256 weightedScore; // Weighted average (0-10000)
        uint256 sourceCount;   // Number of sources contributing
        uint256 calculatedAt;
    }

    struct TransferRecord {
        uint256 id;
        address user;
        address sourcePlatform;
        address destPlatform;
        uint256 reputationAtTransfer; // Score value at time of transfer
        uint256 starRating;
        uint256 totalJobs;
        uint256 timestamp;
    }

    // ──────────────────── State ────────────────────

    mapping(address => ReputationSource) public sources;
    address[] public sourceList;

    mapping(address => mapping(address => Score)) public scores;
    mapping(address => address[]) public userSources;

    // Platform transfers
    uint256 public nextTransferId = 1;
    mapping(uint256 => TransferRecord) public transfers;
    mapping(address => uint256[]) public userTransfers;

    // ──────────────────── Events ────────────────────

    event SourceRegistered(
        address indexed source,
        string name,
        string category,
        uint256 weight
    );

    event SourceUpdated(
        address indexed source,
        uint256 newWeight,
        bool active
    );

    event ScoreSubmitted(
        address indexed source,
        address indexed user,
        uint256 score,
        uint256 starRating,
        uint256 totalJobs,
        uint256 onTimeRate,
        string category,
        uint256 timestamp
    );

    event ReputationTransferred(
        uint256 indexed transferId,
        address indexed user,
        address indexed sourcePlatform,
        address destPlatform,
        uint256 score,
        uint256 starRating,
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

    // ──────────────────── Source Management (Admin) ────────────────────

    function registerSource(
        address sourceAddress,
        string calldata name,
        string calldata category,
        uint256 weight
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(sourceAddress != address(0), "Invalid address");
        require(bytes(name).length > 0, "Name required");
        require(weight > 0 && weight <= 10000, "Weight must be 1-10000");

        sources[sourceAddress] = ReputationSource({
            addr: sourceAddress,
            name: name,
            category: category,
            weight: weight,
            active: true,
            registeredAt: block.timestamp
        });

        sourceList.push(sourceAddress);
        _grantRole(SOURCE_ROLE, sourceAddress);

        emit SourceRegistered(sourceAddress, name, category, weight);
    }

    function updateSource(
        address sourceAddress,
        uint256 newWeight,
        bool active
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(sources[sourceAddress].registeredAt > 0, "Source not registered");
        require(newWeight > 0 && newWeight <= 10000, "Weight must be 1-10000");

        sources[sourceAddress].weight = newWeight;
        sources[sourceAddress].active = active;

        if (!active) {
            _revokeRole(SOURCE_ROLE, sourceAddress);
        } else {
            _grantRole(SOURCE_ROLE, sourceAddress);
        }

        emit SourceUpdated(sourceAddress, newWeight, active);
    }

    // ──────────────────── Score Submission ────────────────────

    /// @notice Submit a reputation score with gig platform metrics
    /// @param user The identity holder being scored
    /// @param value Score value (0-10000 representing 0.00 to 100.00)
    /// @param starRating Star rating (10-50 representing 1.0-5.0)
    /// @param totalCompletedJobs Total deliveries/rides/tasks completed
    /// @param onTimeRate On-time percentage in basis points (9500 = 95.00%)
    function submitScore(
        address user,
        uint256 value,
        uint256 starRating,
        uint256 totalCompletedJobs,
        uint256 onTimeRate
    ) external onlyRole(SOURCE_ROLE) requiresIdentity(user) {
        require(value <= 10000, "Score must be 0-10000");
        require(starRating >= 10 && starRating <= 50, "Rating must be 10-50");
        require(onTimeRate <= 10000, "On-time rate must be 0-10000");
        require(sources[msg.sender].active, "Source not active");

        if (scores[user][msg.sender].updatedAt == 0) {
            userSources[user].push(msg.sender);
        }

        scores[user][msg.sender] = Score({
            source: msg.sender,
            value: value,
            category: sources[msg.sender].category,
            starRating: starRating,
            totalCompletedJobs: totalCompletedJobs,
            onTimeRate: onTimeRate,
            updatedAt: block.timestamp
        });

        emit ScoreSubmitted(
            msg.sender,
            user,
            value,
            starRating,
            totalCompletedJobs,
            onTimeRate,
            sources[msg.sender].category,
            block.timestamp
        );
    }

    // ──────────────────── Platform Transfer ────────────────────

    /// @notice Transfer reputation from one platform to another
    /// @dev In production, the destination platform pays $1 USDC fee.
    ///      For now, the transfer is recorded on-chain for audit.
    function transferReputation(
        address sourcePlatform,
        address destPlatform
    ) external requiresIdentity(msg.sender) {
        require(scores[msg.sender][sourcePlatform].updatedAt > 0, "No score from source");
        require(sources[sourcePlatform].active, "Source platform not active");
        require(sources[destPlatform].active, "Dest platform not active");

        Score memory srcScore = scores[msg.sender][sourcePlatform];

        // Copy the score to the destination platform
        if (scores[msg.sender][destPlatform].updatedAt == 0) {
            userSources[msg.sender].push(destPlatform);
        }

        scores[msg.sender][destPlatform] = Score({
            source: destPlatform,
            value: srcScore.value,
            category: sources[destPlatform].category,
            starRating: srcScore.starRating,
            totalCompletedJobs: srcScore.totalCompletedJobs,
            onTimeRate: srcScore.onTimeRate,
            updatedAt: block.timestamp
        });

        // Record the transfer
        uint256 transferId = nextTransferId++;
        transfers[transferId] = TransferRecord({
            id: transferId,
            user: msg.sender,
            sourcePlatform: sourcePlatform,
            destPlatform: destPlatform,
            reputationAtTransfer: srcScore.value,
            starRating: srcScore.starRating,
            totalJobs: srcScore.totalCompletedJobs,
            timestamp: block.timestamp
        });

        userTransfers[msg.sender].push(transferId);

        emit ReputationTransferred(
            transferId,
            msg.sender,
            sourcePlatform,
            destPlatform,
            srcScore.value,
            srcScore.starRating,
            block.timestamp
        );
    }

    // ──────────────────── View Functions ────────────────────

    function getCompositeReputation(
        address user
    ) external view returns (CompositeReputation memory) {
        address[] memory srcs = userSources[user];
        if (srcs.length == 0) {
            return CompositeReputation(0, 0, block.timestamp);
        }

        uint256 totalWeightedScore = 0;
        uint256 totalWeight = 0;
        uint256 activeCount = 0;

        for (uint256 i = 0; i < srcs.length; i++) {
            ReputationSource memory src = sources[srcs[i]];
            if (!src.active) continue;

            Score memory s = scores[user][srcs[i]];
            totalWeightedScore += s.value * src.weight;
            totalWeight += src.weight;
            activeCount++;
        }

        uint256 composite = totalWeight > 0
            ? totalWeightedScore / totalWeight
            : 0;

        return CompositeReputation({
            weightedScore: composite,
            sourceCount: activeCount,
            calculatedAt: block.timestamp
        });
    }

    function getScore(
        address source,
        address user
    ) external view returns (Score memory) {
        return scores[user][source];
    }

    function getUserSources(
        address user
    ) external view returns (address[] memory) {
        return userSources[user];
    }

    function getAllScores(
        address user
    ) external view returns (Score[] memory) {
        address[] memory srcs = userSources[user];
        Score[] memory result = new Score[](srcs.length);
        for (uint256 i = 0; i < srcs.length; i++) {
            result[i] = scores[user][srcs[i]];
        }
        return result;
    }

    function getSource(
        address sourceAddress
    ) external view returns (ReputationSource memory) {
        return sources[sourceAddress];
    }

    function getAllSources() external view returns (address[] memory) {
        return sourceList;
    }

    function getSourceCount() external view returns (uint256) {
        return sourceList.length;
    }

    function isActiveSource(address addr) external view returns (bool) {
        return sources[addr].active;
    }

    function getTransfer(uint256 transferId) external view returns (TransferRecord memory) {
        return transfers[transferId];
    }

    function getUserTransfers(address user) external view returns (uint256[] memory) {
        return userTransfers[user];
    }

    function getTransferCount() external view returns (uint256) {
        return nextTransferId - 1;
    }
}
