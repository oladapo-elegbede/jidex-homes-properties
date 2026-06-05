/**
 * Application Entry Point
 * ========================
 * Bootstraps the React application with all necessary providers.
 *
 * The order of imports MATTERS for CSS:
 *   1. Bootstrap CSS first (so we can override it)
 *   2. Our design system second (overrides Bootstrap)
 *
 * Providers wrap the entire app from outside in:
 *   QueryClientProvider → React Query for server state
 *     ↓
 *   BrowserRouter → URL routing
 *     ↓
 *   AuthProvider → Global auth state (user, login, logout)
 *     ↓
 *   App → all our routes and components
 *
 * Toaster sits at the root to show toast notifications anywhere.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// CSS imports (order matters!)
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';


// ── React Query Configuration ────────────────────────────────────────────────
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,       // 5 minutes
            gcTime: 10 * 60 * 1000,          // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});


// ── Toast Notification Configuration ─────────────────────────────────────────
const toasterConfig = {
    position: 'top-right',
    duration: 4000,
    style: {
        background: '#1C1C1E',
        color: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        padding: '0.875rem 1.25rem',
    },
    success: {
        iconTheme: {
            primary: '#16A34A',
            secondary: '#FFFFFF',
        },
    },
    error: {
        iconTheme: {
            primary: '#DC2626',
            secondary: '#FFFFFF',
        },
    },
};


// ── Render The Application ────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                    <Toaster toastOptions={toasterConfig} />
                    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);