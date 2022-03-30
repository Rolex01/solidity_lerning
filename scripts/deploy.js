const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]
  const Votings = await ethers.getContractFactory("Voting", contractOwner)
  const voting = await Votings.deploy()
  await voting.deployed()
  console.log("Voting deployed to:", voting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
