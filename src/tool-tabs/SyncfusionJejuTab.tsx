import { Component, type ReactNode } from 'react'
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
  BubbleSeries,
  Category,
  ChartComponent,
  ColumnSeries,
  DataLabel,
  FunnelSeries,
  Inject,
  Legend,
  LineSeries,
  PieSeries,
  PyramidSeries,
  RadarSeries,
  SankeyComponent,
  ScatterSeries,
  SeriesCollectionDirective,
  SeriesDirective,
  SankeySeries,
  SankeyTooltip,
  SparklineComponent,
  SparklineTooltip,
  SplineSeries,
  StepLineSeries,
  Tooltip,
  Zoom,
} from '@syncfusion/ej2-react-charts'
import { ColumnDirective, ColumnsDirective, GridComponent, Page, Search, Sort, Toolbar } from '@syncfusion/ej2-react-grids'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  bubblePlotRows,
  cumulativeTtlSeries,
  funnelStageCounts,
  metricAveragesJeju,
  pieItemTopN,
  sankeyPipelineLinks,
  ttlHistogramBins,
  treemapItemSumTtl,
} from '../jeju/jejuFieldCropModel'
import { getSyncfusionLicenseKey } from '../license/envLicense'
import { CsvLoadErrorPanel, EmptyDataHint, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

function SyncfusionLicenseNote() {
  const ok = Boolean(getSyncfusionLicenseKey())
  if (ok) return null
  return (
    <ToolSection title="Syncfusion 라이선스(무료 Community)">
      <p className="gauge-note" style={{ margin: 0 }}>
        아래 차트·그리드는 키 없이도 표시됩니다(평가판 워터마크·배너가 나올 수 있음). 제거하려면 조건 충족 시{' '}
        <a href="https://www.syncfusion.com/products/communitylicense" target="_blank" rel="noreferrer">
          Community License
        </a>
        를 신청하거나, 계정 키를 <code>.env</code> 에 넣어 주세요:{' '}
        <strong>VITE_SYNCFUSION_LICENSE</strong>, <strong>VITE_SYNCFUSION_LICENSE_KEY</strong>,{' '}
        <strong>LICENSE_KEY</strong>, <strong>SYNCFUSION_LICENSE</strong> — 변경 후 <strong>개발 서버 재시작</strong>.
      </p>
    </ToolSection>
  )
}

/** Syncfusion 내부 런타임 오류 시 전체 탭이 하얗게 되는 것을 방지 */
class SyncfusionRenderBoundary extends Component<{ children: ReactNode }, { msg: string | null }> {
  state: { msg: string | null } = { msg: null }

  static getDerivedStateFromError(err: Error) {
    return { msg: err?.message || String(err) }
  }

  override render() {
    if (this.state.msg) {
      return (
        <ToolSection title="Syncfusion 렌더링 오류">
          <p style={{ color: '#b91c1c', marginTop: 0 }}>{this.state.msg}</p>
          <p className="gauge-note" style={{ marginBottom: 0 }}>
            특정 차트(Sankey·Radar·Zoom 등)와 데이터 조합에서 발생할 수 있습니다. 콘솔(F12)의 스택 트레이스를 함께 확인해 주세요.
          </p>
        </ToolSection>
      )
    }
    return this.props.children
  }
}

const VIVID_PALETTE = ['#6366f1', '#14b8a6', '#f97316', '#e11d48', '#8b5cf6', '#0ea5e9', '#22c55e', '#eab308']
const CHART_H = '168px'
const CHART_H_SM = '148px'
const GRID_H = 248

function orderedSankeyNodeIds(links: { source: string; target: string }[]) {
  const out: string[] = []
  const seen = new Set<string>()
  for (const l of links) {
    for (const id of [l.source, l.target]) {
      if (!seen.has(id)) {
        seen.add(id)
        out.push(id)
      }
    }
  }
  return out
}

export default function SyncfusionJejuTab({ rows, loadError, loading }: ToolRowsProps) {
  const bar = aggregateAvgTtlByItem(rows).slice(0, 12)
  const pie = pieItemTopN(rows, 8)
  const cty = aggregateCtyAvgTtl(rows, 10)
  const line = cumulativeTtlSeries(rows).slice(0, 220)
  const hist = ttlHistogramBins(rows, 12)
  const bubbles = bubblePlotRows(rows, 120)
  const scat = bubbles.map((d) => ({ x: d.bx, y: d.by }))
  const funnel = funnelStageCounts(rows.length)
  const radar = metricAveragesJeju(rows)
  const tree = treemapItemSumTtl(rows).slice(0, 14)
  const pipeLinks = sankeyPipelineLinks(rows.length)
  const sankeyNodes = orderedSankeyNodeIds(pipeLinks).map((id, i) => ({
    id,
    color: VIVID_PALETTE[i % VIVID_PALETTE.length],
    label: { text: id },
  }))
  const sankeyLinks = pipeLinks.map((l) => ({
    sourceId: l.source,
    targetId: l.target,
    value: l.weight,
  }))
  const sparkTail = line.slice(-48)

  if (loadError) {
    return (
      <TabScroll>
        <CsvLoadErrorPanel message={loadError} />
        <SyncfusionLicenseNote />
      </TabScroll>
    )
  }
  if (loading && rows.length === 0) {
    return (
      <TabScroll>
        <p className="gauge-note">셀 사이클 CSV를 불러오는 중입니다…</p>
        <SyncfusionLicenseNote />
      </TabScroll>
    )
  }
  if (!rows.length) {
    return (
      <TabScroll>
        <EmptyDataHint />
      </TabScroll>
    )
  }

  return (
    <TabScroll>
      <SyncfusionLicenseNote />
      <ToolSection title="Syncfusion DataGrid + 검색">
        <GridComponent
          key={`sf-grid-${rows.length}`}
          dataSource={rows.slice(0, 120)}
          allowPaging
          allowSorting
          toolbar={['Search']}
          height={GRID_H}
        >
          <ColumnsDirective>
            <ColumnDirective key="sf-col-seq" field="seq" headerText="seq" width="70" />
            <ColumnDirective key="sf-col-item" field="item" headerText={BAT_COL.cyc_condition_age_type} width="120" />
            <ColumnDirective key="sf-col-cty" field="cty" headerText={`cty(${BAT_COL.soc_est_end})`} width="100" />
            <ColumnDirective key="sf-col-ttl" field="ttlCltvtnArea" headerText={BAT_COL.delta_q_Ah} format="N1" />
            <ColumnDirective key="sf-col-sale" field="saleAmt" headerText={BAT_COL.saleAmt_primary} format="N0" />
            <ColumnDirective key="sf-col-addr" field="plcAddr" headerText={BAT_COL.sd_block_id} />
          </ColumnsDirective>
          <Inject services={[Page, Sort, Toolbar, Search]} />
        </GridComponent>
      </ToolSection>

      <SyncfusionRenderBoundary>
      <ToolSection title="Sankey — 데이터 가공 플로우">
        <SankeyComponent
          key={`sf-sankey-${rows.length}-${sankeyLinks.length}`}
          title="행 수 기준 개념 파이프라인"
          height="192px"
          width="100%"
          nodes={sankeyNodes}
          links={sankeyLinks}
          tooltip={{ enable: true }}
          linkStyle={{ opacity: 0.48, highlightOpacity: 1, colorType: 'Blend', curvature: 0.62 }}
        >
          <Inject services={[SankeySeries, SankeyTooltip]} />
        </SankeyComponent>
      </ToolSection>

      <ToolSection title={`스파크라인 — 누적 ${BAT_COL.delta_q_Ah} 미니 추세`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          {sparkTail.length >= 2
            ? (['Line', 'Area', 'Column'] as const).map((t) => (
                <div key={t} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{t}</div>
                  <SparklineComponent
                    key={`sf-spark-${t}-${sparkTail.length}`}
                    dataSource={sparkTail}
                    xName="seq"
                    yName="cumTtl"
                    type={t}
                    height="42px"
                    width="148px"
                    lineWidth={1.5}
                    fill={t === 'Area' ? '#a5b4fc' : undefined}
                    palette={['#6366f1', '#22d3ee', '#fb7185']}
                    tooltipSettings={{ visible: true, format: '${x} : ${y}' }}
                  >
                    <Inject services={[SparklineTooltip]} />
                  </SparklineComponent>
                </div>
              ))
            : (
                <p className="gauge-note" style={{ margin: 0 }}>
                  누적 시계열 데이터가 부족해 스파크라인을 생략합니다.
                </p>
              )}
        </div>
      </ToolSection>

      <ToolSection title={`막대 — ${BAT_COL.cyc_condition_age_type}별 평균 ${BAT_COL.delta_q_Ah}`}>
        <ChartComponent
          key={`sf-chart-bar-${rows.length}-${bar.length}`}
          title={`평균 ${BAT_COL.delta_q_Ah}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category', labelRotation: 32 }}
          height={CHART_H}
        >
          <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-bar-avg" dataSource={bar} xName="item" yName="avgTtl" type="Column" name={`평균 ${BAT_COL.delta_q_Ah}`} />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`라인 — 누적 ${BAT_COL.delta_q_Ah}(드래그 줌)`}>
        <ChartComponent
          key={`sf-chart-line-${rows.length}-${line.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category' }}
          zoomSettings={{ enableSelectionZooming: true, enableMouseWheelZooming: true, mode: 'X', enablePan: true }}
          height={CHART_H}
        >
          <Inject services={[LineSeries, Legend, Tooltip, Category, Zoom]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-line-cum" dataSource={line} xName="seq" yName="cumTtl" type="Line" name={`누적 ${BAT_COL.delta_q_Ah}`} width={2} />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="스플라인 — 동일 누적">
        <ChartComponent
          key={`sf-chart-spline-${rows.length}-${line.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category' }}
          height={CHART_H_SM}
        >
          <Inject services={[SplineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-spline-cum" dataSource={line} xName="seq" yName="cumTtl" type="Spline" name={`누적 ${BAT_COL.delta_q_Ah}`} />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`스텝 라인 — 누적 ${BAT_COL.delta_q_Ah}`}>
        <ChartComponent
          key={`sf-chart-stepline-${rows.length}-${line.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category' }}
          height={CHART_H_SM}
        >
          <Inject services={[StepLineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-stepline-cum" dataSource={line} xName="seq" yName="cumTtl" type="StepLine" name={`누적 ${BAT_COL.delta_q_Ah}`} />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`영역 — ${BAT_COL.seq} vs ${BAT_COL.delta_q_Ah}(샘플)`}>
        <ChartComponent
          key={`sf-chart-area-ttl-${rows.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category' }}
          height={CHART_H}
        >
          <Inject services={[AreaSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              key="sf-ser-area-ttl"
              dataSource={rows
                .filter((r) => r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea))
                .slice(0, 120)
                .map((r) => ({ sx: r.seq, ttl: r.ttlCltvtnArea }))}
              xName="sx"
              yName="ttl"
              type="Area"
              name={BAT_COL.delta_q_Ah}
              opacity={0.35}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="레이더 — 측정 컬럼별 평균(다축 비교)">
        <ChartComponent
          key={`sf-chart-radar-${rows.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category' }}
          height={CHART_H}
        >
          {/* Radar + drawType Area 는 내부에서 areaSeriesModule.render 를 호출하므로 AreaSeries 주입 필수 */}
          <Inject services={[RadarSeries, AreaSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-radar-avg" dataSource={radar} xName="metric" yName="avg" type="Radar" drawType="Area" name="평균" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`버블 — ${BAT_COL.delta_q_Ah} × ${BAT_COL.cyc_duration_s}, 크기=${BAT_COL.saleAmt_primary}`}>
        <ChartComponent
          key={`sf-chart-bubble-${rows.length}-${bubbles.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ title: BAT_COL.delta_q_Ah, minimum: 0 }}
          primaryYAxis={{ title: BAT_COL.cyc_duration_s, minimum: 0 }}
          height={CHART_H}
        >
          <Inject services={[BubbleSeries, Legend, Tooltip]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              key="sf-ser-bubble-sale"
              dataSource={bubbles}
              xName="bx"
              yName="by"
              size="bsize"
              type="Bubble"
              name={`${BAT_COL.delta_q_Ah}·${BAT_COL.cyc_duration_s}`}
              minRadius={2}
              maxRadius={10}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`산점 — ${BAT_COL.delta_q_Ah} × ${BAT_COL.cyc_duration_s}(동일 데이터, 점만)`}>
        <ChartComponent
          key={`sf-chart-scatter-${rows.length}-${scat.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ title: BAT_COL.delta_q_Ah }}
          primaryYAxis={{ title: BAT_COL.cyc_duration_s }}
          height={CHART_H_SM}
        >
          <Inject services={[ScatterSeries, Legend, Tooltip]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              key="sf-ser-scatter"
              dataSource={scat}
              xName="x"
              yName="y"
              type="Scatter"
              name={`${BAT_COL.delta_q_Ah}·${BAT_COL.cyc_duration_s}`}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`히스토그램 — ${BAT_COL.delta_q_Ah} 구간`}>
        <ChartComponent
          key={`sf-chart-hist-${rows.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category', labelRotation: 25 }}
          height={CHART_H_SM}
        >
          <Inject services={[ColumnSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-hist" dataSource={hist} xName="bin" yName="count" type="Column" name="건수" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`그룹 막대 — cty별 건수·평균 ${BAT_COL.delta_q_Ah}`}>
        <ChartComponent
          key={`sf-chart-cty-group-${rows.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category' }}
          height={CHART_H}
        >
          <Inject services={[ColumnSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-cty-cnt" dataSource={cty} xName="cty" yName="cnt" name="건수" type="Column" />
            <SeriesDirective key="sf-ser-cty-avgttl" dataSource={cty} xName="cty" yName="avgTtl" name={`평균 ${BAT_COL.delta_q_Ah}`} type="Column" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`파이 / 퍼널 / 피라미드 — ${BAT_COL.cyc_condition_age_type} 건수`}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            alignItems: 'stretch',
          }}
        >
          <AccumulationChartComponent key={`sf-acc-pie-${rows.length}`} title="파이" height={CHART_H} legendSettings={{ visible: true }}>
            <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective key="sf-acc-ser-pie" dataSource={pie} xName="bucket" yName="count" type="Pie" innerRadius="44%" />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
          <AccumulationChartComponent key={`sf-acc-funnel-${rows.length}`} title="퍼널" height={CHART_H} legendSettings={{ visible: false }}>
            <Inject services={[FunnelSeries, AccumulationTooltip]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective
                key="sf-acc-ser-funnel"
                dataSource={pie}
                xName="bucket"
                yName="count"
                type="Funnel"
                neckWidth="10%"
                neckHeight="8%"
                dataLabel={{ visible: true, name: 'bucket' }}
              />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
          <AccumulationChartComponent key={`sf-acc-pyramid-${rows.length}`} title="피라미드" height={CHART_H} legendSettings={{ visible: false }}>
            <Inject services={[PyramidSeries, AccumulationTooltip]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective
                key="sf-acc-ser-pyramid"
                dataSource={pie}
                xName="bucket"
                yName="count"
                type="Pyramid"
                dataLabel={{ visible: true, name: 'bucket' }}
              />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
        </div>
      </ToolSection>

      <ToolSection title="가로 막대 — 파이프라인 단계(퍼널 대용)">
        <ChartComponent
          key={`sf-chart-funnel-bar-${rows.length}`}
          palettes={VIVID_PALETTE}
          title="데이터 파이프라인(개념)"
          isTransposed
          height={CHART_H}
        >
          <Inject services={[BarSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-funnel-stage" dataSource={funnel} xName="stage" yName="count" type="Bar" name="건수" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title="가로 막대 — 측정 컬럼 평균(막대 요약)">
        <ChartComponent key={`sf-chart-radar-bar-${rows.length}`} palettes={VIVID_PALETTE} isTransposed height={CHART_H_SM}>
          <Inject services={[BarSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-radar-bar" dataSource={radar} xName="metric" yName="avg" type="Bar" name="평균" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>

      <ToolSection title={`막대 — ${BAT_COL.cyc_condition_age_type}별 ${BAT_COL.delta_q_Ah} 합(트리맵 대용)`}>
        <ChartComponent
          key={`sf-chart-tree-${rows.length}-${tree.length}`}
          palettes={VIVID_PALETTE}
          primaryXAxis={{ valueType: 'Category', labelRotation: 30 }}
          height={CHART_H_SM}
        >
          <Inject services={[ColumnSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective key="sf-ser-tree-sum" dataSource={tree} xName="name" yName="value" type="Column" name={`${BAT_COL.delta_q_Ah} 합`} />
          </SeriesCollectionDirective>
        </ChartComponent>
      </ToolSection>
      </SyncfusionRenderBoundary>
    </TabScroll>
  )
}
