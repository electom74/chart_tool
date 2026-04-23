import { useMemo, useRef } from 'react'
import type { ChartType, ColDef, GridReadyEvent } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { aggregateCtyAvgTtl, type JejuFieldCropSlim } from '../jeju/jejuFieldCropModel'
import { ToolSection } from './shared'

type ChartCard = { title: string; chartType: ChartType }

const CHART_SEQUENCE: ChartCard[] = [
  { title: '1. Grouped column', chartType: 'groupedColumn' },
  { title: '2. Stacked column', chartType: 'stackedColumn' },
  { title: '3. Line', chartType: 'line' },
  { title: '4. Area', chartType: 'area' },
  { title: '5. Pie', chartType: 'pie' },
  { title: '6. Donut', chartType: 'donut' },
  { title: '7. Grouped bar', chartType: 'groupedBar' },
  { title: '8. Stacked bar', chartType: 'stackedBar' },
  { title: '9. Normalized column', chartType: 'normalizedColumn' },
  { title: '10. Column + line combo', chartType: 'columnLineCombo' },
]

function IntegratedChartCard({
  title,
  chartType,
  rowData,
  columnDefs,
}: {
  title: string
  chartType: ChartType
  rowData: { category: string; v1: number; v2: number }[]
  columnDefs: ColDef[]
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const created = useRef(false)

  const onReady = (e: GridReadyEvent) => {
    if (created.current || !hostRef.current || rowData.length === 0) return
    created.current = true
    const { api } = e
    const last = rowData.length - 1
    queueMicrotask(() => {
      api.createRangeChart({
        chartType,
        chartContainer: hostRef.current!,
        cellRange: {
          rowStartIndex: 0,
          rowEndIndex: last,
          columns: ['category', 'v1', 'v2'],
        },
        suppressChartRanges: true,
        unlinkChart: true,
      })
    })
  }

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', padding: '6px 8px' }}>{title}</div>
      <div className="ag-theme-quartz" style={{ height: 96, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: false, filter: false, resizable: false }}
          enableCharts
          cellSelection
          suppressCellFocus
          onGridReady={onReady}
        />
      </div>
      <div ref={hostRef} style={{ minHeight: 200, width: '100%' }} />
    </div>
  )
}

export function AgGridJejuIntegratedCharts({ rows }: { rows: JejuFieldCropSlim[] }) {
  const rowData = useMemo(
    () =>
      aggregateCtyAvgTtl(rows, 10).map((c) => ({
        category: c.cty.length > 8 ? `${c.cty.slice(0, 7)}…` : c.cty,
        v1: c.cnt,
        v2: c.avgTtl,
      })),
    [rows],
  )

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'category', headerName: '시군', chartDataType: 'category', flex: 1 },
      { field: 'v1', headerName: '건수', chartDataType: 'series', width: 90 },
      { field: 'v2', headerName: '평균면적', chartDataType: 'series', width: 100 },
    ],
    [],
  )

  return (
    <ToolSection title="AG Grid Enterprise — Integrated Charts(AG Charts, 10종)">
      <p className="gauge-note" style={{ marginTop: 0 }}>
        <code>AllEnterpriseModule.with(AgChartsCommunityModule)</code> 등록 후, 각 카드가 작은 그리드 범위에 대해{' '}
        <code>api.createRangeChart</code>로 <strong>AG Grid 통합 차트</strong>를 생성합니다. 동일 시군 집계 데이터를
        활용합니다.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 10,
        }}
      >
        {CHART_SEQUENCE.map((c) => (
          <IntegratedChartCard
            key={c.chartType}
            title={c.title}
            chartType={c.chartType}
            rowData={rowData}
            columnDefs={columnDefs}
          />
        ))}
      </div>
    </ToolSection>
  )
}
