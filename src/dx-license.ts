import config from 'devextreme/core/config'

const key = import.meta.env.VITE_DX_LICENSE_KEY
if (key) {
  config({ licenseKey: key })
}
