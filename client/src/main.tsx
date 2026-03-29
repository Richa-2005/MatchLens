import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 14px",
            fontSize: "14px",
          },
          success: {
            style: {
              border: "1px solid #86efac",
            },
          },
          error: {
            style: {
              border: "1px solid #fca5a5",
            },
          },
        }}
      />
  </AuthProvider>
  
  </BrowserRouter>

)
