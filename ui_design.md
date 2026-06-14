# OICE — UI/UX SYSTEM DESIGN

## Version 2.0

### The Innovation Operating System

---

# DESIGN VISION

OICE is not a dashboard.

OICE is a living operating system for innovation.

The interface should feel like:

- Linear
- Vercel
- GitHub Insights
- Ethereum Explorer
- Figma
- Bloomberg Terminal
- NASA Mission Control

Users should feel like they are navigating a network of ideas, contributors, capital, execution, and impact.

Every action should reinforce transparency, ownership, coordination, and discovery.

---

# DESIGN PRINCIPLES

## 1. Innovation Is Visual

Ideas should never feel static.

Every project is represented as a living network.

Users should immediately understand:

- who contributed
- where value was created
- how funding moved
- what impact was produced

---

## 2. Transparency By Default

Every score, decision, contribution, reward, and funding flow should be inspectable.

Nothing should feel hidden.

The interface should resemble a blockchain explorer for innovation.

---

## 3. Intelligence Everywhere

AI is embedded into every workflow.

AI should behave like an analyst.

Not a chatbot.

The AI layer continuously explains:

- risks
- opportunities
- contributor quality
- execution probability
- funding recommendations

---

## 4. Motion Communicates Meaning

Animations are functional.

Never decorative.

Every animation should communicate:

- growth
- contribution
- funding movement
- reputation changes
- execution progress

---

## 5. Network First

Everything is connected.

Ideas connect to:

- contributors
- tasks
- funding
- milestones
- outcomes
- rewards

Relationships are first-class UI elements.

---

# VISUAL IDENTITY

## Brand Personality

OICE should feel:

- ambitious
- intelligent
- transparent
- futuristic
- trustworthy
- technical

Avoid:

- playful SaaS aesthetics
- excessive gradients
- crypto casino visuals
- generic startup design

---

# COLOR SYSTEM

```css
:root {
  /* Backgrounds */

  --bg-primary: #050816;
  --bg-secondary: #0b1020;

  /* Surfaces */

  --surface: #111827;
  --surface-elevated: #161f35;
  --surface-hover: #1a2540;

  /* Text */

  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;

  /* Innovation */

  --innovation: #00e5ff;

  /* Funding */

  --funding: #10b981;

  /* Contributors */

  --contributor: #7b61ff;

  /* Reputation */

  --reputation: #f59e0b;

  /* AI */

  --ai: #ff4fd8;

  /* Risk */

  --risk: #ef4444;

  /* Success */

  --success: #22c55e;

  /* Borders */

  --border: rgba(255, 255, 255, 0.08);
}
```

---

# GRADIENT SYSTEM

## Innovation

```css
#00E5FF → #7B61FF
```

## AI

```css
#7B61FF → #FF4FD8
```

## Funding

```css
#10B981 → #00E5FF
```

## Success

```css
#00E5FF → #10B981
```

Usage:

- CTA buttons
- Graph edges
- Score highlights
- Active tabs

Never use gradients as page backgrounds.

---

# TYPOGRAPHY

## Primary Font

Inter

Used for:

- headings
- labels
- navigation
- body text

---

## Data Font

IBM Plex Mono

Used for:

- IDs
- wallet addresses
- contribution hashes
- timestamps
- scores
- metrics

---

# TYPE SCALE

## Hero

72px

Weight: 800

Line Height: 1.05

---

## Section Header

48px

Weight: 700

---

## Page Header

36px

Weight: 700

---

## Card Title

24px

Weight: 600

---

## Body

16px

Weight: 500

---

## Small Text

14px

Weight: 500

---

## Metadata

12px

IBM Plex Mono

---

# SPACING SYSTEM

```txt
4
8
12
16
24
32
48
64
96
128
```

Only use spacing values from this scale.

---

# LAYOUT SYSTEM

## Desktop

```txt
Sidebar
280px

Main Content
Fluid

AI Panel
420px
```

---

## Tablet

```txt
Collapsible Sidebar

Single Content Column

Slideout AI Panel
```

---

## Mobile

```txt
Bottom Navigation

Stacked Layout

Full Screen Drawers
```

---

# GLOBAL COMPONENTS

## Button

Variants:

- Primary
- Secondary
- Ghost
- Danger

States:

- Default
- Hover
- Active
- Loading
- Disabled

---

## Card

Purpose:

Display structured information.

Features:

- subtle elevation
- hover state
- optional live status indicator

---

## Modal

Used for:

- creating projects
- funding actions
- governance actions

Blurred background required.

---

## Drawer

Used for:

- AI insights
- node details
- contributor details

---

## Tabs

Animated underline.

150ms transition.

---

## Stat Card

Contains:

- metric
- trend
- historical comparison

---

# ADVANCED COMPONENTS

## DNA GRAPH

Flagship component.

Represents the innovation network.

---

### Node Types

Idea

Circle

Contributor

Diamond

Funding

Square

Milestone

Hexagon

Outcome

Star

Reward

Triangle

---

### Edge Types

Knowledge Flow

Contribution Flow

Funding Flow

Reward Flow

Execution Flow

---

### Features

- zoom
- pan
- search
- filters
- simulation overlay
- replay mode

---

## AI COPILOT PANEL

Persistent intelligence layer.

Displays:

- bottlenecks
- contributor recommendations
- funding opportunities
- execution forecasts
- risk assessments

---

## TIMELINE VIEWER

Git history for innovation.

Displays:

- contributions
- milestones
- funding events
- governance decisions
- reward distributions

---

## PASSPORT VIEWER

Displays:

- contribution history
- impact score
- reputation score
- reward history
- network position
- AI-generated summary

---

## SIMULATION ENGINE

Full-screen immersive environment.

Allows users to model:

- new contributors
- funding changes
- milestone delays
- execution scenarios

Results update in real time.

---

# LANDING PAGE

## Section 1 — Hero

Fullscreen.

Animated innovation network background.

Headline:

Innovation Should Work Like Open Source

Subheadline:

Coordinate ideas.
Reward contributors.
Fund execution.
Track impact.

CTA:

Launch OICE

Secondary CTA:

Run Simulation

---

## Section 2 — The Broken System

Animated metrics.

Examples:

97% of ideas never reach execution

Contributions go unrewarded

Impact remains invisible

Funding arrives too late

---

## Section 3 — The OICE Engine

Interactive architecture visualization.

Flow:

Idea

↓

Contributors

↓

Execution

↓

Funding

↓

Impact

↓

Rewards

---

## Section 4 — DNA Graph Showcase

Live network visualization.

Users can:

- zoom
- inspect nodes
- view contributors
- explore impact

---

## Section 5 — Simulation Demo

Interactive scenario builder.

Users modify:

- contributors
- funding
- timelines

Observe projected outcomes.

---

## Section 6 — Innovation passports

Scrollable lifecycle visualizations.

Show how innovations evolve over time.

---

## Section 7 — Final CTA

Fullscreen.

Animated particle field.

Headline:

Build The Future In Public

CTA:

Launch OICE

---

# INNOVATION PAGE

Mission Control layout.

---

## Top

Project Header

Displays:

- Innovation Score
- Execution Probability
- Capital Efficiency
- Active Contributors

---

## Center

DNA Graph

Primary focus.

Occupies majority of screen.

---

## Right Rail

AI Insights

Continuous analysis and recommendations.

---

## Bottom

Timeline Replay

Allows users to replay project evolution.

---

# PASSPORT PAGE

Structure:

Identity

Contribution History

Impact Analytics

Funding Earned

Reputation Evolution

AI Summary

Network Position

Simulation Results

---

# SIMULATION MODE

Full-screen experience.

Hide navigation.

Focus entirely on:

- graph
- controls
- outcomes

---

## Left Panel

Simulation Inputs

---

## Center

Live Network

---

## Right Panel

Predicted Results

---

# ANIMATION SYSTEM

Frameworks:

- Framer Motion
- Motion One
- React Flow Animations

---

# DURATIONS

Fast

150ms

Normal

250ms

Slow

400ms

---

# MOTION RULES

Hover

Scale 1.02

Card Entry

Fade + Slide Up

Graph Expansion

Node Growth Animation

Funding Event

Pulse Along Edges

Milestone Completion

Network Ripple Effect

---

# COMMAND PALETTE

Shortcut:

Ctrl + K

Capabilities:

- search projects
- search contributors
- create innovation
- open passports
- launch simulations

---

# SEARCH SYSTEM

Global Search Across:

- projects
- contributors
- ideas
- passports
- funding pools

Instant results.

---

# LIVE COLLABORATION

Inspired by Figma.

Features:

- active cursors
- presence indicators
- live updates
- collaborative editing

---

# AI NARRATIVE LAYER

AI continuously generates contextual insights.

Examples:

"This project gained 14 contributors this month."

"Execution probability increased by 21%."

"Funding efficiency improved by 17%."

These insights should appear naturally throughout the interface.

---

# SUCCESS CRITERIA

A first-time user should immediately understand:

- what the project is
- who contributes
- where value flows
- how rewards are distributed
- how impact is measured

The interface should feel like:

GitHub + Ethereum + Figma + Bloomberg + Mission Control

combined into a new category of software:

THE INNOVATION OPERATING SYSTEM.
