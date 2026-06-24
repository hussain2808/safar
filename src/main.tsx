import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initAuth } from '@/store/auth'
import App from './App.tsx'

initAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
