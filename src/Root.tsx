import ThemeProvider from '@/theme/Provider'
import { ComponentType, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

function render(App: ComponentType) {
  root.render(
    <StrictMode>
      <RecoilRoot>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </RecoilRoot>
    </StrictMode>,
  )
}

export default render
