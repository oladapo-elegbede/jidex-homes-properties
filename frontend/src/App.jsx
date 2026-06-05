/**
 * App Component
 * =============
 * Root component that defines all application routes.
 *
 * Routes are organized by access level:
 *   PUBLIC routes    → anyone can visit (home, properties, login, register)
 *   USER routes      → require authentication
 *   AGENT routes     → require agent role
 *   ADMIN routes     → require admin role
 *
 * Each route renders a page component wrapped in an appropriate layout.
 */

import { Routes, Route, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import { useAuth } from './hooks/useAuth';


// ── Temporary Welcome Page ────────────────────────────────────────────────────
// Shows different content based on whether the user is logged in.
// This proves AuthContext is working across components.
function WelcomePage() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully.');
    };

    return (
        <div className="container-custom section-padding text-center">
            <h1 className="text-brand-navy">Jidex Homes & Properties</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Premium Property Marketplace Platform
            </p>

            {isAuthenticated ? (
                // ── Logged In View ────────────────────────────
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <div
                        style={{
                            padding: 'var(--space-xl)',
                            background: 'var(--color-bg-surface)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'inline-block',
                            marginBottom: 'var(--space-lg)',
                        }}
                    >
                        <h3 className="text-brand-gold">
                            👋 Welcome back, {user.full_name}!
                        </h3>
                        <p style={{ marginBottom: 0 }}>
                            Logged in as: <strong>{user.email}</strong>
                            <br />
                            Role: <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>
                        </p>
                    </div>
                    <br />
                    <button
                        className="btn"
                        onClick={handleLogout}
                        style={{
                            background: 'var(--color-error)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'var(--font-weight-semibold)',
                            cursor: 'pointer',
                        }}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                // ── Not Logged In View ────────────────────────
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                </div>
            )}
        </div>
    );
}


// ── App Root ──────────────────────────────────────────────────────────────────
function App() {
    return (
        <Routes>
            {/* Public Welcome */}
            <Route path="/" element={<WelcomePage />} />

            {/* Auth Routes (wrapped in AuthLayout) */}
            <Route
                path="/login"
                element={
                    <AuthLayout>
                        <LoginPage />
                    </AuthLayout>
                }
            />
        </Routes>
    );
}

export default App;
