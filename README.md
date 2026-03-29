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

## Forecasting Logic

### Pipeline

Every forecast request runs through a deterministic sequence before a single word is streamed to the client.

```
1. Market priors fetch (parallel)
   ├── Metaculus API → top 5 open questions matching topic → community median %
   └── Polymarket API → top 3 active markets matching topic → YES price %
        │
        ▼ injected as PREDICTION MARKET PRIORS into synthesis prompt

2. LIGHT MODE
   └── Haiku 4.5 + web_search
       ├── Search 1: current state of topic
       ├── Search 2: recent developments
       └── Search 3: expert outlook
       → stream forecast

   DEEP MODE
   ├── Pass 1 — Research (Haiku 4.5 + web_search, 8-10 searches)
   │   Searches cover: current state · recent data signals · expert forecasts ·
   │   historical base rates · reference class data · contrarian views ·
   │   macro/geopolitical factors · sector trends · wild card risks ·
   │   Metaculus + Polymarket crowd probabilities
   │   → outputs structured evidence JSON
   │
   ├── Pass 1.5 — Compression (Haiku 4.5, no tools)
   │   Reduces evidence JSON: ≤20 words per string, ≤5 items per array
   │   Preserves every unique fact, data point, and source
   │   → compressed evidence bundle
   │
   └── Pass 2 — Synthesis (Opus 4.6, no tools)
       Receives: compressed evidence + market priors + horizon strategy
       → streams full structured forecast

3. Chart generation (Sonnet 4.6 + web_search, runs after forecast completes)
   Identifies the single most relevant quantifiable metric for the topic,
   fetches real historical values, projects forward from today
   → JSON chart data rendered by Recharts
```

---

### Horizon Strategy

The time horizon changes what kind of evidence the model is told to prioritize. Before any search or synthesis, a horizon framing is injected into the prompt:

| Horizon | Strategy |
|---------|----------|
| Days / weeks / short months | Near-term momentum dominates. Focus on specific upcoming catalysts and existing trajectories. Structural trends are largely irrelevant. |
| Medium months | Balance current momentum with structural forces. Identify the 1-2 inflection points most likely to determine the outcome within the window. |
| Years / decades | Structural trends, base rates, and fundamental drivers dominate over near-term noise. Emphasize technology curves, demographic shifts, and historical analogues. |

---

### Probability Methodology

The engine is instructed to produce calibrated probabilities using a Bayesian update chain, not intuitive point estimates.

**Step 1 — Identify the reference class**
Before touching current conditions, the model must answer: *"In similar past situations, what fraction resolved this way?"* This base rate is stated explicitly.

**Step 2 — Apply adjustments**
Each material factor that differs from the reference class adds or subtracts from the base rate. Every adjustment is labeled as either:
- **Epistemic** — unknown but knowable (could be resolved with more research)
- **Aleatory** — inherent randomness (irreducible uncertainty)

**Step 3 — Cross-check against prediction markets**
If Metaculus or Polymarket data is available, the model cites the crowd probability as a separate data point. Any divergence greater than 5 percentage points must be explained.

**Step 4 — Resist compression**
The model is explicitly instructed not to cluster probabilities near 50%. If evidence is strong, estimates should reflect that (80%+). If evidence is weak, they should reflect that too (sub-30%).

**Deep mode update chain format:**
```
Base rate: X%  (reference class: [description])
  [+N%] reason  (epistemic)
  [-N%] reason  (aleatory)
  [+N%] reason  (epistemic)
  ────
Final estimate: ~X%

Prediction market: Y% (Metaculus, n=NNN) — divergence: [explanation]
```

---

### Evidence Schema (Deep Mode)

Pass 1 outputs a structured JSON object. Pass 2 synthesizes exclusively from this — no additional web access.

```json
{
  "current_state": "concise summary with key facts and metrics",
  "data_signals": ["signal with source", "..."],
  "expert_forecasts": ["forecast with attribution", "..."],
  "base_rates": "reference class description and historical base rate %",
  "historical_analogues": ["analogue 1", "..."],
  "contrarian_views": ["view 1", "..."],
  "macro_factors": ["factor 1", "..."],
  "wild_card_risks": ["risk 1", "..."],
  "key_uncertainties": ["uncertainty 1", "..."],
  "prediction_market_probability": "crowd probability from Metaculus/Polymarket, or 'not found'"
}
```

---

### Forecast Integrity Rules

Rules embedded in the synthesis prompt that govern every deep forecast:

- Every claim must reference the provided research data — no hallucinated evidence
- Every prediction in the table must include a "Resolved When" column — a specific, observable, measurable event (no vague language)
- Scenario probabilities must sum to ~100%
- The Bottom Line must include: most likely outcome · the single most important variable to watch · what would invalidate the forecast entirely
- The Steelman section is not a list of risks — it is the single strongest argument that the base case is wrong, written as a well-informed skeptic would make it

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
