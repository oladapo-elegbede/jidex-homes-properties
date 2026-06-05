/**
 * PropertiesPage
 * ===============
 * Public page for browsing all available properties.
 *
 * Features:
 * - Fetches properties from /api/v1/properties
 * - Displays them in a responsive grid
 * - Loading state (skeleton cards)
 * - Error state (with retry button)
 * - Empty state (when no properties match)
 * - Shows total count
 *
 * Connected to backend: GET /api/v1/properties
 */

import { useProperties } from '../../hooks/useProperties';
import PropertyCard from '../../components/property/PropertyCard';
import { Loader2, AlertCircle, Home } from 'lucide-react';


export default function PropertiesPage() {

    // ── Fetch Properties ───────────────────────────────────────
    // useProperties handles loading, error, and caching automatically.
    const { data, isLoading, isError, error, refetch } = useProperties();


    return (
        <div className="container-custom" style={{ padding: 'var(--space-3xl) 0' }}>

            {/* ── Page Header ───────────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h1
                    style={{
                        color: 'var(--color-brand-navy)',
                        marginBottom: 'var(--space-xs)',
                    }}
                >
                    Browse Properties
                </h1>
                <p
                    style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-lg)',
                        margin: 0,
                    }}
                >
                    Discover premium properties across Nigeria
                </p>

                {/* Show total count when data is loaded */}
                {data && (
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            marginTop: 'var(--space-md)',
                            margin: 0,
                        }}
                    >
                        <strong style={{ color: 'var(--color-brand-navy)' }}>
                            {data.total}
                        </strong>{' '}
                        {data.total === 1 ? 'property' : 'properties'} found
                    </p>
                )}
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
                        justifyContent: 'center',
                        padding: 'var(--space-5xl) 0',
                        gap: 'var(--space-md)',
                    }}
                >
                    <Loader2
                        size={40}
                        color="var(--color-brand-navy)"
                        style={{ animation: 'spin 1s linear infinite' }}
                    />
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                        Loading properties...
                    </p>
                    {/* Inline animation since we don't have a global keyframes yet */}
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
                        justifyContent: 'center',
                        padding: 'var(--space-5xl) 0',
                        gap: 'var(--space-md)',
                        textAlign: 'center',
                    }}
                >
                    <AlertCircle size={48} color="var(--color-error)" />
                    <h3 style={{ color: 'var(--color-error)', margin: 0 }}>
                        Something went wrong
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                        {error?.message || 'Failed to load properties. Please try again.'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="btn btn-primary"
                        style={{ marginTop: 'var(--space-md)' }}
                    >
                        Try Again
                    </button>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                EMPTY STATE (no properties found)
                ═══════════════════════════════════════════════════ */}
            {data && data.items.length === 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-5xl) 0',
                        gap: 'var(--space-md)',
                        textAlign: 'center',
                    }}
                >
                    <Home size={48} color="var(--color-text-light)" />
                    <h3 style={{ margin: 0 }}>No properties found</h3>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                        Check back soon for new listings.
                    </p>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                PROPERTY GRID (the main event!)
                ═══════════════════════════════════════════════════ */}
            {data && data.items.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 'var(--space-xl)',
                    }}
                >
                    {data.items.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}

        </div>
    );
}