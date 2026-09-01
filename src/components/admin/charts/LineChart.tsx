'use client'

import { useState } from 'react'
import { buildScale, formatMonthFull, formatMonthShort, formatNumberFr, SERIES_COLOR } from './chartUtils'

type Point = { month: string; value: number }

type Props = {
  data: Point[]
  unit?: string
  ariaLabel: string
  valueLabel: string
}

const W = 640
const H = 260
const PAD_LEFT = 48
const PAD_RIGHT = 20
const PAD_TOP = 24
const PAD_BOTTOM = 28

export function LineChart({ data, unit = '', ariaLabel, valueLabel }: Props) {
  const [hover, setHover] = useState<number | null>(null)

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Aucune donnée.</p>
  }

  const { top, ticks } = buildScale(Math.max(...data.map(d => d.value)))
  const innerW = W - PAD_LEFT - PAD_RIGHT
  const innerH = H - PAD_TOP - PAD_BOTTOM
  const xAt = (i: number) => (data.length === 1 ? PAD_LEFT + innerW / 2 : PAD_LEFT + (i / (data.length - 1)) * innerW)
  const yAt = (v: number) => PAD_TOP + innerH - (v / top) * innerH

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.value).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${xAt(data.length - 1).toFixed(1)},${yAt(0).toFixed(1)} L${xAt(0).toFixed(1)},${yAt(0).toFixed(1)} Z`
  const last = data[data.length - 1]
  const lastX = xAt(data.length - 1)
  const lastY = yAt(last.value)
  const labelEvery = data.length > 8 ? 2 : 1
  const showAxisLabel = (i: number) => i % labelEvery === (data.length - 1) % labelEvery
  const bandW = innerW / Math.max(data.length - 1, 1)
  const fmt = (v: number) => `${formatNumberFr(v)}${unit ? ` ${unit}` : ''}`

  return (
    <div>
      <div className="relative" onMouseLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={ariaLabel}
          className="w-full h-auto block"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {ticks.map(t => (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke={t === 0 ? '#e2e8f0' : '#f1f5f9'}
                strokeWidth={1}
              />
              <text x={PAD_LEFT - 6} y={yAt(t) + 3} textAnchor="end" fontSize={10} fill="#475569">
                {formatNumberFr(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            showAxisLabel(i) ? (
              <text key={d.month} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#64748b">
                {formatMonthShort(d.month)}
              </text>
            ) : null
          )}
          <path d={areaPath} fill={SERIES_COLOR} fillOpacity={0.08} stroke="none" />
          <path d={linePath} fill="none" stroke={SERIES_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null && (
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={PAD_TOP}
              y2={PAD_TOP + innerH}
              stroke="#cbd5e1"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {hover !== null && (
            <circle cx={xAt(hover)} cy={yAt(data[hover].value)} r={3.5} fill={SERIES_COLOR} stroke="#ffffff" strokeWidth={1.5} />
          )}
          <circle cx={lastX} cy={lastY} r={4} fill={SERIES_COLOR} stroke="#ffffff" strokeWidth={1.5} />
          <text
            x={Math.min(lastX, W - PAD_RIGHT - 4)}
            y={Math.max(lastY - 10, 12)}
            textAnchor="end"
            fontSize={11}
            fontWeight={600}
            fill="#0f172a"
          >
            {fmt(last.value)}
          </text>
          {data.map((d, i) => (
            <rect
              key={d.month}
              x={xAt(i) - bandW / 2}
              y={0}
              width={bandW}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm whitespace-nowrap"
            style={{
              left: `${(xAt(hover) / W) * 100}%`,
              top: `${(yAt(data[hover].value) / H) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="text-slate-500">{formatMonthFull(data[hover].month)}</div>
            <div className="font-semibold text-slate-900 tabular-nums">{fmt(data[hover].value)}</div>
          </div>
        )}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">Voir les données</summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-1.5 pr-4 font-medium">Mois</th>
                <th className="py-1.5 text-right font-medium">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.month} className="border-b border-slate-100">
                  <td className="py-1.5 pr-4 text-slate-700">{formatMonthFull(d.month)}</td>
                  <td className="py-1.5 text-right text-slate-900 tabular-nums">{fmt(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
