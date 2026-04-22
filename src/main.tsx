import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './dx-license'
import './kendo-license'
import './syncfusion-license'
import 'devextreme/dist/css/dx.material.blue.light.css'
import App from './App.tsx'
import './style.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
