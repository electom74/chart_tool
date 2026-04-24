import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
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

export default function EChartsJejuTab(props: ToolRowsProps) {
  const { rows } = props
  const pie = useMemo(() => pieItemTopN(rows, 10), [rows])
  const cty = useMemo(() => aggregateCtyAvgTtl(rows, 10), [rows])
  const line = useMemo(() => cumulativeTtlSeries(rows).slice(0, 240), [rows])
  const bar = useMemo(() => aggregateAvgTtlByItem(rows).slice(0, 12), [rows])
  const hist = useMemo(() => ttlHistogramBins(rows, 12), [rows])
  const scat = useMemo(() => bubblePlotRows(rows, 200).map((d) => [d.bx, d.by]), [rows])
  const funnel = useMemo(() => funnelStageCounts(rows.length), [rows.length])
  const radar = useMemo(() => metricAveragesJeju(rows), [rows])
  const tree = useMemo(() => treemapItemSumTtl(rows).slice(0, 14), [rows])

  return (
    <JejuDataGate {...props}>
    <TabScroll>
      <ToolSection title={`ECharts — 도넛(${BAT_COL.cyc_condition_age_type} 건수)`}>
        <ReactECharts
          option={{
            title: { text: `${BAT_COL.cyc_condition_age_type} 건수`, left: 'center' },
            tooltip: { trigger: 'item' },
            series: [
              {
                type: 'pie',
                radius: ['34%', '62%'],
                data: pie.map((p) => ({ name: p.bucket, value: p.count })),
              },
            ],
          }}
          style={{ height: 300 }}
        />
      </ToolSection>
      <ToolSection title={`ECharts — 그룹 막대(cty·${BAT_COL.soc_est_end} 구간)`}>
        <ReactECharts
          option={{
            title: { text: `cty별 건수·평균 ${BAT_COL.delta_q_Ah}` },
            tooltip: { trigger: 'axis' },
            legend: { data: ['건수', `평균 ${BAT_COL.delta_q_Ah}`] },
            xAxis: { type: 'category', data: cty.map((c) => c.cty) },
            yAxis: { type: 'value' },
            series: [
              { name: '건수', type: 'bar', data: cty.map((c) => c.cnt) },
              { name: `평균 ${BAT_COL.delta_q_Ah}`, type: 'bar', data: cty.map((c) => c.avgTtl) },
            ],
          }}
          style={{ height: 320 }}
        />
      </ToolSection>
      <ToolSection title={`ECharts — 라인(누적 ${BAT_COL.delta_q_Ah})`}>
        <ReactECharts
          option={{
            title: { text: `누적 ${BAT_COL.delta_q_Ah}` },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: line.map((l) => String(l.seq)) },
            yAxis: { type: 'value' },
            series: [{ type: 'line', smooth: true, data: line.map((l) => l.cumTtl), name: `누적 ${BAT_COL.delta_q_Ah}` }],
          }}
          style={{ height: 280 }}
        />
      </ToolSection>
      <ToolSection title={`ECharts — 가로 막대(${BAT_COL.cyc_condition_age_type}·평균 ${BAT_COL.delta_q_Ah})`}>
        <ReactECharts
          option={{
            title: { text: `${BAT_COL.cyc_condition_age_type}별 평균 ${BAT_COL.delta_q_Ah}` },
            tooltip: { trigger: 'axis' },
            grid: { left: 120, right: 24, top: 48, bottom: 24 },
            xAxis: { type: 'value' },
            yAxis: { type: 'category', data: bar.map((b) => b.item) },
            series: [{ type: 'bar', data: bar.map((b) => b.avgTtl), name: `평균 ${BAT_COL.delta_q_Ah}` }],
          }}
          style={{ height: 340 }}
        />
      </ToolSection>
      <ToolSection title="ECharts — 히스토그램">
        <ReactECharts
          option={{
            title: { text: `${BAT_COL.delta_q_Ah} 구간별 건수` },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: hist.map((h) => h.bin), axisLabel: { rotate: 28 } },
            yAxis: { type: 'value' },
            series: [{ type: 'bar', data: hist.map((h) => h.count), name: '건수', itemStyle: { color: '#a855f7' } }],
          }}
          style={{ height: 280 }}
        />
      </ToolSection>
      <ToolSection title="ECharts — 산점">
        <ReactECharts
          option={{
            title: { text: `${BAT_COL.delta_q_Ah} × ${BAT_COL.cyc_duration_s}` },
            tooltip: { trigger: 'item' },
            xAxis: { type: 'value', name: BAT_COL.delta_q_Ah },
            yAxis: { type: 'value', name: BAT_COL.cyc_duration_s },
            series: [{ type: 'scatter', data: scat, symbolSize: 8 }],
          }}
          style={{ height: 300 }}
        />
      </ToolSection>
      <ToolSection title="ECharts — 퍼널">
        <ReactECharts
          option={{
            title: { text: '파이프라인(개념)' },
            tooltip: { trigger: 'item', formatter: '{b}: {c}' },
            series: [
              {
                type: 'funnel',
                sort: 'descending',
                data: funnel.map((f) => ({ name: f.stage, value: f.count })),
              },
            ],
          }}
          style={{ height: 320 }}
        />
      </ToolSection>
      <ToolSection title="ECharts — 레이더(측정 컬럼 평균)">
        <ReactECharts
          option={{
            title: { text: '측정 컬럼 평균' },
            tooltip: {},
            radar: {
              indicator: radar.map((r) => ({ name: r.metric, max: Math.max(...radar.map((x) => x.avg), 1) * 1.2 })),
            },
            series: [{ type: 'radar', data: [{ value: radar.map((r) => r.avg), name: '평균' }] }],
          }}
          style={{ height: 340 }}
        />
      </ToolSection>
      <ToolSection title="ECharts — 트리맵">
        <ReactECharts
          option={{
            title: { text: `${BAT_COL.cyc_condition_age_type}별 ${BAT_COL.delta_q_Ah} 합` },
            tooltip: { formatter: '{b}: {c}' },
            series: [
              {
                type: 'treemap',
                data: tree.map((t) => ({ name: t.name, value: t.value })),
                leafDepth: 1,
              },
            ],
          }}
          style={{ height: 320 }}
        />
      </ToolSection>
    </TabScroll>
    </JejuDataGate>
  )
}
