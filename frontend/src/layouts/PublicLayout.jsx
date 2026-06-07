/**
 * PublicLayout
 * =============
 * Layout wrapper for public pages with responsive navbar.
 *
 * Features:
 * - Desktop: Full horizontal navbar with links
 * - Mobile: Hamburger menu that slides open from the right
 * - Sticky positioning
 * - Footer with logo
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';


export default function PublicLayout({ children }) {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Mobile menu open/closed state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    // ── Close Mobile Menu When Route Changes ─────────────────
    // Otherwise the menu stays open after clicking a link
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);


    // ── Close Mobile Menu When Window Resizes To Desktop ─────
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // ── Lock Body Scroll When Mobile Menu Is Open ────────────
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);


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
                        padding: 'var(--space-md) 0',
                    }}
                >
                    {/* ── Logo ──────────────────────────────── */}
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src="/jidex-logo.png"
                            alt="Jidex Homes & Properties"
                            style={{
                                height: '55px',
                                width: 'auto',
                            }}
                        />
                    </Link>


                    {/* ── DESKTOP NAVIGATION (hidden on mobile) ── */}
                    <div
                        className="desktop-nav"
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


                    {/* ── DESKTOP AUTH BUTTONS (hidden on mobile) ── */}
                    <div
                        className="desktop-auth"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                        }}
                    >
                        {isAuthenticated ? (
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


                    {/* ── MOBILE HAMBURGER BUTTON (hidden on desktop) ── */}
                    <button
                        className="mobile-menu-button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Open menu"
                        style={{
                            display: 'none',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 'var(--space-sm)',
                            color: 'var(--color-brand-navy)',
                        }}
                    >
                        <Menu size={28} />
                    </button>
                </nav>
            </header>


            {/* ═══════════════════════════════════════════════════
                MOBILE MENU OVERLAY
                ═══════════════════════════════════════════════════ */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop (click to close) */}
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 'var(--z-modal-overlay)',
                            animation: 'fadeIn 200ms ease',
                        }}
                    />

                    {/* Slide-in menu panel */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '85%',
                            maxWidth: '320px',
                            background: 'white',
                            zIndex: 'var(--z-modal)',
                            padding: 'var(--space-xl)',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
                            animation: 'slideInRight 250ms ease',
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Close menu"
                            style={{
                                position: 'absolute',
                                top: 'var(--space-lg)',
                                right: 'var(--space-lg)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-text-secondary)',
                                padding: 'var(--space-sm)',
                            }}
                        >
                            <X size={24} />
                        </button>

                        {/* Logo at top */}
                        <div
                            style={{
                                marginBottom: 'var(--space-2xl)',
                                marginTop: 'var(--space-sm)',
                            }}
                        >
                            <img
                                src="/jidex-logo.png"
                                alt="Jidex Homes & Properties"
                                style={{
                                    height: '50px',
                                    width: 'auto',
                                }}
                            />
                        </div>

                        {/* Navigation links */}
                        <nav
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-xs)',
                            }}
                        >
                            <MobileLink to="/properties">Properties</MobileLink>

                            {isAuthenticated && (
                                <>
                                    {/* User info */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-sm)',
                                            padding: 'var(--space-md)',
                                            marginTop: 'var(--space-md)',
                                            background: 'var(--color-bg-surface)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-brand-gold)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--color-brand-navy)',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <User size={20} />
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {user.full_name}
                                            </p>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-secondary)',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {user.role}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </nav>

                        {/* Bottom auth buttons */}
                        <div
                            style={{
                                marginTop: 'auto',
                                paddingTop: 'var(--space-xl)',
                                borderTop: '1px solid var(--color-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-sm)',
                            }}
                        >
                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-error)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 'var(--space-xs)',
                                    }}
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-md)',
                                            background: 'transparent',
                                            color: 'var(--color-brand-navy)',
                                            border: '1px solid var(--color-brand-navy)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--font-size-base)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            textDecoration: 'none',
                                            textAlign: 'center',
                                            display: 'block',
                                        }}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-md)',
                                            background: 'var(--color-brand-navy)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--font-size-base)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            textDecoration: 'none',
                                            textAlign: 'center',
                                            display: 'block',
                                        }}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}


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
                        <div style={{ maxWidth: '350px' }}>
                            <img
                                src="/jidex-logo.png"
                                alt="Jidex Homes & Properties"
                                style={{
                                    height: '70px',
                                    width: 'auto',
                                    marginBottom: 'var(--space-md)',
                                    filter: 'brightness(0) invert(1) sepia(1) hue-rotate(15deg) saturate(8)',
                                }}
                            />
                            <p
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: 'var(--font-size-sm)',
                                    margin: 0,
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


            {/* ═══════════════════════════════════════════════════
                RESPONSIVE STYLES + ANIMATIONS
                ═══════════════════════════════════════════════════ */}
            <style>
                {`
                    /* Animations */
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }

                    /* Mobile breakpoint: < 768px */
                    @media (max-width: 767px) {
                        .desktop-nav,
                        .desktop-auth {
                            display: none !important;
                        }
                        .mobile-menu-button {
                            display: flex !important;
                            align-items: center;
                            justify-content: center;
                        }
                    }
                `}
            </style>

            {/* ── Mobile Link Sub-Component ───────────────── */}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// MOBILE LINK SUB-COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function MobileLink({ to, children }) {
    return (
        <Link
            to={to}
            style={{
                display: 'block',
                padding: 'var(--space-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
                transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-surface)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {children}
        </Link>
    );
}