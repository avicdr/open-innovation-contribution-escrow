// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract InnovationEscrow is AccessControl, ReentrancyGuard {
    bytes32 public constant PROJECT_OWNER_ROLE = keccak256("PROJECT_OWNER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");
    bytes32 public constant CONTRIBUTOR_ROLE = keccak256("CONTRIBUTOR_ROLE");
    bytes32 public constant SCORE_MANAGER_ROLE = keccak256("SCORE_MANAGER_ROLE");
    bytes32 public constant MILESTONE_APPROVER_ROLE = keccak256("MILESTONE_APPROVER_ROLE");

    struct Innovation {
        address creator;
        bytes32 metadataHash;
        string metadataUri;
        uint256 totalFunds;
        uint256 totalContributionScore;
        uint64 createdAt;
        bool milestoneApproved;
        bool exists;
    }

    struct Contribution {
        uint256 innovationId;
        uint256 proofId;
        address contributor;
        uint96 score;
        uint64 createdAt;
        bool rewarded;
        bool exists;
    }

    struct Proof {
        uint256 innovationId;
        uint256 contributionId;
        address contributor;
        bytes32 proofHash;
        string proofUri;
        bytes32 metadataHash;
        uint64 createdAt;
        bool exists;
    }

    struct Milestone {
        uint256 innovationId;
        address creator;
        bytes32 metadataHash;
        string metadataUri;
        uint64 createdAt;
        bool approved;
        bool exists;
    }

    struct Bounty {
        uint256 innovationId;
        address owner;
        uint256 reward;
        address approvedContributor;
        bytes32 metadataHash;
        uint64 createdAt;
        bool approved;
        bool released;
        bool cancelled;
        bool exists;
    }

    uint256 private nextInnovationId = 1;
    uint256 private nextContributionId = 1;
    uint256 private nextProofId = 1;
    uint256 private nextMilestoneId = 1;
    uint256 private nextBountyId = 1;

    mapping(uint256 => Innovation) public innovations;
    mapping(uint256 => Contribution) public contributions;
    mapping(uint256 => Proof) public proofs;
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => Bounty) public bounties;
    // Escrow funds reserved by live (open/approved) bounties, per innovation.
    mapping(uint256 => uint256) public lockedFunds;
    mapping(uint256 => uint256[]) private innovationContributions;
    mapping(bytes32 => bool) public anchoredProofHashes;

    event InnovationRegistered(
        uint256 indexed innovationId,
        address indexed creator,
        bytes32 metadataHash,
        string metadataUri
    );

    event ContributionRegistered(
        uint256 indexed contributionId,
        uint256 indexed innovationId,
        address indexed contributor,
        uint256 proofId
    );

    event ProofAnchored(
        uint256 indexed proofId,
        uint256 indexed innovationId,
        uint256 indexed contributionId,
        address contributor,
        bytes32 proofHash,
        string proofUri,
        bytes32 metadataHash
    );

    event ContributionScoreUpdated(
        uint256 indexed contributionId,
        uint256 indexed innovationId,
        uint96 previousScore,
        uint96 newScore
    );

    event FundsDeposited(uint256 indexed innovationId, address indexed sponsor, uint256 amount);
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed innovationId,
        address indexed creator,
        bytes32 metadataHash,
        string metadataUri
    );
    event MilestoneApproved(uint256 indexed innovationId, address indexed approver);
    event RewardsDistributed(uint256 indexed innovationId, uint256 amount, uint256 contributionCount);

    event BountyCreated(
        uint256 indexed bountyId,
        uint256 indexed innovationId,
        address indexed owner,
        uint256 reward,
        bytes32 metadataHash
    );
    event SubmissionApproved(uint256 indexed bountyId, uint256 indexed innovationId, address indexed contributor);
    event RewardReleased(uint256 indexed bountyId, address indexed contributor, uint256 amount);
    event BountyCancelled(uint256 indexed bountyId, uint256 indexed innovationId);

    error EmptyMetadata();
    error EmptyProof();
    error DuplicateProof();
    error InnovationNotFound();
    error ContributionNotFound();
    error MilestoneNotApproved();
    error NoFundsAvailable();
    error NoScoreAvailable();
    error RewardAlreadyDistributed(uint256 contributionId);
    error InvalidContributionForInnovation(uint256 contributionId);
    error TransferFailed(address recipient, uint256 amount);
    error NotInnovationOwner();
    error BountyNotFound();
    error NotBountyOwner();
    error BountyRewardExceedsAvailable();
    error BountyNotOpen();
    error BountyAlreadyResolved();
    error SubmissionNotApproved();
    error InvalidContributor();

    constructor(address admin) {
        require(admin != address(0), "admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROJECT_OWNER_ROLE, admin);
        _grantRole(VALIDATOR_ROLE, admin);
        _grantRole(SPONSOR_ROLE, admin);
        _grantRole(CONTRIBUTOR_ROLE, admin);
        _grantRole(SCORE_MANAGER_ROLE, admin);
        _grantRole(MILESTONE_APPROVER_ROLE, admin);
    }

    function registerInnovation(bytes32 metadataHash, string calldata metadataUri) external returns (uint256 innovationId) {
        if (metadataHash == bytes32(0) || bytes(metadataUri).length == 0) {
            revert EmptyMetadata();
        }

        innovationId = nextInnovationId++;
        innovations[innovationId] = Innovation({
            creator: msg.sender,
            metadataHash: metadataHash,
            metadataUri: metadataUri,
            totalFunds: 0,
            totalContributionScore: 0,
            createdAt: uint64(block.timestamp),
            milestoneApproved: false,
            exists: true
        });

        _grantRole(PROJECT_OWNER_ROLE, msg.sender);
        emit InnovationRegistered(innovationId, msg.sender, metadataHash, metadataUri);
    }

    function registerContribution(
        uint256 innovationId,
        bytes32 proofHash,
        string calldata proofUri,
        bytes32 metadataHash
    ) external onlyRole(CONTRIBUTOR_ROLE) returns (uint256 contributionId, uint256 proofId) {
        if (!innovations[innovationId].exists) {
            revert InnovationNotFound();
        }

        if (proofHash == bytes32(0) || bytes(proofUri).length == 0) {
            revert EmptyProof();
        }

        if (anchoredProofHashes[proofHash]) {
            revert DuplicateProof();
        }

        contributionId = nextContributionId++;
        proofId = nextProofId++;
        anchoredProofHashes[proofHash] = true;

        contributions[contributionId] = Contribution({
            innovationId: innovationId,
            proofId: proofId,
            contributor: msg.sender,
            score: 0,
            createdAt: uint64(block.timestamp),
            rewarded: false,
            exists: true
        });

        proofs[proofId] = Proof({
            innovationId: innovationId,
            contributionId: contributionId,
            contributor: msg.sender,
            proofHash: proofHash,
            proofUri: proofUri,
            metadataHash: metadataHash,
            createdAt: uint64(block.timestamp),
            exists: true
        });

        innovationContributions[innovationId].push(contributionId);

        emit ContributionRegistered(contributionId, innovationId, msg.sender, proofId);
        emit ProofAnchored(proofId, innovationId, contributionId, msg.sender, proofHash, proofUri, metadataHash);
    }

    function setContributionScore(uint256 contributionId, uint96 score) external onlyRole(SCORE_MANAGER_ROLE) {
        Contribution storage contribution = contributions[contributionId];

        if (!contribution.exists) {
            revert ContributionNotFound();
        }

        Innovation storage innovation = innovations[contribution.innovationId];
        uint96 previousScore = contribution.score;

        innovation.totalContributionScore =
            innovation.totalContributionScore -
            uint256(previousScore) +
            uint256(score);
        contribution.score = score;

        emit ContributionScoreUpdated(contributionId, contribution.innovationId, previousScore, score);
    }

    function depositFunds(uint256 innovationId) external payable onlyRole(SPONSOR_ROLE) {
        Innovation storage innovation = innovations[innovationId];

        if (!innovation.exists) {
            revert InnovationNotFound();
        }

        if (msg.value == 0) {
            revert NoFundsAvailable();
        }

        innovation.totalFunds += msg.value;
        emit FundsDeposited(innovationId, msg.sender, msg.value);
    }

    function createMilestone(
        uint256 innovationId,
        bytes32 metadataHash,
        string calldata metadataUri
    ) external onlyRole(PROJECT_OWNER_ROLE) returns (uint256 milestoneId) {
        if (!innovations[innovationId].exists) {
            revert InnovationNotFound();
        }

        if (metadataHash == bytes32(0) || bytes(metadataUri).length == 0) {
            revert EmptyMetadata();
        }

        milestoneId = nextMilestoneId++;
        milestones[milestoneId] = Milestone({
            innovationId: innovationId,
            creator: msg.sender,
            metadataHash: metadataHash,
            metadataUri: metadataUri,
            createdAt: uint64(block.timestamp),
            approved: false,
            exists: true
        });

        emit MilestoneCreated(milestoneId, innovationId, msg.sender, metadataHash, metadataUri);
    }

    function approveMilestone(uint256 innovationId) external onlyRole(VALIDATOR_ROLE) {
        Innovation storage innovation = innovations[innovationId];

        if (!innovation.exists) {
            revert InnovationNotFound();
        }

        innovation.milestoneApproved = true;
        emit MilestoneApproved(innovationId, msg.sender);
    }

    function calculateRewards(
        uint256 innovationId,
        uint256[] calldata contributionIds,
        uint256 rewardAmount
    ) external view returns (uint256[] memory payouts, uint256 totalScore, uint256 escrowPool) {
        Innovation storage innovation = innovations[innovationId];

        if (!innovation.exists) {
            revert InnovationNotFound();
        }

        escrowPool = innovation.totalFunds - lockedFunds[innovationId];
        payouts = new uint256[](contributionIds.length);

        if (rewardAmount > escrowPool) {
            revert NoFundsAvailable();
        }

        for (uint256 i = 0; i < contributionIds.length; i++) {
            Contribution storage contribution = contributions[contributionIds[i]];

            if (!contribution.exists) {
                revert ContributionNotFound();
            }

            if (contribution.innovationId != innovationId) {
                revert InvalidContributionForInnovation(contributionIds[i]);
            }

            totalScore += uint256(contribution.score);
        }

        if (totalScore == 0 || rewardAmount == 0) {
            return (payouts, totalScore, escrowPool);
        }

        for (uint256 i = 0; i < contributionIds.length; i++) {
            payouts[i] = (rewardAmount * uint256(contributions[contributionIds[i]].score)) / totalScore;
        }
    }

    function releaseFunds(
        uint256 innovationId,
        uint256[] calldata contributionIds,
        uint256 rewardAmount
    ) external nonReentrant onlyRole(PROJECT_OWNER_ROLE) {
        _distributeRewards(innovationId, contributionIds, rewardAmount);
    }

    function distributeRewards(
        uint256 innovationId,
        uint256[] calldata contributionIds,
        uint256 rewardAmount
    ) external nonReentrant onlyRole(PROJECT_OWNER_ROLE) {
        _distributeRewards(innovationId, contributionIds, rewardAmount);
    }

    function _distributeRewards(
        uint256 innovationId,
        uint256[] calldata contributionIds,
        uint256 rewardAmount
    ) internal {
        Innovation storage innovation = innovations[innovationId];

        if (!innovation.exists) {
            revert InnovationNotFound();
        }

        if (innovation.creator != msg.sender) {
            revert NotInnovationOwner();
        }

        if (!innovation.milestoneApproved) {
            revert MilestoneNotApproved();
        }

        uint256 availableFunds = innovation.totalFunds - lockedFunds[innovationId];
        uint256 selectedScore;

        if (rewardAmount == 0 || rewardAmount > availableFunds) {
            revert NoFundsAvailable();
        }

        for (uint256 i = 0; i < contributionIds.length; i++) {
            Contribution storage contribution = contributions[contributionIds[i]];

            if (!contribution.exists) {
                revert ContributionNotFound();
            }

            if (contribution.innovationId != innovationId) {
                revert InvalidContributionForInnovation(contributionIds[i]);
            }

            if (contribution.rewarded) {
                revert RewardAlreadyDistributed(contributionIds[i]);
            }

            selectedScore += uint256(contribution.score);
        }

        if (selectedScore == 0) {
            revert NoScoreAvailable();
        }

        uint256 distributed;

        for (uint256 i = 0; i < contributionIds.length; i++) {
            Contribution storage contribution = contributions[contributionIds[i]];

            contribution.rewarded = true;
            uint256 payout = (rewardAmount * uint256(contribution.score)) / selectedScore;
            distributed += payout;

            if (payout > 0) {
                (bool sent, ) = payable(contribution.contributor).call{value: payout}("");
                if (!sent) {
                    revert TransferFailed(contribution.contributor, payout);
                }
            }
        }

        innovation.totalFunds -= distributed;

        innovation.milestoneApproved = false;
        emit RewardsDistributed(innovationId, distributed, contributionIds.length);
    }

    function getInnovationContributions(uint256 innovationId) external view returns (uint256[] memory) {
        if (!innovations[innovationId].exists) {
            revert InnovationNotFound();
        }

        return innovationContributions[innovationId];
    }

    // --- Innovation Bounties -------------------------------------------------

    /// @notice Reserve part of the escrow pool as a task reward. Only the
    ///         innovation creator may open a bounty, and the reward must be
    ///         covered by funds not already locked by other live bounties.
    function createBounty(
        uint256 innovationId,
        uint256 reward,
        bytes32 metadataHash
    ) external returns (uint256 bountyId) {
        Innovation storage innovation = innovations[innovationId];

        if (!innovation.exists) {
            revert InnovationNotFound();
        }

        if (innovation.creator != msg.sender) {
            revert NotBountyOwner();
        }

        if (reward == 0) {
            revert NoFundsAvailable();
        }

        uint256 available = innovation.totalFunds - lockedFunds[innovationId];
        if (reward > available) {
            revert BountyRewardExceedsAvailable();
        }

        lockedFunds[innovationId] += reward;

        bountyId = nextBountyId++;
        bounties[bountyId] = Bounty({
            innovationId: innovationId,
            owner: msg.sender,
            reward: reward,
            approvedContributor: address(0),
            metadataHash: metadataHash,
            createdAt: uint64(block.timestamp),
            approved: false,
            released: false,
            cancelled: false,
            exists: true
        });

        emit BountyCreated(bountyId, innovationId, msg.sender, reward, metadataHash);
    }

    /// @notice Owner approves a submission, locking in the winning contributor.
    function approveSubmission(uint256 bountyId, address contributor) external {
        Bounty storage bounty = bounties[bountyId];

        if (!bounty.exists) {
            revert BountyNotFound();
        }

        if (bounty.owner != msg.sender) {
            revert NotBountyOwner();
        }

        if (bounty.released || bounty.cancelled || bounty.approved) {
            revert BountyNotOpen();
        }

        if (contributor == address(0)) {
            revert InvalidContributor();
        }

        bounty.approved = true;
        bounty.approvedContributor = contributor;

        emit SubmissionApproved(bountyId, bounty.innovationId, contributor);
    }

    /// @notice Pay the approved contributor exactly once. Reentrancy-guarded and
    ///         only callable by the owner after approval.
    function releaseBountyReward(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];

        if (!bounty.exists) {
            revert BountyNotFound();
        }

        if (bounty.owner != msg.sender) {
            revert NotBountyOwner();
        }

        if (!bounty.approved) {
            revert SubmissionNotApproved();
        }

        if (bounty.released || bounty.cancelled) {
            revert BountyAlreadyResolved();
        }

        Innovation storage innovation = innovations[bounty.innovationId];
        uint256 reward = bounty.reward;

        if (reward > innovation.totalFunds) {
            revert NoFundsAvailable();
        }

        bounty.released = true;
        innovation.totalFunds -= reward;
        lockedFunds[bounty.innovationId] -= reward;

        (bool sent, ) = payable(bounty.approvedContributor).call{value: reward}("");
        if (!sent) {
            revert TransferFailed(bounty.approvedContributor, reward);
        }

        emit RewardReleased(bountyId, bounty.approvedContributor, reward);
    }

    /// @notice Cancel an unresolved bounty and unlock its reserved funds.
    function cancelBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];

        if (!bounty.exists) {
            revert BountyNotFound();
        }

        if (bounty.owner != msg.sender) {
            revert NotBountyOwner();
        }

        if (bounty.released || bounty.cancelled) {
            revert BountyAlreadyResolved();
        }

        bounty.cancelled = true;
        lockedFunds[bounty.innovationId] -= bounty.reward;

        emit BountyCancelled(bountyId, bounty.innovationId);
    }
}
