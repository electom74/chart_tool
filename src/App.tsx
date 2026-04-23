import LoadPanel from 'devextreme-react/load-panel'
import TabPanel, { Item } from 'devextreme-react/tab-panel'
import { useJejuCsv } from './hooks/useJejuCsv'
import ManufacturingDashboard from './ManufacturingDashboard'
import AgGridJejuTab from './tool-tabs/AgGridJejuTab'
import ChartJsJejuTab from './tool-tabs/ChartJsJejuTab'
import EChartsJejuTab from './tool-tabs/EChartsJejuTab'
import HandsontableJejuTab from './tool-tabs/HandsontableJejuTab'
import IgniteJejuTab from './tool-tabs/IgniteJejuTab'
import KendoJejuTab from './tool-tabs/KendoJejuTab'
import RechartsJejuTab from './tool-tabs/RechartsJejuTab'
import SyncfusionJejuTab from './tool-tabs/SyncfusionJejuTab'
import WijmoJejuTab from './tool-tabs/WijmoJejuTab'

export default function App() {
  const { rows, loading, error } = useJejuCsv()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoadPanel visible={loading} showIndicator showPane message="제주 밭작물 CSV 불러오는 중…" />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <TabPanel
          width="100%"
          height="100%"
          animationEnabled
          swipeEnabled
          focusStateEnabled
        >
        <Item title="DevExtreme" icon="chart">
          <ManufacturingDashboard rows={rows} loadError={error} />
        </Item>
        <Item title="Syncfusion" icon="mediumiconslayout">
          <SyncfusionJejuTab key={`syncfusion-jeju-${rows.length}`} rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="Ignite UI" icon="rowfield">
          <IgniteJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="KendoReact" icon="chart">
          <KendoJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="AG Grid Enterprise" icon="fields">
          <AgGridJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="Handsontable" icon="pasteplaintext">
          <HandsontableJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="Wijmo" icon="chart">
          <WijmoJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="Recharts" icon="chart">
          <RechartsJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="ECharts" icon="chart">
          <EChartsJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        <Item title="Chart.js" icon="chart">
          <ChartJsJejuTab rows={rows} loadError={error} loading={loading} />
        </Item>
        </TabPanel>
      </div>
    </div>
  )
}
