import type { ReactNode } from 'react'
import type { JejuFieldCropSlim } from '../jeju/jejuFieldCropModel'

export type ToolRowsProps = { rows: JejuFieldCropSlim[] }

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
