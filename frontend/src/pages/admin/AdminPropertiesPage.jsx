/**
 * AdminPropertiesPage
 * ====================
 * Admin page for reviewing and managing all property listings.
 *
 * Connected to backend:
 * - GET /api/v1/admin/properties           → list all properties
 * - PUT /api/v1/admin/properties/{id}/approval → approve/reject
 *
 * Features:
 * - Filter by status (All / Pending / Approved / Rejected)
 * - Table view with property details
 * - Approve button (one click)
 * - Reject button (opens modal for rejection reason)
 * - Updates dashboard stats automatically (via cache invalidation)
 */

import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Loader2,
    AlertCircle,
    Home,
    CheckCircle,
    XCircle,
    Eye,
    X,
    Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAdminProperties, useReviewProperty } from '../../hooks/useAdmin';
import {
    formatPrice,
    capitalize,
    getListingStatusInfo,
    formatRelativeDate,
} from '../../utils/formatters';


export default function AdminPropertiesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentFilter = searchParams.get('status') || 'all';

    // Build API params (only include listing_status if not 'all')
    const apiParams = currentFilter === 'all'
        ? {}
        : { listing_status: currentFilter };

    const { data, isLoading, isError } = useAdminProperties(apiParams);
    const reviewMutation = useReviewProperty();

    // Track property being rejected (for the modal)
    const [propertyToReject, setPropertyToReject] = useState(null);


    // ── Handle Approve ────────────────────────────────────────
    const handleApprove = async (property) => {
        try {
            await reviewMutation.mutateAsync({
                propertyId: property.id,
                approvalData: { listing_status: 'approved' },
            });
            toast.success(`"${property.title}" approved and live!`);
        } catch (err) {
            toast.error('Failed to approve property.');
        }
    };


    // ── Handle Reject (Submit From Modal) ────────────────────
    const handleReject = async (rejectionReason) => {
        if (!propertyToReject) return;

        try {
            await reviewMutation.mutateAsync({
                propertyId: propertyToReject.id,
                approvalData: {
                    listing_status: 'rejected',
                    rejection_reason: rejectionReason,
                },
            });
            toast.success(`"${propertyToReject.title}" rejected.`);
            setPropertyToReject(null);
        } catch (err) {
            toast.error('Failed to reject property.');
        }
    };


    // ── Handle Filter Change ─────────────────────────────────
    const setFilter = (filter) => {
        if (filter === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ status: filter });
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
                    Property Management
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Review, approve, or reject property listings
                </p>
            </div>


            {/* ── Filter Tabs ───────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 'var(--space-xs)',
                    marginBottom: 'var(--space-xl)',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: 'var(--space-xs)',
                    overflowX: 'auto',
                }}
            >
                <FilterTab
                    label="All"
                    active={currentFilter === 'all'}
                    onClick={() => setFilter('all')}
                />
                <FilterTab
                    label="Pending Review"
                    active={currentFilter === 'pending'}
                    onClick={() => setFilter('pending')}
                />
                <FilterTab
                    label="Approved"
                    active={currentFilter === 'approved'}
                    onClick={() => setFilter('approved')}
                />
                <FilterTab
                    label="Rejected"
                    active={currentFilter === 'rejected'}
                    onClick={() => setFilter('rejected')}
                />
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
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
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
                    <h3 style={{ color: 'var(--color-error)' }}>Failed to load</h3>
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
                    <Home size={64} color="var(--color-text-light)" style={{ margin: '0 auto var(--space-lg)' }} />
                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>
                        No {currentFilter === 'all' ? '' : currentFilter} listings
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                        {currentFilter === 'pending'
                            ? 'No listings need review right now.'
                            : 'Check back later for new listings.'}
                    </p>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                PROPERTIES TABLE
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
                                    <Th>Property</Th>
                                    <Th>Price</Th>
                                    <Th>Status</Th>
                                    <Th>Submitted</Th>
                                    <Th style={{ textAlign: 'right' }}>Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((property) => (
                                    <PropertyRow
                                        key={property.id}
                                        property={property}
                                        onApprove={() => handleApprove(property)}
                                        onReject={() => setPropertyToReject(property)}
                                        isProcessing={reviewMutation.isPending}
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
                        {data.total === 1 ? 'listing' : 'listings'}
                    </div>
                </div>
            )}


            {/* ── Reject Modal ──────────────────────────────── */}
            {propertyToReject && (
                <RejectModal
                    property={propertyToReject}
                    isProcessing={reviewMutation.isPending}
                    onConfirm={handleReject}
                    onCancel={() => setPropertyToReject(null)}
                />
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Filter Tab ────────────────────────────────────────────────────────────────
function FilterTab({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: 'var(--space-md) var(--space-lg)',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${active ? 'var(--color-brand-navy)' : 'transparent'}`,
                color: active
                    ? 'var(--color-brand-navy)'
                    : 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: active
                    ? 'var(--font-weight-bold)'
                    : 'var(--font-weight-medium)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: '-1px',
            }}
        >
            {label}
        </button>
    );
}


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


// ── Property Row ──────────────────────────────────────────────────────────────
function PropertyRow({ property, onApprove, onReject, isProcessing }) {
    const statusInfo = getListingStatusInfo(property.listing_status);

    return (
        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {/* Title */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                    {property.title}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    {capitalize(property.property_type)} · {property.city}
                </p>
            </td>

            {/* Price */}
            <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
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

            {/* Status */}
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
                    }}
                >
                    {statusInfo.label}
                </span>
            </td>

            {/* Date */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    color: 'var(--color-text-secondary)',
                }}
            >
                {formatRelativeDate(property.created_at)}
            </td>

            {/* Actions */}
            <td
                style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    textAlign: 'right',
                }}
            >
                <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                    {/* View Button (always visible if approved) */}
                    {property.listing_status === 'approved' && (
                        <Link
                            to={`/properties/${property.id}`}
                            title="View Public Page"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                background: 'transparent',
                                border: '1px solid var(--color-text-secondary)',
                                color: 'var(--color-text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                            }}
                        >
                            <Eye size={16} />
                        </Link>
                    )}

                    {/* Approve Button (only if not already approved) */}
                    {property.listing_status !== 'approved' && (
                        <button
                            onClick={onApprove}
                            disabled={isProcessing}
                            title="Approve"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                background: 'var(--color-success)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                            }}
                        >
                            <CheckCircle size={16} />
                            Approve
                        </button>
                    )}

                    {/* Reject Button (only if not already rejected) */}
                    {property.listing_status !== 'rejected' && (
                        <button
                            onClick={onReject}
                            disabled={isProcessing}
                            title="Reject"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                background: 'var(--color-error)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                            }}
                        >
                            <XCircle size={16} />
                            Reject
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}


// ── Reject Modal With Reason Input ────────────────────────────────────────────
function RejectModal({ property, isProcessing, onConfirm, onCancel }) {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        const trimmed = reason.trim();
        if (trimmed.length < 10) {
            toast.error('Rejection reason must be at least 10 characters.');
            return;
        }
        onConfirm(trimmed);
    };

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
                    maxWidth: '500px',
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
                        background: 'var(--color-error-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-lg)',
                    }}
                >
                    <XCircle size={28} color="var(--color-error)" />
                </div>

                <h3
                    style={{
                        textAlign: 'center',
                        marginBottom: 'var(--space-sm)',
                    }}
                >
                    Reject Listing
                </h3>

                <p
                    style={{
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-lg)',
                    }}
                >
                    Provide a reason for rejecting "<strong>{property.title}</strong>".
                    The agent will be able to see this reason.
                </p>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--space-xs)',
                        }}
                    >
                        Rejection Reason
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Missing required photos, inaccurate location details..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: 'var(--space-md)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-base)',
                            fontFamily: 'var(--font-body)',
                            resize: 'vertical',
                        }}
                    />
                    <p
                        style={{
                            margin: 'var(--space-xs) 0 0 0',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Minimum 10 characters
                    </p>
                </div>

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
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            background: 'var(--color-error)',
                            border: 'none',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}
                    >
                        {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                </div>
            </div>
        </div>
    );
}