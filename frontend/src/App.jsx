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
 *
 * For now, we have a single "Welcome" route to verify the app works.
 * We'll expand this as we build each page.
 */

import { Routes, Route } from 'react-router-dom';


// ── Temporary Welcome Page ────────────────────────────────────────────────────
// This will be replaced by real pages soon.
// For now, it confirms that React + Router + Design System all work together.
function WelcomePage() {
    return (
        <div className="container-custom section-padding text-center">
            <h1 className="text-brand-navy">
                Jidex Homes & Properties
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                Premium Property Marketplace Platform
            </p>

            <div style={{
                marginTop: 'var(--space-2xl)',
                padding: 'var(--space-xl)',
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                display: 'inline-block',
            }}>
                <h3 className="text-brand-gold">🎨 Design System Working!</h3>
                <p style={{ marginBottom: 0 }}>
                    Navy + Gold theme, Playfair Display + Inter fonts, all loaded.
                </p>
            </div>

            <div style={{ marginTop: 'var(--space-2xl)' }}>
                <button className="btn btn-primary" style={{ marginRight: 'var(--space-md)' }}>
                    Primary Button
                </button>
                <button
                    className="btn"
                    style={{
                        background: 'var(--color-brand-gold)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    Accent Button
                </button>
            </div>
        </div>
    );
}


// ── App Root ──────────────────────────────────────────────────────────────────
function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />

            {/* More routes will go here as we build pages */}
        </Routes>
    );
}

export default App;
