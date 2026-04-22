import '@syncfusion/ej2-base/styles/material.css'
import '@syncfusion/ej2-react-grids/styles/material.css'
import {
  AccumulationChartComponent,
  AccumulationLegend,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  AccumulationTooltip,
  AreaSeries,
  BarSeries,
  Category,
  ChartComponent,
  ColumnSeries,
  DataLabel,
  Inject,
  Legend,
  LineSeries,
  PieSeries,
  ScatterSeries,
  SeriesCollectionDirective,
  SeriesDirective,
  SplineSeries,
  StepLineSeries,
  Tooltip,
} from '@syncfusion/ej2-react-charts'
import { ColumnDirective, ColumnsDirective, GridComponent, Page, Search, Sort, Toolbar } from '@syncfusion/ej2-react-grids'
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
import { EmptyDataHint, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

function SyncfusionLicenseNote() {
  const ok = Boolean((import.meta.env.VITE_SYNCFUSION_LICENSE as string | undefined)?.trim())
  if (ok) return null
  return (
    <ToolSection title="Syncfusion 라이선스(무료 Community)">
      <p className="gauge-note" style={{ margin: 0 }}>
        평가판 배너·가입 유도는 라이선스 미등록 때문입니다. 조건 충족 시{' '}
        <a href="https://www.syncfusion.com/products/communitylicense" target="_blank" rel="noreferrer">
          Community License
        </a>
        로 무료 키를 받거나, 계정에서 발급한 키를 <code>.env</code> 의 <strong>VITE_SYNCFUSION_LICENSE</strong> 로
        넣어 주세요.
      </p>
    </ToolSection>
  )
}

export default function SyncfusionJejuTab({ rows }: ToolRowsProps) {
  const hasLicense = Boolean((import.meta.env.VITE_SYNCFUSION_LICENSE as string | undefined)?.trim())
  const bar = aggregateAvgTtlByItem(rows).slice(0, 12)
  const pie = pieItemTopN(rows, 8)
  const cty = aggregateCtyAvgTtl(rows, 10)
  const line = cumulativeTtlSeries(rows).slice(0, 220)
  const hist = ttlHistogramBins(rows, 12)
  const scat = bubblePlotRows(rows, 180).map((d) => ({ x: d.bx, y: d.by }))
  const funnel = funnelStageCounts(rows.length)
  const radar = metricAveragesJeju(rows)
  const tree = treemapItemSumTtl(rows).slice(0, 14)

  if (!rows.length) return <EmptyDataHint />
  if (!hasLicense) {
    return (
      <TabScroll>
        <SyncfusionLicenseNote />
        <ToolSection title="데이터 미리보기(라이선스 미설정)">
          <p className="gauge-note" style={{ marginTop: 0 }}>
            Signup/평가판 요구 UI를 피하기 위해 라이선스 키가 없을 때는 Syncfusion 컴포넌트를 렌더하지 않습니다.
            <br />
            Community License 또는 평가판 키를 설정하면 Syncfusion Grid/Chart가 자동 활성화됩니다.
          </p>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {bar.slice(0, 8).map((b) => (
              <div key={b.item} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 12, color: '#475569' }}>{b.item}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#3730a3' }}>{b.avgTtl}</div>
              </div>
            ))}
          </div>
        </ToolSection>
      </TabScroll>
    )
  }

  return (
    <TabScroll>
      <SyncfusionLicenseNote />
      <ToolSection title="Syncfusion DataGrid + 검색">
        <GridComponent
          dataSource={rows.slice(0, 120)}
          allowPaging
          allowSorting
          toolbar={['Search']}
          height={380}
        >
          <ColumnsDirective>
            <ColumnDirective field="seq" headerText="seq" width="70" />
            <ColumnDirective field="item" headerText="작목" width="120" />
            <ColumnDirective field="cty" headerText="시군" width="100" />
            <ColumnDirective field="ttlCltvtnArea" headerText="총재배면적" format="N1" />
            <ColumnDirective field="saleAmt" headerText="판매금액" format="N0" />
            <ColumnDirective field="plcAddr" headerText="주소" />
          </ColumnsDirective>
          <Inject services={[Page, Sort, Toolbar, Search]} />
        </GridComponent>
      </ToolSection>

      <ToolSection title="막대 — 작목별 평균 총재배면적">
        <ChartComponent title="평균 총재배면적" primaryXAxis={{ valueType: 'Category', labelRotation: 32 }} height="300px">
          <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={bar} xName="item" yName="avgTtl" type="Column" name="평균" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="라인 — 누적 총재배면적">
        <ChartComponent primaryXAxis={{ valueType: 'Category' }} height="280px">
          <Inject services={[LineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={line} xName="seq" yName="cumTtl" type="Line" name="누적" width={2} />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="스플라인 — 동일 누적">
        <ChartComponent primaryXAxis={{ valueType: 'Category' }} height="260px">
          <Inject services={[SplineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={line} xName="seq" yName="cumTtl" type="Spline" name="누적" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="스텝 라인 — 누적">
        <ChartComponent primaryXAxis={{ valueType: 'Category' }} height="260px">
          <Inject services={[StepLineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={line} xName="seq" yName="cumTtl" type="StepLine" name="누적" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="영역 — 행 seq vs 총재배면적(샘플)">
        <ChartComponent primaryXAxis={{ valueType: 'Category' }} height="280px">
          <Inject services={[AreaSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={rows
                .filter((r) => r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea))
                .slice(0, 120)
                .map((r) => ({ sx: r.seq, ttl: r.ttlCltvtnArea }))}
              xName="sx"
              yName="ttl"
              type="Area"
              name="총재배면적"
              opacity={0.35}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="산점 — 면적 × 조사대지">
        <ChartComponent primaryXAxis={{ title: '총재배면적' }} primaryYAxis={{ title: '조사대지(평)' }} height="300px">
          <Inject services={[ScatterSeries, Legend, Tooltip]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={scat} xName="x" yName="y" type="Scatter" name="조사지" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="히스토그램 — 총재배면적 구간">
        <ChartComponent primaryXAxis={{ valueType: 'Category', labelRotation: 25 }} height="280px">
          <Inject services={[ColumnSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={hist} xName="bin" yName="count" type="Column" name="건수" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="그룹 막대 — 시군별 건수·평균면적">
        <ChartComponent primaryXAxis={{ valueType: 'Category' }} height="320px">
          <Inject services={[ColumnSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={cty} xName="cty" yName="cnt" name="건수" type="Column" />
            <SeriesDirective dataSource={cty} xName="cty" yName="avgTtl" name="평균 총재배면적" type="Column" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="파이 — 작목 건수">
        <AccumulationChartComponent title="작목 분포" height="300px" legendSettings={{ visible: true }}>
          <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip]} />
          <AccumulationSeriesCollectionDirective>
            <AccumulationSeriesDirective dataSource={pie} xName="bucket" yName="count" type="Pie" innerRadius="40%" />
          </AccumulationSeriesCollectionDirective>
        </AccumulationChartComponent>
      </ToolSection>

      <ToolSection title="가로 막대 — 파이프라인 단계(퍼널 대용)">
        <ChartComponent title="데이터 파이프라인(개념)" isTransposed height="320px">
          <Inject services={[BarSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={funnel} xName="stage" yName="count" type="Bar" name="건수" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="가로 막대 — 지표 평균(레이더 대용)">
        <ChartComponent isTransposed height="300px">
          <Inject services={[BarSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={radar} xName="metric" yName="avg" type="Bar" name="평균" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="막대 — 작목별 면적 합(트리맵 대용)">
        <ChartComponent primaryXAxis={{ valueType: 'Category', labelRotation: 30 }} height="300px">
          <Inject services={[ColumnSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective dataSource={tree} xName="name" yName="value" type="Column" name="면적합" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>
    </TabScroll>
  )
}
