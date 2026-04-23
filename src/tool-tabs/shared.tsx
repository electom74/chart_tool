import type { ReactNode } from 'react'
import type { JejuFieldCropSlim } from '../jeju/jejuFieldCropModel'

export type ToolRowsProps = {
  rows: JejuFieldCropSlim[]
  /** CSV fetch/파싱 실패 시 메시지 */
  loadError?: string | null
  /** 제주 샘플 CSV 로드 중 */
  loading?: boolean
}

export function ToolSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="viz-card" style={{ marginBottom: '0.75rem' }}>
      <h3 className="viz-card-title">{title}</h3>
      {children}
    </section>
  )
}

export function EmptyDataHint() {
  return <p className="gauge-note">표시할 행이 없습니다. CSV 로드가 끝난 뒤 다시 시도하세요.</p>
}

export function CsvLoadErrorPanel({ message }: { message: string }) {
  return (
    <div className="viz-card" style={{ marginBottom: '0.75rem' }}>
      <h3 className="viz-card-title">데이터(CSV)를 불러오지 못했습니다</h3>
      <p style={{ color: '#b91c1c', marginTop: 0 }}>{message}</p>
      <p className="gauge-note" style={{ marginBottom: 0 }}>
        프로젝트 루트에서 <code>npm run extract:jeju-csv</code> 로{' '}
        <code>public/data/jeju-field-crops-sample.csv</code> 를 만든 뒤 개발 서버를 다시 시작하거나 새로고침하세요.
      </p>
    </div>
  )
}

/** CSV 오류·로딩·빈 행일 때 공통 처리 후 본문 렌더 */
export function JejuDataGate({ rows, loadError, loading, children }: ToolRowsProps & { children: ReactNode }) {
  if (loadError) return <CsvLoadErrorPanel message={loadError} />
  if (loading && rows.length === 0) return <p className="gauge-note">제주 샘플 CSV를 불러오는 중…</p>
  if (!rows.length) return <EmptyDataHint />
  return <>{children}</>
}
