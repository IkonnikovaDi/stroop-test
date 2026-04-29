import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StroopProvider } from './context/StroopContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StroopProvider>
      <App />
    </StroopProvider>
  </StrictMode>,
)
