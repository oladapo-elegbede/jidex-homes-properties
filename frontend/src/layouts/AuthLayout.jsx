/**
 * AuthLayout
 * ===========
 * Layout wrapper for authentication pages (Login, Register).
 *
 * Design pattern: Centered card on a clean background.
 *
 * Structure:
 *   ┌────────────────────────────────────┐
 *   │                                    │
 *   │         [Brand Logo]               │
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
 *
 * Note: Logo is a text placeholder for now.
 * ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE later.
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
                    padding: 'var(--space-2xl) 0',
                }}
            >
                {/*
                    ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE
                    Replace this text with: <img src="/logo.png" alt="Jidex Homes" />
                */}
                <Link
                    to="/"
                    style={{
                        textDecoration: 'none',
                        display: 'inline-block',
                    }}
                >
                    <h1
                        style={{
                            color: 'var(--color-brand-navy)',
                            fontSize: 'var(--font-size-3xl)',
                            marginBottom: 'var(--space-xs)',
                        }}
                    >
                        Jidex Homes
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-brand-gold)',
                            fontSize: 'var(--font-size-sm)',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            fontWeight: 'var(--font-weight-semibold)',
                            margin: 0,
                        }}
                    >
                        &amp; Properties
                    </p>
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