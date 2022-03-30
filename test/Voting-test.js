const { expect } = require("chai");
const { ethers } = require("hardhat");
const { bignumber } = require("bignumber");

describe("Voting", function () {
    let accOwner
    let acc1
    let acc2
    let voting
    const durationPool = 2000 // time for votes (1000 * 60 * 60 * 24 * 3)

    beforeEach(async function() {
        [accOwner, acc1, acc2] = await ethers.getSigners()
        const Votings = await ethers.getContractFactory("Voting", accOwner)
        voting = await Votings.deploy()
        await voting.deployed()
    })

    it("getLastId", async function () {
        const lastId = await voting.getLastId()
        expect(lastId).to.eq(0)
    })

    it("addVoting", async function () {
        const votingName = "test"

        await expect(voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address]))
            .to.emit(voting, 'AddedVoting')
            .withArgs(accOwner.address, votingName, 1);
    })

    it("vote", async function () {
        const votingName = "test2"
        const sum = ethers.utils.parseEther("0.01")

        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        const tx = await voting.vote(1, acc1.address, { value: sum})
        await tx.wait()

        const blockTimestamp = await (await ethers.provider.getBlock(tx.blockNumber)).timestamp
        const voteInfo = await voting.getVoteCandidate(1, acc1.address)
        
        await expect(() => tx)
            .to.changeEtherBalance(accOwner, ethers.BigNumber.from("-" + sum));
        expect(voteInfo.count).to.eq(1)
        expect(voteInfo.lastVote).to.eq(blockTimestamp)
    })

    it("finish", async function () {
        const votingName = "test3"
        const stateFinished = 2
        const sum = ethers.utils.parseEther("0.01")
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        const tx = await voting.vote(1, acc1.address, { value: sum})
        await tx.wait()
        await new Promise(r => setTimeout(r, durationPool));
        await voting.finish(1)
        const state = await voting.getVoteStatus(1)

        expect(state).to.eq(stateFinished)
    })

    it("withdrawOwner", async function () {
        const votingName = "test4"
        const stateFinished = 3
        const sum = ethers.utils.parseEther("0.01")
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        const tx = await voting.vote(1, acc1.address, { value: sum})
        await tx.wait()
        await new Promise(r => setTimeout(r, durationPool));
        await voting.finish(1)
        await voting.withdrawOwner(1)
        const state = await voting.getVoteStatus(1)

        expect(state).to.eq(stateFinished)
    })

    it("getVoteCandidates", async function () {
        const votingName = "test5"
        const accs = [accOwner.address, acc1.address, acc2.address]
        
        await voting.addVoting(votingName, accs)
        const candidates = await voting.getVoteCandidates(1)

        for (let i = 0; i < candidates.length; i++) {
            expect(candidates[i]).to.hexEqual(accs[i])
        }
    })

    it("getVoteParticipants", async function () {
        const votingName = "test6"
        const sum = ethers.BigNumber.from("10000000000000000")
        const accs = [accOwner.address, acc1.address, acc2.address]
        
        await voting.addVoting(votingName, accs)
        const tx = await voting.vote(1, acc1.address, { value: sum})
        await tx.wait()
        const participants = await voting.getVoteParticipants(1)

        expect(participants[0]).to.hexEqual(accs[0])
    })

    it("getVoteParticipantsCount", async function () {
        const votingName = "test7"
        const sum = ethers.utils.parseEther("0.01")
        const accs = [accOwner.address, acc1.address, acc2.address]
        
        await voting.addVoting(votingName, accs)
        const tx = await voting.vote(1, acc1.address, { value: sum})
        await tx.wait()
        const participantsCount = await voting.getVoteParticipantsCount(1)

        expect(participantsCount).to.eq(1)
    })

    it("getVoteCreateAt", async function () {
        const votingName = "test8"
        const sum = ethers.utils.parseEther("0.01")
        const accs = [accOwner.address, acc1.address, acc2.address]
        
        const tx = await voting.addVoting(votingName, accs)
        await tx.wait()
        const createAt = await voting.getVoteCreateAt(1)
        const blockTimestamp = await (await ethers.provider.getBlock(tx.blockNumber)).timestamp
        
        expect(createAt).to.eq(blockTimestamp)
    })

    it("getVoteWinner", async function () {
        const votingName = "test9"
        const stateFinished = 2
        const sum = ethers.utils.parseEther("0.01")
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        const tx = await voting.vote(1, acc2.address, { value: sum})
        await tx.wait()
        await new Promise(r => setTimeout(r, durationPool));
        await voting.finish(1)
        const winner = await voting.getVoteWinner(1)

        expect(winner).to.eq(acc2.address)
    })

    it("onlyOwner", async function () {
        const votingName = "test 10"
        const accs = [accOwner.address, acc1.address, acc2.address]

        await expect(voting.connect(acc1).addVoting(votingName, accs))
            .to.be.revertedWith('you are not an owner!');
    })

    it("existVote", async function () {
        await expect(voting.withdrawOwner(6))
            .to.be.revertedWith('voting with given number does not exist!');
    })

    it("withdrawOwner branch 1", async function () {
        const votingName = "test11"
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        await expect(voting.withdrawOwner(1))
            .to.be.revertedWith('voting has not ended yet!');
    })

    it("withdrawOwner branch 2", async function () {
        const votingName = "test12"
        const sum = ethers.utils.parseEther("0.01")
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        const tx = await voting.vote(1, acc1.address, { value: sum})
        await tx.wait()
        await new Promise(r => setTimeout(r, durationPool));
        await voting.finish(1)
        await voting.withdrawOwner(1)
        await expect(voting.withdrawOwner(1))
            .to.be.revertedWith('you have already received commission!');
    })

    it("onlyNew branch 1", async function () {
        const votingName = "test13"
        const sum = ethers.utils.parseEther("0.01")
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        await new Promise(r => setTimeout(r, durationPool + 1000));
        await expect(voting.vote(1, acc1.address, { value: sum}))
            .to.be.revertedWith('voting time has expired!');
    })

    it("onlyNew branch 2", async function () {
        const votingName = "test14"
        const sum = ethers.utils.parseEther("0.01")
        
        await voting.addVoting(votingName, [accOwner.address, acc1.address, acc2.address])
        await voting.vote(1, acc1.address, { value: sum})
        await expect(voting.vote(1, acc1.address, { value: sum}))
            .to.be.revertedWith('you have already participated in this poll!');
    })

    it("onlyNew branch 3", async function () {
        const votingName = "test15"
        const sum = ethers.utils.parseEther("0.01")
        const accs = [accOwner.address, acc1.address]
        
        await voting.addVoting(votingName, accs)
        await expect(voting.vote(1, acc2.address, { value: sum}))
            .to.be.revertedWith('no candidate in the specified ballot!');
    })

    it("onlyNew branch 4", async function () {
        const votingName = "test16"
        const sum = ethers.utils.parseEther("0.1")
        const accs = [accOwner.address, acc1.address]
        
        await voting.addVoting(votingName, accs)
        await expect(voting.vote(1, acc1.address, { value: sum}))
            .to.be.revertedWith('to participate in the voting, 0.01 ETH is required!');
    })

    it("premature finish", async function () {
        const votingName = "test17"
        const accs = [accOwner.address, acc1.address, acc2.address]
        
        await voting.addVoting(votingName, accs)
        await expect(voting.finish(1))
            .to.be.revertedWith('time to vote has not yet expired!');
    })

    it("getVoteCandidate exist candidate", async function () {
        const votingName = "test18"
        const accs = [accOwner.address, acc1.address]
        
        await voting.addVoting(votingName, accs)
        await expect(voting.getVoteCandidate(1, acc2.address))
            .to.be.revertedWith('no candidate in this poll!');
    })

    it("premature getVoteWinner", async function () {
        const votingName = "test19"
        const accs = [accOwner.address, acc1.address]
        
        await voting.addVoting(votingName, accs)
        await expect(voting.getVoteWinner(1))
            .to.be.revertedWith('voting is not over yet!');
    })
})
