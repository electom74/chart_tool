import * as wjc from '@grapecity/wijmo'
import { Position } from '@grapecity/wijmo.chart'
import '@grapecity/wijmo.styles/wijmo-core.css'
import '@grapecity/wijmo.styles/themes/material/wijmo.theme.material.teal-blue.css'
import { useMemo } from 'react'
import { FlexChart, FlexPie } from '@grapecity/wijmo.react.chart'
import { FlexGrid } from '@grapecity/wijmo.react.grid'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  cumulativeTtlSeries,
  pieItemTopN,
  ttlHistogramBins,
} from '../jeju/jejuFieldCropModel'
import { EmptyDataHint, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

export default function WijmoJejuTab({ rows }: ToolRowsProps) {
  const cv = useMemo(() => new wjc.CollectionView(rows.slice(0, 150), { pageSize: 50 }), [rows])
  const bar = useMemo(() => aggregateAvgTtlByItem(rows).slice(0, 12), [rows])
  const line = useMemo(() => cumulativeTtlSeries(rows).slice(0, 160), [rows])
  const pie = useMemo(() => pieItemTopN(rows, 8), [rows])
  const hist = useMemo(() => ttlHistogramBins(rows, 10), [rows])
  const cty = useMemo(() => aggregateCtyAvgTtl(rows, 10), [rows])

  if (!rows.length) return <EmptyDataHint />

  return (
    <TabScroll>
      <ToolSection title="Wijmo — FlexGrid">
        <FlexGrid itemsSource={cv} style={{ height: 400 }} />
      </ToolSection>
      <ToolSection title="Wijmo — FlexChart Column">
        <FlexChart
          itemsSource={bar}
          bindingX="item"
          chartType="Column"
          header="평균 총재배면적"
          axisY={{ title: '평균' }}
          series={[{ name: '평균', binding: 'avgTtl' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 300 }}
        />
      </ToolSection>
      <ToolSection title="Wijmo — FlexChart Line(누적)">
        <FlexChart
          itemsSource={line}
          bindingX="seq"
          chartType="Line"
          header="누적 총재배면적"
          series={[{ name: '누적', binding: 'cumTtl' }]}
          legend={{ position: Position.Bottom }}
          style={{ height: 280 }}
        />
      </ToolSection>
      <ToolSection title="Wijmo — FlexPie">
        <FlexPie
          itemsSource={pie}
          bindingName="bucket"
          binding="count"
          header="작목 건수"
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
      <ToolSection title="Wijmo — FlexChart 그룹 Column(시군)">
        <FlexChart
          itemsSource={cty}
          bindingX="cty"
          chartType="Column"
          header="건수 / 평균면적"
          series={[
            { name: '건수', binding: 'cnt' },
            { name: '평균면적', binding: 'avgTtl' },
          ]}
          legend={{ position: Position.Bottom }}
          style={{ height: 320 }}
        />
      </ToolSection>
    </TabScroll>
  )
}
