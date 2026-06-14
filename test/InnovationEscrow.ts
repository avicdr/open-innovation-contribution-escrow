import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("InnovationEscrow", () => {
  async function deployEscrow() {
    const [admin, creator, contributorA, contributorB, sponsor] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("InnovationEscrow");
    const escrow = (await Escrow.deploy(admin.address)) as any;
    await escrow.waitForDeployment();
    await escrow.connect(admin).grantRole(await escrow.CONTRIBUTOR_ROLE(), contributorA.address);
    await escrow.connect(admin).grantRole(await escrow.CONTRIBUTOR_ROLE(), contributorB.address);
    await escrow.connect(admin).grantRole(await escrow.SPONSOR_ROLE(), sponsor.address);

    return { admin, creator, contributorA, contributorB, sponsor, escrow };
  }

  it("anchors contribution proofs on-chain", async () => {
    const { creator, contributorA, escrow } = await deployEscrow();
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("innovation metadata"));
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof artifact"));

    await escrow.connect(creator).registerInnovation(metadataHash, "ipfs://innovation");

    await expect(
      escrow.connect(contributorA).registerContribution(1, proofHash, "ipfs://proof", metadataHash),
    )
      .to.emit(escrow, "ProofAnchored")
      .withArgs(1, 1, 1, contributorA.address, proofHash, "ipfs://proof", metadataHash);

    await expect(
      escrow.connect(contributorA).registerContribution(1, proofHash, "ipfs://proof-copy", metadataHash),
    ).to.be.revertedWithCustomError(escrow, "DuplicateProof");
  });

  it("lets the innovation owner distribute a selected reward amount by contribution score", async () => {
    const { admin, creator, contributorA, contributorB, sponsor, escrow } = await deployEscrow();
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("innovation metadata"));
    const proofA = ethers.keccak256(ethers.toUtf8Bytes("proof a"));
    const proofB = ethers.keccak256(ethers.toUtf8Bytes("proof b"));

    await escrow.connect(creator).registerInnovation(metadataHash, "ipfs://innovation");
    await escrow.connect(contributorA).registerContribution(1, proofA, "ipfs://proof-a", metadataHash);
    await escrow.connect(contributorB).registerContribution(1, proofB, "ipfs://proof-b", metadataHash);
    await escrow.connect(admin).setContributionScore(1, 70);
    await escrow.connect(admin).setContributionScore(2, 30);
    await escrow.connect(sponsor).depositFunds(1, { value: ethers.parseEther("1") });
    await escrow.connect(admin).approveMilestone(1);

    await expect(escrow.connect(admin).distributeRewards(1, [1, 2], ethers.parseEther("0.4"))).to.be.revertedWithCustomError(
      escrow,
      "NotInnovationOwner",
    );

    await expect(() => escrow.connect(creator).distributeRewards(1, [1, 2], ethers.parseEther("0.4"))).to.changeEtherBalances(
      [contributorA, contributorB],
      [ethers.parseEther("0.28"), ethers.parseEther("0.12")],
    );

    const innovation = await escrow.innovations(1);
    expect(innovation.totalFunds).to.equal(ethers.parseEther("0.6"));
  });

  it("previews reward calculations without moving funds", async () => {
    const { admin, creator, contributorA, contributorB, sponsor, escrow } = await deployEscrow();
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("innovation metadata"));
    const proofA = ethers.keccak256(ethers.toUtf8Bytes("proof a"));
    const proofB = ethers.keccak256(ethers.toUtf8Bytes("proof b"));

    await escrow.connect(creator).registerInnovation(metadataHash, "ipfs://innovation");
    await escrow.connect(contributorA).registerContribution(1, proofA, "ipfs://proof-a", metadataHash);
    await escrow.connect(contributorB).registerContribution(1, proofB, "ipfs://proof-b", metadataHash);
    await escrow.connect(admin).setContributionScore(1, 60);
    await escrow.connect(admin).setContributionScore(2, 40);
    await escrow.connect(sponsor).depositFunds(1, { value: ethers.parseEther("1") });

    const [payouts, totalScore, escrowPool] = await escrow.calculateRewards(1, [1, 2], ethers.parseEther("0.5"));

    expect(totalScore).to.equal(100);
    expect(escrowPool).to.equal(ethers.parseEther("1"));
    expect(payouts[0]).to.equal(ethers.parseEther("0.3"));
    expect(payouts[1]).to.equal(ethers.parseEther("0.2"));
  });

  it("does not allow score rewards to spend bounty-reserved funds", async () => {
    const { admin, creator, contributorA, sponsor, escrow } = await deployEscrow();
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("innovation metadata"));
    const proofA = ethers.keccak256(ethers.toUtf8Bytes("proof a"));
    const bountyHash = ethers.keccak256(ethers.toUtf8Bytes("bounty metadata"));

    await escrow.connect(creator).registerInnovation(metadataHash, "ipfs://innovation");
    await escrow.connect(contributorA).registerContribution(1, proofA, "ipfs://proof-a", metadataHash);
    await escrow.connect(admin).setContributionScore(1, 100);
    await escrow.connect(sponsor).depositFunds(1, { value: ethers.parseEther("1") });
    await escrow.connect(creator).createBounty(1, ethers.parseEther("0.4"), bountyHash);
    await escrow.connect(admin).approveMilestone(1);

    await expect(escrow.connect(creator).distributeRewards(1, [1], ethers.parseEther("0.7"))).to.be.revertedWithCustomError(
      escrow,
      "NoFundsAvailable",
    );

    await expect(() => escrow.connect(creator).distributeRewards(1, [1], ethers.parseEther("0.6"))).to.changeEtherBalance(
      contributorA,
      ethers.parseEther("0.6"),
    );

    expect(await escrow.lockedFunds(1)).to.equal(ethers.parseEther("0.4"));
  });
});
