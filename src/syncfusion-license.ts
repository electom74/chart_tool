/**
 * Syncfusion: 상용/평가판 모두 https://www.syncfusion.com/account 에서 발급한 키가 필요합니다.
 * 매출·인원 조건을 충족하면 무료 Community License 신청이 가능합니다.
 * https://www.syncfusion.com/products/communitylicense
 *
 * `.env` 에 `VITE_SYNCFUSION_LICENSE` 를 설정한 뒤 `registerLicense` 가 호출됩니다.
 */
import { registerLicense } from '@syncfusion/ej2-base'

const key = (import.meta.env.VITE_SYNCFUSION_LICENSE as string | undefined)?.trim()
if (key) registerLicense(key)
