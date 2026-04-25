# OPEN_FUTURE `v0.1.3`

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
Pass 1   →  Sonnet research agent runs all searches, outputs structured evidence JSON
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
- **Conclusion** with a sensitivity statement: *"If [variable] moves from X to Y, probability shifts from A% to B%"*

---

## Prediction Market Integration

Every forecast is grounded against real-money crowd wisdom. Before synthesis, the engine queries:

- **Metaculus** — crowd probability, forecaster count, open questions
- **Polymarket** — binary market prices, trading volume

If a prediction market exists for your topic, it's cited in the Base Rate Analysis. If the model's estimate diverges by more than 5%, it explains why. Both APIs are queried in parallel with exponential-backoff retry before any model pass runs.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 — App Router, server-side streaming |
| AI | Claude Sonnet 4.6 (research) + Claude Haiku 4.5 (compress) + Claude Opus 4.6 (synthesis) |
| Web Search | Anthropic built-in `web_search_20260209` tool |
| Database | Supabase — forecast history, shareable URLs |
| Styling | Tailwind v4 — dark terminal aesthetic by default |
| Rendering | react-markdown + remark-gfm — streamed markdown output |
| Testing | Vitest — unit tests for validation, rate limiting, and logging |

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
            Pass 1: Sonnet + web_search (8-10 searches) → research JSON         │
            Pass 1.5: Haiku compresses JSON → tight evidence bundle             │
            Pass 2: Opus synthesizes → streams full forecast                    │
                                                                                │
            (Metaculus + Polymarket queried in parallel before any pass)        │
                                                                                ▼
                                                            Streamed to client
                                                            Saved to Supabase
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
   ├── Pass 1 — Research (Sonnet 4.6 + web_search, 8-10 searches)
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
- The Conclusion must include: most likely outcome · the single most important variable to watch · what would invalidate the forecast entirely
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI model overrides — optional, defaults shown
MODEL_RESEARCH=claude-sonnet-4-6
MODEL_COMPRESS=claude-haiku-4-5-20251001
MODEL_SYNTHESIS=claude-opus-4-6
MODEL_LIGHT=claude-haiku-4-5-20251001
```

Create the Supabase tables:

```sql
create table forecasts (
  id         uuid primary key default gen_random_uuid(),
  topic      text not null,
  horizon    text not null,
  content    text not null,
  created_at timestamptz default now()
);

create table prediction_runs (
  id           uuid primary key default gen_random_uuid(),
  forecast_id  uuid references forecasts(id) on delete cascade,
  topic        text not null,
  horizon      text not null,
  mode         text not null default 'light' check (mode in ('light', 'deep')),
  predictions  jsonb not null default '[]',
  status       text not null default 'pending'
                 check (status in ('pending', 'correct', 'incorrect', 'partial')),
  reviewed_at  timestamptz,
  notes        text,
  created_at   timestamptz not null default now()
);
```

Migrations are also available in `supabase/migrations/`.

Run:

```bash
npm run dev       # development
npm run test      # unit tests
npm run build     # production build
```

Open `http://localhost:3000`.

---

## Prediction Tracker

Every completed forecast is automatically logged as a **prediction run** — a single record containing all extracted predictions from the output. Runs are tracked through a resolution lifecycle:

```
pending  →  correct | partial | incorrect
```

The `/predictions` page shows all runs with:
- **Calibration score** — `(correct + partial × 0.5) / resolved` across all reviewed forecasts
- **Filter tabs** — view by status (all / pending / correct / partial / incorrect)
- **Per-run actions** — resolve (toggle correct/partial/wrong) or delete with confirmation
- **Prediction preview** — first 3 extracted predictions with confidence shown inline

Predictions are extracted automatically from completed forecasts:
- **Deep mode** — parses the `## Predictions Table` markdown table (timeframe, text, confidence, key assumption)
- **Light mode** — parses the `## Key Predictions` list (text + inline confidence %)

### `prediction_runs` schema

```sql
create table prediction_runs (
  id           uuid primary key default gen_random_uuid(),
  forecast_id  uuid references forecasts(id) on delete cascade,
  topic        text not null,
  horizon      text not null,
  mode         text not null check (mode in ('light', 'deep')),
  predictions  jsonb not null default '[]',
  status       text not null default 'pending'
                 check (status in ('pending', 'correct', 'incorrect', 'partial')),
  reviewed_at  timestamptz,
  notes        text,
  created_at   timestamptz not null default now()
);
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Main forecast interface |
| `/history` | Paginated forecast history, newest first |
| `/forecast/[id]` | Individual shareable forecast |
| `/predictions` | Prediction Tracker — resolve and calibrate runs |
| `/api/forecast` | Streaming POST — topic, horizon, mode |
| `/api/save` | Saves forecast to Supabase and logs a prediction run |
| `/api/delete` | Deletes a forecast by ID |
| `/api/resolve-prediction` | Marks a prediction run correct/partial/incorrect |
| `/api/delete-prediction-run` | Deletes a prediction run by ID |

---

## Reliability & Security

- **Rate limiting** — sliding window: 5 req/min on `/api/forecast`, 20 req/min on `/api/save`
- **Input validation** — topic (1–500 chars), horizon (enum), mode (enum), content (1–100k chars)
- **Timeouts** — 2-minute server timeout on research/compression passes, 5-minute on synthesis stream, 6-minute client-side abort
- **Retry logic** — exponential backoff (3 attempts) for Metaculus and Polymarket API calls
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a strict CSP via `next.config.ts`
- **Structured logging** — timestamped JSON-style logs via `lib/logger.ts`

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
## Conclusion                ← outcome + sensitivity statement + invalidation condition
```

---

> *Signal over noise. Evidence over intuition. Probability over certainty.*
