import { useMemo } from 'react'
import { ModuleRegistry } from 'ag-grid-community'
import type { ColDef, GridOptions } from 'ag-grid-community'
import { AgChartsCommunityModule } from 'ag-charts-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  pivotLongFromJeju,
  ttlHistogramBins,
} from '../jeju/jejuFieldCropModel'
import { JejuDataGate, ToolSection, type ToolRowsProps } from './shared'
import { AgGridJejuIntegratedCharts } from './AgGridJejuIntegratedCharts'
import { TabScroll } from './TabScroll'

ModuleRegistry.registerModules([AllEnterpriseModule.with(AgChartsCommunityModule)])

const mainCols: ColDef[] = [
  { field: 'seq', headerName: 'seq', width: 80, filter: 'agNumberColumnFilter', enableRowGroup: true },
  { field: 'item', headerName: '작목', flex: 1, minWidth: 100, filter: 'agTextColumnFilter', enableRowGroup: true },
  { field: 'cty', headerName: '시군', width: 110, filter: 'agTextColumnFilter', enableRowGroup: true },
  { field: 'ttlCltvtnArea', headerName: '총재배면적', width: 130, filter: 'agNumberColumnFilter' },
  { field: 'saleAmt', headerName: '판매금액', width: 120, filter: 'agNumberColumnFilter' },
  { field: 'alt', headerName: '고도', width: 90, filter: 'agNumberColumnFilter' },
  { field: 'exmnTrgtPlcAreaPy', headerName: '조사대지(평)', width: 120, filter: 'agNumberColumnFilter' },
]

const defaultColDef: ColDef = {
  sortable: true,
  resizable: true,
  floatingFilter: true,
}

const gridOpts: GridOptions = {
  rowGroupPanelShow: 'always',
  groupDisplayType: 'multipleColumns',
  animateRows: true,
  enableCharts: true,
  cellSelection: true,
  statusBar: {
    statusPanels: [
      { statusPanel: 'agTotalRowCountComponent', align: 'left' },
      { statusPanel: 'agFilteredRowCountComponent' },
      { statusPanel: 'agSelectedRowCountComponent' },
    ],
  },
  sideBar: {
    toolPanels: [
      { id: 'columns', labelDefault: '열', labelKey: 'columns', iconKey: 'columns', toolPanel: 'agColumnsToolPanel' },
      { id: 'filters', labelDefault: '필터', labelKey: 'filters', iconKey: 'filter', toolPanel: 'agFiltersToolPanel' },
    ],
    defaultToolPanel: 'filters',
  },
}

export default function AgGridJejuTab(props: ToolRowsProps) {
  const { rows } = props
  const chartRows = useMemo(() => aggregateAvgTtlByItem(rows).slice(0, 16), [rows])
  const ctyRows = useMemo(() => aggregateCtyAvgTtl(rows, 12), [rows])
  const histRows = useMemo(() => ttlHistogramBins(rows, 12), [rows])
  const pivotRows = useMemo(() => pivotLongFromJeju(rows).slice(0, 400), [rows])

  const chartCols = useMemo<ColDef[]>(
    () => [
      { field: 'item', headerName: '작목', flex: 1 },
      { field: 'avgTtl', headerName: '평균 총재배면적', width: 160, filter: 'agNumberColumnFilter' },
    ],
    [],
  )

  return (
    <JejuDataGate {...props}>
    <TabScroll>
      <ToolSection title="AG Grid Enterprise — 메인(그룹·상태바·사이드바)">
        <div className="ag-theme-quartz" style={{ height: 420, width: '100%' }}>
          <AgGridReact
            rowData={rows}
            columnDefs={mainCols}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={30}
            {...gridOpts}
          />
        </div>
      </ToolSection>
      <AgGridJejuIntegratedCharts rows={rows} />
      <ToolSection title="집계 그리드 — 작목별 평균면적">
        <div className="ag-theme-quartz" style={{ height: 280, width: '100%' }}>
          <AgGridReact rowData={chartRows} columnDefs={chartCols} defaultColDef={defaultColDef} />
        </div>
      </ToolSection>
      <ToolSection title="집계 그리드 — 시군별 건수·평균">
        <div className="ag-theme-quartz" style={{ height: 280, width: '100%' }}>
          <AgGridReact
            rowData={ctyRows}
            columnDefs={[
              { field: 'cty', headerName: '시군', flex: 1 },
              { field: 'cnt', headerName: '건수', width: 100, filter: 'agNumberColumnFilter' },
              { field: 'avgTtl', headerName: '평균면적', width: 130, filter: 'agNumberColumnFilter' },
            ]}
            defaultColDef={defaultColDef}
          />
        </div>
      </ToolSection>
      <ToolSection title="히스토그램 — 구간별 건수">
        <div className="ag-theme-quartz" style={{ height: 260, width: '100%' }}>
          <AgGridReact
            rowData={histRows}
            columnDefs={[
              { field: 'bin', headerName: '구간', flex: 1 },
              { field: 'count', headerName: '건수', width: 100, filter: 'agNumberColumnFilter' },
            ]}
            defaultColDef={defaultColDef}
          />
        </div>
      </ToolSection>
      <ToolSection title="롱 포맷 — 피벗용(조사×지표×값)">
        <div className="ag-theme-quartz" style={{ height: 360, width: '100%' }}>
          <AgGridReact
            rowData={pivotRows}
            columnDefs={[
              { field: 'srvyLabel', headerName: '조사', width: 160, filter: 'agTextColumnFilter' },
              { field: 'item', headerName: '작목', width: 120, filter: 'agTextColumnFilter' },
              { field: 'measure', headerName: '지표', width: 120, filter: 'agTextColumnFilter' },
              { field: 'value', headerName: '값', width: 120, filter: 'agNumberColumnFilter', aggFunc: 'sum' },
            ]}
            defaultColDef={defaultColDef}
            rowGroupPanelShow="always"
          />
        </div>
      </ToolSection>
    </TabScroll>
    </JejuDataGate>
  )
}
