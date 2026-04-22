import LoadPanel from 'devextreme-react/load-panel'
import TabPanel, { Item } from 'devextreme-react/tab-panel'
import { useJejuCsv } from './hooks/useJejuCsv'
import ManufacturingDashboard from './ManufacturingDashboard'
import AgGridJejuTab from './tool-tabs/AgGridJejuTab'
import ChartJsJejuTab from './tool-tabs/ChartJsJejuTab'
import EChartsJejuTab from './tool-tabs/EChartsJejuTab'
import HandsontableJejuTab from './tool-tabs/HandsontableJejuTab'
import IgniteJejuTab from './tool-tabs/IgniteJejuTab'
import RechartsJejuTab from './tool-tabs/RechartsJejuTab'
import SyncfusionJejuTab from './tool-tabs/SyncfusionJejuTab'
import WijmoJejuTab from './tool-tabs/WijmoJejuTab'

export default function App() {
  const { rows, loading, error } = useJejuCsv()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoadPanel visible={loading} showIndicator showPane message="제주 밭작물 CSV 불러오는 중…" />
      <TabPanel
        width="100%"
        height="calc(100vh - 8px)"
        animationEnabled
        swipeEnabled
        focusStateEnabled
      >
        <Item title="DevExtreme" icon="chart">
          <ManufacturingDashboard rows={rows} loadError={error} />
        </Item>
        <Item title="Syncfusion" icon="mediumiconslayout">
          <SyncfusionJejuTab rows={rows} />
        </Item>
        <Item title="Ignite UI" icon="rowfield">
          <IgniteJejuTab rows={rows} />
        </Item>
        <Item title="AG Grid Enterprise" icon="fields">
          <AgGridJejuTab rows={rows} />
        </Item>
        <Item title="Handsontable" icon="pasteplaintext">
          <HandsontableJejuTab rows={rows} />
        </Item>
        <Item title="Wijmo" icon="chart">
          <WijmoJejuTab rows={rows} />
        </Item>
        <Item title="Recharts" icon="chart">
          <RechartsJejuTab rows={rows} />
        </Item>
        <Item title="ECharts" icon="chart">
          <EChartsJejuTab rows={rows} />
        </Item>
        <Item title="Chart.js" icon="chart">
          <ChartJsJejuTab rows={rows} />
        </Item>
      </TabPanel>
    </div>
  )
}
