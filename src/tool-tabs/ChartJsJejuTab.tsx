import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Bubble, Doughnut, Line, Radar } from 'react-chartjs-2'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  bubblePlotRows,
  funnelStageCounts,
  metricAveragesJeju,
  pieItemTopN,
  ttlHistogramBins,
} from '../jeju/jejuFieldCropModel'
import { EmptyDataHint, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export default function ChartJsJejuTab({ rows }: ToolRowsProps) {
  if (!rows.length) return <EmptyDataHint />

  const agg = aggregateAvgTtlByItem(rows).slice(0, 12)
  const hist = ttlHistogramBins(rows, 10)
  const pie = pieItemTopN(rows, 8)
  const cty = aggregateCtyAvgTtl(rows, 10)
  const bub = bubblePlotRows(rows, 120).map((d) => ({ x: d.bx, y: d.by, r: d.bsize }))
  const funnel = funnelStageCounts(rows.length)
  const radar = metricAveragesJeju(rows)

  return (
    <TabScroll>
      <ToolSection title="Chart.js — 막대(작목 평균)">
        <Bar
          data={{
            labels: agg.map((a) => a.item),
            datasets: [{ label: '평균 총재배면적', data: agg.map((a) => a.avgTtl), backgroundColor: 'rgba(99,102,241,0.7)' }],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { ticks: { maxRotation: 40 } } } }}
        />
      </ToolSection>
      <ToolSection title="Chart.js — 라인(히스토그램)">
        <Line
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
          options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
        />
      </ToolSection>
      <ToolSection title="Chart.js — 도넛(작목 건수)">
        <Doughnut
          data={{
            labels: pie.map((p) => p.bucket),
            datasets: [
              {
                data: pie.map((p) => p.count),
                backgroundColor: ['#6366f1', '#0d9488', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#64748b'],
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'right' } } }}
        />
      </ToolSection>
      <ToolSection title="Chart.js — 그룹 막대(시군)">
        <Bar
          data={{
            labels: cty.map((c) => c.cty),
            datasets: [
              { label: '건수', data: cty.map((c) => c.cnt), backgroundColor: 'rgba(99,102,241,0.65)' },
              { label: '평균면적', data: cty.map((c) => c.avgTtl), backgroundColor: 'rgba(249,115,22,0.65)' },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
        />
      </ToolSection>
      <ToolSection title="Chart.js — 버블(면적·대지)">
        <Bubble
          data={{
            datasets: [
              {
                label: '조사지',
                data: bub,
                backgroundColor: 'rgba(13,148,136,0.45)',
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              x: { title: { display: true, text: '총재배면적' } },
              y: { title: { display: true, text: '조사대지(평)' } },
            },
          }}
        />
      </ToolSection>
      <ToolSection title="Chart.js — 레이더(지표 평균)">
        <Radar
          data={{
            labels: radar.map((r) => r.metric),
            datasets: [
              {
                label: '평균',
                data: radar.map((r) => r.avg),
                backgroundColor: 'rgba(99,102,241,0.25)',
                borderColor: 'rgb(99,102,241)',
                borderWidth: 2,
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { r: { beginAtZero: true } } }}
        />
      </ToolSection>
      <ToolSection title="Chart.js — 가로 막대(퍼널 대용)">
        <Bar
          data={{
            labels: funnel.map((f) => f.stage),
            datasets: [{ label: '건수', data: funnel.map((f) => f.count), backgroundColor: 'rgba(168,85,247,0.7)' }],
          }}
          options={{ indexAxis: 'y' as const, responsive: true, plugins: { legend: { display: false } } }}
        />
      </ToolSection>
    </TabScroll>
  )
}
