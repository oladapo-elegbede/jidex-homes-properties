/**
 * AdminUsersPage
 * ===============
 * Admin page for viewing and managing all platform users.
 *
 * Connected to backend:
 * - GET /api/v1/admin/users           → list all users
 * - PUT /api/v1/admin/users/{id}      → activate/deactivate
 *
 * Features:
 * - Table view of all users
 * - Role badge (User / Agent / Admin)
 * - Active/Inactive toggle button
 * - Soft delete pattern (deactivate, don't delete)
 */

import { useState } from 'react';
import {
    Loader2,
    AlertCircle,
    Users,
    UserCheck,
    UserX,
    X,
    Shield,
    Home,
    User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAdminUsers, useUpdateUserActivation } from '../../hooks/useAdmin';
import { formatRelativeDate, capitalize } from '../../utils/formatters';


export default function AdminUsersPage() {
    const { data, isLoading, isError } = useAdminUsers();
    const updateMutation = useUpdateUserActivation();

    const [userToToggle, setUserToToggle] = useState(null);


    // ── Handle Toggle Confirmation ────────────────────────────
    const handleToggle = async () => {
        if (!userToToggle) return;

        try {
            await updateMutation.mutateAsync({
                userId: userToToggle.id,
                isActive: !userToToggle.is_active,
            });

            const action = userToToggle.is_active ? 'deactivated' : 'activated';
            toast.success(`${userToToggle.full_name} ${action}.`);
            setUserToToggle(null);
        } catch (err) {
            toast.error('Failed to update user.');
        }
    };


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
                    User Management
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    View and manage all platform users
                </p>
            </div>


            {/* ── Loading State ─────────────────────────────── */}
            {isLoading && (
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
                        size={36}
                        color="var(--color-brand-navy)"
                        style={{ animation: 'spin 1s linear infinite' }}
                    />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading users...</p>
                    <style>
                        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                    </style>
                </div>
            )}


            {/* ── Error State ───────────────────────────────── */}
            {isError && (
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
                    <h3 style={{ color: 'var(--color-error)' }}>Failed to load users</h3>
                </div>
            )}


            {/* ── Users Table ───────────────────────────────── */}
            {data && data.items.length > 0 && (
                <div
                    style={{
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 'var(--font-size-sm)',
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: 'var(--color-bg-surface)',
                                        borderBottom: '1px solid var(--color-border)',
                                    }}
                                >
                                    <Th>User</Th>
                                    <Th>Email</Th>
                                    <Th>Role</Th>
                                    <Th>Status</Th>
                                    <Th>Joined</Th>
                                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        onToggle={() => setUserToToggle(user)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            padding: 'var(--space-md) var(--space-lg)',
                            borderTop: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        Showing {data.items.length} of {data.total}{' '}
                        {data.total === 1 ? 'user' : 'users'}
                    </div>
                </div>
            )}


            {/* ── Confirmation Modal ────────────────────────── */}
            {userToToggle && (
                <ConfirmModal
                    user={userToToggle}
                    isProcessing={updateMutation.isPending}
                    onConfirm={handleToggle}
                    onCancel={() => setUserToToggle(null)}
                />
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Table Header Cell ─────────────────────────────────────────────────────────
function Th({ children, style }) {
    return (
        <th
            style={{
                padding: 'var(--space-md) var(--space-lg)',
                textAlign: 'left',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                ...style,
            }}
        >
            {children}
        </th>
    );
}


// ── Role Badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
    const roleMap = {
        admin: {
            label: 'Admin',
            icon: <Shield size={12} />,
            bg: 'var(--color-info-bg)',
            color: 'var(--color-info)',
        },
        agent: {
            label: 'Agent',
            icon: <Home size={12} />,
            bg: 'var(--color-brand-gold-light)',
            color: 'var(--color-brand-gold)',
        },
        user: {
            label: 'User',
            icon: <UserIcon size={12} />,
            bg: 'var(--color-bg-surface)',
            color: 'var(--color-text-secondary)',
        },
    };

    const info = roleMap[role] || roleMap.user;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: info.bg,
                color: info.color,
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}
        >
            {info.icon}
            {info.label}
        </span>
    );
}


// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, onToggle }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {/* User Info */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-brand-navy-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-brand-navy)',
                            flexShrink: 0,
                        }}
                    >
                        <UserIcon size={18} />
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {user.full_name}
                    </p>
                </div>
            </td>

            {/* Email */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    color: 'var(--color-text-primary)',
                }}
            >
                {user.email}
            </td>

            {/* Role */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <RoleBadge role={user.role} />
            </td>

            {/* Status */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: user.is_active
                            ? 'var(--color-success-bg)'
                            : 'var(--color-error-bg)',
                        color: user.is_active
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    {user.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
                    {user.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>

            {/* Joined Date */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    color: 'var(--color-text-secondary)',
                }}
            >
                {formatRelativeDate(user.created_at)}
            </td>

            {/* Actions */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    textAlign: 'right',
                }}
            >
                {/* Admins can't be deactivated through this UI (safety) */}
                {user.role !== 'admin' && (
                    <button
                        onClick={onToggle}
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: user.is_active
                                ? 'var(--color-error)'
                                : 'var(--color-success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                )}
                {user.role === 'admin' && (
                    <span
                        style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-light)',
                            fontStyle: 'italic',
                        }}
                    >
                        Protected
                    </span>
                )}
            </td>
        </tr>
    );
}


// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ user, isProcessing, onConfirm, onCancel }) {
    const isDeactivating = user.is_active;
    const action = isDeactivating ? 'deactivate' : 'activate';
    const actionColor = isDeactivating ? 'var(--color-error)' : 'var(--color-success)';
    const actionBg = isDeactivating ? 'var(--color-error-bg)' : 'var(--color-success-bg)';

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 'var(--z-modal-overlay)',
                padding: 'var(--space-lg)',
            }}
            onClick={onCancel}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-xl)',
                    maxWidth: '450px',
                    width: '100%',
                    position: 'relative',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: 'var(--space-md)',
                        right: 'var(--space-md)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    <X size={20} />
                </button>

                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-full)',
                        background: actionBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-lg)',
                    }}
                >
                    {isDeactivating ? (
                        <UserX size={28} color={actionColor} />
                    ) : (
                        <UserCheck size={28} color={actionColor} />
                    )}
                </div>

                <h3
                    style={{
                        textAlign: 'center',
                        marginBottom: 'var(--space-sm)',
                        textTransform: 'capitalize',
                    }}
                >
                    {action} User?
                </h3>

                <p
                    style={{
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-xl)',
                    }}
                >
                    Are you sure you want to {action}{' '}
                    <strong>{user.full_name}</strong>?
                    {isDeactivating && (
                        <>
                            <br />
                            <small>They will not be able to log in until reactivated.</small>
                        </>
                    )}
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            background: actionColor,
                            border: 'none',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontWeight: 'var(--font-weight-semibold)',
                            textTransform: 'capitalize',
                        }}
                    >
                        {isProcessing ? 'Processing...' : action}
                    </button>
                </div>
            </div>
        </div>
    );
}