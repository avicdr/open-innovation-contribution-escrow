# API_SPEC.md

# OICE — API Specification

---

# 1. OVERVIEW

All APIs are built using Next.js Route Handlers.

---

# 2. BASE ROUTE

```txt
/api
```

---

# 3. CORE ENDPOINTS

---

## INNOVATIONS

### Create Innovation

```http
POST /api/innovation/create
```

---

### Get Innovations

```http
GET /api/innovation/list
```

---

### Get Innovation Detail

```http
GET /api/innovation/:id
```

---

## CONTRIBUTIONS

### Create Contribution

```http
POST /api/contribution/create
```

---

### Get Contributions

```http
GET /api/contribution/:innovationId
```

---

## AI ROUTES

---

### Analyze Contribution

```http
POST /api/ai/analyze-contribution
```

---

### Innovation Copilot

```http
POST /api/ai/copilot
```

---

### Missing Contributors

```http
POST /api/ai/missing-contributors
```

---

### Timeline Prediction

```http
POST /api/ai/timeline
```

---

## FUNDING

---

### Deposit Funds

```http
POST /api/funding/deposit
```

---

### Get Funding Status

```http
GET /api/funding/:innovationId
```

---

## MILESTONES

---

### Create Milestone

```http
POST /api/milestone/create
```

---

### Approve Milestone

```http
POST /api/milestone/approve
```

---

## REWARDS

---

### Distribute Rewards

```http
POST /api/rewards/distribute
```

---

## PASSPORT

---

### Get Passport

```http
GET /api/passport/:innovationId
```

---

## SIMULATION

---

### Start Simulation

```http
POST /api/simulation/start
```

---

### Step Simulation

```http
POST /api/simulation/step
```

---

### Reset Simulation

```http
POST /api/simulation/reset
```

---

# 4. API RULES

- All responses must be JSON
- All AI endpoints validated via schema
- All blockchain actions logged
- All simulation calls deterministic

---

# END API SPEC
