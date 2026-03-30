-- Replace per-prediction rows with one record per forecast run
-- Predictions stored as JSONB array — no need for individual rows

drop table if exists predictions;

create table if not exists prediction_runs (
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

create index if not exists prediction_runs_forecast_id_idx on prediction_runs(forecast_id);
create index if not exists prediction_runs_status_idx on prediction_runs(status);
create index if not exists prediction_runs_created_at_idx on prediction_runs(created_at desc);

alter table prediction_runs disable row level security;
