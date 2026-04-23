import '@progress/kendo-theme-default/dist/default-dataviz-v4.css'
import type { ReactNode } from 'react'
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTooltip,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartXAxis,
  ChartXAxisItem,
  ChartYAxis,
  ChartYAxisItem,
} from '@progress/kendo-react-charts'
import {
  aggregateAvgTtlByItem,
  bubblePlotRows,
  cumulativeTtlSeries,
  funnelStageCounts,
  metricAveragesJeju,
  pieItemTopN,
  ttlHistogramBins,
  type JejuFieldCropSlim,
} from '../jeju/jejuFieldCropModel'

export function downsampleCum<T>(full: T[], maxPoints: number) {
  if (full.length <= maxPoints) return full
  const step = Math.ceil(full.length / maxPoints)
  const out = full.filter((_, i) => i % step === 0)
  const last = full[full.length - 1]
  if (out.length && out[out.length - 1] !== last) out.push(last)
  return out
}

function MiniKendoChart({ title, height, children }: { title: string; height: number; children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '6px 6px 2px',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 2 }}>{title}</div>
      <Chart style={{ height }}>
        <ChartTooltip />
        <ChartLegend visible={false} />
        {children}
      </Chart>
    </div>
  )
}

const chartGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 10,
} as const

const defaultChartHeight = 148

export type JejuKendoChartGalleryProps = {
  rows: JejuFieldCropSlim[]
  /** 차트 높이(px). 기본 148 */
  chartHeight?: number
}

/** 제주 밭작물 동일 데이터로 KendoReact Chart 10종(막대·라인·영역·도넛·퍼널·버블·레이더·가로막대·범위막대·산점) */
export function JejuKendoChartGallery({ rows, chartHeight = defaultChartHeight }: JejuKendoChartGalleryProps) {
  const h = chartHeight
  const funnel = funnelStageCounts(rows.length)

  const colData = aggregateAvgTtlByItem(rows)
    .slice(0, 8)
    .map((x) => ({
      item: x.item.length > 7 ? `${x.item.slice(0, 6)}…` : x.item,
      avgTtl: x.avgTtl,
    }))
  const cumSeries = downsampleCum(cumulativeTtlSeries(rows), 56)
  const pieKendo = pieItemTopN(rows, 8)
  const histRange = ttlHistogramBins(rows, 8).map((b) => ({
    bin: b.bin.length > 14 ? `${b.bin.slice(0, 13)}…` : b.bin,
    lo: 0,
    hi: b.count,
  }))
  const radarRows = metricAveragesJeju(rows)
  const bubbles = bubblePlotRows(rows, 120)
  const scatterPts = bubbles.slice(0, 90)

  return (
    <div style={chartGrid}>
      <MiniKendoChart title="1. Column — 작목 평균 재배면적" height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem labels={{ rotation: -35 }} />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem labels={{ format: '{0}' }} />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem type="column" data={colData} field="avgTtl" categoryField="item" color="#6366f1" />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="2. Line — 누적 총재배면적(샘플링)" height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="line"
            style="smooth"
            data={cumSeries.length ? cumSeries : [{ seq: 0, cumTtl: 0 }]}
            field="cumTtl"
            categoryField="seq"
            color="#0d9488"
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="3. Area — 누적면적(영역)" height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="area"
            style="smooth"
            data={cumSeries.length ? cumSeries : [{ seq: 0, cumTtl: 0 }]}
            field="cumTtl"
            categoryField="seq"
            color="#a855f7"
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="4. Donut — 작목 건수 비중" height={h}>
        <ChartSeries>
          <ChartSeriesItem
            type="donut"
            holeSize={0.55}
            data={pieKendo.length ? pieKendo : [{ bucket: '—', count: 1 }]}
            categoryField="bucket"
            field="count"
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="5. Funnel — 작목 건수(상위→하위)" height={h}>
        <ChartSeries>
          <ChartSeriesItem
            type="funnel"
            data={pieKendo.length ? pieKendo : [{ bucket: '—', count: 1 }]}
            categoryField="bucket"
            field="count"
            dynamicHeight={false}
            segmentSpacing={2}
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="6. Bubble — 면적×조사대지(크기=판매금액)" height={h}>
        <ChartXAxis>
          <ChartXAxisItem title={{ text: '총재배면적' }} majorGridLines={{ visible: true }} />
        </ChartXAxis>
        <ChartYAxis>
          <ChartYAxisItem title={{ text: '조사대지(평)' }} majorGridLines={{ visible: true }} />
        </ChartYAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="bubble"
            data={
              bubbles.length
                ? bubbles
                : [
                    { bx: 0, by: 0, bsize: 8 },
                    { bx: 1, by: 1, bsize: 8 },
                  ]
            }
            xField="bx"
            yField="by"
            sizeField="bsize"
            color="#f97316"
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="7. Radar area — 지표 평균 프로필" height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem visible={false} />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="radarArea"
            data={radarRows}
            field="avg"
            categoryField="metric"
            name="평균"
            color="#2563eb"
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="8. Bar — 퍼널 단계(가로)" height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem type="bar" data={funnel} field="count" categoryField="stage" color="#7c3aed" />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="9. Range column — 면적 히스토그램(0→건수)" height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem labels={{ rotation: -30 }} />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="rangeColumn"
            data={histRange.length ? histRange : [{ bin: '—', lo: 0, hi: 0 }]}
            fromField="lo"
            toField="hi"
            categoryField="bin"
            color="#0ea5e9"
          />
        </ChartSeries>
      </MiniKendoChart>

      <MiniKendoChart title="10. Scatter — 면적 vs 조사대지" height={h}>
        <ChartXAxis>
          <ChartXAxisItem title={{ text: '총재배면적' }} majorGridLines={{ visible: true }} />
        </ChartXAxis>
        <ChartYAxis>
          <ChartYAxisItem title={{ text: '조사대지(평)' }} majorGridLines={{ visible: true }} />
        </ChartYAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="scatter"
            data={
              scatterPts.length
                ? scatterPts
                : [
                    { bx: 0, by: 0, bsize: 1 },
                    { bx: 1, by: 1, bsize: 1 },
                  ]
            }
            xField="bx"
            yField="by"
            color="#db2777"
          />
        </ChartSeries>
      </MiniKendoChart>
    </div>
  )
}
