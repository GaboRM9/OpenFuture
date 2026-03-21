# OpenFuture

The future isn't hidden. It's just unevenly distributed across a thousand data points no one has time to read.

OpenFuture feeds a topic into an AI that browses the live web, synthesizes what it finds, and returns a structured probabilistic forecast — scenarios, predictions, confidence levels, wild cards. Not vibes. Not headlines. Signal.

---

## What it does

You give it a topic and a time horizon. It searches the internet in real time, reads what's out there, and streams back a full analytical forecast: base case, upside, downside, the things that could make all of it wrong.

The output isn't a summary. It's a framework for thinking about what comes next.

---

## Stack

- **Next.js 16** — App Router, server-side streaming
- **Claude claude-sonnet-4-6** — model + built-in web browsing, no scraper needed
- **Supabase** — forecast history, zero auth
- **Tailwind v4** — dark by default
- **react-markdown + remark-gfm** — renders the streamed output

---

## Setup

```bash
git clone https://github.com/GaboRM9/OpenFuture.git
cd OpenFuture
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
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

## How it works

1. You submit a topic + time horizon
2. Claude searches the web autonomously — current state, expert analysis, recent developments
3. The forecast streams back live as it's generated
4. Saved to Supabase automatically, accessible at `/history`

---

> *The present is already the past by the time you read it.*
