//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;
    uint private voteCount;
    uint public durationPool = 2 seconds; // 3 days

    enum State {NotExist, Created, Finished, Paid}

    struct VoteInfo {
        uint count;
        uint lastVote;
    }

    struct Polling {
        string name;
        uint createAt;
        address[] candidates;
        address[] participants;
        mapping(address => VoteInfo) candidatesMap;
        mapping(address => uint) participantsMap;
        uint candidatesCount;
        uint participantsCount;
        address winner;
        State state;
        uint cash;
        uint comission;
    }
    mapping (uint => Polling) private votes;


    constructor() {
        owner = msg.sender;
    }

    // fallback() external payable {
    //     revert("function does not exist!");
    // }

    receive() external payable {
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "you are not an owner!");
        _;
    }

    modifier onlyNew(uint voteNum, address candidate) {
        require(block.timestamp - votes[voteNum].createAt <= durationPool, "voting time has expired!");
        require(votes[voteNum].participantsMap[msg.sender] == 0, "you have already participated in this poll!");
        require(votes[voteNum].candidatesMap[candidate].lastVote > 0, "no candidate in the specified ballot!");
        require(msg.value == (0.01 ether), "to participate in the voting, 0.01 ETH is required!");
        _;
    }

    modifier existVote(uint voteNum) {
        require(votes[voteNum].state != State.NotExist, "voting with given number does not exist!");
        _;
    }

    event AddedVoting(address indexed _owner, string indexed _name, uint _voteNum);


    function addVoting(string memory name, address[] memory candidates) external onlyOwner {
        voteCount++;
        votes[voteCount].createAt = block.timestamp;
        votes[voteCount].name = name;
        votes[voteCount].state = State.Created;
        uint candidatesCnt = candidates.length;
        for (uint i = 0; i < candidatesCnt; i++) {
            votes[voteCount].candidatesMap[candidates[i]].lastVote = 1;
            votes[voteCount].candidates.push(candidates[i]);
        }
        votes[voteCount].candidatesCount = candidatesCnt;
        emit AddedVoting(msg.sender, name, voteCount);
    }

    function vote(uint voteNum, address candidate) external payable existVote(voteNum) onlyNew(voteNum, candidate) {
        votes[voteNum].candidatesMap[candidate].count++;
        votes[voteNum].candidatesMap[candidate].lastVote = block.timestamp;
        votes[voteNum].participantsMap[msg.sender] = block.timestamp;
        votes[voteNum].participants.push(msg.sender);
        votes[voteNum].participantsCount++;
    }

    function finish(uint voteNum) external existVote(voteNum) {
        require(block.timestamp - votes[voteNum].createAt > durationPool, "time to vote has not yet expired!");
        uint cash = votes[voteNum].participantsCount * 0.01 ether;

        votes[voteNum].comission = cash / 10;
        votes[voteNum].cash = cash - votes[voteNum].comission;
        uint maxCount;
        uint lastVote;
        address winner;
        for (uint i = 0; i < votes[voteNum].candidatesCount; i++) {
            if (votes[voteNum].candidatesMap[votes[voteNum].candidates[i]].count > maxCount || (
                votes[voteNum].candidatesMap[votes[voteNum].candidates[i]].count == maxCount &&
                votes[voteNum].candidatesMap[votes[voteNum].candidates[i]].lastVote < lastVote
            )) {
                maxCount = votes[voteNum].candidatesMap[votes[voteNum].candidates[i]].count;
                lastVote = votes[voteNum].candidatesMap[votes[voteNum].candidates[i]].lastVote;
                winner = votes[voteNum].candidates[i];
            }
        }
        votes[voteNum].winner = winner;
        votes[voteNum].state = State.Finished;
        payable(winner).transfer(votes[voteNum].cash);
    }

    function withdrawOwner(uint voteNum) external  existVote(voteNum) onlyOwner {
        if (votes[voteNum].state < State.Finished) {
            revert("voting has not ended yet!");
        } else if (votes[voteNum].state > State.Finished) {
            revert("you have already received commission!");
        }

        payable(owner).transfer(votes[voteNum].comission);
        votes[voteNum].state = State.Paid;
    }

    function getVoteCandidates(uint voteNum) external existVote(voteNum) view returns(address[] memory) {
        return votes[voteNum].candidates;
    }

    function getVoteParticipants(uint voteNum) external existVote(voteNum) view returns(address[] memory) {
        return votes[voteNum].participants;
    }

    function getVoteParticipantsCount(uint voteNum) external existVote(voteNum) view returns(uint) {
        return votes[voteNum].participantsCount;
    }

    function getVoteCandidate(uint voteNum, address candidate) external existVote(voteNum) view returns(VoteInfo memory) {
        require(votes[voteNum].candidatesMap[candidate].lastVote > 1, "no candidate in this poll!");
        return votes[voteNum].candidatesMap[candidate];
    }

    function getVoteStatus(uint voteNum) external existVote(voteNum) view returns(State) {
        return votes[voteNum].state;
    }

    function getVoteCreateAt(uint voteNum) external existVote(voteNum) view returns(uint) {
        return votes[voteNum].createAt;
    }

    function getVoteWinner(uint voteNum) external existVote(voteNum) view returns(address) {
        require(votes[voteNum].state >= State.Finished, "voting is not over yet!");
        return votes[voteNum].winner;
    }

    function getLastId() external view returns(uint) {
        return voteCount;
    }
}
