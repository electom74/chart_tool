/**
 * DevExtreme 상단 평가 배너는 **유효한 JS용 라이선스 키(LCP)**가 있을 때만 사라집니다.
 *
 * 설정 방법(택1):
 * - 프로젝트 루트 `.env` / `.env.local` 에 `VITE_DX_LICENSE_KEY`(또는 `DX_LICENSE_KEY`)에
 *   DevExpress Download Manager에서 복사한 **DevExtreme** 키를 넣고 dev 서버를 다시 실행
 * - 또는 Windows `%AppData%/DevExpress` 등에 DevExpress가 등록한 LCX가 있으면
 *   `vite.config.ts`의 `DevExtremeLicensePlugin`이 빌드 시 주입합니다.
 *
 * https://js.devexpress.com/React/Documentation/Guide/Common/Licensing/
 */
import config from 'devextreme/core/config'
import { getDevExtremeLicenseKey } from './license/envLicense'

const key = getDevExtremeLicenseKey()
if (key) {
  config({ licenseKey: key })
}
