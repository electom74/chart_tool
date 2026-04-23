import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const require = createRequire(import.meta.url)
const { DevExtremeLicensePlugin } = require('devextreme/license/devextreme-license-plugin.js')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** `VITE_` 없이 `.env` 에만 넣은 키도 빌드/개발 서버에서 쓸 수 있게 주입 */
  const syncfusionLicense = (
    env.VITE_SYNCFUSION_LICENSE ||
    env.VITE_SYNCFUSION_LICENSE_KEY ||
    env.SYNCFUSION_LICENSE ||
    env.LICENSE_KEY ||
    ''
  ).trim()
  const devExtremeLicense = (
    env.VITE_DX_LICENSE_KEY ||
    env.VITE_DEVEXTREME_LICENSE_KEY ||
    env.DX_LICENSE_KEY ||
    env.DEVEXTREME_LICENSE_KEY ||
    ''
  ).trim()

  return {
    /** DevExpress PC 등록(LCX) 또는 아래 `define` 키로 런타임 `config({ licenseKey })`와 함께 평가 배너 제거 */
    plugins: [DevExtremeLicensePlugin.vite(), react()],
    server: {
      open: true,
    },
    define: {
      __LICENSE_SYNCFUSION__: JSON.stringify(syncfusionLicense),
      __LICENSE_DEVEXTREME__: JSON.stringify(devExtremeLicense),
    },
  }
})
