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
      <LoadPanel visible={loading} showIndicator showPane message="셀 사이클 CSV 불러오는 중…" />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <TabPanel
          width="100%"
          height="100%"
          animationEnabled
          swipeEnabled
          focusStateEnabled
        >
        <Item title="DevExtreme" icon="chart">
          <div className="tool-tab-host">
            <ManufacturingDashboard rows={rows} loadError={error} />
          </div>
        </Item>
        <Item title="Syncfusion" icon="mediumiconslayout">
          <div className="tool-tab-host">
            <SyncfusionJejuTab key={`syncfusion-jeju-${rows.length}`} rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="Ignite UI" icon="rowfield">
          <div className="tool-tab-host">
            <IgniteJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="KendoReact" icon="chart">
          <div className="tool-tab-host">
            <KendoJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="AG Grid Enterprise" icon="fields">
          <div className="tool-tab-host">
            <AgGridJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="Handsontable" icon="pasteplaintext">
          <div className="tool-tab-host">
            <HandsontableJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="Wijmo" icon="chart">
          <div className="tool-tab-host">
            <WijmoJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="Recharts" icon="chart">
          <div className="tool-tab-host">
            <RechartsJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="ECharts" icon="chart">
          <div className="tool-tab-host">
            <EChartsJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        <Item title="Chart.js" icon="chart">
          <div className="tool-tab-host">
            <ChartJsJejuTab rows={rows} loadError={error} loading={loading} />
          </div>
        </Item>
        </TabPanel>
      </div>
    </div>
  )
}
