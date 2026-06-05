/**
 * App Component
 * =============
 * Root component that defines all application routes.
 */

import { Routes, Route, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';
import LoginPage from './pages/auth/LoginPage';
import PropertiesPage from './pages/public/PropertiesPage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import { useAuth } from './hooks/useAuth';


// ── Temporary Welcome Page ────────────────────────────────────────────────────
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
                        onClick={() => navigate('/properties')}
                        className="btn btn-primary"
                        style={{ marginRight: 'var(--space-md)' }}
                    >
                        Browse Properties
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn"
                        style={{
                            background: 'var(--color-error)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <button
                        onClick={() => navigate('/properties')}
                        className="btn btn-primary"
                        style={{ marginRight: 'var(--space-md)' }}
                    >
                        Browse Properties
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn"
                        style={{
                            background: 'var(--color-brand-gold)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-md) var(--space-xl)',
                            borderRadius: 'var(--radius-md)',
                        }}
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
            {/* ─── Public Routes (with Navbar + Footer) ───── */}
            <Route
                path="/"
                element={
                    <PublicLayout>
                        <WelcomePage />
                    </PublicLayout>
                }
            />
            <Route
                path="/properties"
                element={
                    <PublicLayout>
                        <PropertiesPage />
                    </PublicLayout>
                }
            />
            <Route
                path="/properties/:id"
                element={
                    <PublicLayout>
                        <PropertyDetailPage />
                    </PublicLayout>
                }
            />

            {/* ─── Auth Routes (no navbar — centered card) ─── */}
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
