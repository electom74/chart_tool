import Papa from 'papaparse'
import { mapRawRowToSlim, type JejuFieldCropSlim } from './jejuFieldCropModel'

const CSV_URL = '/data/jeju-field-crops-sample.csv'

export async function loadJejuFieldCropSample(): Promise<JejuFieldCropSlim[]> {
  const res = await fetch(CSV_URL)
  if (!res.ok) {
    throw new Error(`CSV 로드 실패: ${res.status} ${CSV_URL}`)
  }
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        const rows = results.data.filter(
          (r) => r && Object.keys(r).length > 0 && String(r.srvy_id ?? '').trim() !== '',
        )
        const slim: JejuFieldCropSlim[] = []
        let id = 0
        for (const row of rows) {
          id += 1
          slim.push(mapRawRowToSlim(row, id))
        }
        resolve(slim)
      },
      error: (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))),
    })
  })
}
