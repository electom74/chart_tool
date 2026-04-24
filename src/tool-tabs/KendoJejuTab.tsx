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
} from '@progress/kendo-react-charts'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
import { aggregateCtyAvgTtl, pieItemTopN, type JejuFieldCropSlim } from '../jeju/jejuFieldCropModel'
import { JejuDataGate, ToolSection, type ToolRowsProps } from './shared'
import { JejuKendoChartGallery } from './JejuKendoChartGallery'
import { TabScroll } from './TabScroll'

function Mini({ title, height, children }: { title: string; height: number; children: ReactNode }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 10px 6px', background: '#fff', minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 6 }}>{title}</div>
      <Chart style={{ height, fontSize: 13 }}>
        <ChartTooltip />
        <ChartLegend visible={false} />
        {children}
      </Chart>
    </div>
  )
}

function KendoExtraTwo({ rows }: { rows: JejuFieldCropSlim[] }) {
  const pie = pieItemTopN(rows, 8)
  const cty = aggregateCtyAvgTtl(rows, 7)
  const h = 400
  return (
    <div className="kendo-gallery-grid" style={{ marginTop: 10 }}>
      <Mini title={`11. Pie — ${BAT_COL.cyc_condition_age_type} 건수`} height={h}>
        <ChartSeries>
          <ChartSeriesItem
            type="pie"
            data={pie.length ? pie : [{ bucket: '—', count: 1 }]}
            categoryField="bucket"
            field="count"
          />
        </ChartSeries>
      </Mini>
      <Mini title={`12. Stacked column — cty·건수·평균 ${BAT_COL.delta_q_Ah}(스택)`} height={h}>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="column"
            stack={{ group: 'g' }}
            data={cty}
            field="cnt"
            categoryField="cty"
            name="건수"
            color="#6366f1"
          />
          <ChartSeriesItem
            type="column"
            stack={{ group: 'g' }}
            data={cty}
            field="avgTtl"
            categoryField="cty"
            name={`평균 ${BAT_COL.delta_q_Ah}`}
            color="#14b8a6"
          />
        </ChartSeries>
      </Mini>
    </div>
  )
}

export default function KendoJejuTab(props: ToolRowsProps) {
  const { rows } = props
  return (
    <JejuDataGate {...props}>
      <TabScroll>
        <ToolSection title="KendoReact Chart — 셀 사이클 데이터 시각화(12종)">
          <p className="gauge-note" style={{ marginTop: 0 }}>
            이 탭은 <strong>KendoReact Chart</strong>만 사용합니다. 데이터는 <code>cell_eocv2</code> CSV를 동일 스키마로 매핑한
            것입니다.
          </p>
          <JejuKendoChartGallery rows={rows} />
          <KendoExtraTwo rows={rows} />
        </ToolSection>
      </TabScroll>
    </JejuDataGate>
  )
}
