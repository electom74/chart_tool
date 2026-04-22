/** 2023 제주 농업경영정보조사 REFINED 밭작물 CSV — 시각화용 슬림 행 */

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
    { field: 'ttlCltvtnArea', cap: '총재배면적' },
    { field: 'alt', cap: '고도' },
    { field: 'exmnTrgtPlcAreaPy', cap: '조사대지면적(평)' },
    { field: 'sdQty', cap: '파종량' },
    { field: 'salePrdcQty', cap: '판매생산량' },
    { field: 'saleAmt', cap: '판매금액' },
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
    { bucket: '총재배면적 하위', count: low },
    { bucket: '총재배면적 중간', count: midC },
    { bucket: '총재배면적 상위', count: high },
  ].filter((x) => x.count > 0)
}

export function funnelStageCounts(rowCount: number) {
  return [
    { stage: 'Raw 수집', count: rowCount },
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
    { metric: '총재배면적', avg: avg((r) => r.ttlCltvtnArea) },
    { metric: '고도', avg: avg((r) => r.alt) },
    { metric: '조사대지면적', avg: avg((r) => r.exmnTrgtPlcAreaPy) },
    { metric: '파종량', avg: avg((r) => r.sdQty) },
    { metric: '판매금액', avg: avg((r) => r.saleAmt) },
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
  if (other > 0) out.push({ bucket: '기타 작목', count: other })
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
  return [
    { source: '조사 응답', target: 'REFINED 정제', weight: rowCount },
    { source: 'REFINED 정제', target: 'Canonical(Parquet)', weight: w + 2 },
    { source: 'Canonical(Parquet)', target: 'Task-Ready', weight: w + 1 },
    { source: 'Task-Ready', target: 'AI·정책 분석', weight: w },
  ]
}

/** 총재배면적 분포 히스토그램 */
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

/** 누적 총재배면적 (step) */
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

/** 버블: 면적–조사대지–판매금액(크기) */
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

/** 시군구별 건수·평균 면적 (그룹 막대용) */
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

/** TileView용 상위 작목 카드 */
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
        text: `${short}\n면적합 ${Math.round(sum)} · ${n}건`,
      }
    })
}
