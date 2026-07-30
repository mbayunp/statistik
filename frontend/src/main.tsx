import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupAxiosInterceptors } from './utils/auth'

// Inisialisasi Axios Interceptors untuk penanganan otomatis Error 401/403 (Token Kadaluarsa)
setupAxiosInterceptors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
