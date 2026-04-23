/**
 * Syncfusion: 상용/평가판 모두 https://www.syncfusion.com/account 에서 발급한 키가 필요합니다.
 * 매출·인원 조건을 충족하면 무료 Community License 신청이 가능합니다.
 * https://www.syncfusion.com/products/communitylicense
 *
 * `.env` 에 `VITE_SYNCFUSION_LICENSE`(권장) 또는 `LICENSE_KEY` / `SYNCFUSION_LICENSE` 등을 넣을 수 있습니다.
 * `VITE_` 없는 이름은 `vite.config.ts` 의 `define` 경로로 주입됩니다.
 */
import { registerLicense } from '@syncfusion/ej2-base'
import { getSyncfusionLicenseKey } from './license/envLicense'

const key = getSyncfusionLicenseKey()
if (key) registerLicense(key)
