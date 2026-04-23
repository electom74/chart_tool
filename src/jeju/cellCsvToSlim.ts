import { num, type JejuFieldCropSlim } from './jejuFieldCropModel'

/**
 * `cell_eocv2_*.csv`(세미콜론 구분) 한 행을 시각화용 `JejuFieldCropSlim` 형태로 매핑합니다.
 * 필드는 배터리 사이클(전압·SOC·Ah·Wh 등)을 면적·판매 등 UI 축에 대응시킨 데모 매핑입니다.
 */
export function mapCellCsvRowToSlim(row: Record<string, unknown>, id: number): JejuFieldCropSlim {
  const s = (k: string) => (row[k] != null && row[k] !== undefined ? String(row[k]).trim() : '')

  const dq = num(row.delta_q_Ah)
  const dqChg = num(row.delta_q_chg_Ah)
  const qSum = num(row.total_q_chg_sum_Ah)
  const ttlRaw =
    dq != null && Number.isFinite(dq)
      ? Math.abs(dq) * 80
      : qSum != null && Number.isFinite(qSum)
        ? Math.abs(qSum) * 25
        : dqChg != null && Number.isFinite(dqChg)
          ? Math.abs(dqChg) * 120
          : 0.01
  const ttlCltvtnArea = ttlRaw > 0 ? Math.round(ttlRaw * 1000) / 1000 : 0.01

  const socEnd = num(row.soc_est_end)
  const socBand = socEnd != null && Number.isFinite(socEnd) ? Math.round(socEnd / 12.5) * 12 : 0

  const eChg = num(row.total_e_chg_sum_Wh)
  const eDis = num(row.total_e_dischg_sum_Wh)
  const saleAmtRaw = eChg != null && Math.abs(eChg) > 1e-6 ? Math.abs(eChg) * 100 : eDis != null ? Math.abs(eDis) * 100 : 1000
  const saleAmt = Math.max(1, Math.round(saleAmtRaw))

  const ts = s('timestamp_s') || String(id)
  const block = s('sd_block_id') || 'blk'

  return {
    id,
    seq: id,
    srvyId: `cell-${ts}`.slice(0, 48),
    listId: `${s('cyc_condition')}_${s('cyc_charged')}`.slice(0, 32) || `cyc-${id}`,
    plcAddr: `sd_block ${block}`.slice(0, 80),
    mngmSttsNm: s('cyc_charged') === '1' ? '충전' : s('cyc_charged') === '0' ? '대기' : s('cyc_charged'),
    item: `Cyc${s('cyc_condition')}_Age${s('age_type')}`.slice(0, 48),
    cty: `SOC${socBand}`,
    eupmyeon: s('age_profile') || s('cyc_condition'),
    ttlCltvtnArea,
    alt: num(row.t_end_degC),
    exmnTrgtPlcAreaPy: num(row.cyc_duration_s),
    sdQty: num(row.soh_cap) ?? num(row.soc_est_start),
    salePrdcQty: dqChg ?? num(row.total_q_chg_cyc_OT_Ah),
    saleAmt,
  }
}
