'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

type DataPoint = {
  label: string
  value: number
  projected: boolean
}

type ChartData = {
  metric: string
  unit: string
  description: string
  data: DataPoint[]
}

type Props = {
  data: ChartData
}

function CustomTooltip({ active, payload, label, unit }: {
  active?: boolean
  payload?: { value: number; payload: DataPoint }[]
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]
  return (
    <div
      className="border px-3 py-2 text-xs"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--green-border)',
        color: 'var(--green)',
      }}
    >
      <p style={{ color: 'var(--green-muted)' }}>{label}</p>
      <p className="font-bold mt-0.5">
        {point.value.toLocaleString()} {unit}
        {point.payload.projected && (
          <span style={{ color: 'var(--green-muted)' }}> · projected</span>
        )}
      </p>
    </div>
  )
}

export default function ForecastChart({ data }: Props) {
  // Find split index between historical and projected
  const splitIdx = data.data.findIndex((d) => d.projected)
  const splitLabel = splitIdx > 0 ? data.data[splitIdx].label : null

  const values = data.data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.2 || 1

  return (
    <div
      className="border w-full"
      style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--green-border)' }}
      >
        <div>
          <p
            className="text-xs tracking-widest uppercase font-bold"
            style={{ color: 'var(--green-bright)' }}
          >
            {data.metric}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--green-muted)' }}>
            {data.description}
          </p>
        </div>
        <span
          className="text-xs tracking-widest ml-4 shrink-0 mt-0.5"
          style={{ color: 'var(--green-faint)' }}
        >
          {data.unit}
        </span>
      </div>

      {/* Chart */}
      <div className="px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--green-dim)"  stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--green-dim)"  stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillGradProj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--green-muted)" stopOpacity={0.12} />
                <stop offset="95%" stopColor="var(--green-muted)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--green-muted)', fontFamily: 'inherit' }}
              axisLine={{ stroke: 'var(--green-border)' }}
              tickLine={false}
            />
            <YAxis
              domain={[min - padding, max + padding]}
              tick={{ fontSize: 10, fill: 'var(--green-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) =>
                Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
              }
            />
            <Tooltip content={<CustomTooltip unit={data.unit} />} />

            {splitLabel && (
              <ReferenceLine
                x={splitLabel}
                stroke="var(--green-border)"
                strokeDasharray="4 4"
                label={{
                  value: 'NOW',
                  fontSize: 9,
                  fill: 'var(--green-muted)',
                  fontFamily: 'inherit',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--green-dim)"
              strokeWidth={1.5}
              fill="url(#fillGrad)"
              dot={(props) => {
                const { cx, cy, payload } = props
                if (payload.projected) return <g key={props.key} />
                return (
                  <circle
                    key={props.key}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="var(--green)"
                    stroke="none"
                  />
                )
              }}
              activeDot={{ r: 4, fill: 'var(--green-bright)', stroke: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 px-4 pb-3 text-xs"
        style={{ color: 'var(--green-faint)' }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-px w-4" style={{ background: 'var(--green-dim)' }} />
          HISTORICAL
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-px w-4"
            style={{ background: 'var(--green-muted)', borderTop: '1px dashed var(--green-muted)' }}
          />
          PROJECTED
        </span>
      </div>
    </div>
  )
}
