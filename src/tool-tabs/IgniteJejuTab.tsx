import { useMemo } from 'react'
import 'igniteui-webcomponents/themes/light/material.css'
import 'igniteui-grid-lite/define'
import { IgrGridLite } from 'igniteui-react/grid-lite'
import {
  IgrCategoryXAxis,
  IgrCategoryXAxisModule,
  IgrColumnSeries,
  IgrColumnSeriesModule,
  IgrDataChart,
  IgrDataChartCategoryModule,
  IgrDataChartCoreModule,
  IgrFunnelChart,
  IgrFunnelChartModule,
  IgrLineSeries,
  IgrLineSeriesModule,
  IgrNumericYAxis,
  IgrNumericYAxisModule,
  IgrPieChart,
  IgrPieChartModule,
  IgrSparkline,
  IgrSparklineModule,
  SparklineDisplayType,
} from 'igniteui-react-charts'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  cumulativeTtlSeries,
  funnelStageCounts,
  pieItemTopN,
  tileViewTopCrops,
  ttlAreaBuckets,
} from '../jeju/jejuFieldCropModel'
import { EmptyDataHint, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

let igniteChartsRegistered = false
function registerIgniteCharts() {
  if (igniteChartsRegistered) return
  igniteChartsRegistered = true
  IgrPieChartModule.register()
  IgrFunnelChartModule.register()
  IgrDataChartCoreModule.register()
  IgrDataChartCategoryModule.register()
  IgrCategoryXAxisModule.register()
  IgrNumericYAxisModule.register()
  IgrColumnSeriesModule.register()
  IgrLineSeriesModule.register()
  IgrSparklineModule.register()
}
registerIgniteCharts()

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

  const ignitePieData = useMemo(() => {
    const pts = pieItemTopN(rows, 10).map((p) => ({ name: p.bucket, count: p.count }))
    return pts.length ? pts : [{ name: '데이터 없음', count: 1 }]
  }, [rows])

  const igniteFunnelData = useMemo(
    () => funnelStageCounts(rows.length).map((f) => ({ stage: f.stage, count: f.count })),
    [rows],
  )

  const igniteColumnData = useMemo(
    () =>
      aggregateAvgTtlByItem(rows)
        .slice(0, 12)
        .map((x) => ({
          cat: x.item.length > 11 ? `${x.item.slice(0, 10)}…` : x.item,
          avg: x.avgTtl,
        })),
    [rows],
  )
  const igniteColumnSafe =
    igniteColumnData.length > 0 ? igniteColumnData : [{ cat: '데이터 없음', avg: 0 }]

  const igniteLineData = useMemo(
    () =>
      aggregateCtyAvgTtl(rows, 12).map((c) => ({
        cty: c.cty.length > 11 ? `${c.cty.slice(0, 10)}…` : c.cty,
        cnt: c.cnt,
      })),
    [rows],
  )
  const igniteLineSafe = igniteLineData.length ? igniteLineData : [{ cty: '데이터 없음', cnt: 0 }]

  const igniteSparkData = useMemo(() => {
    const cum = cumulativeTtlSeries(rows).slice(0, 48)
    const pts = cum.map((c, i) => ({ i, v: c.cumTtl }))
    return pts.length ? pts : [
      { i: 0, v: 0 },
      { i: 1, v: 0 },
    ]
  }, [rows])

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
      <ToolSection title="Ignite UI — igniteui-react-charts (5종)">
        <p className="gauge-note" style={{ marginTop: 0 }}>
          <strong>Pie</strong>·<strong>Funnel</strong>·<strong>Column</strong>에 더해 <strong>Line</strong>
          {`(cty·${BAT_COL.soc_est_end} 구간별 건수)`}, <strong>Sparkline</strong>
          {`(누적 ${BAT_COL.delta_q_Ah} 추이)`}을 둡니다.
        </p>
        <IgrPieChart
          height="280px"
          width="100%"
          dataSource={ignitePieData}
          valueMemberPath="count"
          labelMemberPath="name"
          innerExtent={0.5}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            marginTop: 14,
          }}
        >
          <div>
            <p className="gauge-note" style={{ marginTop: 0, marginBottom: 6 }}>
              Funnel — 파이프라인 단계
            </p>
            <IgrFunnelChart
              height="260px"
              width="100%"
              dataSource={igniteFunnelData}
              valueMemberPath="count"
              outerLabelMemberPath="stage"
            />
          </div>
          <div>
            <p className="gauge-note" style={{ marginTop: 0, marginBottom: 6 }}>
              {`Column — ${BAT_COL.cyc_condition_age_type}별 평균 ${BAT_COL.delta_q_Ah}(상위 12)`}
            </p>
            <IgrDataChart height="260px" width="100%" dataSource={igniteColumnSafe} isHorizontalZoomEnabled={false}>
              <IgrCategoryXAxis name="igColX" label="cat" />
              <IgrNumericYAxis name="igColY" labelLocation="OutsideLeft" minimumValue={0} title={`평균 ${BAT_COL.delta_q_Ah}`} />
              <IgrColumnSeries
                name="igColS"
                xAxisName="igColX"
                yAxisName="igColY"
                valueMemberPath="avg"
                title={`평균 ${BAT_COL.delta_q_Ah}`}
                brush="#6366f1"
              />
            </IgrDataChart>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            marginTop: 14,
          }}
        >
          <div>
            <p className="gauge-note" style={{ marginTop: 0, marginBottom: 6 }}>
              {`Line — cty·${BAT_COL.soc_est_end} 구간별 건수(상위 12)`}
            </p>
            <IgrDataChart height="260px" width="100%" dataSource={igniteLineSafe} isHorizontalZoomEnabled={false}>
              <IgrCategoryXAxis name="igLineX" label="cty" />
              <IgrNumericYAxis name="igLineY" labelLocation="OutsideLeft" minimumValue={0} title="건수" />
              <IgrLineSeries
                name="igLineS"
                xAxisName="igLineX"
                yAxisName="igLineY"
                valueMemberPath="cnt"
                title="건수"
                thickness={2.5}
                brush="#ea580c"
              />
            </IgrDataChart>
          </div>
          <div>
            <p className="gauge-note" style={{ marginTop: 0, marginBottom: 6 }}>
              {`Sparkline — 누적 ${BAT_COL.delta_q_Ah}(앞 48행)`}
            </p>
            <IgrSparkline
              height="100px"
              width="100%"
              dataSource={igniteSparkData}
              labelMemberPath="i"
              valueMemberPath="v"
              displayType={SparklineDisplayType.Line}
              brush="#0d9488"
            />
          </div>
        </div>
      </ToolSection>

      <ToolSection title="Ignite UI — Grid Lite">
        <p className="gauge-note" style={{ marginTop: 0 }}>
          <code>igniteui-grid-lite</code> 그리드와 HTML 시각화입니다.
        </p>
        <IgrGridLite
          autoGenerate
          data={rows.slice(0, 120) as unknown as Record<string, unknown>[]}
          style={{ height: 400, display: 'block' }}
        />
      </ToolSection>
      <ToolSection title={`HTML — ${BAT_COL.cyc_condition_age_type} 타일(${BAT_COL.delta_q_Ah} 합)`}>
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
      <ToolSection title={`HTML — ${BAT_COL.delta_q_Ah} 구간(히트맵 스타일)`}>
        <HeatBuckets rows={buckets} />
      </ToolSection>
      <ToolSection title={`HTML — 평균 ${BAT_COL.delta_q_Ah} 막대`}>
        <SimpleBars items={bars} />
      </ToolSection>
      <ToolSection title={`HTML — ${BAT_COL.cyc_condition_age_type} 건수 막대`}>
        <SimpleBars items={pieBars} />
      </ToolSection>
      <ToolSection title={`HTML — cty(${BAT_COL.soc_est_end}) 건수 막대`}>
        <SimpleBars items={cty} />
      </ToolSection>
      <ToolSection title="HTML — 퍼널 레인">
        <FunnelLanes stages={funnel} />
      </ToolSection>
    </TabScroll>
  )
}
