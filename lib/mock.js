import { ethers } from "ethers";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SNOWDROP_ADDRESS || "0x5dc8B0b0821ebE7128D911044AACC4F9c4C8B87f";

export const FUJI_EXPLORER_URL = "https://testnet.snowtrace.io";

const STORAGE_KEY = "snowdrop_drops_history_v1";

// Helper to get drops from localStorage (Zero fake/demo seeds)
const getStoredDrops = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading drops history", e);
    return [];
  }
};

const saveDrops = (drops) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
  } catch (e) {
    console.error("Error saving drops", e);
  }
};

export function saveRealDropToHistory(drop) {
  if (!drop || !drop.commit) return;
  const drops = getStoredDrops();
  const existingIdx = drops.findIndex(
    (d) => d.commit.toLowerCase() === drop.commit.toLowerCase()
  );
  if (existingIdx !== -1) {
    drops[existingIdx] = { ...drops[existingIdx], ...drop };
  } else {
    drops.unshift(drop);
  }
  saveDrops(drops);
}

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a mock drop (single or group)
 * Generates cryptographic 32-byte secret and calculates keccak256 commit
 * // TODO: replace with real contract call tomorrow:
 * // contract.createDrop(commit, expiry, { value: parseEther(amount) })
 * // or contract.createGroupDrop(commit, expiry, maxClaims, perClaim, { value: total })
 */
export async function createMockDrop({
  amount,
  expiryHours = 24,
  type = "single",
  maxClaims = 1,
  sender = "0x3fC8D80F16e51D6Db69B4B32cAfb8f3319088a2C",
}) {
  await delay(800); // Simulate transaction confirmation

  // Generate 32-byte cryptographically secure random secret
  const randomBytes = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 32; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  const secret = ethers.hexlify(randomBytes);

  // Calculate keccak256 commit
  const commit = ethers.keccak256(secret);

  const now = Date.now();
  const expiresAt = now + expiryHours * 3600 * 1000;
  const fakeTxHash = ethers.hexlify(ethers.randomBytes(32));

  const perClaim =
    type === "group" && maxClaims > 0
      ? (parseFloat(amount) / maxClaims).toFixed(4)
      : amount;

  const newDrop = {
    commit,
    secret,
    sender,
    type,
    amount: amount.toString(),
    perClaim: perClaim.toString(),
    expiryHours,
    createdAt: now,
    expiresAt,
    status: "active",
    maxClaims: type === "group" ? parseInt(maxClaims) : 1,
    claimedCount: 0,
    claimers: [],
    txHash: fakeTxHash,
  };

  const drops = getStoredDrops();
  drops.unshift(newDrop);
  saveDrops(drops);

  return newDrop;
}

/**
 * Fetches drop by secret or commit
 * // TODO: replace with real contract call tomorrow:
 * // const d = await contract.drops(commit) or contract.groupDrops(commit)
 */
export async function getMockDrop(secretOrCommit) {
  await delay(300);
  const drops = getStoredDrops();

  let found = drops.find(
    (d) => d.secret.toLowerCase() === secretOrCommit.toLowerCase() ||
           d.commit.toLowerCase() === secretOrCommit.toLowerCase()
  );

  // If not found in stored drops, generate a realistic deterministic mock drop
  if (!found && secretOrCommit.startsWith("0x")) {
    let commit = secretOrCommit;
    let secret = secretOrCommit;
    if (secretOrCommit.length === 66) {
      commit = ethers.keccak256(secretOrCommit);
    }
    found = {
      commit,
      secret,
      sender: "0x82A1...91Db",
      type: "single",
      amount: "0.05",
      perClaim: "0.05",
      expiryHours: 24,
      createdAt: Date.now() - 3600 * 1000,
      expiresAt: Date.now() + 23 * 3600 * 1000,
      status: "active",
      maxClaims: 1,
      claimedCount: 0,
      claimers: [],
      txHash: ethers.hexlify(ethers.randomBytes(32)),
    };
  }

  if (found) {
    // Check if expired
    if (found.status === "active" && Date.now() > found.expiresAt) {
      found.status = "expired";
    }
  }

  return found || null;
}

/**
 * Claims a mock drop using its secret
 * // TODO: replace with real contract call tomorrow:
 * // contract.claim(secret) or contract.claimGroup(secret)
 */
export async function claimMockDrop(secret, claimer = "0x98bF32014670Ad18f4a38E619e0A7c293A9188aC") {
  await delay(800);
  const drops = getStoredDrops();

  const dropIndex = drops.findIndex(
    (d) => d.secret.toLowerCase() === secret.toLowerCase() ||
           d.commit.toLowerCase() === ethers.keccak256(secret).toLowerCase()
  );

  const fakeTxHash = ethers.hexlify(ethers.randomBytes(32));

  if (dropIndex !== -1) {
    const drop = drops[dropIndex];
    if (drop.status === "claimed") {
      throw new Error("This drop has already been claimed.");
    }
    if (Date.now() > drop.expiresAt) {
      drop.status = "expired";
      saveDrops(drops);
      throw new Error("This drop has expired.");
    }

    if (drop.type === "group") {
      if (drop.claimedCount >= drop.maxClaims) {
        throw new Error("All claims for this group drop have been taken.");
      }
      drop.claimedCount += 1;
      drop.claimers.push(claimer);
      if (drop.claimedCount >= drop.maxClaims) {
        drop.status = "claimed";
      }
    } else {
      drop.status = "claimed";
      drop.claimedCount = 1;
      drop.claimers.push(claimer);
    }

    saveDrops(drops);
    return {
      success: true,
      amount: drop.type === "group" ? drop.perClaim : drop.amount,
      txHash: fakeTxHash,
      drop,
    };
  }

  // Fallback success for custom secrets
  return {
    success: true,
    amount: "0.05",
    txHash: fakeTxHash,
    drop: {
      type: "single",
      amount: "0.05",
      txHash: fakeTxHash,
    },
  };
}

/**
 * Refunds an expired mock drop back to sender
 * // TODO: replace with real contract call tomorrow:
 * // contract.refund(commit) or contract.refundGroup(commit)
 */
export async function refundMockDrop(commit, sender = "0x3fC8D80F16e51D6Db69B4B32cAfb8f3319088a2C") {
  await delay(800);
  const drops = getStoredDrops();
  const dropIndex = drops.findIndex((d) => d.commit.toLowerCase() === commit.toLowerCase());

  const fakeTxHash = ethers.hexlify(ethers.randomBytes(32));

  if (dropIndex !== -1) {
    const drop = drops[dropIndex];
    drop.status = "refunded";
    saveDrops(drops);
    return {
      success: true,
      amount: drop.amount,
      txHash: fakeTxHash,
      refundedTo: sender,
    };
  }

  return {
    success: true,
    amount: "0.05",
    txHash: fakeTxHash,
    refundedTo: sender,
  };
}

/**
 * Returns drops created by current user
 */
export function getMockUserDrops() {
  const drops = getStoredDrops();
  // Auto-expire items whose time passed
  const now = Date.now();
  let updated = false;
  drops.forEach((d) => {
    if (d.status === "active" && now > d.expiresAt) {
      d.status = "expired";
      updated = true;
    }
  });
  if (updated) saveDrops(drops);
  return drops;
}
