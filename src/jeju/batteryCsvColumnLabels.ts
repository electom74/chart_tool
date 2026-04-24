/**
 * `public/data/cell_eocv2_*.csv` 원본 컬럼명.
 * 시각화용 `JejuFieldCropSlim` 매핑은 `cellCsvToSlim.ts` 참고.
 */
export const BAT_COL = {
  seq: 'seq',
  timestamp_s: 'timestamp_s',
  sd_block_id: 'sd_block_id',
  cyc_condition: 'cyc_condition',
  cyc_charged: 'cyc_charged',
  /** listId 슬림 필드에 대응 */
  cyc_condition_cyc_charged: 'cyc_condition+cyc_charged',
  /** item 슬림 필드에 대응 */
  cyc_condition_age_type: 'cyc_condition+age_type',
  /** cty 슬림(구간 라벨) — 원값은 soc_est_end */
  soc_est_end: 'soc_est_end',
  age_profile: 'age_profile',
  /** ttlCltvtnArea — delta_q_Ah 우선, 없으면 total_q_chg_sum_Ah·delta_q_chg_Ah 기반 파생 스케일 */
  delta_q_Ah: 'delta_q_Ah',
  total_q_chg_sum_Ah: 'total_q_chg_sum_Ah',
  t_end_degC: 't_end_degC',
  cyc_duration_s: 'cyc_duration_s',
  soh_cap: 'soh_cap',
  soc_est_start: 'soc_est_start',
  /** sdQty: soh_cap ?? soc_est_start */
  soh_cap_soc_est_start: 'soh_cap|soc_est_start',
  delta_q_chg_Ah: 'delta_q_chg_Ah',
  total_q_chg_cyc_OT_Ah: 'total_q_chg_cyc_OT_Ah',
  /** salePrdcQty: delta_q_chg_Ah ?? total_q_chg_cyc_OT_Ah */
  salePrdcQty_primary: 'delta_q_chg_Ah',
  total_e_chg_sum_Wh: 'total_e_chg_sum_Wh',
  total_e_dischg_sum_Wh: 'total_e_dischg_sum_Wh',
  /** saleAmt: total_e_chg_sum_Wh·total_e_dischg_sum_Wh 기반 파생 스케일 */
  saleAmt_primary: 'total_e_chg_sum_Wh',
} as const
