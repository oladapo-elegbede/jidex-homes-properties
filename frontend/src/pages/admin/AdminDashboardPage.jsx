/**
 * AdminDashboardPage
 * ===================
 * Dashboard overview page for administrators.
 *
 * Displays platform-wide statistics in beautiful card layout:
 * - User counts (total, agents, admins, active)
 * - Property counts (total, by status)
 * - Quick action buttons for review queues
 *
 * Connected to backend: GET /api/v1/admin/dashboard
 */

import { Link } from 'react-router-dom';
import {
    Users,
    Home,
    Shield,
    UserCheck,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';

import { useAdminDashboard } from '../../hooks/useAdmin';


export default function AdminDashboardPage() {
    const { data: stats, isLoading, isError } = useAdminDashboard();


    // ── Loading State ────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 'var(--space-5xl) 0',
                    gap: 'var(--space-md)',
                }}
            >
                <Loader2
                    size={40}
                    color="var(--color-brand-navy)"
                    style={{ animation: 'spin 1s linear infinite' }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Loading dashboard...
                </p>
                <style>
                    {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                </style>
            </div>
        );
    }


    // ── Error State ──────────────────────────────────────────
    if (isError) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 'var(--space-5xl) 0',
                    gap: 'var(--space-md)',
                    textAlign: 'center',
                }}
            >
                <AlertCircle size={48} color="var(--color-error)" />
                <h3 style={{ color: 'var(--color-error)' }}>
                    Failed to load dashboard
                </h3>
            </div>
        );
    }


    return (
        <div>
            {/* ── Page Header ───────────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h1
                    style={{
                        color: 'var(--color-brand-navy)',
                        marginBottom: 'var(--space-xs)',
                    }}
                >
                    Admin Dashboard
                </h1>
                <p
                    style={{
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                    }}
                >
                    Platform overview and statistics
                </p>
            </div>


            {/* ── Pending Review Alert ──────────────────────── */}
            {stats.pending_properties > 0 && (
                <Link
                    to="/admin/properties?status=pending"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-lg) var(--space-xl)',
                        background: 'var(--color-warning-bg)',
                        border: '1px solid var(--color-warning)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-2xl)',
                        textDecoration: 'none',
                        transition: 'transform var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <Clock size={28} color="var(--color-warning)" />
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontWeight: 'var(--font-weight-bold)',
                                    color: 'var(--color-warning)',
                                }}
                            >
                                {stats.pending_properties}{' '}
                                {stats.pending_properties === 1 ? 'listing' : 'listings'} pending review
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Click to review and approve them
                            </p>
                        </div>
                    </div>
                    <ArrowRight size={20} color="var(--color-warning)" />
                </Link>
            )}


            {/* ═══════════════════════════════════════════════════
                USER STATISTICS
                ═══════════════════════════════════════════════════ */}
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
                <h2
                    style={{
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-lg)',
                        fontSize: 'var(--font-size-xl)',
                    }}
                >
                    Users
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 'var(--space-lg)',
                    }}
                >
                    <StatCard
                        icon={<Users size={24} />}
                        label="Total Users"
                        value={stats.total_users}
                        color="var(--color-brand-navy)"
                    />
                    <StatCard
                        icon={<UserCheck size={24} />}
                        label="Active Users"
                        value={stats.active_users}
                        color="var(--color-success)"
                    />
                    <StatCard
                        icon={<Home size={24} />}
                        label="Agents"
                        value={stats.total_agents}
                        color="var(--color-brand-gold)"
                    />
                    <StatCard
                        icon={<Shield size={24} />}
                        label="Admins"
                        value={stats.total_admins}
                        color="var(--color-info)"
                    />
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════
                PROPERTY STATISTICS
                ═══════════════════════════════════════════════════ */}
            <section>
                <h2
                    style={{
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-lg)',
                        fontSize: 'var(--font-size-xl)',
                    }}
                >
                    Properties
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 'var(--space-lg)',
                    }}
                >
                    <StatCard
                        icon={<Home size={24} />}
                        label="Total Listings"
                        value={stats.total_properties}
                        color="var(--color-brand-navy)"
                    />
                    <StatCard
                        icon={<Clock size={24} />}
                        label="Pending Review"
                        value={stats.pending_properties}
                        color="var(--color-warning)"
                        linkTo="/admin/properties?status=pending"
                    />
                    <StatCard
                        icon={<CheckCircle size={24} />}
                        label="Approved"
                        value={stats.approved_properties}
                        color="var(--color-success)"
                    />
                    <StatCard
                        icon={<XCircle size={24} />}
                        label="Rejected"
                        value={stats.rejected_properties}
                        color="var(--color-error)"
                    />
                </div>
            </section>


            {/* ── Quick Actions ─────────────────────────────── */}
            <section
                style={{
                    marginTop: 'var(--space-3xl)',
                    padding: 'var(--space-xl)',
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <h3
                    style={{
                        color: 'var(--color-brand-navy)',
                        marginBottom: 'var(--space-lg)',
                    }}
                >
                    Quick Actions
                </h3>
                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-md)',
                        flexWrap: 'wrap',
                    }}
                >
                    <Link
                        to="/admin/properties"
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            textDecoration: 'none',
                            color: 'white',
                        }}
                    >
                        <Home size={18} />
                        Manage Properties
                    </Link>
                    <Link
                        to="/admin/users"
                        className="btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            textDecoration: 'none',
                            background: 'var(--color-brand-gold)',
                            color: 'white',
                            padding: 'var(--space-md) var(--space-lg)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        <Users size={18} />
                        Manage Users
                    </Link>
                </div>
            </section>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Stat Card (Reusable) ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, linkTo = null }) {
    const cardContent = (
        <div
            style={{
                background: 'white',
                padding: 'var(--space-xl)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
                cursor: linkTo ? 'pointer' : 'default',
                height: '100%',
            }}
            onMouseEnter={(e) => {
                if (linkTo) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
            }}
            onMouseLeave={(e) => {
                if (linkTo) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: `${color}20`,    // 20 = 12.5% opacity in hex
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    marginBottom: 'var(--space-md)',
                }}
            >
                {icon}
            </div>
            <p
                style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: 1,
                    marginBottom: 'var(--space-xs)',
                }}
            >
                {value}
            </p>
            <p
                style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                }}
            >
                {label}
            </p>
        </div>
    );

    if (linkTo) {
        return (
            <Link to={linkTo} style={{ textDecoration: 'none', color: 'inherit' }}>
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}