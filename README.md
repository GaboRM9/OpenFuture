# OPEN_FUTURE

> *The present is already the past by the time you read it.*

The future isn't hidden. It's just unevenly distributed across a thousand data points no one has time to read.

OpenFuture feeds a topic into an AI that browses the live web, synthesizes what it finds, and returns a structured probabilistic forecast — scenarios, predictions, confidence levels, wild cards, steelmanned counterarguments. Not vibes. Not headlines. Signal.

---

## What it does

You give it a topic and a time horizon. It searches the internet in real time, reads what's out there, and streams back a full analytical forecast: base case, upside, downside, the things that could make all of it wrong — and the single variable that determines which future actually arrives.

The output isn't a summary. It's a framework for thinking about what comes next.

---

## Modes

### LIGHT
Fast. Three targeted web searches. Concise predictions with explicit confidence percentages. Returns in under 30 seconds. For when you need signal, not ceremony.

### DEEP
Rigorous. Eight to ten web searches across current state, expert forecasts, base rates, historical analogues, contrarian views, macro factors, and wild card risks. Two-pass architecture:

```
Pass 1   →  Haiku research agent runs all searches, outputs structured evidence JSON
Pass 1.5 →  Haiku compresses the evidence (token-efficient, quality-preserving)
Pass 2   →  Opus synthesizes into a full forecast from compressed evidence
```

Deep mode output includes:
- **Probability update chain** — explicit base rate → adjustments → final estimate
- **Scenario analysis** with causal paths (A → causes B → leads to C), not just labels
- **Predictions table** with resolution criteria — every prediction is falsifiable by design
- **Wild cards** with explicit probability estimates
- **Steelman** — the strongest case that the base case is wrong
- **Pre-mortem** — what single failure would most likely cause the forecast to miss
- **Bottom line** with a sensitivity statement: *"If [variable] moves from X to Y, probability shifts from A% to B%"*

---

## Prediction Market Integration

Every forecast is grounded against real-money crowd wisdom. Before synthesis, the engine queries:

- **Metaculus** — crowd probability, forecaster count, open questions
- **Polymarket** — binary market prices, trading volume

If a prediction market exists for your topic, it's cited in the Base Rate Analysis. If the model's estimate diverges by more than 5%, it explains why.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 — App Router, server-side streaming |
| AI | Claude Haiku 4.5 (research) + Claude Opus 4.6 (synthesis) |
| Web Search | Anthropic built-in `web_search_20260209` tool |
| Database | Supabase — forecast history, shareable URLs |
| Styling | Tailwind v4 — dark terminal aesthetic by default |
| Charts | Recharts — metric visualization from forecast data |
| Rendering | react-markdown + remark-gfm — streamed markdown output |

---

## Architecture

```
User submits topic + horizon + mode
        │
        ├── LIGHT ──────────────────────────────────────────────────────────────┐
        │   Haiku + web_search (3 searches)                                     │
        │   → streams forecast directly                                         │
        │                                                                       │
        └── DEEP ────────────────────────────────────────────────────────────── ┤
            Pass 1: Haiku + web_search (8-10 searches) → research JSON          │
            Pass 1.5: Haiku compresses JSON → tight evidence bundle             │
            Pass 2: Opus synthesizes → streams full forecast                    │
                                                                                │
            (Metaculus + Polymarket queried in parallel before any pass)        │
                                                                                ▼
                                                            Streamed to client
                                                            Saved to Supabase
                                                            Chart generated from forecast data
                                                            Shareable URL created
```

---

## Setup

```bash
git clone https://github.com/GaboRM9/OpenFuture.git
cd OpenFuture
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

Create the Supabase table:

```sql
create table forecasts (
  id         uuid primary key default gen_random_uuid(),
  topic      text not null,
  horizon    text not null,
  content    text not null,
  created_at timestamptz default now()
);
```

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Main forecast interface |
| `/history` | All past forecasts, newest first |
| `/forecast/[id]` | Individual shareable forecast |
| `/api/forecast` | Streaming POST — topic, horizon, mode |
| `/api/save` | Saves completed forecast to Supabase |
| `/api/chart` | Extracts metric data from forecast text for chart rendering |

---

## Forecast Output Structure (Deep Mode)

```
## Current State Assessment
## Base Rate Analysis        ← update chain: prior → adjustments → posterior
## Key Drivers & Trends      ← ranked by impact
## Scenario Analysis         ← Optimistic / Base / Pessimistic with causal paths
## Predictions Table         ← Timeframe | Prediction | Confidence | Assumption | Resolved When
## Wild Cards                ← explicit probabilities per card
## Steelman                  ← strongest case against the base case
## Pre-Mortem                ← most likely single cause of failure
## Bottom Line               ← outcome + sensitivity statement + invalidation condition
```

---

## Top 20 — The Transmission Queue

*What gets built next, in order of signal-to-noise ratio.*

**01 — Forecast Accuracy Tracker**
Come back to past forecasts when predictions resolve. Score each one. Track calibration over time. Build a record of what the engine gets right and what it misses — and why.

**02 — Source Citation Linking**
Every factual claim in the forecast links to the web source it came from. Full epistemic transparency. You should be able to trace any number back to its origin.

**03 — Forecast Versioning**
Re-run the same topic weekly or monthly. Plot how the probability estimate moves over time. Watch the future update itself as new evidence arrives.

**04 — Resolution Alerts**
Set a watch on a forecast. When the resolution date arrives — or when a key variable crosses a threshold — get notified. The forecast shouldn't just sit there.

**05 — More Prediction Market Sources**
Add Manifold Markets, Kalshi, and PredictIt alongside Metaculus and Polymarket. The more crowd data, the better the prior.

**06 — Forecast Comparison Mode**
Run two topics or two time horizons side by side. Useful for comparing competing hypotheses or testing how sensitive an outcome is to the horizon.

**07 — User Accounts + Personal History**
Right now all forecasts are public. Accounts let users build a private forecast history, track their own accuracy, and revisit their past reasoning.

**08 — Batch Forecasting**
Submit a list of related questions at once — e.g., all the variables in a geopolitical scenario. The engine runs them in sequence and surfaces correlations.

**09 — Scenario Probability Editor**
Let users adjust scenario probabilities manually after the forecast is generated. If you think the model underweights the downside, drag it up and see how it changes the bottom line.

**10 — Research Depth Control**
Slider from 3 to 15 searches. Power users who want maximum coverage can go deeper. Users on a time budget stay fast.

**11 — API Access + Embed Widget**
Expose the forecast engine as a public API. Let developers embed a live forecast widget into their own products. Rate-limited, key-authenticated.

**12 — Real-Time Data Feeds**
Pull structured live data before synthesis — FRED economic indicators, Google Trends, Reddit sentiment, GitHub star velocity for tech topics. Structured signal, not just search results.

**13 — Collaborative Forecasting**
Share a forecast in edit mode. Let multiple people annotate, adjust probabilities, and add their own reasoning. Aggregate into a team consensus view.

**14 — Forecast Templates**
Pre-built query templates for common domains: macro economics, geopolitics, technology adoption, public health, sports. One click to a well-structured question with a sensible horizon.

**15 — Confidence Interval Charts**
Replace point estimates with visualized probability distributions. Show the range of outcomes, not just the most likely one. A 60% confidence interval that's narrow is different from one that covers 20-80%.

**16 — Export to PDF / Markdown**
Download any forecast as a formatted PDF or raw markdown file. Built for sharing in reports, investment memos, or research documents.

**17 — Accuracy Leaderboard**
Public rankings for topics with resolved forecasts. See which domains the engine calls correctly most often. Benchmark against prediction market performance.

**18 — Fine-Tuned Reasoning Mode**
Optional pass using a reasoning model for topics where step-by-step deduction matters more than breadth — legal questions, scientific predictions, long-chain technical forecasts.

**19 — PWA / Mobile**
Progressive Web App support. The forecast form and output are already mobile-responsive — full offline caching, home screen install, push notifications for resolution alerts.

**20 — Discord / Slack Integration**
`/forecast AGI timeline 5 years` in any channel. Returns the bottom line + key predictions inline. Team forecasting without leaving the conversation.

---

> *Signal over noise. Evidence over intuition. Probability over certainty.*
