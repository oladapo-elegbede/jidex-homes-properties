/**
 * ProtectedRoute Component
 * =========================
 * Route guard that protects pages requiring authentication and/or specific roles.
 *
 * Usage in App.jsx:
 *
 *   // Just require login
 *   <Route element={
 *     <ProtectedRoute>
 *       <UserDashboard />
 *     </ProtectedRoute>
 *   } />
 *
 *   // Require specific role
 *   <Route element={
 *     <ProtectedRoute allowedRoles={['agent', 'admin']}>
 *       <AgentDashboard />
 *     </ProtectedRoute>
 *   } />
 *
 * Behavior:
 * - If NOT logged in → redirects to /login
 * - If logged in but WRONG role → redirects to / with toast error
 * - If logged in AND correct role → renders the protected children
 *
 * While loading auth state on app startup, shows a spinner.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';


export default function ProtectedRoute({
    children,
    allowedRoles = null,    // null = any authenticated user can access
}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();


    // ── Show toast when access is denied due to wrong role ──
    // useEffect ensures the toast only fires once, not on every render
    useEffect(() => {
        if (
            !isLoading &&
            isAuthenticated &&
            allowedRoles &&
            !allowedRoles.includes(user?.role)
        ) {
            toast.error('You do not have permission to access this page.');
        }
    }, [isLoading, isAuthenticated, user, allowedRoles]);


    // ── Loading State ─────────────────────────────────────────
    // While AuthContext is verifying the stored token on app startup
    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 'var(--space-md)',
                    background: 'var(--color-bg-surface)',
                }}
            >
                <Loader2
                    size={40}
                    color="var(--color-brand-navy)"
                    style={{ animation: 'spin 1s linear infinite' }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Verifying access...
                </p>
                <style>
                    {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                </style>
            </div>
        );
    }


    // ── Not Authenticated → Redirect To Login ─────────────────
    if (!isAuthenticated) {
        // Save the page they were trying to visit so we can return them after login
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }


    // ── Wrong Role → Redirect To Home ─────────────────────────
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }


    // ── Authorized → Render The Protected Page ────────────────
    return children;
}