import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AuthProvider>
      <App />
  </AuthProvider>
  </BrowserRouter>

)
