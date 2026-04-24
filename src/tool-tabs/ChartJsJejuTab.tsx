import { useMemo, type ReactNode } from 'react'
import { Chart as ChartJS, registerables } from 'chart.js'
import { Bar, Bubble, Doughnut, Line, Pie, PolarArea, Radar, Scatter } from 'react-chartjs-2'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  bubblePlotRows,
  funnelStageCounts,
  metricAveragesJeju,
  pieItemTopN,
  ttlHistogramBins,
} from '../jeju/jejuFieldCropModel'
import { JejuDataGate, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

ChartJS.register(...registerables)

/** 차트 영역 높이(px). ChartWrap 및 react-chartjs-2 height와 동일 */
const CH = 88

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { font: { size: 7 }, boxWidth: 8, padding: 2 },
    },
  },
  scales: {
    x: { ticks: { font: { size: 7 }, maxRotation: 45 } },
    y: { ticks: { font: { size: 7 } } },
  },
}

const noCartesianOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { font: { size: 7 }, boxWidth: 8, padding: 2 },
    },
  },
}

function ChartWrap({ children }: { children: ReactNode }) {
  return <div style={{ height: CH, maxWidth: '100%', position: 'relative' }}>{children}</div>
}

export default function ChartJsJejuTab(props: ToolRowsProps) {
  const { rows } = props
  const agg = aggregateAvgTtlByItem(rows).slice(0, 12)
  const hist = ttlHistogramBins(rows, 10)
  const pie = pieItemTopN(rows, 8)
  const cty = aggregateCtyAvgTtl(rows, 10)
  const bub = bubblePlotRows(rows, 120).map((d) => ({ x: d.bx, y: d.by, r: d.bsize }))
  const funnel = funnelStageCounts(rows.length)
  const radar = metricAveragesJeju(rows)

  const scatterSeqTtl = useMemo(
    () =>
      rows
        .filter((r) => r.seq != null && r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea as number))
        .slice(0, 100)
        .map((r) => ({ x: r.seq, y: r.ttlCltvtnArea as number })),
    [rows],
  )

  const scatterSafe = scatterSeqTtl.length ? scatterSeqTtl : [{ x: 0, y: 0 }]

  return (
    <JejuDataGate {...props}>
      <TabScroll>
        <ToolSection title={`Chart.js — 막대(${BAT_COL.cyc_condition_age_type} 평균 ${BAT_COL.delta_q_Ah})`}>
          <ChartWrap>
            <Bar
              height={CH}
              data={{
                labels: agg.map((a) => a.item),
                datasets: [
                  { label: `평균 ${BAT_COL.delta_q_Ah}`, data: agg.map((a) => a.avgTtl), backgroundColor: 'rgba(99,102,241,0.7)' },
                ],
              }}
              options={{
                ...baseOpts,
                scales: { ...baseOpts.scales, x: { ...baseOpts.scales.x, ticks: { ...baseOpts.scales.x.ticks, maxRotation: 50 } } },
              }}
            />
          </ChartWrap>
        </ToolSection>
        <ToolSection title="Chart.js — 라인(히스토그램)">
          <ChartWrap>
            <Line
              height={CH}
              data={{
                labels: hist.map((h) => h.bin),
                datasets: [
                  {
                    label: '건수',
                    data: hist.map((h) => h.count),
                    borderColor: 'rgb(13,148,136)',
                    backgroundColor: 'rgba(13,148,136,0.2)',
                    fill: true,
                    tension: 0.25,
                  },
                ],
              }}
              options={baseOpts}
            />
          </ChartWrap>
        </ToolSection>
        <ToolSection title={`Chart.js — 도넛(${BAT_COL.cyc_condition_age_type} 건수)`}>
          <ChartWrap>
            <Doughnut
              height={CH}
              data={{
                labels: pie.map((p) => p.bucket),
                datasets: [
                  {
                    data: pie.map((p) => p.count),
                    backgroundColor: ['#6366f1', '#0d9488', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#64748b'],
                  },
                ],
              }}
              options={noCartesianOpts}
            />
          </ChartWrap>
        </ToolSection>
        <ToolSection title={`Chart.js — 그룹 막대(cty·${BAT_COL.soc_est_end} 구간)`}>
          <ChartWrap>
            <Bar
              height={CH}
              data={{
                labels: cty.map((c) => c.cty),
                datasets: [
                  { label: '건수', data: cty.map((c) => c.cnt), backgroundColor: 'rgba(99,102,241,0.65)' },
                  { label: `평균 ${BAT_COL.delta_q_Ah}`, data: cty.map((c) => c.avgTtl), backgroundColor: 'rgba(249,115,22,0.65)' },
                ],
              }}
              options={baseOpts}
            />
          </ChartWrap>
        </ToolSection>
        <ToolSection title={`Chart.js — 버블(${BAT_COL.delta_q_Ah}·${BAT_COL.cyc_duration_s})`}>
          <ChartWrap>
            <Bubble
              height={CH}
              data={{
                datasets: [
                  {
                    label: `${BAT_COL.delta_q_Ah}·${BAT_COL.cyc_duration_s}`,
                    data: bub,
                    backgroundColor: 'rgba(13,148,136,0.45)',
                  },
                ],
              }}
              options={{
                ...baseOpts,
                scales: {
                  ...baseOpts.scales,
                  x: { ...baseOpts.scales.x, title: { display: true, text: BAT_COL.delta_q_Ah, font: { size: 8 } } },
                  y: { ...baseOpts.scales.y, title: { display: true, text: BAT_COL.cyc_duration_s, font: { size: 8 } } },
                },
              }}
            />
          </ChartWrap>
        </ToolSection>
        <ToolSection title="Chart.js — 레이더(측정 컬럼 평균)">
          <ChartWrap>
            <Radar
              height={CH}
              data={{
                labels: radar.map((r) => r.metric),
                datasets: [
                  {
                    label: '평균',
                    data: radar.map((r) => r.avg),
                    backgroundColor: 'rgba(99,102,241,0.25)',
                    borderColor: 'rgb(99,102,241)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                ...noCartesianOpts,
                scales: {
                  r: {
                    beginAtZero: true,
                    ticks: { font: { size: 7 } },
                    pointLabels: { font: { size: 7 } },
                  },
                },
              }}
            />
          </ChartWrap>
        </ToolSection>
        <ToolSection title="Chart.js — 가로 막대(퍼널)">
          <ChartWrap>
            <Bar
              height={CH}
              data={{
                labels: funnel.map((f) => f.stage),
                datasets: [{ label: '건수', data: funnel.map((f) => f.count), backgroundColor: 'rgba(168,85,247,0.7)' }],
              }}
              options={{ ...baseOpts, indexAxis: 'y' as const, plugins: { ...baseOpts.plugins, legend: { display: false } } }}
            />
          </ChartWrap>
        </ToolSection>

        <ToolSection title={`Chart.js — Pie(${BAT_COL.cyc_condition_age_type} 건수)`}>
          <ChartWrap>
            <Pie
              height={CH}
              data={{
                labels: pie.map((p) => p.bucket),
                datasets: [
                  {
                    data: pie.map((p) => p.count),
                    backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#64748b', '#14b8a6'],
                  },
                ],
              }}
              options={noCartesianOpts}
            />
          </ChartWrap>
        </ToolSection>

        <ToolSection title={`Chart.js — Polar area(cty·${BAT_COL.soc_est_end} 구간 건수)`}>
          <ChartWrap>
            <PolarArea
              height={CH}
              data={{
                labels: cty.map((c) => c.cty),
                datasets: [
                  {
                    data: cty.map((c) => c.cnt),
                    backgroundColor: cty.map((_, i) => `hsla(${(i * 37) % 360}, 65%, 55%, 0.75)`),
                  },
                ],
              }}
              options={noCartesianOpts}
            />
          </ChartWrap>
        </ToolSection>

        <ToolSection title={`Chart.js — Scatter(${BAT_COL.seq} × ${BAT_COL.delta_q_Ah})`}>
          <ChartWrap>
            <Scatter
              height={CH}
              data={{
                datasets: [
                  {
                    label: '표본',
                    data: scatterSafe,
                    backgroundColor: 'rgba(99,102,241,0.55)',
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                ...baseOpts,
                scales: {
                  x: { type: 'linear' as const, title: { display: true, text: 'seq', font: { size: 8 } }, ticks: { font: { size: 7 } } },
                  y: {
                    type: 'linear' as const,
                    title: { display: true, text: BAT_COL.delta_q_Ah, font: { size: 8 } },
                    ticks: { font: { size: 7 } },
                  },
                },
              }}
            />
          </ChartWrap>
        </ToolSection>

        <ToolSection title={`Chart.js — 스택 막대(cty·건수·${BAT_COL.delta_q_Ah}/10)`}>
          <ChartWrap>
            <Bar
              height={CH}
              data={{
                labels: cty.map((c) => c.cty),
                datasets: [
                  { label: '건수', data: cty.map((c) => c.cnt), backgroundColor: 'rgba(99,102,241,0.75)' },
                  { label: `${BAT_COL.delta_q_Ah}/10`, data: cty.map((c) => c.avgTtl / 10), backgroundColor: 'rgba(249,115,22,0.75)' },
                ],
              }}
              options={{
                ...baseOpts,
                scales: {
                  x: { stacked: true, ticks: { font: { size: 7 }, maxRotation: 45 } },
                  y: { stacked: true, ticks: { font: { size: 7 } } },
                },
              }}
            />
          </ChartWrap>
        </ToolSection>

        <ToolSection title="Chart.js — 스텝 라인(퍼널 건수)">
          <ChartWrap>
            <Line
              height={CH}
              data={{
                labels: funnel.map((f) => f.stage),
                datasets: [
                  {
                    label: '건수',
                    data: funnel.map((f) => f.count),
                    borderColor: 'rgb(124,58,237)',
                    backgroundColor: 'rgba(124,58,237,0.15)',
                    fill: false,
                    stepped: true,
                    tension: 0,
                  },
                ],
              }}
              options={baseOpts}
            />
          </ChartWrap>
        </ToolSection>
      </TabScroll>
    </JejuDataGate>
  )
}
