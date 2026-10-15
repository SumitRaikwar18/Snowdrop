// lib/contract.js
// Snowdrop Smart Contract ABI & ethers.js integration helper for Avalanche Fuji C-Chain

import { ethers } from "ethers";

export const FUJI_CHAIN_ID = 43113;
export const FUJI_CHAIN_ID_HEX = "0xa869";
export const FUJI_RPC_URL = process.env.NEXT_PUBLIC_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.snowtrace.io";

// Contract address deployed on Avalanche Fuji C-Chain
export const SNOWDROP_CONTRACT_ADDRESS = 
  process.env.NEXT_PUBLIC_SNOWDROP_ADDRESS || "0x5dc8B0b0821ebE7128D911044AACC4F9c4C8B87f";

export const SNOWDROP_ABI = [
  // Events
  "event DropCreated(bytes32 indexed commit, address indexed sender, uint256 amount, uint64 expiry)",
  "event Claimed(bytes32 indexed commit, address indexed claimer, uint256 amount)",
  "event Refunded(bytes32 indexed commit, address indexed sender, uint256 amount)",
  "event GroupDropCreated(bytes32 indexed commit, address indexed sender, uint256 perClaim, uint8 maxClaims, uint64 expiry)",
  "event GroupClaimed(bytes32 indexed commit, address indexed claimer, uint256 amount)",
  "event GroupRefunded(bytes32 indexed commit, address indexed sender, uint256 amount)",

  // Single Drop Functions
  "function createDrop(bytes32 commit, uint64 expiry) external payable",
  "function claim(bytes32 secret) external",
  "function refund(bytes32 commit) external",
  "function drops(bytes32 commit) external view returns (address sender, uint256 amount, uint64 expiry, bool claimed)",

  // Group Drop Functions
  "function createGroupDrop(bytes32 commit, uint64 expiry, uint8 maxClaims, uint256 perClaim) external payable",
  "function claimGroup(bytes32 secret) external",
  "function refundGroup(bytes32 commit) external",
  "function groupDrops(bytes32 commit) external view returns (address sender, uint256 perClaim, uint64 expiry, uint8 maxClaims, uint8 claimed)",
  "function groupClaimed(bytes32 commit, address user) external view returns (bool)"
];

/**
 * Get read-only or read-write Snowdrop contract instance
 */
export function getSnowdropContract(signerOrProvider) {
  if (!SNOWDROP_CONTRACT_ADDRESS || SNOWDROP_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.warn("Snowdrop contract address not set in NEXT_PUBLIC_SNOWDROP_ADDRESS");
  }
  return new ethers.Contract(SNOWDROP_CONTRACT_ADDRESS, SNOWDROP_ABI, signerOrProvider);
}

/**
 * Generate cryptographic secret and commit hash
 * secret = 32-byte secure random hex
 * commit = keccak256(secret)
 */
export function generateSecretAndCommit() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const secret = ethers.hexlify(randomBytes);
  const commit = ethers.keccak256(secret);
  return { secret, commit };
}

/**
 * Compute commitment hash from a preimage secret
 */
export function computeCommitFromSecret(secret) {
  const formattedSecret = secret.startsWith("0x") ? secret : `0x${secret}`;
  return ethers.keccak256(formattedSecret);
}

/**
 * Fetch on-chain status of a single drop
 */
export async function fetchOnChainDrop(commit, provider) {
  try {
    const contract = getSnowdropContract(provider);
    const drop = await contract.drops(commit);
    if (!drop || drop.amount === 0n) return null;

    return {
      sender: drop.sender,
      amount: ethers.formatEther(drop.amount),
      amountWei: drop.amount,
      expiry: Number(drop.expiry),
      claimed: drop.claimed,
      isExpired: Date.now() / 1000 > Number(drop.expiry)
    };
  } catch (err) {
    console.error("Error fetching on-chain drop:", err);
    return null;
  }
}

/**
 * Fetch on-chain status of a group drop
 */
export async function fetchOnChainGroupDrop(commit, provider, userAddress = null) {
  try {
    const contract = getSnowdropContract(provider);
    const group = await contract.groupDrops(commit);
    if (!group || group.perClaim === 0n) return null;

    let hasUserClaimed = false;
    if (userAddress) {
      hasUserClaimed = await contract.groupClaimed(commit, userAddress);
    }

    return {
      sender: group.sender,
      perClaim: ethers.formatEther(group.perClaim),
      perClaimWei: group.perClaim,
      expiry: Number(group.expiry),
      maxClaims: Number(group.maxClaims),
      claimed: Number(group.claimed),
      remainingClaims: Number(group.maxClaims) - Number(group.claimed),
      hasUserClaimed,
      isExpired: Date.now() / 1000 > Number(group.expiry)
    };
  } catch (err) {
    console.error("Error fetching on-chain group drop:", err);
    return null;
  }
}

/**
 * Execute real on-chain drop creation on Avalanche Fuji C-Chain
 */
export async function createRealDrop({
  signer,
  amount,
  expiryHours = 24,
  type = "single",
  maxClaims = 1,
  perClaim = "0"
}) {
  const { secret, commit } = generateSecretAndCommit();
  const expiryTimestamp = Math.floor(Date.now() / 1000) + Math.round(Number(expiryHours) * 3600);
  const contract = getSnowdropContract(signer);

  let tx;
  if (type === "single") {
    const valueWei = ethers.parseEther(String(amount));
    tx = await contract.createDrop(commit, expiryTimestamp, { value: valueWei });
  } else {
    const claims = Number(maxClaims);
    const perClaimWei = ethers.parseEther(String(perClaim));
    const totalValueWei = perClaimWei * BigInt(claims);
    tx = await contract.createGroupDrop(commit, expiryTimestamp, claims, perClaimWei, { value: totalValueWei });
  }

  const receipt = await tx.wait();

  return {
    commit,
    secret,
    type,
    amount: String(amount),
    perClaim: String(perClaim),
    maxClaims: Number(maxClaims),
    expiryHours: Number(expiryHours),
    createdAt: Date.now(),
    expiresAt: expiryTimestamp * 1000,
    txHash: receipt.hash || tx.hash,
    status: "active",
    claimedCount: 0,
    claimers: []
  };
}

/**
 * Execute real on-chain claim on Avalanche Fuji C-Chain
 */
export async function claimRealDrop({ signer, secret, isGroup = false }) {
  const formattedSecret = secret.startsWith("0x") ? secret : `0x${secret}`;
  const contract = getSnowdropContract(signer);

  let tx;
  if (isGroup) {
    tx = await contract.claimGroup(formattedSecret);
  } else {
    tx = await contract.claim(formattedSecret);
  }

  const receipt = await tx.wait();
  return {
    success: true,
    txHash: receipt.hash || tx.hash,
    blockNumber: receipt.blockNumber
  };
}

/**
 * Execute real on-chain timelocked refund to reclaim unclaimed AVAX
 */
export async function refundRealDrop({ signer, commit, isGroup = false }) {
  const contract = getSnowdropContract(signer);

  let tx;
  if (isGroup) {
    tx = await contract.refundGroup(commit);
  } else {
    tx = await contract.refund(commit);
  }

  const receipt = await tx.wait();
  return {
    success: true,
    txHash: receipt.hash || tx.hash
  };
}

