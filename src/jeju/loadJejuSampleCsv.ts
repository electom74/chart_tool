import Papa from 'papaparse'
import { mapCellCsvRowToSlim } from './cellCsvToSlim'
import { expandJejuFieldCropRowsForDemo, JEJU_DEMO_EXPAND_TARGET_ROWS, type JejuFieldCropSlim } from './jejuFieldCropModel'

/** 배터리 셀 EOC/사이클 CSV (`public/data` 정적 파일) */
const CSV_URL = '/data/cell_eocv2_P001_1_S01_C10.csv'

export async function loadJejuFieldCropSample(): Promise<JejuFieldCropSlim[]> {
  const res = await fetch(CSV_URL)
  if (!res.ok) {
    throw new Error(`CSV 로드 실패: ${res.status} ${CSV_URL}`)
  }
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      delimiter: ';',
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        const rows = results.data.filter(
          (r) => r && Object.keys(r).length > 0 && String(r.timestamp_s ?? r.sd_block_id ?? '').trim() !== '',
        )
        const slim: JejuFieldCropSlim[] = []
        let id = 0
        for (const row of rows) {
          id += 1
          slim.push(mapCellCsvRowToSlim(row, id))
        }
        resolve(
          expandJejuFieldCropRowsForDemo(slim, JEJU_DEMO_EXPAND_TARGET_ROWS, {
            regionalFallbacks: false,
          }),
        )
      },
      error: (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))),
    })
  })
}
