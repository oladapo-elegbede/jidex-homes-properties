/**
 * AuthLayout
 * ===========
 * Layout wrapper for authentication pages (Login, Register).
 *
 * Design pattern: Centered card on a clean background with brand logo.
 *
 * Structure:
 *   ┌────────────────────────────────────┐
 *   │                                    │
 *   │      [JIDEX HOMES LOGO]            │
 *   │                                    │
 *   │      ┌─────────────────────┐       │
 *   │      │                     │       │
 *   │      │   Form Card         │       │
 *   │      │   (children render  │       │
 *   │      │    here)            │       │
 *   │      │                     │       │
 *   │      └─────────────────────┘       │
 *   │                                    │
 *   │     Footer copyright text          │
 *   │                                    │
 *   └────────────────────────────────────┘
 */

import { Link } from 'react-router-dom';


export default function AuthLayout({ children }) {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, var(--color-brand-navy-light) 0%, var(--color-bg-surface) 100%)',
                padding: 'var(--space-lg)',
            }}
        >
            {/* ── Header With Brand Logo ──────────────────── */}
            <header
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl) 0',
                }}
            >
                <Link
                    to="/"
                    style={{
                        textDecoration: 'none',
                        display: 'inline-block',
                    }}
                >
                    <img
                        src="/jidex-logo.png"
                        alt="Jidex Homes & Properties"
                        style={{
                            height: '120px',
                            width: 'auto',
                        }}
                    />
                </Link>
            </header>

            {/* ── Main Content (Form Card) ────────────────── */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        background: 'white',
                        padding: 'var(--space-3xl)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        width: '100%',
                        maxWidth: '450px',
                    }}
                >
                    {children}
                </div>
            </main>

            {/* ── Footer ──────────────────────────────────── */}
            <footer
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl) 0',
                    color: 'var(--color-text-light)',
                    fontSize: 'var(--font-size-sm)',
                }}
            >
                © {new Date().getFullYear()} Jidex Homes &amp; Properties. All rights reserved.
            </footer>
        </div>
    );
}