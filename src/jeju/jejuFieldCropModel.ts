/** 대시보드 공통 시각화용 슬림 행(농업·셀 CSV 등 매핑 대상) */

import { BAT_COL } from './batteryCsvColumnLabels'

export type JejuFieldCropSlim = {
  id: number
  seq: number
  srvyId: string
  listId: string
  plcAddr: string
  mngmSttsNm: string
  item: string
  cty: string
  eupmyeon: string
  ttlCltvtnArea: number | null
  alt: number | null
  exmnTrgtPlcAreaPy: number | null
  sdQty: number | null
  salePrdcQty: number | null
  saleAmt: number | null
}

export function num(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

export function mapRawRowToSlim(row: Record<string, unknown>, id: number): JejuFieldCropSlim {
  const s = (k: string) => (row[k] != null ? String(row[k]) : '')
  return {
    id,
    seq: id,
    srvyId: s('srvy_id'),
    listId: s('list_id'),
    plcAddr: s('plc_addr'),
    mngmSttsNm: s('mngm_stts_nm'),
    item: s('item'),
    cty: s('cty'),
    eupmyeon: s('fst_strt_eupmyeon'),
    ttlCltvtnArea: num(row.ttl_cltvtn_area),
    alt: num(row.alt),
    exmnTrgtPlcAreaPy: num(row.exmn_trgt_plc_area_py),
    sdQty: num(row.sd_qty),
    salePrdcQty: num(row.sale_prdc_qty),
    saleAmt: num(row.sale_amt),
  }
}

export function pivotLongFromJeju(rows: JejuFieldCropSlim[]) {
  type M = keyof Pick<
    JejuFieldCropSlim,
    'ttlCltvtnArea' | 'alt' | 'exmnTrgtPlcAreaPy' | 'sdQty' | 'salePrdcQty' | 'saleAmt'
  >
  const keys: { field: M; cap: string }[] = [
    { field: 'ttlCltvtnArea', cap: BAT_COL.delta_q_Ah },
    { field: 'alt', cap: BAT_COL.t_end_degC },
    { field: 'exmnTrgtPlcAreaPy', cap: BAT_COL.cyc_duration_s },
    { field: 'sdQty', cap: BAT_COL.soh_cap_soc_est_start },
    { field: 'salePrdcQty', cap: BAT_COL.salePrdcQty_primary },
    { field: 'saleAmt', cap: BAT_COL.saleAmt_primary },
  ]
  const flat: {
    srvyKey: string
    srvyLabel: string
    item: string
    measure: string
    value: number
  }[] = []
  for (const r of rows) {
    const srvyLabel = `${r.srvyId}`.slice(0, 18)
    for (const { field, cap } of keys) {
      const v = r[field]
      if (v == null || !Number.isFinite(v)) continue
      flat.push({
        srvyKey: r.srvyId,
        srvyLabel,
        item: r.item || '(미상)',
        measure: cap,
        value: v,
      })
    }
  }
  return flat
}

export function ttlAreaBuckets(rows: JejuFieldCropSlim[]) {
  const vals = rows.map((r) => r.ttlCltvtnArea).filter((v): v is number => v != null && Number.isFinite(v))
  if (!vals.length) return [{ bucket: '데이터 없음', count: 1 }]
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  const mid = (lo + hi) / 2
  const span = hi - lo || 1
  let low = 0,
    midC = 0,
    high = 0
  for (const v of vals) {
    if (v < mid - span * 0.15) low += 1
    else if (v > mid + span * 0.15) high += 1
    else midC += 1
  }
  return [
    { bucket: `${BAT_COL.delta_q_Ah} 하위`, count: low },
    { bucket: `${BAT_COL.delta_q_Ah} 중간`, count: midC },
    { bucket: `${BAT_COL.delta_q_Ah} 상위`, count: high },
  ].filter((x) => x.count > 0)
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

export function treemapItemSumTtl(rows: JejuFieldCropSlim[]) {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = r.item?.trim() || '(미상)'
    const v = r.ttlCltvtnArea
    if (v == null) continue
    map.set(k, (map.get(k) ?? 0) + v)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

export function metricAveragesJeju(rows: JejuFieldCropSlim[]) {
  const avg = (pick: (r: JejuFieldCropSlim) => number | null) => {
    const xs = rows.map(pick).filter((v): v is number => v != null && Number.isFinite(v))
    if (!xs.length) return 0
    return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
  }
  return [
    { metric: BAT_COL.delta_q_Ah, avg: avg((r) => r.ttlCltvtnArea) },
    { metric: BAT_COL.t_end_degC, avg: avg((r) => r.alt) },
    { metric: BAT_COL.cyc_duration_s, avg: avg((r) => r.exmnTrgtPlcAreaPy) },
    { metric: BAT_COL.soh_cap_soc_est_start, avg: avg((r) => r.sdQty) },
    { metric: BAT_COL.saleAmt_primary, avg: avg((r) => r.saleAmt) },
  ]
}

export function pieItemTopN(rows: JejuFieldCropSlim[], top = 10) {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = r.item?.trim() || '(미상)'
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
  const head = sorted.slice(0, top)
  const tail = sorted.slice(top)
  const other = tail.reduce((a, [, c]) => a + c, 0)
  const out = head.map(([bucket, count]) => ({ bucket, count }))
  if (other > 0) out.push({ bucket: `기타 (${BAT_COL.cyc_condition_age_type})`, count: other })
  return out
}

export function aggregateAvgTtlByItem(rows: JejuFieldCropSlim[]) {
  const map = new Map<string, { sum: number; n: number }>()
  for (const r of rows) {
    const k = r.item?.trim() || '(미상)'
    const v = r.ttlCltvtnArea
    if (v == null) continue
    const cur = map.get(k) ?? { sum: 0, n: 0 }
    cur.sum += v
    cur.n += 1
    map.set(k, cur)
  }
  return [...map.entries()]
    .map(([item, { sum, n }]) => ({
      item,
      avgTtl: Math.round((sum / n) * 10) / 10,
    }))
    .sort((a, b) => b.avgTtl - a.avgTtl)
    .slice(0, 20)
}

export function sankeyPipelineLinks(rowCount: number) {
  const w = Math.max(1, Math.round(rowCount / 2))
  const head = Math.max(1, rowCount)
  return [
    { source: 'cell_eocv2 행', target: 'REFINED 정제', weight: head },
    { source: 'REFINED 정제', target: 'Canonical(Parquet)', weight: w + 2 },
    { source: 'Canonical(Parquet)', target: 'Task-Ready', weight: w + 1 },
    { source: 'Task-Ready', target: 'AI·정책 분석', weight: w },
  ]
}

/** `ttlCltvtnArea`(배터리 CSV에서는 주로 `delta_q_Ah` 매핑) 분포 히스토그램 */
export function ttlHistogramBins(rows: JejuFieldCropSlim[], binCount = 12) {
  const vals = rows.map((r) => r.ttlCltvtnArea).filter((v): v is number => v != null && Number.isFinite(v))
  if (!vals.length) return []
  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const w = (mx - mn) / binCount || 1
  const bins: { bin: string; count: number }[] = []
  for (let i = 0; i < binCount; i++) {
    const lo = mn + w * i
    const hi = mn + w * (i + 1)
    bins.push({
      bin: `${Math.round(lo * 10) / 10}~${Math.round(hi * 10) / 10}`,
      count: 0,
    })
  }
  for (const v of vals) {
    let i = Math.floor((v - mn) / w)
    if (i >= binCount) i = binCount - 1
    if (i < 0) i = 0
    bins[i].count += 1
  }
  return bins
}

/** 누적 `ttlCltvtnArea` / `delta_q_Ah` 표시값 (step) */
export function cumulativeTtlSeries(rows: JejuFieldCropSlim[]) {
  let s = 0
  const xs = rows
    .filter((r) => r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea))
    .sort((a, b) => a.seq - b.seq)
  return xs.map((r) => {
    s += r.ttlCltvtnArea as number
    return { seq: r.seq, cumTtl: Math.round(s * 10) / 10 }
  })
}

/** 버블: `delta_q_Ah`–`cyc_duration_s`–`saleAmt`(Wh 파생, 크기) */
export function bubblePlotRows(rows: JejuFieldCropSlim[], limit = 500) {
  return rows
    .filter(
      (r) =>
        r.ttlCltvtnArea != null &&
        r.exmnTrgtPlcAreaPy != null &&
        r.saleAmt != null &&
        Number.isFinite(r.ttlCltvtnArea) &&
        Number.isFinite(r.exmnTrgtPlcAreaPy) &&
        Number.isFinite(r.saleAmt) &&
        r.saleAmt > 0,
    )
    .slice(0, limit)
    .map((r) => ({
      bx: r.ttlCltvtnArea as number,
      by: r.exmnTrgtPlcAreaPy as number,
      bsize: Math.max(4, Math.min(44, Math.sqrt(r.saleAmt as number) / 100)),
    }))
}

/** `cty`(soc_est_end 구간)별 건수·평균 `delta_q_Ah` 표시값 */
export function aggregateCtyAvgTtl(rows: JejuFieldCropSlim[], limit = 14) {
  const m = new Map<string, { sum: number; n: number }>()
  for (const r of rows) {
    const c = r.cty?.trim() || '(미상)'
    const v = r.ttlCltvtnArea
    if (v == null) continue
    const cur = m.get(c) ?? { sum: 0, n: 0 }
    cur.sum += v
    cur.n += 1
    m.set(c, cur)
  }
  return [...m.entries()]
    .map(([cty, { sum, n }]) => ({
      cty,
      avgTtl: Math.round((sum / n) * 10) / 10,
      cnt: n,
    }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, limit)
}

/** TileView용 상위 `cyc_condition+age_type` 카드 */
export function tileViewTopCrops(rows: JejuFieldCropSlim[], limit = 16) {
  const m = new Map<string, { sum: number; n: number }>()
  for (const r of rows) {
    const k = r.item?.trim() || '(미상)'
    const v = r.ttlCltvtnArea
    if (v == null) continue
    const cur = m.get(k) ?? { sum: 0, n: 0 }
    cur.sum += v
    cur.n += 1
    m.set(k, cur)
  }
  return [...m.entries()]
    .sort((a, b) => b[1].sum - a[1].sum)
    .slice(0, limit)
    .map(([item, { sum, n }]) => {
      const short = item.length > 14 ? `${item.slice(0, 13)}…` : item
      return {
        text: `${short}\n${BAT_COL.delta_q_Ah} 합 ${Math.round(sum)} · ${n}건`,
      }
    })
}

/** CSV가 짧을 때 시각화용으로 채울 목표 행 수(이상이면 확장하지 않음) */
export const JEJU_DEMO_EXPAND_TARGET_ROWS = 1900

export type ExpandFieldCropDemoOptions = {
  /** false면 제주 작목/시군 보조 라벨을 쓰지 않음(비농업 CSV 등) */
  regionalFallbacks?: boolean
}

const FALLBACK_JEJU_ITEMS = [
  '감귤',
  '배추',
  '무',
  '당근',
  '양파',
  '마늘',
  '감자',
  '고구마',
  '옥수수',
  '보리',
  '메밀',
  '상추',
  '브로콜리',
  '대파',
  '쪽파',
  '딸기',
]

const FALLBACK_JEJU_CTY = ['제주시', '서귀포시']

function u01(seed: number): number {
  let x = Math.imul(seed ^ 0x6a09e667, 0x9e3779b1)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x >>> 0) & 0xffffffff) / 0x100000000
}

function jitterFinite(v: number, seed: number, relSpread: number): number {
  const t = (u01(seed) * 2 - 1) * relSpread
  const nv = v * (1 + t)
  return Math.round(nv * 1000) / 1000
}

function jitterNullable(v: number | null, seed: number, relSpread: number): number | null {
  if (v == null || !Number.isFinite(v)) return v
  return jitterFinite(v, seed, relSpread)
}

const FALLBACK_CELL_ITEMS = ['Cyc0/Age1', 'Cyc2/Age1', 'Cyc0/Age0', 'Cyc2/Age0', 'Cyc0/Age1·복제']
const FALLBACK_CELL_CTY = ['SOC0', 'SOC25', 'SOC50', 'SOC75']

/**
 * 원본 행이 `minRows` 미만이면, 총재배면적이 있는 행을 시드로 순환·변주해 데모 행을 늘립니다.
 * 이미 충분히 긴 CSV는 그대로 둡니다.
 */
export function expandJejuFieldCropRowsForDemo(
  rows: JejuFieldCropSlim[],
  minRows = JEJU_DEMO_EXPAND_TARGET_ROWS,
  opts?: ExpandFieldCropDemoOptions,
): JejuFieldCropSlim[] {
  if (rows.length >= minRows) return rows

  const regional = opts?.regionalFallbacks !== false

  const seeds = rows.filter((r) => r.ttlCltvtnArea != null && Number.isFinite(r.ttlCltvtnArea))
  if (!seeds.length) return rows

  const itemSet = new Set<string>()
  const ctySet = new Set<string>()
  let mngmFallback = ''
  for (const r of rows) {
    const it = r.item?.trim()
    if (it) itemSet.add(it)
    const c = r.cty?.trim()
    if (c) ctySet.add(c)
    if (!mngmFallback && r.mngmSttsNm?.trim()) mngmFallback = r.mngmSttsNm.trim()
  }

  const itemsPool = [...itemSet]
  if (regional) {
    if (itemsPool.length < 12) {
      for (const x of FALLBACK_JEJU_ITEMS) {
        if (itemsPool.length >= 14) break
        if (!itemSet.has(x)) itemsPool.push(x)
      }
    }
  } else if (itemsPool.length < 8) {
    for (const x of FALLBACK_CELL_ITEMS) {
      if (itemsPool.length >= 12) break
      if (!itemSet.has(x)) itemsPool.push(x)
    }
  }
  if (!itemsPool.length) itemsPool.push(regional ? '밭작물' : '셀_사이클')

  const ctyPool = [...ctySet]
  if (regional) {
    if (ctyPool.length < 2) {
      for (const x of FALLBACK_JEJU_CTY) {
        if (!ctySet.has(x)) ctyPool.push(x)
      }
    }
  } else if (ctyPool.length < 2) {
    for (const x of FALLBACK_CELL_CTY) {
      if (!ctySet.has(x)) ctyPool.push(x)
    }
  }
  if (!ctyPool.length) ctyPool.push(regional ? '제주시' : 'SOC0', regional ? '서귀포시' : 'SOC50')

  const out: JejuFieldCropSlim[] = rows.slice()

  for (let k = rows.length; k < minRows; k += 1) {
    const base = seeds[k % seeds.length]
    const seed = Math.imul(k, 0x9e3779b1)
    const item = itemsPool[(k * 17) % itemsPool.length] || '(미상)'
    const cty = ctyPool[(k * 5) % ctyPool.length] || '(미상)'

    const ttl = jitterFinite(base.ttlCltvtnArea as number, seed, 0.22)
    const altJ = jitterNullable(base.alt, seed + 1, 0.12)
    const pyJ = jitterNullable(base.exmnTrgtPlcAreaPy, seed + 2, 0.14)
    const sdJ = jitterNullable(base.sdQty, seed + 3, 0.16)
    const spqJ = jitterNullable(base.salePrdcQty, seed + 4, 0.15)
    const saleBaseOk = base.saleAmt != null && base.saleAmt > 0 && Number.isFinite(base.saleAmt)
    const saleJ = saleBaseOk
      ? jitterFinite(base.saleAmt as number, seed + 5, 0.18)
      : Math.round(30000 + u01(seed + 6) * 280000)

    const altOut = altJ != null ? Math.max(0, altJ) : null
    const pyOut = pyJ != null ? Math.max(0, pyJ) : null
    const sdOut = sdJ != null ? Math.max(0, sdJ) : null
    const spqOut = spqJ != null ? Math.max(0, spqJ) : null
    const saleOut = Math.max(1, Math.round(saleJ))

    out.push({
      id: k + 1,
      seq: k + 1,
      srvyId: `syn-${String(k + 1).padStart(6, '0')}`,
      listId: base.listId ? `${base.listId}-s${k}` : `L${k}`,
      plcAddr: base.plcAddr ? `${base.plcAddr.slice(0, 40)} · 확장` : regional ? `제주 데모 주소 ${k + 1}` : `데모 위치 ${k + 1}`,
      mngmSttsNm: mngmFallback || base.mngmSttsNm || (regional ? '경영 중' : '측정'),
      item,
      cty,
      eupmyeon: base.eupmyeon || (regional ? '읍면동' : '세그'),
      ttlCltvtnArea: ttl,
      alt: altOut,
      exmnTrgtPlcAreaPy: pyOut,
      sdQty: sdOut,
      salePrdcQty: spqOut,
      saleAmt: saleOut,
    })
  }

  return out
}
