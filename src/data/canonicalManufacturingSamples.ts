/** Canonical Parquet 샘플(제조 파이프 측정) — WK_DT 중복 행은 첫 행만 유지 */

export type CanonicalManufacturingRow = {
  id: number
  wkDtRaw: string
  wkDt: Date
  wkDtLabel: string
  pipeNo: string
  dvR: number
  daR: number
  avR: number
  aaR: number
  pmR: number
  finJgmt: number
}

const RAW_TSV = `
20220117080000100	PP22041200707	308	7962	364	5975	9270	1
20220117080000400	PP22041200707	319	8351	360	5964	9270	1
20220117080000600	PP22041200707	320	8312	361	5983	9270	1
20220117080000800	PP22041200707	319	8346	359	6049	9275	1
20220117080001000	PP22041200707	320	8323	357	6056	9288	1
20220117080001100	PP22041200707	320	8295	360	6025	9288	1
20220117080001400	PP22041200707	321	8275	361	5992	9300	1
20220117080001600	PP22041200707	308	8294	361	5997	9300	1
20220117080001800	PP22041200707	319	8324	359	6018	9317	1
20220117080002000	PP22041200707	320	8321	360	6046	9320	1
20220117080002300	PP22041200707	320	8309	358	6041	9333	1
20220117080002600	PP22041200707	321	8296	357	6041	9330	1
20220117080002700	PP22041200707	319	8359	365	5948	9328	1
20220117080003000	PP22041200707	308	7934	363	5948	9319	1
20220117080003300	PP22041200707	308	7934	362	6003	9308	1
20220117080003400	PP22041200707	308	7934	359	6038	9300	1
20220117080003800	PP22041200707	308	7934	360	5974	9296	1
20220117080004100	PP22041200707	308	8332	359	6019	9285	1
20220117080004400	PP22041200707	320	8309	362	5973	9279	1
20220117080004600	PP22041200707	320	8302	361	5985	9275	1
20220117080004800	PP22041200707	320	8286	360	6050	9270	1
20220117080005000	PP22041200707	320	8323	363	5948	9276	1
20220117080005400	PP22041200707	320	8305	358	6052	9299	1
20220117080005600	PP22041200707	319	8325	359	6018	9321	1
20220117080005800	PP22041200707	320	8284	360	6022	9270	1
`.trim()

export function parseWkDt(raw: string): Date {
  const y = Number(raw.slice(0, 4))
  const mo = Number(raw.slice(4, 6)) - 1
  const d = Number(raw.slice(6, 8))
  const h = Number(raw.slice(8, 10))
  const mi = Number(raw.slice(10, 12))
  const s = Number(raw.slice(12, 14))
  const ms = raw.length >= 17 ? Number(raw.slice(14, 17)) : 0
  return new Date(y, mo, d, h, mi, s, ms)
}

function formatWkLabel(d: Date): string {
  const pad = (n: number, w: number) => String(n).padStart(w, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)} ${pad(d.getHours(), 2)}:${pad(
    d.getMinutes(),
    2,
  )}:${pad(d.getSeconds(), 2)}.${pad(d.getMilliseconds(), 3)}`
}

export function buildCanonicalManufacturingRows(): CanonicalManufacturingRow[] {
  const seen = new Set<string>()
  const out: CanonicalManufacturingRow[] = []
  let id = 0
  for (const line of RAW_TSV.split(/\r?\n/)) {
    const t = line.trim()
    if (!t) continue
    const p = t.split(/\s+/)
    if (p.length < 8) continue
    const [wkDtRaw, pipeNo, dvS, daS, avS, aaS, pmS, finS] = p
    if (seen.has(wkDtRaw)) continue
    seen.add(wkDtRaw)
    const wkDt = parseWkDt(wkDtRaw)
    id += 1
    out.push({
      id,
      wkDtRaw,
      wkDt,
      wkDtLabel: formatWkLabel(wkDt),
      pipeNo,
      dvR: Number(dvS),
      daR: Number(daS),
      avR: Number(avS),
      aaR: Number(aaS),
      pmR: Number(pmS),
      finJgmt: Number(finS),
    })
  }
  return out
}

export const canonicalManufacturingRows = buildCanonicalManufacturingRows()

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function pmRQualityBuckets(rows: CanonicalManufacturingRow[]) {
  const pm = rows.map((r) => r.pmR)
  const lo = Math.min(...pm)
  const hi = Math.max(...pm)
  const mid = (lo + hi) / 2
  let low = 0,
    midC = 0,
    high = 0
  for (const v of pm) {
    if (v < mid - (hi - lo) * 0.15) low += 1
    else if (v > mid + (hi - lo) * 0.15) high += 1
    else midC += 1
  }
  return [
    { bucket: 'PM_R 하위권', count: low },
    { bucket: 'PM_R 중간', count: midC },
    { bucket: 'PM_R 상위권', count: high },
  ].filter((x) => x.count > 0)
}

export function metricAverages(rows: CanonicalManufacturingRow[]) {
  return [
    { metric: 'DV_R', avg: Math.round(avg(rows.map((r) => r.dvR))) },
    { metric: 'DA_R', avg: Math.round(avg(rows.map((r) => r.daR))) },
    { metric: 'AV_R', avg: Math.round(avg(rows.map((r) => r.avR))) },
    { metric: 'AA_R', avg: Math.round(avg(rows.map((r) => r.aaR))) },
    { metric: 'PM_R', avg: Math.round(avg(rows.map((r) => r.pmR))) },
  ]
}

export function funnelStageCounts(rowCount: number) {
  return [
    { stage: 'Raw 수집', count: Math.max(1, rowCount) },
    { stage: '품질 검증', count: Math.max(1, rowCount - 1) },
    { stage: 'Canonical(Parquet)', count: Math.max(1, rowCount - 2) },
    { stage: 'Task-Ready', count: Math.max(1, rowCount - 3) },
    { stage: 'AI 학습 적재', count: Math.max(1, rowCount - 4) },
  ]
}

export function treemapMetricTotals(rows: CanonicalManufacturingRow[]) {
  const sum = (f: keyof Pick<CanonicalManufacturingRow, 'dvR' | 'daR' | 'avR' | 'aaR' | 'pmR'>) =>
    rows.reduce((a, r) => a + r[f], 0)
  return [
    { name: 'DV_R Σ', value: sum('dvR') },
    { name: 'DA_R Σ', value: sum('daR') },
    { name: 'AV_R Σ', value: sum('avR') },
    { name: 'AA_R Σ', value: sum('aaR') },
    { name: 'PM_R Σ', value: sum('pmR') },
  ]
}

export function pivotLongStore(rows: CanonicalManufacturingRow[]) {
  const measures: Array<'dvR' | 'daR' | 'avR' | 'aaR' | 'pmR'> = ['dvR', 'daR', 'avR', 'aaR', 'pmR']
  const cap: Record<(typeof measures)[number], string> = {
    dvR: 'DV_R',
    daR: 'DA_R',
    avR: 'AV_R',
    aaR: 'AA_R',
    pmR: 'PM_R',
  }
  const flat: {
    wkKey: string
    wkDtLabel: string
    pipeNo: string
    measure: string
    value: number
  }[] = []
  for (const r of rows) {
    for (const m of measures) {
      flat.push({
        wkKey: r.wkDtRaw,
        wkDtLabel: r.wkDtLabel,
        pipeNo: r.pipeNo,
        measure: cap[m],
        value: r[m],
      })
    }
  }
  return flat
}

export function sankeyPipelineLinks(rowCount: number) {
  const w = Math.max(1, Math.round(rowCount / 2))
  const head = Math.max(1, rowCount)
  return [
    { source: 'Plant / VPN', target: 'Ingestion', weight: head },
    { source: 'Ingestion', target: 'Canonical Parquet', weight: w + 2 },
    { source: 'Canonical Parquet', target: 'Task-Ready', weight: w + 1 },
    { source: 'Task-Ready', target: 'AI 학습', weight: w },
  ]
}
