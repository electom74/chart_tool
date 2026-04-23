import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'
import HotTable from '@handsontable/react'
import {
  aggregateAvgTtlByItem,
  aggregateCtyAvgTtl,
  cumulativeTtlSeries,
  pieItemTopN,
  ttlHistogramBins,
} from '../jeju/jejuFieldCropModel'
import { JejuDataGate, ToolSection, type ToolRowsProps } from './shared'
import { TabScroll } from './TabScroll'

registerAllModules()

const hotLicenseKey = 'non-commercial-and-evaluation'

export default function HandsontableJejuTab(props: ToolRowsProps) {
  const { rows } = props
  const agg = aggregateAvgTtlByItem(rows).slice(0, 20)
  const cum = cumulativeTtlSeries(rows).slice(0, 100)
  const hist = ttlHistogramBins(rows, 10)
  const cty = aggregateCtyAvgTtl(rows, 10)
  const pie = pieItemTopN(rows, 8)

  return (
    <JejuDataGate {...props}>
    <TabScroll>
      <ToolSection title="Handsontable — 원본(객체 배열)">
        <div className="hot ht-theme-main" style={{ width: '100%', minHeight: 380 }}>
          <HotTable
            themeName="main"
            licenseKey={hotLicenseKey}
            data={rows.slice(0, 80)}
            colHeaders={['seq', '작목', '시군', '총재배면적', '판매금액', '주소']}
            columns={[
              { data: 'seq', type: 'numeric', width: 64 },
              { data: 'item', width: 120 },
              { data: 'cty', width: 100 },
              { data: 'ttlCltvtnArea', type: 'numeric', numericFormat: { pattern: '0,0.0' } },
              { data: 'saleAmt', type: 'numeric', numericFormat: { pattern: '0,0' } },
              { data: 'plcAddr', width: 240 },
            ]}
            rowHeaders
            width="100%"
            height={380}
            stretchH="all"
            columnSorting
          />
        </div>
      </ToolSection>

      <ToolSection title="Handsontable — 누적(2차원 배열 + data 인덱스)">
        <div className="hot ht-theme-main" style={{ width: '100%', minHeight: 280 }}>
          <HotTable
            themeName="main"
            licenseKey={hotLicenseKey}
            data={cum.map((r) => [r.seq, r.cumTtl])}
            colHeaders={['seq', '누적 면적']}
            columns={[
              { data: 0, type: 'numeric', readOnly: true },
              { data: 1, type: 'numeric', numericFormat: { pattern: '0,0.0' }, readOnly: true },
            ]}
            rowHeaders
            width="100%"
            height={280}
          />
        </div>
      </ToolSection>

      <ToolSection title="Handsontable — 히스토그램(구간·건수)">
        <div className="hot ht-theme-main" style={{ width: '100%', minHeight: 260 }}>
          <HotTable
            themeName="main"
            licenseKey={hotLicenseKey}
            data={hist.map((h) => [h.bin, h.count])}
            colHeaders={['구간', '건수']}
            columns={[
              { data: 0, readOnly: true, width: 220 },
              { data: 1, type: 'numeric', readOnly: true },
            ]}
            rowHeaders
            width="100%"
            height={260}
          />
        </div>
      </ToolSection>

      <ToolSection title="Handsontable — 시군(건수·평균면적)">
        <div className="hot ht-theme-main" style={{ width: '100%', minHeight: 280 }}>
          <HotTable
            themeName="main"
            licenseKey={hotLicenseKey}
            data={cty.map((c) => [c.cty, c.cnt, c.avgTtl])}
            colHeaders={['시군', '건수', '평균 총재배면적']}
            columns={[
              { data: 0, readOnly: true, width: 120 },
              { data: 1, type: 'numeric', readOnly: true },
              { data: 2, type: 'numeric', numericFormat: { pattern: '0,0.0' }, readOnly: true },
            ]}
            rowHeaders
            width="100%"
            height={280}
          />
        </div>
      </ToolSection>

      <ToolSection title="Handsontable — 작목별 평균면적">
        <div className="hot ht-theme-main" style={{ width: '100%', minHeight: 300 }}>
          <HotTable
            themeName="main"
            licenseKey={hotLicenseKey}
            data={agg.map((r) => [r.item, r.avgTtl])}
            colHeaders={['작목', '평균 총재배면적']}
            columns={[
              { data: 0, readOnly: true, width: 180 },
              { data: 1, type: 'numeric', numericFormat: { pattern: '0,0.0' }, readOnly: true },
            ]}
            rowHeaders
            width="100%"
            height={300}
          />
        </div>
      </ToolSection>

      <ToolSection title="Handsontable — 작목 건수(파이용 데이터)">
        <div className="hot ht-theme-main" style={{ width: '100%', minHeight: 280 }}>
          <HotTable
            themeName="main"
            licenseKey={hotLicenseKey}
            data={pie.map((p) => [p.bucket, p.count])}
            colHeaders={['작목', '건수']}
            columns={[
              { data: 0, readOnly: true, width: 200 },
              { data: 1, type: 'numeric', readOnly: true },
            ]}
            rowHeaders
            width="100%"
            height={280}
          />
        </div>
      </ToolSection>
    </TabScroll>
    </JejuDataGate>
  )
}
