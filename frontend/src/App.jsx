/**
 * App Component
 * =============
 * Root component that defines all application routes.
 */

import { Routes, Route, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public Pages
import PropertiesPage from './pages/public/PropertiesPage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';

// Agent Pages
import AgentListingsPage from './pages/agent/AgentListingsPage';
import CreateListingPage from './pages/agent/CreateListingPage';

import { useAuth } from './hooks/useAuth';


// ── Temporary Welcome Page ────────────────────────────────────────────────────
function WelcomePage() {
    const { user, isAuthenticated, isAgent, logout } = useAuth();
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

                    {/* Agents see this button */}
                    {isAgent && (
                        <button
                            onClick={() => navigate('/agent/listings')}
                            className="btn"
                            style={{
                                background: 'var(--color-brand-gold)',
                                color: 'white',
                                border: 'none',
                                padding: 'var(--space-md) var(--space-xl)',
                                borderRadius: 'var(--radius-md)',
                                marginRight: 'var(--space-md)',
                            }}
                        >
                            My Listings
                        </button>
                    )}

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
                            marginRight: 'var(--space-md)',
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="btn"
                        style={{
                            background: 'transparent',
                            color: 'var(--color-brand-navy)',
                            border: '2px solid var(--color-brand-navy)',
                            padding: 'calc(var(--space-md) - 2px) var(--space-xl)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        Create Account
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

            {/* ═══════════════════════════════════════════════════
                PUBLIC ROUTES (with Navbar + Footer)
                ═══════════════════════════════════════════════════ */}
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


            {/* ═══════════════════════════════════════════════════
                AUTH ROUTES (no navbar — centered card)
                ═══════════════════════════════════════════════════ */}
            <Route
                path="/login"
                element={
                    <AuthLayout>
                        <LoginPage />
                    </AuthLayout>
                }
            />
            <Route
                path="/register"
                element={
                    <AuthLayout>
                        <RegisterPage />
                    </AuthLayout>
                }
            />


            {/* ═══════════════════════════════════════════════════
                AGENT ROUTES (protected — agent or admin only)
                ═══════════════════════════════════════════════════ */}
            <Route
                path="/agent/listings"
                element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                        <DashboardLayout>
                            <AgentListingsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/agent/listings/new"
                element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                        <DashboardLayout>
                            <CreateListingPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            {/* Dashboard redirect — go to listings for now */}
            <Route
                path="/agent/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                        <DashboardLayout>
                            <AgentListingsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default App;