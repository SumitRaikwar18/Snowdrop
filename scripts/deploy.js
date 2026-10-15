const hre = require("hardhat");

async function main() {
  console.log("==========================================");
  console.log("❄️  Snowdrop Deployment on Avalanche Fuji");
  console.log("==========================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "AVAX");

  const Snowdrop = await hre.ethers.getContractFactory("contracts/Snowdrop.sol:Snowdrop");
  console.log("Deploying Snowdrop to Avalanche Fuji (Chain ID: 43113)...");
  
  const snowdrop = await Snowdrop.deploy();
  await snowdrop.waitForDeployment();

  const contractAddress = await snowdrop.getAddress();
  console.log("✅ Snowdrop deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔍 Snowtrace Explorer:", `https://testnet.snowtrace.io/address/${contractAddress}`);
  console.log("==========================================");
  console.log("Next steps: Add NEXT_PUBLIC_SNOWDROP_ADDRESS=" + contractAddress + " to your .env");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
