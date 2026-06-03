import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './style/index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
    <ThemeProvider>
    <AuthProvider>
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>
    </AuthProvider>
    </ThemeProvider>,
)
