import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.jsx'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from 'sonner'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="smarterp-theme">
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </Provider>
)
