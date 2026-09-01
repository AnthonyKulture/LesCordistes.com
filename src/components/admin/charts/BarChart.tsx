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

function barPath(x: number, y: number, w: number, baseline: number): string {
  const r = Math.min(4, w / 2, Math.max(baseline - y, 0))
  if (baseline - y <= 0) return ''
  return [
    `M${x.toFixed(1)},${baseline.toFixed(1)}`,
    `L${x.toFixed(1)},${(y + r).toFixed(1)}`,
    `Q${x.toFixed(1)},${y.toFixed(1)} ${(x + r).toFixed(1)},${y.toFixed(1)}`,
    `L${(x + w - r).toFixed(1)},${y.toFixed(1)}`,
    `Q${(x + w).toFixed(1)},${y.toFixed(1)} ${(x + w).toFixed(1)},${(y + r).toFixed(1)}`,
    `L${(x + w).toFixed(1)},${baseline.toFixed(1)}`,
    'Z',
  ].join(' ')
}

export function BarChart({ data, unit = '', ariaLabel, valueLabel }: Props) {
  const [hover, setHover] = useState<number | null>(null)

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Aucune donnée.</p>
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const { top, ticks } = buildScale(maxValue)
  const innerW = W - PAD_LEFT - PAD_RIGHT
  const innerH = H - PAD_TOP - PAD_BOTTOM
  const baseline = PAD_TOP + innerH
  const bandW = innerW / data.length
  const gap = Math.max(2, bandW * 0.25)
  const barW = Math.max(bandW - gap, 2)
  const xAt = (i: number) => PAD_LEFT + i * bandW + gap / 2
  const yAt = (v: number) => PAD_TOP + innerH - (v / top) * innerH
  const labelEvery = data.length > 8 ? 2 : 1
  const showAxisLabel = (i: number) => i % labelEvery === (data.length - 1) % labelEvery
  const fmt = (v: number) => `${formatNumberFr(v)}${unit ? ` ${unit}` : ''}`
  const maxIndex = data.findIndex(d => d.value === maxValue)
  const showDirectLabel = (i: number) =>
    data[i].value > 0 && (i === data.length - 1 || (i === maxIndex && maxValue > data[data.length - 1].value))

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
              <text key={d.month} x={xAt(i) + barW / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="#64748b">
                {formatMonthShort(d.month)}
              </text>
            ) : null
          )}
          {data.map((d, i) => {
            const path = barPath(xAt(i), yAt(d.value), barW, baseline)
            if (!path) return null
            return (
              <path
                key={d.month}
                d={path}
                fill={SERIES_COLOR}
                fillOpacity={hover === null || hover === i ? 1 : 0.55}
              />
            )
          })}
          {data.map((d, i) =>
            showDirectLabel(i) ? (
              <text
                key={`label-${d.month}`}
                x={xAt(i) + barW / 2}
                y={Math.max(yAt(d.value) - 6, 12)}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="#0f172a"
              >
                {fmt(d.value)}
              </text>
            ) : null
          )}
          {data.map((d, i) => (
            <rect
              key={`band-${d.month}`}
              x={PAD_LEFT + i * bandW}
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
              left: `${((xAt(hover) + barW / 2) / W) * 100}%`,
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
