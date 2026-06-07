/**
 * NotFoundPage (404)
 * ===================
 * Beautiful 404 page shown when a user visits an unknown URL.
 *
 * Features:
 * - Big "404" display in brand navy
 * - Friendly message
 * - Two action buttons: Go Home + Browse Properties
 * - Premium on-brand design
 *
 * Used by a catch-all route in App.jsx: <Route path="*" element={...} />
 */

import { Link } from 'react-router-dom';
import { Home, Search, FileQuestion } from 'lucide-react';


export default function NotFoundPage() {
    return (
        <div
            className="container-custom"
            style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 'var(--space-3xl) var(--space-lg)',
            }}
        >
            {/* ── Icon ────────────────────────────────────── */}
            <div
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-brand-navy-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-xl)',
                }}
            >
                <FileQuestion size={60} color="var(--color-brand-navy)" strokeWidth={1.5} />
            </div>

            {/* ── 404 Number ──────────────────────────────── */}
            <h1
                style={{
                    fontSize: 'clamp(4rem, 15vw, 8rem)',
                    color: 'var(--color-brand-navy)',
                    margin: 0,
                    lineHeight: 1,
                    fontWeight: 'var(--font-weight-bold)',
                    letterSpacing: '-0.05em',
                }}
            >
                404
            </h1>

            {/* ── Gold Divider Line ───────────────────────── */}
            <div
                style={{
                    width: '60px',
                    height: '3px',
                    background: 'var(--color-brand-gold)',
                    margin: 'var(--space-lg) 0',
                    borderRadius: 'var(--radius-pill)',
                }}
            />

            {/* ── Title ───────────────────────────────────── */}
            <h2
                style={{
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-md)',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                }}
            >
                Page Not Found
            </h2>

            {/* ── Description ─────────────────────────────── */}
            <p
                style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-lg)',
                    maxWidth: '500px',
                    marginBottom: 'var(--space-2xl)',
                    lineHeight: 'var(--line-height-normal)',
                }}
            >
                Sorry, the page you're looking for doesn't exist or has been moved.
                Let's get you back on track.
            </p>

            {/* ── Action Buttons ──────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        padding: 'var(--space-md) var(--space-xl)',
                        background: 'var(--color-brand-navy)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-brand-navy-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-brand-navy)';
                    }}
                >
                    <Home size={18} />
                    Go Home
                </Link>

                <Link
                    to="/properties"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        padding: 'var(--space-md) var(--space-xl)',
                        background: 'var(--color-brand-gold)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-brand-gold-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-brand-gold)';
                    }}
                >
                    <Search size={18} />
                    Browse Properties
                </Link>
            </div>
        </div>
    );
}