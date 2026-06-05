/**
 * PublicLayout
 * =============
 * Layout wrapper for public pages (Home, Properties, Agents, etc.).
 *
 * Structure:
 *   - Navbar (sticky at top)
 *   - Main content area (renders children)
 *   - Footer (sticky at bottom)
 *
 * Navbar shows different content based on auth state:
 *   - Not logged in: Sign In + Register buttons
 *   - Logged in: User name + Logout
 *   - Agent: + Dashboard link
 *   - Admin: + Admin link
 *
 * ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE
 * (in the navbar — currently uses text branding)
 */

import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';


export default function PublicLayout({ children }) {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully.');
        navigate('/');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-primary)',
            }}
        >
            {/* ═══════════════════════════════════════════════════
                NAVBAR
                ═══════════════════════════════════════════════════ */}
            <header
                style={{
                    background: 'white',
                    borderBottom: '1px solid var(--color-border)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 'var(--z-sticky)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <nav
                    className="container-custom"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-lg) 0',
                    }}
                >
                    {/* ── Logo / Brand ───────────────────────── */}
                    {/*
                        ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE
                        Replace this Link block with: <img src="/logo.png" alt="Jidex Homes" />
                    */}
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-brand-navy)',
                                lineHeight: 1,
                            }}
                        >
                            Jidex Homes
                        </span>
                        <span
                            style={{
                                fontSize: '0.625rem',
                                color: 'var(--color-brand-gold)',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                fontWeight: 'var(--font-weight-semibold)',
                            }}
                        >
                            &amp; Properties
                        </span>
                    </Link>

                    {/* ── Navigation Links ───────────────────── */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xl)',
                        }}
                    >
                        <Link
                            to="/properties"
                            style={{
                                color: 'var(--color-text-primary)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                textDecoration: 'none',
                            }}
                        >
                            Properties
                        </Link>
                    </div>

                    {/* ── Auth Buttons ───────────────────────── */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                        }}
                    >
                        {isAuthenticated ? (
                            // ── Logged In State ──────────────
                            <>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-xs)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                    }}
                                >
                                    <User size={16} />
                                    <span>{user.full_name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        background: 'transparent',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-sm)',
                                        cursor: 'pointer',
                                        transition: 'background var(--transition-fast)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--color-bg-surface)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            // ── Logged Out State ─────────────
                            <>
                                <Link
                                    to="/login"
                                    style={{
                                        color: 'var(--color-text-primary)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        textDecoration: 'none',
                                        padding: 'var(--space-sm) var(--space-md)',
                                    }}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    style={{
                                        background: 'var(--color-brand-navy)',
                                        color: 'white',
                                        padding: 'var(--space-sm) var(--space-lg)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* ═══════════════════════════════════════════════════
                MAIN CONTENT AREA
                ═══════════════════════════════════════════════════ */}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {/* ═══════════════════════════════════════════════════
                FOOTER
                ═══════════════════════════════════════════════════ */}
            <footer
                style={{
                    background: 'var(--color-brand-navy)',
                    color: 'white',
                    padding: 'var(--space-3xl) 0 var(--space-xl) 0',
                    marginTop: 'var(--space-3xl)',
                }}
            >
                <div className="container-custom">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 'var(--space-xl)',
                            marginBottom: 'var(--space-2xl)',
                        }}
                    >
                        {/*
                            ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE
                            (the white version of your logo for the dark footer)
                        */}
                        <div>
                            <h3
                                style={{
                                    color: 'white',
                                    fontSize: 'var(--font-size-xl)',
                                    marginBottom: 'var(--space-xs)',
                                }}
                            >
                                Jidex Homes
                            </h3>
                            <p
                                style={{
                                    color: 'var(--color-brand-gold)',
                                    fontSize: 'var(--font-size-xs)',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    margin: 0,
                                }}
                            >
                                &amp; Properties
                            </p>
                            <p
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: 'var(--font-size-sm)',
                                    marginTop: 'var(--space-md)',
                                    maxWidth: '350px',
                                }}
                            >
                                Premium property marketplace connecting buyers, renters,
                                and agents across Nigeria.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3xl)' }}>
                            <div>
                                <h5
                                    style={{
                                        color: 'white',
                                        fontSize: 'var(--font-size-sm)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginBottom: 'var(--space-md)',
                                    }}
                                >
                                    Explore
                                </h5>
                                <ul
                                    style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        margin: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--space-xs)',
                                    }}
                                >
                                    <li>
                                        <Link
                                            to="/properties"
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: 'var(--font-size-sm)',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Browse Properties
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/login"
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: 'var(--font-size-sm)',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Sign In
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingTop: 'var(--space-lg)',
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        © {new Date().getFullYear()} Jidex Homes &amp; Properties. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}