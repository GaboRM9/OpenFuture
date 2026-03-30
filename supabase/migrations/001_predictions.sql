-- Predictions table: stores individual predictions extracted from forecasts
-- Status lifecycle: pending → correct | incorrect | partial
-- Users manually resolve predictions; auto-scanning is a future concern

create table if not exists predictions (
  id                  uuid primary key default gen_random_uuid(),
  forecast_id         uuid references forecasts(id) on delete cascade,
  topic               text not null,
  horizon             text not null,
  prediction_text     text not null,
  confidence          integer check (confidence >= 0 and confidence <= 100),
  timeframe           text,               -- e.g. "3 months", "by end of 2026"
  resolution_criteria text,               -- what has to be true for this to resolve
  status              text not null default 'pending'
                        check (status in ('pending', 'correct', 'incorrect', 'partial')),
  resolved_at         timestamptz,
  notes               text,               -- free-form context when resolving
  created_at          timestamptz not null default now()
);

create index if not exists predictions_forecast_id_idx on predictions(forecast_id);
create index if not exists predictions_status_idx on predictions(status);
create index if not exists predictions_created_at_idx on predictions(created_at desc);

-- Disable RLS so the anon key can insert/select freely (same as forecasts table)
alter table predictions disable row level security;
