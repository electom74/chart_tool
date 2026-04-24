import * as wjc from '@grapecity/wijmo'
import { ChartType, Position } from '@grapecity/wijmo.chart'
import '@grapecity/wijmo.styles/wijmo-core.css'
import '@grapecity/wijmo.styles/themes/material/wijmo.theme.material.teal-blue.css'
import { useMemo } from 'react'
import { FlexChart, FlexPie } from '@grapecity/wijmo.react.chart'
import { FlexGrid } from '@grapecity/wijmo.react.grid'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  bubblePlotRows,
  cumulativeTtlSeries,
  pieItemTopN,
  ttlHistogramBins,
} from '../jeju/jejuFieldCropModel'
import { JejuDataGate, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

export default function WijmoJejuTab(props: ToolRowsProps) {
  const { rows } = props
  const cv = useMemo(() => new wjc.CollectionView(rows.slice(0, 150), { pageSize: 50 }), [rows])
  const bar = useMemo(() => aggregateAvgTtlByItem(rows).slice(0, 12), [rows])
  const line = useMemo(() => cumulativeTtlSeries(rows).slice(0, 160), [rows])
  const pie = useMemo(() => pieItemTopN(rows, 8), [rows])
  const hist = useMemo(() => ttlHistogramBins(rows, 10), [rows])
  const cty = useMemo(() => aggregateCtyAvgTtl(rows, 10), [rows])
  const bubble = useMemo(() => {
    const b = bubblePlotRows(rows, 100)
    return b.length ? b : [{ bx: 0, by: 0, bsize: 4 }]
  }, [rows])
  const scatterSeqTtl = useMemo(() => {
    const pts = rows
      .filter((r) => r.seq != null && r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea as number))
      .slice(0, 120)
      .map((r) => ({ vx: r.seq, vy: r.ttlCltvtnArea as number }))
    return pts.length ? pts : [{ vx: 0, vy: 0 }]
  }, [rows])

  return (
    <JejuDataGate {...props}>
    <TabScroll>
      <ToolSection title="Wijmo — FlexGrid">
        <FlexGrid itemsSource={cv} style={{ height: 400 }} />
      </ToolSection>
      <ToolSection title="Wijmo — FlexChart Column">
        <FlexChart
          itemsSource={bar}
          bindingX="item"
          chartType="Column"
          header={`평균 ${BAT_COL.delta_q_Ah}`}
          axisY={{ title: `평균 ${BAT_COL.delta_q_Ah}` }}
          series={[{ name: `평균 ${BAT_COL.delta_q_Ah}`, binding: 'avgTtl' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 300 }}
        />
      </ToolSection>
      <ToolSection title="Wijmo — FlexChart Line(누적)">
        <FlexChart
          itemsSource={line}
          bindingX="seq"
          chartType="Line"
          header={`누적 ${BAT_COL.delta_q_Ah}`}
          series={[{ name: `누적 ${BAT_COL.delta_q_Ah}`, binding: 'cumTtl' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 280 }}
        />
      </ToolSection>
      <ToolSection title="Wijmo — FlexPie">
        <FlexPie
          itemsSource={pie}
          bindingName="bucket"
          binding="count"
          header={`${BAT_COL.cyc_condition_age_type} 건수`}
          legend={{ position: Position.Right }}
          style={{ height: 300 }}
        />
      </ToolSection>
      <ToolSection title="Wijmo — FlexChart Bar(히스토그램)">
        <FlexChart
          itemsSource={hist}
          bindingX="bin"
          chartType="Bar"
          header="구간별 건수"
          axisX={{ title: '구간' }}
          axisY={{ title: '건수' }}
          series={[{ name: '건수', binding: 'count' }]}
          style={{ height: 280 }}
        />
      </ToolSection>
      <ToolSection title={`Wijmo — FlexChart 그룹 Column(cty·${BAT_COL.soc_est_end})`}>
        <FlexChart
          itemsSource={cty}
          bindingX="cty"
          chartType="Column"
          header={`건수 / 평균 ${BAT_COL.delta_q_Ah}`}
          series={[
            { name: '건수', binding: 'cnt' },
            { name: `평균 ${BAT_COL.delta_q_Ah}`, binding: 'avgTtl' },
          ]}
          legend={{ position: Position.Bottom }}
          style={{ height: 320 }}
        />
      </ToolSection>

      <ToolSection title="Wijmo — FlexChart Area(누적)">
        <FlexChart
          itemsSource={line}
          bindingX="seq"
          chartType={ChartType.Area}
          header={`누적 ${BAT_COL.delta_q_Ah} (영역)`}
          series={[{ name: `누적 ${BAT_COL.delta_q_Ah}`, binding: 'cumTtl' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 260 }}
        />
      </ToolSection>

      <ToolSection title={`Wijmo — FlexChart Spline(${BAT_COL.cyc_condition_age_type}·평균 ${BAT_COL.delta_q_Ah})`}>
        <FlexChart
          itemsSource={bar}
          bindingX="item"
          chartType={ChartType.Spline}
          header={`${BAT_COL.cyc_condition_age_type}별 평균 ${BAT_COL.delta_q_Ah} (스플라인)`}
          axisY={{ title: `평균 ${BAT_COL.delta_q_Ah}` }}
          series={[{ name: `평균 ${BAT_COL.delta_q_Ah}`, binding: 'avgTtl' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 280 }}
        />
      </ToolSection>

      <ToolSection title="Wijmo — FlexChart SplineArea(히스토그램)">
        <FlexChart
          itemsSource={hist}
          bindingX="bin"
          chartType={ChartType.SplineArea}
          header="구간별 건수 (스플라인 영역)"
          series={[{ name: '건수', binding: 'count' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 260 }}
        />
      </ToolSection>

      <ToolSection title={`Wijmo — FlexChart Scatter(${BAT_COL.seq} × ${BAT_COL.delta_q_Ah})`}>
        <FlexChart
          itemsSource={scatterSeqTtl}
          bindingX="vx"
          chartType={ChartType.Scatter}
          header={`${BAT_COL.seq} vs ${BAT_COL.delta_q_Ah}`}
          axisX={{ title: BAT_COL.seq }}
          axisY={{ title: BAT_COL.delta_q_Ah }}
          series={[{ name: '표본', binding: 'vy' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 280 }}
        />
      </ToolSection>

      <ToolSection title={`Wijmo — FlexChart Step(cty·${BAT_COL.soc_est_end} 건수)`}>
        <FlexChart
          itemsSource={cty}
          bindingX="cty"
          chartType={ChartType.Step}
          header={`cty별 건수 (${BAT_COL.soc_est_end} 구간, 스텝)`}
          series={[{ name: '건수', binding: 'cnt' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 280 }}
        />
      </ToolSection>

      <ToolSection title={`Wijmo — FlexChart Bubble(${BAT_COL.delta_q_Ah}·${BAT_COL.cyc_duration_s}·${BAT_COL.saleAmt_primary})`}>
        <FlexChart
          itemsSource={bubble}
          bindingX="bx"
          chartType={ChartType.Bubble}
          header={`${BAT_COL.delta_q_Ah} × ${BAT_COL.cyc_duration_s}, 크기=${BAT_COL.saleAmt_primary}`}
          axisX={{ title: BAT_COL.delta_q_Ah }}
          axisY={{ title: BAT_COL.cyc_duration_s }}
          series={[{ name: `${BAT_COL.delta_q_Ah}·${BAT_COL.cyc_duration_s}`, binding: 'by,bsize' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 300 }}
        />
      </ToolSection>
    </TabScroll>
    </JejuDataGate>
  )
}
