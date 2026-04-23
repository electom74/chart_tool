/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DX_LICENSE_KEY?: string
  readonly VITE_DEVEXTREME_LICENSE_KEY?: string
  readonly VITE_SYNCFUSION_LICENSE?: string
  readonly VITE_SYNCFUSION_LICENSE_KEY?: string
}

declare const __LICENSE_SYNCFUSION__: string
declare const __LICENSE_DEVEXTREME__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
