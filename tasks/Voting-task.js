// const { ethers } = require("hardhat");
require("@nomiclabs/hardhat-ethers");
const contractAddress = `${process.env.CONTRACT_ADDRESS}`

task("qwe", "asd")
  .setAction(async (taskArgs) => {
    console.log(contractAddress);
});

task("addVoting", "create voting by name and candidates array")
  .addParam("name", "poll name")
  .addParam("candidates", "candidates array")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    await voting.addVoting(taskArgs.name, taskArgs.candidates);
});

task("vote", "voting for a candidate with his address")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .addParam("candidate", "candidate's address")
  .setAction(async (taskArgs) => {
    const sum = ethers.utils.parseEther("0.01")
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    await voting.vote(taskArgs.id, taskArgs.candidate, { value: sum });
});

task("finish", "close voting")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    await voting.finish(taskArgs.id);
});

task("withdrawOwner", "get comission by id pool")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    await voting.withdrawOwner(taskArgs.id);
});

task("getVoteCandidates", "get candidates address vote by id")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteCandidates(taskArgs.id));
});

task("getVoteParticipants", "get participants address vote by id")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteParticipants(taskArgs.id));
});

task("getVoteParticipantsCount", "get participants count by id")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteParticipants(taskArgs.id));
});

task("getVoteCandidate", "get candidate info by id and address")
.addParam("id", "id vote (AddedVoting after addVoting)")
.addParam("candidate", "candidate's address")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteCandidate(taskArgs.id, taskArgs.candidate));
});

task("getVoteStatus", "get status vote by id")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteStatus(taskArgs.id));
});

task("getVoteCreateAt", "get create datetime vote by id")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteCreateAt(taskArgs.id));
});

task("getVoteWinner", "get winner vote by id")
  .addParam("id", "id vote (AddedVoting after addVoting)")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getVoteWinner(taskArgs.id));
});

task("getLastId", "get last id votes")
  .setAction(async (taskArgs) => {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.attach(contractAddress);

    console.log(await voting.getLastId(taskArgs.id));
});

module.exports = {

}