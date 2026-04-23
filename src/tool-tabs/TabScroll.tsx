import type { ReactNode } from 'react'

/**
 * DevExtreme TabPanel 안에서 또 다른 DevExtreme ScrollView 를 쓰면 높이가 0으로 잡혀
 * 탭 내용이 보이지 않는 경우가 있어, 네이티브 스크롤 영역으로 둡니다.
 */
export function TabScroll({ children }: { children: ReactNode }) {
  return (
    <div
      className="viz-tab-scroll-root"
      style={{
        width: '100%',
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div className="viz-tab-pad">{children}</div>
    </div>
  )
}
