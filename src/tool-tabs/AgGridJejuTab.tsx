import { useMemo } from 'react'
import { ModuleRegistry } from 'ag-grid-community'
import type { ColDef, GridOptions } from 'ag-grid-community'
import { AgChartsCommunityModule } from 'ag-charts-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { BAT_COL } from '../jeju/batteryCsvColumnLabels'
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
  { field: 'seq', headerName: BAT_COL.seq, width: 80, filter: 'agNumberColumnFilter', enableRowGroup: true },
  { field: 'item', headerName: BAT_COL.cyc_condition_age_type, flex: 1, minWidth: 100, filter: 'agTextColumnFilter', enableRowGroup: true },
  { field: 'cty', headerName: `cty(${BAT_COL.soc_est_end})`, width: 110, filter: 'agTextColumnFilter', enableRowGroup: true },
  { field: 'ttlCltvtnArea', headerName: BAT_COL.delta_q_Ah, width: 130, filter: 'agNumberColumnFilter' },
  { field: 'saleAmt', headerName: BAT_COL.saleAmt_primary, width: 120, filter: 'agNumberColumnFilter' },
  { field: 'alt', headerName: BAT_COL.t_end_degC, width: 90, filter: 'agNumberColumnFilter' },
  { field: 'exmnTrgtPlcAreaPy', headerName: BAT_COL.cyc_duration_s, width: 120, filter: 'agNumberColumnFilter' },
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
      { field: 'item', headerName: BAT_COL.cyc_condition_age_type, flex: 1 },
      { field: 'avgTtl', headerName: `평균 ${BAT_COL.delta_q_Ah}`, width: 160, filter: 'agNumberColumnFilter' },
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
      <ToolSection title={`집계 그리드 — ${BAT_COL.cyc_condition_age_type}별 평균 ${BAT_COL.delta_q_Ah}`}>
        <div className="ag-theme-quartz" style={{ height: 280, width: '100%' }}>
          <AgGridReact rowData={chartRows} columnDefs={chartCols} defaultColDef={defaultColDef} />
        </div>
      </ToolSection>
      <ToolSection title={`집계 그리드 — cty별 건수·평균 ${BAT_COL.delta_q_Ah}`}>
        <div className="ag-theme-quartz" style={{ height: 280, width: '100%' }}>
          <AgGridReact
            rowData={ctyRows}
            columnDefs={[
              { field: 'cty', headerName: `cty(${BAT_COL.soc_est_end})`, flex: 1 },
              { field: 'cnt', headerName: '건수', width: 100, filter: 'agNumberColumnFilter' },
              { field: 'avgTtl', headerName: `평균 ${BAT_COL.delta_q_Ah}`, width: 130, filter: 'agNumberColumnFilter' },
            ]}
            defaultColDef={defaultColDef}
          />
        </div>
      </ToolSection>
      <ToolSection title={`히스토그램 — ${BAT_COL.delta_q_Ah} 구간별 건수`}>
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
      <ToolSection title={`롱 포맷 — 피벗용(${BAT_COL.timestamp_s}×측정컬럼×값)`}>
        <div className="ag-theme-quartz" style={{ height: 360, width: '100%' }}>
          <AgGridReact
            rowData={pivotRows}
            columnDefs={[
              { field: 'srvyLabel', headerName: `${BAT_COL.timestamp_s}(일부)`, width: 160, filter: 'agTextColumnFilter' },
              { field: 'item', headerName: BAT_COL.cyc_condition_age_type, width: 120, filter: 'agTextColumnFilter' },
              { field: 'measure', headerName: '측정 컬럼', width: 120, filter: 'agTextColumnFilter' },
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
