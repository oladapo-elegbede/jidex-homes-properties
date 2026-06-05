/**
 * AgentListingsPage
 * ==================
 * Dashboard page where agents see and manage all their own listings.
 *
 * Connected to backend: GET /api/v1/agent/properties
 *
 * Features:
 * - Table view of all agent's listings (any status)
 * - Status badges (pending/approved/rejected)
 * - Edit button (navigates to edit page)
 * - Delete button (with confirmation modal)
 * - "Create New Listing" button at top
 * - Loading, error, and empty states
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    Home,
    Eye,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useMyProperties, useDeleteProperty } from '../../hooks/useProperties';
import {
    formatPrice,
    capitalize,
    getListingStatusInfo,
    formatRelativeDate,
} from '../../utils/formatters';


export default function AgentListingsPage() {
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useMyProperties();
    const deleteMutation = useDeleteProperty();

    // Track which property is being deleted (for confirmation modal)
    const [propertyToDelete, setPropertyToDelete] = useState(null);


    // ── Handle Delete Confirmation ────────────────────────────
    const handleDelete = async () => {
        if (!propertyToDelete) return;

        try {
            await deleteMutation.mutateAsync(propertyToDelete.id);
            toast.success(`"${propertyToDelete.title}" was deleted.`);
            setPropertyToDelete(null);
        } catch (err) {
            toast.error('Failed to delete property. Please try again.');
        }
    };


    return (
        <div>
            {/* ── Page Header ───────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 'var(--space-lg)',
                    marginBottom: 'var(--space-2xl)',
                }}
            >
                <div>
                    <h1
                        style={{
                            color: 'var(--color-brand-navy)',
                            marginBottom: 'var(--space-xs)',
                        }}
                    >
                        My Listings
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                        }}
                    >
                        Manage your property listings
                    </p>
                </div>

                <Link
                    to="/agent/listings/new"
                    className="btn btn-primary"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        textDecoration: 'none',
                        color: 'white',
                    }}
                >
                    <Plus size={18} />
                    Create New Listing
                </Link>
            </div>


            {/* ═══════════════════════════════════════════════════
                LOADING STATE
                ═══════════════════════════════════════════════════ */}
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
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Loading your listings...
                    </p>
                    <style>
                        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                    </style>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                ERROR STATE
                ═══════════════════════════════════════════════════ */}
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
                    <h3 style={{ color: 'var(--color-error)', margin: 0 }}>
                        Failed to load listings
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                        {error?.message || 'Please try again later.'}
                    </p>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                EMPTY STATE
                ═══════════════════════════════════════════════════ */}
            {data && data.items.length === 0 && (
                <div
                    style={{
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4xl) var(--space-xl)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <Home
                        size={64}
                        color="var(--color-text-light)"
                        style={{ margin: '0 auto var(--space-lg)' }}
                    />
                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>
                        No listings yet
                    </h3>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--space-xl)',
                        }}
                    >
                        Create your first property listing to get started.
                    </p>
                    <Link
                        to="/agent/listings/new"
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            textDecoration: 'none',
                            color: 'white',
                        }}
                    >
                        <Plus size={18} />
                        Create First Listing
                    </Link>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                LISTINGS TABLE (the main event!)
                ═══════════════════════════════════════════════════ */}
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
                                    <TableHeader>Property</TableHeader>
                                    <TableHeader>Price</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Listed</TableHeader>
                                    <TableHeader style={{ textAlign: 'right' }}>Actions</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((property) => (
                                    <PropertyRow
                                        key={property.id}
                                        property={property}
                                        onView={() => navigate(`/properties/${property.id}`)}
                                        onEdit={() => navigate(`/agent/listings/${property.id}/edit`)}
                                        onDelete={() => setPropertyToDelete(property)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary footer */}
                    <div
                        style={{
                            padding: 'var(--space-md) var(--space-lg)',
                            borderTop: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        Showing {data.items.length} of {data.total}{' '}
                        {data.total === 1 ? 'listing' : 'listings'}
                    </div>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                DELETE CONFIRMATION MODAL
                ═══════════════════════════════════════════════════ */}
            {propertyToDelete && (
                <DeleteConfirmModal
                    propertyTitle={propertyToDelete.title}
                    isDeleting={deleteMutation.isPending}
                    onConfirm={handleDelete}
                    onCancel={() => setPropertyToDelete(null)}
                />
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Table Header Cell ─────────────────────────────────────────────────────────
function TableHeader({ children, style }) {
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


// ── Property Row ──────────────────────────────────────────────────────────────
function PropertyRow({ property, onView, onEdit, onDelete }) {
    const statusInfo = getListingStatusInfo(property.listing_status);

    return (
        <tr
            style={{
                borderBottom: '1px solid var(--color-border)',
                transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-surface)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {/* Property Title */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    {property.title}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    {property.city}, {property.state}
                </p>
            </td>

            {/* Price */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <span
                    style={{
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-brand-navy)',
                    }}
                >
                    {formatPrice(property.price)}
                </span>
                <p
                    style={{
                        margin: 0,
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'capitalize',
                    }}
                >
                    For {property.listing_type}
                </p>
            </td>

            {/* Type */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <span
                    style={{
                        color: 'var(--color-text-primary)',
                        textTransform: 'capitalize',
                    }}
                >
                    {capitalize(property.property_type)}
                </span>
            </td>

            {/* Status Badge */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <span
                    style={{
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'inline-block',
                    }}
                >
                    {statusInfo.label}
                </span>
            </td>

            {/* Listed Date */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                }}
            >
                {formatRelativeDate(property.created_at)}
            </td>

            {/* Action Buttons */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    textAlign: 'right',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        gap: 'var(--space-xs)',
                    }}
                >
                    <ActionButton
                        icon={<Eye size={16} />}
                        label="View"
                        onClick={onView}
                        color="var(--color-text-secondary)"
                    />
                    <ActionButton
                        icon={<Edit2 size={16} />}
                        label="Edit"
                        onClick={onEdit}
                        color="var(--color-brand-navy)"
                    />
                    <ActionButton
                        icon={<Trash2 size={16} />}
                        label="Delete"
                        onClick={onDelete}
                        color="var(--color-error)"
                    />
                </div>
            </td>
        </tr>
    );
}


// ── Action Button (Icon Button) ───────────────────────────────────────────────
function ActionButton({ icon, label, onClick, color }) {
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                background: 'transparent',
                border: `1px solid ${color}`,
                color: color,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = color;
                e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = color;
            }}
        >
            {icon}
        </button>
    );
}


// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteConfirmModal({ propertyTitle, isDeleting, onConfirm, onCancel }) {
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
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-error-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-lg)',
                    }}
                >
                    <Trash2 size={28} color="var(--color-error)" />
                </div>

                <h3
                    style={{
                        textAlign: 'center',
                        marginBottom: 'var(--space-sm)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    Delete Listing?
                </h3>

                <p
                    style={{
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-xl)',
                    }}
                >
                    Are you sure you want to delete "<strong>{propertyTitle}</strong>"?
                    This action cannot be undone.
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-sm)',
                    }}
                >
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            background: 'var(--color-error)',
                            border: 'none',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}