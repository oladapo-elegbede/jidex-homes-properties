/**
 * DashboardLayout
 * ================
 * Layout wrapper for all agent/admin dashboard pages.
 *
 * Features:
 * - Sticky sidebar with navigation links
 * - Active link highlighting
 * - Top bar with user info and logout
 * - Responsive: sidebar collapses on mobile
 *
 * Used by:
 * - Agent Dashboard
 * - My Listings
 * - Create Listing
 * - Edit Listing
 * - (later) Admin pages
 *
 * ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE
 * (in the sidebar header)
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Home,
    Plus,
    LogOut,
    User,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';


export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
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
                display: 'grid',
                gridTemplateColumns: '260px 1fr',
                background: 'var(--color-bg-surface)',
            }}
            className="dashboard-layout"
        >

            {/* ═══════════════════════════════════════════════════
                SIDEBAR
                ═══════════════════════════════════════════════════ */}
            <aside
                style={{
                    background: 'var(--color-brand-navy)',
                    color: 'white',
                    padding: 'var(--space-xl) 0',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                }}
            >
                {/* ── Sidebar Header (Logo) ──────────────────── */}
                {/*
                    ADD YOUR OFFICIAL JIDEX HOMES & PROPERTIES LOGO HERE
                    Replace this Link block with: <img src="/logo-white.png" />
                */}
                <Link
                    to="/"
                    style={{
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 var(--space-xl)',
                        marginBottom: 'var(--space-2xl)',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'white',
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
                            marginTop: '0.125rem',
                        }}
                    >
                        &amp; Properties
                    </span>
                </Link>

                {/* ── Navigation Links ──────────────────────── */}
                <nav style={{ flex: 1, padding: '0 var(--space-md)' }}>
                    <SidebarLink
                        to="/agent/dashboard"
                        icon={<LayoutDashboard size={18} />}
                        label="Dashboard"
                    />
                    <SidebarLink
                        to="/agent/listings"
                        icon={<Home size={18} />}
                        label="My Listings"
                    />
                    <SidebarLink
                        to="/agent/listings/new"
                        icon={<Plus size={18} />}
                        label="Create Listing"
                    />
                </nav>

                {/* ── User Info & Logout (Bottom) ───────────── */}
                <div
                    style={{
                        padding: '0 var(--space-xl)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingTop: 'var(--space-lg)',
                        marginTop: 'var(--space-lg)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-md)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-brand-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-brand-navy)',
                                flexShrink: 0,
                            }}
                        >
                            <User size={18} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p
                                style={{
                                    margin: 0,
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {user?.full_name}
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-brand-gold)',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {user?.role}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </aside>


            {/* ═══════════════════════════════════════════════════
                MAIN CONTENT AREA
                ═══════════════════════════════════════════════════ */}
            <main
                style={{
                    padding: 'var(--space-2xl)',
                    overflowX: 'auto',
                }}
            >
                {children}
            </main>


            {/* ═══════════════════════════════════════════════════
                RESPONSIVE STYLES (Hide sidebar on small screens)
                ═══════════════════════════════════════════════════ */}
            <style>
                {`
                    @media (max-width: 767px) {
                        .dashboard-layout {
                            grid-template-columns: 1fr !important;
                        }
                        .dashboard-layout aside {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR LINK COMPONENT (Reusable)
// ═══════════════════════════════════════════════════════════════════════════
function SidebarLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            end
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-xs)',
                color: isActive ? 'var(--color-brand-navy)' : 'rgba(255, 255, 255, 0.85)',
                background: isActive ? 'var(--color-brand-gold)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive
                    ? 'var(--font-weight-semibold)'
                    : 'var(--font-weight-medium)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
            })}
        >
            {icon}
            {label}
        </NavLink>
    );
}