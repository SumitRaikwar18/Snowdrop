// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Snowdrop
 * @author Sumit Raikwar
 * @notice Non-custodial link drops on Avalanche C-Chain.
 *         Send AVAX to anyone with a link — no wallet address needed.
 */
contract Snowdrop is ReentrancyGuard {
    struct Drop {
        address sender;
        uint256 amount;
        uint64 expiry;
        bool claimed;
    }

    struct GroupDrop {
        address sender;
        uint256 perClaim;
        uint64 expiry;
        uint8 maxClaims;
        uint8 claimed;
    }

    // commit = keccak256(abi.encodePacked(secret))
    mapping(bytes32 => Drop) public drops;
    mapping(bytes32 => GroupDrop) public groupDrops;
    mapping(bytes32 => mapping(address => bool)) public groupClaimed;

    // Events
    event DropCreated(bytes32 indexed commit, address indexed sender, uint256 amount, uint64 expiry);
    event Claimed(bytes32 indexed commit, address indexed claimer, uint256 amount);
    event Refunded(bytes32 indexed commit, address indexed sender, uint256 amount);
    event GroupDropCreated(bytes32 indexed commit, address indexed sender, uint256 perClaim, uint8 maxClaims, uint64 expiry);
    event GroupClaimed(bytes32 indexed commit, address indexed claimer, uint256 amount);
    event GroupRefunded(bytes32 indexed commit, address indexed sender, uint256 amount);

    // ==========================================
    //            SINGLE DROP FUNCTIONS
    // ==========================================

    /**
     * @notice Create a single drop locked by a commitment hash
     * @param commit keccak256(secret) generated client-side
     * @param expiry Unix timestamp in seconds after which sender can refund
     */
    function createDrop(bytes32 commit, uint64 expiry) external payable nonReentrant {
        require(msg.value > 0, "empty drop");
        require(expiry > block.timestamp, "bad expiry");
        require(drops[commit].amount == 0, "exists");

        drops[commit] = Drop(msg.sender, msg.value, expiry, false);
        emit DropCreated(commit, msg.sender, msg.value, expiry);
    }

    /**
     * @notice Claim a single drop by presenting the preimage secret
     * @param secret 32-byte preimage secret from the link fragment
     */
    function claim(bytes32 secret) external nonReentrant {
        bytes32 commit = keccak256(abi.encodePacked(secret));
        Drop storage d = drops[commit];

        require(d.amount > 0 && !d.claimed, "invalid/claimed");
        require(block.timestamp <= d.expiry, "expired");

        d.claimed = true;

        (bool ok, ) = msg.sender.call{value: d.amount}("");
        require(ok, "send failed");

        emit Claimed(commit, msg.sender, d.amount);
    }

    /**
     * @notice Refund an unclaimed drop back to the sender after expiry
     * @param commit The commitment hash of the expired drop
     */
    function refund(bytes32 commit) external nonReentrant {
        Drop storage d = drops[commit];

        require(d.amount > 0 && !d.claimed, "invalid/claimed");
        require(msg.sender == d.sender, "not sender");
        require(block.timestamp > d.expiry, "not expired");

        d.claimed = true;

        (bool ok, ) = d.sender.call{value: d.amount}("");
        require(ok, "send failed");

        emit Refunded(commit, d.sender, d.amount);
    }

    // ==========================================
    //            GROUP DROP FUNCTIONS
    // ==========================================

    /**
     * @notice Create a group drop where first N claimers get paid
     * @param commit keccak256(secret)
     * @param expiry Expiry timestamp
     * @param maxClaims Maximum number of recipients (e.g. 5)
     * @param perClaim Amount each recipient will receive
     */
    function createGroupDrop(
        bytes32 commit,
        uint64 expiry,
        uint8 maxClaims,
        uint256 perClaim
    ) external payable nonReentrant {
        require(maxClaims > 0 && perClaim > 0, "bad params");
        require(expiry > block.timestamp, "bad expiry");
        require(msg.value == perClaim * maxClaims, "wrong value");
        require(groupDrops[commit].perClaim == 0, "exists");

        groupDrops[commit] = GroupDrop(msg.sender, perClaim, expiry, maxClaims, 0);
        emit GroupDropCreated(commit, msg.sender, perClaim, maxClaims, expiry);
    }

    /**
     * @notice Claim an allocation from a group drop
     * @param secret 32-byte preimage secret from the link fragment
     */
    function claimGroup(bytes32 secret) external nonReentrant {
        bytes32 commit = keccak256(abi.encodePacked(secret));
        GroupDrop storage g = groupDrops[commit];

        require(g.perClaim > 0, "invalid");
        require(block.timestamp <= g.expiry, "expired");
        require(g.claimed < g.maxClaims, "all claimed");
        require(!groupClaimed[commit][msg.sender], "already claimed");

        groupClaimed[commit][msg.sender] = true;
        g.claimed += 1;

        (bool ok, ) = msg.sender.call{value: g.perClaim}("");
        require(ok, "send failed");

        emit GroupClaimed(commit, msg.sender, g.perClaim);
    }

    /**
     * @notice Refund remaining unclaimed funds from a group drop after expiry
     * @param commit The commitment hash of the group drop
     */
    function refundGroup(bytes32 commit) external nonReentrant {
        GroupDrop storage g = groupDrops[commit];

        require(g.perClaim > 0, "invalid");
        require(msg.sender == g.sender, "not sender");
        require(block.timestamp > g.expiry, "not expired");

        uint256 remainder = g.perClaim * (g.maxClaims - g.claimed);
        g.claimed = g.maxClaims; // Close the drop

        if (remainder > 0) {
            (bool ok, ) = g.sender.call{value: remainder}("");
            require(ok, "send failed");
        }

        emit GroupRefunded(commit, g.sender, remainder);
    }
}
