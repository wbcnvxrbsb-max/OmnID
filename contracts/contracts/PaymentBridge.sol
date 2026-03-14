// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title PaymentBridge - Payment Method Bridging for OmnID
/// @notice Enables users to pay with Apple Pay or Google Wallet where only
///         credit cards are accepted, and vice versa. Each bridge transaction
///         incurs a $1 fee paid by the user.
///
/// EXAMPLE:
/// User wants to pay at a card-only merchant using Apple Pay.
/// OmnID bridges the payment: Apple Pay → OmnID → Card Payment.
/// User pays $1 bridging fee on top of the purchase amount.
contract PaymentBridge is AccessControl {
    // ──────────────────── External Contracts ────────────────────

    address public identityRegistry;

    // ──────────────────── Structs ────────────────────

    struct BridgeTransaction {
        uint256 id;
        address user;
        bytes32 sourceMethod;    // keccak256("APPLE_PAY"), keccak256("GOOGLE_WALLET"), etc.
        bytes32 destMethod;      // keccak256("CREDIT_CARD"), keccak256("CRYPTO"), etc.
        uint256 amount;          // Amount in cents (or smallest unit)
        uint256 fee;             // Fee in cents ($1.00 = 100)
        uint256 timestamp;
        bool completed;
    }

    // ──────────────────── State ────────────────────

    uint256 public nextTxId = 1;
    uint256 public bridgeFee = 100; // $1.00 in cents
    uint256 public totalFeesCollected;

    mapping(uint256 => BridgeTransaction) public transactions;
    mapping(address => uint256[]) public userTransactions;

    // ──────────────────── Events ────────────────────

    event PaymentBridged(
        uint256 indexed txId,
        address indexed user,
        bytes32 sourceMethod,
        bytes32 destMethod,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );

    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);

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

    // ──────────────────── Functions ────────────────────

    /// @notice Bridge a payment from one method to another
    /// @param sourceMethod Hash of the source payment method (e.g., keccak256("APPLE_PAY"))
    /// @param destMethod Hash of the destination payment method (e.g., keccak256("CREDIT_CARD"))
    /// @param amount Payment amount in cents
    function bridgePayment(
        bytes32 sourceMethod,
        bytes32 destMethod,
        uint256 amount
    ) external requiresIdentity(msg.sender) {
        require(sourceMethod != bytes32(0), "Invalid source method");
        require(destMethod != bytes32(0), "Invalid dest method");
        require(sourceMethod != destMethod, "Source and dest must differ");
        require(amount > 0, "Amount must be > 0");

        uint256 txId = nextTxId++;
        totalFeesCollected += bridgeFee;

        transactions[txId] = BridgeTransaction({
            id: txId,
            user: msg.sender,
            sourceMethod: sourceMethod,
            destMethod: destMethod,
            amount: amount,
            fee: bridgeFee,
            timestamp: block.timestamp,
            completed: true
        });

        userTransactions[msg.sender].push(txId);

        emit PaymentBridged(
            txId,
            msg.sender,
            sourceMethod,
            destMethod,
            amount,
            bridgeFee,
            block.timestamp
        );
    }

    /// @notice Update the bridge fee (admin only)
    function setBridgeFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldFee = bridgeFee;
        bridgeFee = newFee;
        emit BridgeFeeUpdated(oldFee, newFee);
    }

    // ──────────────────── View Functions ────────────────────

    function getTransaction(uint256 txId) external view returns (BridgeTransaction memory) {
        require(transactions[txId].completed, "Transaction not found");
        return transactions[txId];
    }

    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }

    function getBridgeHistory(address user) external view returns (BridgeTransaction[] memory) {
        uint256[] memory txIds = userTransactions[user];
        BridgeTransaction[] memory result = new BridgeTransaction[](txIds.length);
        for (uint256 i = 0; i < txIds.length; i++) {
            result[i] = transactions[txIds[i]];
        }
        return result;
    }

    function getTransactionCount() external view returns (uint256) {
        return nextTxId - 1;
    }
}
