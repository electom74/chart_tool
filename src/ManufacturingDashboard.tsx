import { useMemo, useState, type ReactNode } from 'react'
import PivotGridDataSource from 'devextreme/ui/pivot_grid/data_source'
import BarGauge, { Legend as BarGaugeLegend } from 'devextreme-react/bar-gauge'
import Bullet from 'devextreme-react/bullet'
import Chart, {
  ArgumentAxis,
  CommonSeriesSettings,
  Crosshair,
  Export as ChartExport,
  HorizontalLine,
  Legend as ChartLegend,
  Series,
  Tooltip as ChartTooltip,
  ValueAxis,
  VerticalLine,
  ZoomAndPan,
} from 'devextreme-react/chart'
import CircularGauge, {
  Range as CgRange,
  RangeContainer as CgRangeContainer,
  Scale as CgScale,
  ValueIndicator as CgValueIndicator,
} from 'devextreme-react/circular-gauge'
import DataGrid, {
  Column,
  ColumnChooser,
  Export as GridExport,
  FilterRow,
  GroupPanel,
  Pager,
  Paging,
  SearchPanel,
  Summary,
  TotalItem,
} from 'devextreme-react/data-grid'
import Funnel from 'devextreme-react/funnel'
import LinearGauge, {
  Range as LgRange,
  RangeContainer as LgRangeContainer,
  Scale as LgScale,
  ValueIndicator as LgValueIndicator,
} from 'devextreme-react/linear-gauge'
import PieChart, {
  Export as PieExport,
  Legend as PieLegend,
  Series as PieSeries,
  Tooltip as PieTooltip,
} from 'devextreme-react/pie-chart'
import PivotGrid, { Export as PivotExport, FieldChooser } from 'devextreme-react/pivot-grid'
import PolarChart, {
  CommonSeriesSettings as PolarCommon,
  Export as PolarExport,
  Series as PolarSeries,
  Tooltip as PolarTooltip,
} from 'devextreme-react/polar-chart'
import ProgressBar from 'devextreme-react/progress-bar'
import RangeSelector, {
  Behavior,
  Chart as RsChart,
  Series as RsSeries,
  Scale as RsScale,
  Size as RsSize,
} from 'devextreme-react/range-selector'
import Sankey from 'devextreme-react/sankey'
import SelectBox from 'devextreme-react/select-box'
import Sparkline from 'devextreme-react/sparkline'
import TabPanel, { Item } from 'devextreme-react/tab-panel'
import TileView from 'devextreme-react/tile-view'
import Toolbar, { Item as ToolbarItem } from 'devextreme-react/toolbar'
import TreeMap from 'devextreme-react/tree-map'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  bubblePlotRows,
  cumulativeTtlSeries,
  funnelStageCounts,
  metricAveragesJeju,
  pivotLongFromJeju,
  pieItemTopN,
  sankeyPipelineLinks,
  tileViewTopCrops,
  treemapItemSumTtl,
  ttlHistogramBins,
  type JejuFieldCropSlim,
} from './jeju/jejuFieldCropModel'
import { TabScroll } from './tool-tabs/TabScroll'

function chartHeight(h: number) {
  return { height: h }
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="viz-card">
      <h3 className="viz-card-title">{title}</h3>
      {children}
    </section>
  )
}

function ttlNumericRows(rows: JejuFieldCropSlim[]) {
  return rows.filter((r) => r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea))
}

function ttlStats(rows: JejuFieldCropSlim[]) {
  const vals = rows.map((r) => r.ttlCltvtnArea).filter((v): v is number => v != null && Number.isFinite(v))
  if (!vals.length) return { min: 0, max: 1, avg: 0 }
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  return { min, max, avg: vals.reduce((a, b) => a + b, 0) / vals.length }
}

function scatterRows(rows: JejuFieldCropSlim[]) {
  return rows.filter(
    (r) =>
      r.ttlCltvtnArea != null &&
      r.exmnTrgtPlcAreaPy != null &&
      Number.isFinite(r.ttlCltvtnArea) &&
      Number.isFinite(r.exmnTrgtPlcAreaPy),
  )
}

function saleMedian(rows: JejuFieldCropSlim[]) {
  const xs = rows.map((r) => r.saleAmt).filter((v): v is number => v != null && Number.isFinite(v) && v > 0)
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)] ?? s[0] ?? 0
}

type CtyOpt = { value: string | null; name: string }

export type ManufacturingDashboardProps = {
  rows: JejuFieldCropSlim[]
  loadError: string | null
}

export default function ManufacturingDashboard({ rows, loadError }: ManufacturingDashboardProps) {
  const [ctyFilter, setCtyFilter] = useState<string | null>(null)

  const viewRows = useMemo(
    () => (ctyFilter ? rows.filter((r) => r.cty === ctyFilter) : rows),
    [rows, ctyFilter],
  )

  const ctyOptions = useMemo((): CtyOpt[] => {
    const set = new Set(rows.map((r) => r.cty?.trim()).filter(Boolean) as string[])
    const sorted = [...set].sort()
    return [{ value: null, name: '전체 시군' }, ...sorted.map((c) => ({ value: c, name: c }))]
  }, [rows])

  const last = viewRows[viewRows.length - 1]
  const { min: ttlMin, max: ttlMax, avg: ttlAvg } = ttlStats(viewRows)
  const lastTtl = last?.ttlCltvtnArea ?? ttlAvg
  const normTtl =
    ttlMax > ttlMin
      ? Math.min(100, Math.max(0, ((lastTtl - ttlMin) / (ttlMax - ttlMin)) * 100))
      : 50

  const pivotSource = useMemo(
    () =>
      new PivotGridDataSource({
        fields: [
          { dataField: 'srvyLabel', area: 'row', caption: '조사 ID(일부)' },
          { dataField: 'measure', area: 'column', caption: '지표' },
          { dataField: 'value', area: 'data', summaryType: 'sum', caption: '값' },
        ],
        store: pivotLongFromJeju(viewRows),
      }),
    [viewRows],
  )

  const sparkTtl = useMemo(() => {
    const slice = ttlNumericRows(viewRows).slice(0, 200)
    return slice.map((r) => ({ t: r.seq, v: r.ttlCltvtnArea as number }))
  }, [viewRows])

  const barGaugeVals = useMemo(() => {
    if (!last) return [0, 0, 0, 0, 0]
    const maxOf = (fn: (r: JejuFieldCropSlim) => number | null) => {
      let m = 0
      for (const r of viewRows) {
        const v = fn(r)
        if (v != null && Number.isFinite(v)) m = Math.max(m, v)
      }
      return m || 1
    }
    const pick = [
      last.ttlCltvtnArea,
      last.alt,
      last.exmnTrgtPlcAreaPy,
      last.sdQty,
      last.saleAmt,
    ]
    const mx = {
      a: maxOf((r) => r.ttlCltvtnArea),
      b: maxOf((r) => r.alt),
      c: maxOf((r) => r.exmnTrgtPlcAreaPy),
      d: maxOf((r) => r.sdQty),
      e: maxOf((r) => r.saleAmt),
    }
    const n = (v: number | null, m: number) => (v != null && m ? Math.round((v / m) * 100) : 0)
    return [n(pick[0], mx.a), n(pick[1], mx.b), n(pick[2], mx.c), n(pick[3], mx.d), n(pick[4], mx.e)]
  }, [last, viewRows])

  const splineDs = ttlNumericRows(viewRows)
  const stackedDs = viewRows.filter(
    (r) =>
      r.ttlCltvtnArea != null || r.alt != null || r.exmnTrgtPlcAreaPy != null,
  )
  const saleTarget = saleMedian(viewRows)
  const lastSale = last?.saleAmt ?? 0

  const rsMin = splineDs[0]?.seq ?? 1
  const rsMax = splineDs[splineDs.length - 1]?.seq ?? rsMin + 1
  const rsSpan = Math.max(5, Math.floor((rsMax - rsMin) * 0.35))
  const rsDefault: [number, number] = [rsMin, Math.min(rsMax, rsMin + rsSpan)]

  const tab1 = (
    <TabScroll>
      <div className="viz-filter-bar">
        <span className="viz-filter-label">시군구 필터</span>
        <SelectBox
          width={220}
          displayExpr="name"
          valueExpr="value"
          dataSource={ctyOptions}
          value={ctyFilter}
          searchEnabled
          showClearButton
          placeholder="시군 선택"
          onValueChanged={(e) => setCtyFilter(e.value as string | null)}
        />
        <span className="viz-filter-meta">
          표시 {viewRows.length}건 / 전체 {rows.length}건
        </span>
      </div>

      <div className="viz-grid">
        <Card title="RangeSelector + 미니차트 (총재배면적 구간)">
          <RangeSelector
            dataSource={splineDs}
            title={{ text: '행 구간을 드래그해 탐색 (총재배면적)' }}
            defaultValue={rsDefault}
          >
            <RsSize height={120} />
            <RsScale startValue={rsMin} endValue={rsMax} tickInterval={Math.max(1, Math.floor((rsMax - rsMin) / 8))} />
            <RsChart palette="Harmony Light">
              <RsSeries argumentField="seq" valueField="ttlCltvtnArea" type="area" />
            </RsChart>
            <Behavior valueChangeMode="onHandleMove" />
          </RangeSelector>
        </Card>

        <Card title="행 순서 — 총재배면적 (Spline · 줌/팬 · 크로스헤어)">
          <Chart
            dataSource={splineDs}
            style={chartHeight(320)}
            palette="Harmony Light"
            title={{ text: '마우스로 확대·이동 가능' }}
          >
            <ZoomAndPan argumentAxis="both" valueAxis="none" />
            <Crosshair enabled color="#6366f1" width={1} dashStyle="dash">
              <HorizontalLine visible={false} />
              <VerticalLine visible />
            </Crosshair>
            <ArgumentAxis title={{ text: '행 순서(샘플)' }} />
            <ValueAxis title={{ text: '총재배면적' }} />
            <Series argumentField="seq" valueField="ttlCltvtnArea" type="spline" name="총재배면적" />
            <ChartLegend visible />
            <ChartTooltip enabled shared />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="버블 — 면적 × 조사대지 × 판매금액(크기)">
          <Chart dataSource={bubblePlotRows(viewRows)} style={chartHeight(320)} palette="Pastel">
            <ArgumentAxis title={{ text: '총재배면적' }} />
            <ValueAxis title={{ text: '조사대지면적(평)' }} />
            <Series
              argumentField="bx"
              valueField="by"
              sizeField="bsize"
              type="bubble"
              name="농가·작목"
            />
            <ChartTooltip enabled customizeTooltip={(e) => ({ text: `면적 ${e.point?.data?.bx}, 대지 ${e.point?.data?.by}` })} />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="Step — 누적 총재배면적">
          <Chart dataSource={cumulativeTtlSeries(viewRows)} style={chartHeight(280)} palette="Soft">
            <ArgumentAxis title={{ text: '행 순서' }} />
            <ValueAxis title={{ text: '누적 면적' }} />
            <Series argumentField="seq" valueField="cumTtl" type="stepline" name="누적" color="#0d9488" />
            <ChartTooltip enabled />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="히스토그램 — 총재배면적 구간별 건수">
          <Chart dataSource={ttlHistogramBins(viewRows, 14)} style={chartHeight(300)} palette="Bright">
            <ArgumentAxis />
            <ValueAxis title={{ text: '건수' }} />
            <Series argumentField="bin" valueField="count" type="bar" name="건수" />
            <ChartTooltip enabled />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="시군구 — 건수·평균면적 (그룹 막대)">
          <Chart dataSource={aggregateCtyAvgTtl(viewRows, 12)} style={chartHeight(320)} palette="Ocean">
            <ArgumentAxis title={{ text: '시군구' }} />
            <ValueAxis title={{ text: '값' }} />
            <CommonSeriesSettings argumentField="cty" type="bar" />
            <Series valueField="cnt" name="건수" />
            <Series valueField="avgTtl" name="평균 총재배면적" />
            <ChartLegend horizontalAlignment="center" verticalAlignment="bottom" />
            <ChartTooltip enabled shared />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="TileView — 상위 작목(면적합 기준)">
          <TileView
            items={tileViewTopCrops(viewRows, 18)}
            height={220}
            baseItemHeight={100}
            direction="horizontal"
            itemMargin={10}
          />
        </Card>

        <Card title="스택 영역 — 면적·고도·조사대지(행 순서)">
          <Chart
            dataSource={stackedDs}
            style={chartHeight(340)}
            palette="Bright"
            resolveLabelOverlapping="stack"
          >
            <ArgumentAxis />
            <ValueAxis title={{ text: '값' }} />
            <CommonSeriesSettings argumentField="seq" type="stackedarea" />
            <Series valueField="ttlCltvtnArea" name="총재배면적" />
            <Series valueField="alt" name="고도" />
            <Series valueField="exmnTrgtPlcAreaPy" name="조사대지면적(평)" />
            <ChartLegend horizontalAlignment="center" verticalAlignment="bottom" />
            <ChartTooltip enabled shared />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="총재배면적 vs 조사대지면적 (Scatter)">
          <Chart dataSource={scatterRows(viewRows)} style={chartHeight(300)} palette="Soft">
            <ArgumentAxis title={{ text: '총재배면적' }} />
            <ValueAxis title={{ text: '조사대지면적(평)' }} />
            <Series
              argumentField="ttlCltvtnArea"
              valueField="exmnTrgtPlcAreaPy"
              type="scatter"
              name="조사지"
            />
            <ChartTooltip enabled />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="막대 — 작목별 총재배면적 평균 (상위 20)">
          <Chart
            dataSource={aggregateAvgTtlByItem(viewRows)}
            style={chartHeight(320)}
            rotated
            palette="Ocean"
          >
            <ArgumentAxis />
            <ValueAxis title={{ text: '평균 총재배면적' }} />
            <Series argumentField="item" valueField="avgTtl" type="bar" name="평균" />
            <ChartTooltip enabled />
            <ChartExport enabled />
          </Chart>
        </Card>

        <Card title="작목 분포 (도넛 Pie, 상위 10 + 기타)">
          <PieChart
            dataSource={pieItemTopN(viewRows, 10)}
            style={chartHeight(300)}
            palette="Bright"
            innerRadius={0.55}
          >
            <PieSeries argumentField="bucket" valueField="count" />
            <PieLegend visible horizontalAlignment="center" verticalAlignment="bottom" />
            <PieTooltip enabled customizeTooltip={(e) => ({ text: `${e.argumentText}: ${e.valueText}건` })} />
            <PieExport enabled />
          </PieChart>
        </Card>

        <Card title="데이터 정제·활용 흐름 (Sankey)">
          <Sankey
            dataSource={sankeyPipelineLinks(viewRows.length)}
            sourceField="source"
            targetField="target"
            weightField="weight"
            title={{ text: 'REFINED → Parquet → 활용' }}
            style={chartHeight(320)}
          />
        </Card>

        <Card title="단계별 볼륨 (Funnel)">
          <Funnel
            dataSource={funnelStageCounts(viewRows.length)}
            argumentField="stage"
            valueField="count"
            algorithm="dynamicHeight"
            style={chartHeight(320)}
            palette="Soft Pastel"
          />
        </Card>

        <Card title="작목별 총재배면적 합 (TreeMap)">
          <TreeMap
            dataSource={treemapItemSumTtl(viewRows)}
            valueField="value"
            labelField="name"
            idField="name"
            layoutAlgorithm="squarified"
            style={chartHeight(300)}
          />
        </Card>

        <Card title="지표 평균 레이더 (Polar)">
          <PolarChart dataSource={metricAveragesJeju(viewRows)} style={chartHeight(320)} palette="Soft">
            <PolarCommon type="line" />
            <PolarSeries argumentField="metric" valueField="avg" name="표본 평균" />
            <PolarTooltip enabled />
            <PolarExport enabled />
          </PolarChart>
        </Card>

        <Card title="마지막 행 기준 — 총재배면적 게이지">
          <div className="gauge-row">
            <div className="gauge-cell">
              <CircularGauge
                value={lastTtl}
                style={{ height: 220 }}
                title={{ text: '총재배면적' }}
              >
                <CgScale
                  startValue={Math.max(0, ttlMin - (ttlMax - ttlMin) * 0.1)}
                  endValue={ttlMax + (ttlMax - ttlMin) * 0.1}
                >
                  <CgRangeContainer>
                    <CgRange startValue={ttlMin} endValue={ttlAvg} color="#e0e7ff" />
                    <CgRange startValue={ttlAvg} endValue={ttlMax} color="#c7d2fe" />
                  </CgRangeContainer>
                </CgScale>
                <CgValueIndicator color="#4f46e5" />
              </CircularGauge>
            </div>
            <div className="gauge-cell">
              <LinearGauge
                value={normTtl}
                style={{ height: 120 }}
                subvalues={[33, 66]}
                title={{ text: '총재배면적 상대위치(0~100)' }}
              >
                <LgScale startValue={0} endValue={100} tickInterval={25}>
                  <LgRangeContainer>
                    <LgRange startValue={0} endValue={33} color="#fecaca" />
                    <LgRange startValue={33} endValue={66} color="#fde68a" />
                    <LgRange startValue={66} endValue={100} color="#bbf7d0" />
                  </LgRangeContainer>
                </LgScale>
                <LgValueIndicator color="#0f172a" />
              </LinearGauge>
              <p className="gauge-note">필터 적용 표본에서 마지막 행의 상대 위치</p>
            </div>
          </div>
        </Card>

        <Card title="마지막 행 5지표 상대 BarGauge (0~100)">
          <BarGauge values={barGaugeVals} startValue={0} endValue={100} style={{ height: 180 }}>
            <BarGaugeLegend
              visible
              verticalAlignment="bottom"
              horizontalAlignment="center"
              customizeItems={(items) =>
                items.map((item, i) => ({
                  ...item,
                  text:
                    ['총재배면적', '고도', '조사대지면적', '파종량', '판매금액'][i] ?? item.text,
                }))
              }
            />
          </BarGauge>
        </Card>

        <Card title="판매금액 vs 표본 중앙값 (Bullet)">
          <Bullet
            value={lastSale}
            startScaleValue={0}
            endScaleValue={Math.max(lastSale, saleTarget) * 1.25 || 1}
            target={saleTarget || 1}
            color="#6366f1"
            style={{ height: 56, width: '100%' }}
          />
        </Card>

        <Card title="총재배면적 스파크라인 (앞 200행)">
          <Sparkline
            dataSource={sparkTtl}
            argumentField="t"
            valueField="v"
            type="line"
            showMinMax
            style={{ height: 80, width: '100%' }}
          />
        </Card>

        <Card title="샘플 로드 진행률(데모)">
          <ProgressBar value={Math.min(100, Math.round((rows.length / 800) * 100))} />
          <p className="gauge-note">로드된 레코드 {rows.length}건 · 원본 CSV에서 앞부분 샘플</p>
        </Card>
      </div>
    </TabScroll>
  )

  const tab2 = (
    <div className="viz-tab-pad">
      <DataGrid
        dataSource={viewRows}
        keyExpr="id"
        showBorders
        columnAutoWidth
        allowColumnReordering
        rowAlternationEnabled
        style={{ height: '68vh' }}
      >
        <FilterRow visible />
        <GroupPanel visible />
        <SearchPanel visible width={260} placeholder="검색…" />
        <ColumnChooser enabled mode="select" />
        <Paging defaultPageSize={15} />
        <Pager visible showPageSizeSelector showInfo />
        <GridExport enabled allowExportSelectedData />
        <Column dataField="srvyId" caption="srvy_id" width={120} />
        <Column dataField="listId" caption="list_id" width={100} />
        <Column dataField="item" caption="작목(item)" minWidth={100} />
        <Column dataField="cty" caption="시군구(cty)" width={90} />
        <Column dataField="eupmyeon" caption="읍면" width={90} />
        <Column dataField="mngmSttsNm" caption="경영상태" minWidth={120} />
        <Column dataField="plcAddr" caption="주소" minWidth={180} />
        <Column dataField="ttlCltvtnArea" caption="총재배면적" dataType="number" format=",##0.##" />
        <Column dataField="alt" caption="고도" dataType="number" format=",##0.##" />
        <Column dataField="exmnTrgtPlcAreaPy" caption="조사대지면적(평)" dataType="number" format=",##0.##" />
        <Column dataField="sdQty" caption="파종량" dataType="number" format=",##0.##" />
        <Column dataField="salePrdcQty" caption="판매생산량" dataType="number" format=",##0.##" />
        <Column dataField="saleAmt" caption="판매금액" dataType="number" format=",##0" />
        <Summary>
          <TotalItem
            column="ttlCltvtnArea"
            summaryType="avg"
            valueFormat=",##0.0"
            displayFormat="총재배면적 평균: {0}"
          />
          <TotalItem column="id" summaryType="count" displayFormat="행 수: {0}" />
        </Summary>
      </DataGrid>
    </div>
  )

  const tab3 = (
    <div className="viz-tab-pad">
      <PivotGrid
        dataSource={pivotSource}
        showBorders
        allowSorting
        allowFiltering
        height={560}
        export={{ enabled: true }}
      >
        <FieldChooser enabled height={400} />
        <PivotExport enabled />
      </PivotGrid>
    </div>
  )

  return (
    <main className="dash-shell">
      <Toolbar className="dash-toolbar">
        <ToolbarItem location="before">
          <div>
            <div className="dash-title">2023 제주 농업경영정보조사 · 밭작물 (REFINED) 시각화</div>
            <div className="dash-sub">
              원본: Downloads CSV → 샘플 <code>public/data/jeju-field-crops-sample.csv</code> — 전체{' '}
              <strong>{rows.length}</strong>행
              {ctyFilter ? (
                <>
                  {' '}
                  · 필터 적용 <strong>{viewRows.length}</strong>행
                </>
              ) : null}
            </div>
          </div>
        </ToolbarItem>
      </Toolbar>

      {loadError ? (
        <div className="viz-card" style={{ marginTop: 12 }}>
          <p style={{ color: '#b91c1c' }}>데이터를 불러오지 못했습니다: {loadError}</p>
          <p className="gauge-note">
            프로젝트 루트에서 <code>npm run extract:jeju-csv</code> 로{' '}
            <code>public/data/jeju-field-crops-sample.csv</code> 를 만든 뒤 다시 실행해 보세요.
          </p>
        </div>
      ) : null}

      {!loadError ? (
        <TabPanel animationEnabled swipeEnabled focusStateEnabled height="calc(100vh - 140px)">
          <Item title="차트 · 게이지" icon="chart">
            {tab1}
          </Item>
          <Item title="DataGrid" icon="mediumiconslayout">
            {tab2}
          </Item>
          <Item title="PivotGrid" icon="fieldchooser">
            {tab3}
          </Item>
        </TabPanel>
      ) : null}
    </main>
  )
}
