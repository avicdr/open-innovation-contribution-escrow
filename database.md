# DATABASE.md

# OICE — Database Design Specification

---

# 1. DATABASE OVERVIEW

PostgreSQL is the source of truth for all **application state**.

Blockchain stores ownership + escrow + rewards.
Database stores everything needed for fast querying.

---

# 2. CORE PRINCIPLE

```txt
Blockchain = Truth
Database = State
AI = Intelligence
```

---

# 3. ENTITY RELATIONSHIP MODEL

---

# 4. TABLES

---

## USERS

```sql
id UUID PRIMARY KEY
wallet_address TEXT UNIQUE
username TEXT
avatar TEXT
bio TEXT
reputation_score INT DEFAULT 0
created_at TIMESTAMP
```

---

## INNOVATIONS

```sql
id UUID PRIMARY KEY
title TEXT
summary TEXT
description TEXT
category TEXT
creator_id UUID
ipfs_hash TEXT
status TEXT
created_at TIMESTAMP
```

---

## CONTRIBUTIONS

```sql
id UUID PRIMARY KEY
innovation_id UUID
contributor_id UUID
title TEXT
description TEXT
type TEXT
proof_url TEXT

ai_originality INT
ai_effort INT
ai_complexity INT
ai_usefulness INT
ai_impact INT
ai_overall_score INT

impact_score INT
created_at TIMESTAMP
```

---

## VALIDATIONS

```sql
id UUID PRIMARY KEY
contribution_id UUID
validator_id UUID
rating INT
comment TEXT
created_at TIMESTAMP
```

---

## FUNDING

```sql
id UUID PRIMARY KEY
innovation_id UUID
sponsor_address TEXT
amount DECIMAL
tx_hash TEXT
created_at TIMESTAMP
```

---

## MILESTONES

```sql
id UUID PRIMARY KEY
innovation_id UUID
title TEXT
description TEXT
status TEXT
approval_count INT
created_at TIMESTAMP
```

---

## REWARDS

```sql
id UUID PRIMARY KEY
innovation_id UUID
user_id UUID
amount DECIMAL
tx_hash TEXT
created_at TIMESTAMP
```

---

## passports

```sql
id UUID PRIMARY KEY
innovation_id UUID

summary TEXT
impact_statement TEXT
future_potential TEXT

readiness_score INT
created_at TIMESTAMP
```

---

## SIMULATIONS

```sql
id UUID PRIMARY KEY
name TEXT
status TEXT

current_step TEXT
progress INT

created_at TIMESTAMP
```

---

# 5. INDEXING STRATEGY

```sql
CREATE INDEX idx_innovations_creator ON innovations(creator_id);
CREATE INDEX idx_contributions_innovation ON contributions(innovation_id);
CREATE INDEX idx_validations_contribution ON validations(contribution_id);
```

---

# 6. PERFORMANCE RULES

- AI results cached in DB
- Never recompute scores unless needed
- Store all simulation states separately

---

# END DATABASE
