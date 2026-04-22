import ScrollView from 'devextreme-react/scroll-view'
import type { ReactNode } from 'react'

/** 탭 내부를 세로 스크롤해 여러 차트·그리드를 DevExtreme 탭과 유사하게 배치 */
export function TabScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView width="100%" height="calc(100vh - 88px)">
      <div className="viz-tab-pad">{children}</div>
    </ScrollView>
  )
}
