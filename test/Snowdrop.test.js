const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Snowdrop Smart Contract", function () {
  let snowdrop;
  let owner, alice, bob, charlie, dave;

  beforeEach(async function () {
    [owner, alice, bob, charlie, dave] = await ethers.getSigners();
    const Snowdrop = await ethers.getContractFactory("Snowdrop");
    snowdrop = await Snowdrop.deploy();
    await snowdrop.waitForDeployment();
  });

  describe("Single Drops", function () {
    it("1. createDrop: Locks AVAX and stores correct commit and expiry", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 3600; // 1 hour
      const amount = ethers.parseEther("1.0");

      await expect(
        snowdrop.connect(alice).createDrop(commit, expiry, { value: amount })
      )
        .to.emit(snowdrop, "DropCreated")
        .withArgs(commit, alice.address, amount, expiry);

      const drop = await snowdrop.drops(commit);
      expect(drop.sender).to.equal(alice.address);
      expect(drop.amount).to.equal(amount);
      expect(drop.expiry).to.equal(expiry);
      expect(drop.claimed).to.be.false;

      // Contract balance should be 1 AVAX
      expect(await ethers.provider.getBalance(await snowdrop.getAddress())).to.equal(amount);
    });

    it("2. claim: Transfers full AVAX to claimer upon providing valid preimage secret", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 3600;
      const amount = ethers.parseEther("0.5");

      await snowdrop.connect(alice).createDrop(commit, expiry, { value: amount });

      const bobBalanceBefore = await ethers.provider.getBalance(bob.address);

      const tx = await snowdrop.connect(bob).claim(secret);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const bobBalanceAfter = await ethers.provider.getBalance(bob.address);
      expect(bobBalanceAfter).to.equal(bobBalanceBefore + amount - gasUsed);

      const drop = await snowdrop.drops(commit);
      expect(drop.claimed).to.be.true;
    });

    it("3. Double-claim rejection: Reverts if already claimed", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 3600;
      const amount = ethers.parseEther("0.2");

      await snowdrop.connect(alice).createDrop(commit, expiry, { value: amount });
      await snowdrop.connect(bob).claim(secret);

      // Attempt second claim by Charlie
      await expect(
        snowdrop.connect(charlie).claim(secret)
      ).to.be.revertedWith("invalid/claimed");
    });

    it("4. Expired claim rejection: Reverts if current timestamp > expiry", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 100;
      const amount = ethers.parseEther("0.1");

      await snowdrop.connect(alice).createDrop(commit, expiry, { value: amount });

      // Fast forward time past expiry
      await time.increaseTo(expiry + 10);

      await expect(
        snowdrop.connect(bob).claim(secret)
      ).to.be.revertedWith("expired");
    });

    it("5. Wrong secret rejection: Reverts if keccak256(secret) != commit", async function () {
      const realSecret = ethers.hexlify(ethers.randomBytes(32));
      const wrongSecret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(realSecret);
      const currentTime = await time.latest();
      const expiry = currentTime + 3600;

      await snowdrop.connect(alice).createDrop(commit, expiry, { value: ethers.parseEther("0.1") });

      await expect(
        snowdrop.connect(bob).claim(wrongSecret)
      ).to.be.revertedWith("invalid/claimed");
    });

    it("6. Refund before expiry rejection: Reverts if sender tries to refund early", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 3600;

      await snowdrop.connect(alice).createDrop(commit, expiry, { value: ethers.parseEther("0.3") });

      await expect(
        snowdrop.connect(alice).refund(commit)
      ).to.be.revertedWith("not expired");
    });

    it("7. Refund after expiry: Sends 100% AVAX back to original creator", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 1000;
      const amount = ethers.parseEther("0.5");

      await snowdrop.connect(alice).createDrop(commit, expiry, { value: amount });

      // Increase time past expiry
      await time.increaseTo(expiry + 10);

      // Non-sender cannot refund
      await expect(
        snowdrop.connect(bob).refund(commit)
      ).to.be.revertedWith("not sender");

      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
      const tx = await snowdrop.connect(alice).refund(commit);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      expect(aliceBalanceAfter).to.equal(aliceBalanceBefore + amount - gasUsed);

      const drop = await snowdrop.drops(commit);
      expect(drop.claimed).to.be.true;
    });
  });

  describe("Group Drops (First N Claimers)", function () {
    it("8. Group drops: First N unique claimers receive perClaim AVAX, (N+1)th reverts", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 7200;
      const perClaim = ethers.parseEther("0.1");
      const maxClaims = 2;
      const totalAmount = perClaim * BigInt(maxClaims);

      await expect(
        snowdrop.connect(alice).createGroupDrop(commit, expiry, maxClaims, perClaim, { value: totalAmount })
      )
        .to.emit(snowdrop, "GroupDropCreated")
        .withArgs(commit, alice.address, perClaim, maxClaims, expiry);

      // Claim 1: Bob
      await expect(snowdrop.connect(bob).claimGroup(secret))
        .to.emit(snowdrop, "GroupClaimed")
        .withArgs(commit, bob.address, perClaim);

      // Same user cannot claim twice
      await expect(
        snowdrop.connect(bob).claimGroup(secret)
      ).to.be.revertedWith("already claimed");

      // Claim 2: Charlie
      await expect(snowdrop.connect(charlie).claimGroup(secret))
        .to.emit(snowdrop, "GroupClaimed")
        .withArgs(commit, charlie.address, perClaim);

      // Claim 3 (N+1): Dave should revert
      await expect(
        snowdrop.connect(dave).claimGroup(secret)
      ).to.be.revertedWith("all claimed");
    });

    it("9. Group drop refund: Creator receives remainder of unclaimed AVAX after expiry", async function () {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const commit = ethers.keccak256(secret);
      const currentTime = await time.latest();
      const expiry = currentTime + 3600;
      const perClaim = ethers.parseEther("0.2");
      const maxClaims = 3;
      const totalAmount = perClaim * BigInt(maxClaims); // 0.6 AVAX

      await snowdrop.connect(alice).createGroupDrop(commit, expiry, maxClaims, perClaim, { value: totalAmount });

      // Only Bob claims (1 out of 3 claimed, 2 remaining = 0.4 AVAX)
      await snowdrop.connect(bob).claimGroup(secret);

      // Fast forward past expiry
      await time.increaseTo(expiry + 60);

      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
      const tx = await snowdrop.connect(alice).refundGroup(commit);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const expectedRefund = perClaim * BigInt(2); // 0.4 AVAX
      expect(aliceBalanceAfter).to.equal(aliceBalanceBefore + expectedRefund - gasCost);

      const groupDrop = await snowdrop.groupDrops(commit);
      expect(groupDrop.claimed).to.equal(maxClaims);
    });
  });
});
