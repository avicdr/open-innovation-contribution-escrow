# CONTRACTS.md

# OICE — Smart Contract Specification

---

# 1. CONTRACT OVERVIEW

Single core contract:

```txt
InnovationEscrow.sol
```

---

# 2. CORE PURPOSE

Handles:

- Innovation registration
- Contribution tracking
- Funding escrow
- Milestone approval
- Reward distribution

---

# 3. CONTRACT STRUCTURE

---

## STATE VARIABLES

```solidity
mapping(uint => address) public innovationOwner;
mapping(uint => uint) public totalFunds;
mapping(uint => bool) public milestoneApproved;
```

---

## EVENTS

```solidity
event InnovationCreated(uint id, address creator);
event ContributionAdded(uint id, address contributor);
event FundsDeposited(uint id, uint amount);
event MilestoneApproved(uint id);
event RewardsDistributed(uint id);
```

---

## FUNCTIONS

---

### registerInnovation()

Stores innovation metadata hash.

---

### addContribution()

Links contribution to innovation.

---

### depositFunds()

Locks ETH in contract.

---

### approveMilestone()

Marks milestone complete.

---

### distributeRewards()

Splits funds among contributors.

---

# 4. REWARD LOGIC

```txt
Contribution Score / Total Score = Reward Share
```

---

# 5. SECURITY

- ReentrancyGuard
- Ownable
- Input validation
- Event-based tracking

---

# END CONTRACTS
