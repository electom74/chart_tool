/**
 * Vite는 기본적으로 `VITE_` 로 시작하는 변수만 `import.meta.env`에 넣습니다.
 * `vite.config.ts`의 `define`으로 주입되는 비-VITE 키 fallback 은 `vite-env.d.ts` 의 상수입니다.
 */
function trim(v: unknown): string {
  if (v == null) return ''
  const s = String(v).trim()
  return s
}

/** Syncfusion `registerLicense` / UI 게이트용 */
export function getSyncfusionLicenseKey(): string {
  const e = import.meta.env
  return (
    trim(e.VITE_SYNCFUSION_LICENSE) ||
    trim(e.VITE_SYNCFUSION_LICENSE_KEY) ||
    trim(typeof __LICENSE_SYNCFUSION__ !== 'undefined' ? __LICENSE_SYNCFUSION__ : '')
  )
}

/** DevExtreme `config({ licenseKey })` 용 */
export function getDevExtremeLicenseKey(): string {
  const e = import.meta.env
  return (
    trim(e.VITE_DX_LICENSE_KEY) ||
    trim(e.VITE_DEVEXTREME_LICENSE_KEY) ||
    trim(typeof __LICENSE_DEVEXTREME__ !== 'undefined' ? __LICENSE_DEVEXTREME__ : '')
  )
}
