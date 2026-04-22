import 'igniteui-webcomponents/themes/light/material.css'
import { IgrGridLite } from 'igniteui-react/grid-lite'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  funnelStageCounts,
  pieItemTopN,
  tileViewTopCrops,
  ttlAreaBuckets,
} from '../jeju/jejuFieldCropModel'
import { EmptyDataHint, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

function SimpleBars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((d) => d.value), 1)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        minHeight: 200,
        padding: '8px 4px 0',
        overflowX: 'auto',
      }}
    >
      {items.map((d) => (
        <div
          key={d.label}
          style={{ flex: '0 0 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <div
            title={`${d.label}: ${d.value}`}
            style={{
              width: '100%',
              height: `${Math.max(8, (d.value / max) * 160)}px`,
              background: 'linear-gradient(180deg,#6366f1,#4f46e5)',
              borderRadius: 6,
            }}
          />
          <span style={{ fontSize: 10, color: '#475569', textAlign: 'center', lineHeight: 1.1 }}>
            {d.label.length > 5 ? `${d.label.slice(0, 4)}…` : d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function HeatBuckets({ rows }: { rows: { bucket: string; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {rows.map((r) => (
        <div
          key={r.bucket}
          style={{
            borderRadius: 10,
            padding: '12px 10px',
            color: '#fff',
            textAlign: 'center',
            fontSize: 13,
            background: `rgba(15,118,110,${0.35 + (r.count / max) * 0.55})`,
          }}
        >
          <div style={{ fontWeight: 600 }}>{r.bucket}</div>
          <div style={{ fontSize: 22, marginTop: 6 }}>{r.count}</div>
        </div>
      ))}
    </div>
  )
}

function FunnelLanes({ stages }: { stages: { stage: string; count: number }[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {stages.map((s) => (
        <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 140, fontSize: 12, color: '#475569' }}>{s.stage}</div>
          <div
            style={{
              height: 22,
              borderRadius: 6,
              background: 'linear-gradient(90deg,#6366f1,#a855f7)',
              width: `${40 + (s.count / max) * 55}%`,
              minWidth: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 8,
              color: '#fff',
              fontSize: 12,
            }}
          >
            {s.count}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function IgniteJejuTab({ rows }: ToolRowsProps) {
  if (!rows.length) return <EmptyDataHint />
  const bars = aggregateAvgTtlByItem(rows)
    .slice(0, 16)
    .map((x) => ({ label: x.item, value: x.avgTtl }))
  const pieBars = pieItemTopN(rows, 10).map((p) => ({ label: p.bucket, value: p.count }))
  const cty = aggregateCtyAvgTtl(rows, 8).map((c) => ({ label: c.cty, value: c.cnt }))
  const tiles = tileViewTopCrops(rows, 12)
  const buckets = ttlAreaBuckets(rows)
  const funnel = funnelStageCounts(rows.length)

  return (
    <TabScroll>
      <ToolSection title="Ignite UI — Grid Lite">
        <p className="gauge-note" style={{ marginTop: 0 }}>
          Ignite UI React 번들에는 별도 차트 컴포넌트가 포함되어 있지 않아, 동일 데이터를 Grid + HTML 시각화로 구성했습니다.
        </p>
        <IgrGridLite
          autoGenerate
          data={rows.slice(0, 120) as unknown as Record<string, unknown>[]}
          style={{ height: 400, display: 'block' }}
        />
      </ToolSection>
      <ToolSection title="HTML — 작목 타일(면적합)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {tiles.map((t, i) => (
            <div
              key={i}
              style={{
                width: 140,
                minHeight: 72,
                borderRadius: 10,
                padding: 10,
                background: 'linear-gradient(145deg,#eef2ff,#e0e7ff)',
                border: '1px solid #c7d2fe',
                fontSize: 12,
                whiteSpace: 'pre-line',
              }}
            >
              {t.text}
            </div>
          ))}
        </div>
      </ToolSection>
      <ToolSection title="HTML — 면적 구간(히트맵 스타일)">
        <HeatBuckets rows={buckets} />
      </ToolSection>
      <ToolSection title="HTML — 평균면적 막대">
        <SimpleBars items={bars} />
      </ToolSection>
      <ToolSection title="HTML — 작목 건수 막대">
        <SimpleBars items={pieBars} />
      </ToolSection>
      <ToolSection title="HTML — 시군 건수 막대">
        <SimpleBars items={cty} />
      </ToolSection>
      <ToolSection title="HTML — 퍼널 레인">
        <FunnelLanes stages={funnel} />
      </ToolSection>
    </TabScroll>
  )
}
