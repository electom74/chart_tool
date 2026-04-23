import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from 'recharts'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  bubblePlotRows,
  cumulativeTtlSeries,
  funnelStageCounts,
  metricAveragesJeju,
  pieItemTopN,
  ttlHistogramBins,
  treemapItemSumTtl,
} from '../jeju/jejuFieldCropModel'
import { JejuDataGate, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

const COLORS = ['#6366f1', '#0d9488', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#64748b']

export default function RechartsJejuTab(props: ToolRowsProps) {
  const { rows } = props
  const bar = aggregateAvgTtlByItem(rows).slice(0, 12)
  const bub = bubblePlotRows(rows, 200)
  const cum = cumulativeTtlSeries(rows).slice(0, 200)
  const pie = pieItemTopN(rows, 8)
  const hist = ttlHistogramBins(rows, 10)
  const cty = aggregateCtyAvgTtl(rows, 10)
  const funnel = funnelStageCounts(rows.length)
  const radar = metricAveragesJeju(rows)
  const tree = treemapItemSumTtl(rows).slice(0, 12)

  return (
    <JejuDataGate {...props}>
    <TabScroll>
      <ToolSection title="막대 — 작목별 평균">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={bar} margin={{ top: 8, right: 8, left: 8, bottom: 44 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" angle={-28} textAnchor="end" interval={0} height={72} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgTtl" name="평균 총재배면적" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="영역 — 누적">
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={cum} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="seq" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="cumTtl" name="누적" stroke="#0d9488" fill="#99f6e4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="라인+막대 — 시군(Composed)">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={cty} margin={{ top: 8, right: 8, left: 8, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cty" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="cnt" name="건수" fill="#6366f1" />
              <Line yAxisId="right" type="monotone" dataKey="avgTtl" name="평균면적" stroke="#f97316" dot />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="산점 — 면적·대지">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="bx" name="총재배면적" />
              <YAxis type="number" dataKey="by" name="조사대지(평)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="조사지" data={bub} fill="#0d9488" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="파이 — 작목 건수">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pie} dataKey="count" nameKey="bucket" cx="50%" cy="50%" outerRadius={100} label>
                {pie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="히스토그램 — 막대">
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={hist} margin={{ top: 8, right: 8, left: 8, bottom: 36 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bin" interval={0} angle={-20} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="건수" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="레이더 — 지표 평균">
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <RadarChart data={radar} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis />
              <Radar name="평균" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="방사 막대 — 퍼널 단계">
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <RadialBarChart
              innerRadius="18%"
              outerRadius="100%"
              data={funnel.map((f, i) => ({ name: f.stage, uv: f.count, fill: COLORS[i % COLORS.length] }))}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background dataKey="uv" cornerRadius={4} label={{ position: 'insideStart' }} />
              <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="Treemap — 작목 면적 합">
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <Treemap
              data={tree.map((t) => ({ name: t.name, size: t.value }))}
              dataKey="size"
              stroke="#fff"
              fill="#6366f1"
              aspectRatio={4 / 3}
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </ToolSection>
      <ToolSection title="라인 — 행 vs 총재배면적">
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart
              data={rows
                .filter((r) => r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea))
                .slice(0, 200)}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="seq" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ttlCltvtnArea" name="총재배면적" stroke="#7c3aed" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ToolSection>
    </TabScroll>
    </JejuDataGate>
  )
}
