/**
 * PropertyDetailPage
 * ===================
 * Detailed view of a single property listing.
 *
 * Connected to backend: GET /api/v1/properties/{id}
 *
 * Features:
 * - Hero image (or placeholder) with status badge
 * - Full property information (title, price, location, description)
 * - All amenities with checkmarks
 * - Property specs (beds, baths, area, type)
 * - Sticky agent contact card (sidebar)
 * - Back navigation
 * - Loading and error states
 *
 * URL: /properties/:id
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Bed,
    Bath,
    Square,
    MapPin,
    Home,
    Calendar,
    Eye,
    CheckCircle,
    Loader2,
    AlertCircle,
    Mail,
    Phone,
    User,
    ImageIcon,
} from 'lucide-react';

import { useProperty } from '../../hooks/useProperties';
import {
    formatPrice,
    formatArea,
    formatRelativeDate,
    capitalize,
    getAvailabilityStatusInfo,
} from '../../utils/formatters';


export default function PropertyDetailPage() {
    // Get the property ID from the URL (e.g., /properties/abc-123)
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch property data using our React Query hook
    const { data: property, isLoading, isError, error } = useProperty(id);


    // ═══════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════
    if (isLoading) {
        return (
            <div
                className="container-custom"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: 'var(--space-md)',
                }}
            >
                <Loader2
                    size={40}
                    color="var(--color-brand-navy)"
                    style={{ animation: 'spin 1s linear infinite' }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Loading property details...
                </p>
                <style>
                    {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                </style>
            </div>
        );
    }


    // ═══════════════════════════════════════════════════
    // ERROR STATE
    // ═══════════════════════════════════════════════════
    if (isError) {
        return (
            <div
                className="container-custom"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: 'var(--space-md)',
                    textAlign: 'center',
                }}
            >
                <AlertCircle size={48} color="var(--color-error)" />
                <h2 style={{ color: 'var(--color-error)', margin: 0 }}>
                    Property Not Found
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    {error?.response?.status === 404
                        ? 'This property no longer exists or has been removed.'
                        : 'Failed to load property. Please try again.'}
                </p>
                <Link to="/properties" className="btn btn-primary">
                    ← Back to Properties
                </Link>
            </div>
        );
    }


    // ═══════════════════════════════════════════════════
    // SUCCESS STATE — Render Property Details
    // ═══════════════════════════════════════════════════

    const statusInfo = getAvailabilityStatusInfo(property.availability_status);


    return (
        <div className="container-custom" style={{ padding: 'var(--space-2xl) 0' }}>

            {/* ── Back Button ────────────────────────────────── */}
            <button
                onClick={() => navigate('/properties')}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer',
                    padding: 'var(--space-sm) 0',
                    marginBottom: 'var(--space-lg)',
                    transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-brand-navy)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
            >
                <ArrowLeft size={16} />
                Back to Properties
            </button>


            {/* ─────────────────────────────────────────────────
                HERO IMAGE
            ───────────────────────────────────────────────────── */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '500px',
                    background: 'var(--color-bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    marginBottom: 'var(--space-2xl)',
                }}
            >
                {property.images && property.images.length > 0 ? (
                    <img
                        src={property.images[0].image_url}
                        alt={property.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            background: 'linear-gradient(135deg, var(--color-brand-navy-light) 0%, var(--color-bg-surface) 100%)',
                        }}
                    >
                        <ImageIcon
                            size={96}
                            color="var(--color-text-light)"
                            strokeWidth={1}
                        />
                    </div>
                )}

                {/* Status Badge */}
                <span
                    style={{
                        position: 'absolute',
                        top: 'var(--space-lg)',
                        left: 'var(--space-lg)',
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    {statusInfo.label}
                </span>

                {/* Featured Badge */}
                {property.is_featured && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 'var(--space-lg)',
                            right: 'var(--space-lg)',
                            background: 'var(--color-brand-gold)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        ⭐ Featured
                    </span>
                )}
            </div>


            {/* ─────────────────────────────────────────────────
                PROPERTY TITLE + PRICE
            ───────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 'var(--space-lg)',
                        marginBottom: 'var(--space-md)',
                    }}
                >
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h1
                            style={{
                                color: 'var(--color-brand-navy)',
                                margin: 0,
                                marginBottom: 'var(--space-sm)',
                            }}
                        >
                            {property.title}
                        </h1>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)',
                                color: 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-base)',
                            }}
                        >
                            <MapPin size={16} />
                            <span>
                                {property.address}, {property.city}, {property.state}
                            </span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <p
                            style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-brand-navy)',
                                margin: 0,
                                lineHeight: 1,
                            }}
                        >
                            {formatPrice(property.price)}
                        </p>
                        <span
                            style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 'var(--font-weight-medium)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            For {capitalize(property.listing_type)}
                        </span>
                    </div>
                </div>

                {/* Meta Info Bar */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-lg)',
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        paddingTop: 'var(--space-md)',
                        borderTop: '1px solid var(--color-border)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        <span>Listed {formatRelativeDate(property.created_at)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={14} />
                        <span>{property.view_count} view{property.view_count === 1 ? '' : 's'}</span>
                    </div>
                </div>
            </div>


            {/* ─────────────────────────────────────────────────
                TWO-COLUMN LAYOUT: DETAILS + AGENT CARD
            ───────────────────────────────────────────────────── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--space-2xl)',
                }}
                className="property-detail-grid"
            >
                {/* ── LEFT COLUMN: Property Details ──────────── */}
                <div>

                    {/* Key Specs Cards */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: 'var(--space-md)',
                            marginBottom: 'var(--space-2xl)',
                        }}
                    >
                        <SpecCard
                            icon={<Bed size={24} />}
                            value={property.bedrooms}
                            label={property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                        />
                        <SpecCard
                            icon={<Bath size={24} />}
                            value={property.bathrooms}
                            label={property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                        />
                        {property.area_sqft && (
                            <SpecCard
                                icon={<Square size={24} />}
                                value={formatArea(property.area_sqft)}
                                label="Total Area"
                            />
                        )}
                        <SpecCard
                            icon={<Home size={24} />}
                            value={capitalize(property.property_type)}
                            label="Property Type"
                        />
                    </div>


                    {/* Description */}
                    <section style={{ marginBottom: 'var(--space-2xl)' }}>
                        <h2
                            style={{
                                color: 'var(--color-brand-navy)',
                                marginBottom: 'var(--space-md)',
                            }}
                        >
                            Description
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-primary)',
                                lineHeight: 'var(--line-height-normal)',
                                fontSize: 'var(--font-size-base)',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {property.description}
                        </p>
                    </section>


                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                        <section style={{ marginBottom: 'var(--space-2xl)' }}>
                            <h2
                                style={{
                                    color: 'var(--color-brand-navy)',
                                    marginBottom: 'var(--space-md)',
                                }}
                            >
                                Amenities
                            </h2>
                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 'var(--space-md)',
                                }}
                            >
                                {property.amenities.map((amenity, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-sm)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: 'var(--font-size-base)',
                                        }}
                                    >
                                        <CheckCircle size={18} color="var(--color-brand-gold)" />
                                        <span>{amenity}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>


                {/* ── RIGHT COLUMN: Agent Contact Card ───────── */}
                {property.agent && (
                    <aside
                        style={{
                            background: 'white',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-xl)',
                            boxShadow: 'var(--shadow-md)',
                            height: 'fit-content',
                            position: 'sticky',
                            top: 'var(--space-xl)',
                        }}
                    >
                        <h3
                            style={{
                                color: 'var(--color-brand-navy)',
                                marginBottom: 'var(--space-lg)',
                                fontSize: 'var(--font-size-lg)',
                            }}
                        >
                            Listed By
                        </h3>

                        {/* Agent Avatar Placeholder */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                                marginBottom: 'var(--space-lg)',
                                paddingBottom: 'var(--space-lg)',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--color-brand-navy-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-brand-navy)',
                                }}
                            >
                                <User size={28} />
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontWeight: 'var(--font-weight-bold)',
                                        color: 'var(--color-text-primary)',
                                        margin: 0,
                                        fontSize: 'var(--font-size-base)',
                                    }}
                                >
                                    {property.agent.full_name}
                                </p>
                                <p
                                    style={{
                                        color: 'var(--color-brand-gold)',
                                        margin: 0,
                                        fontSize: 'var(--font-size-sm)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: 'var(--font-weight-semibold)',
                                    }}
                                >
                                    Verified Agent
                                </p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-md)',
                                marginBottom: 'var(--space-lg)',
                            }}
                        >
                            <a
                                href={`mailto:${property.agent.email}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-sm)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 'var(--font-size-sm)',
                                    wordBreak: 'break-all',
                                }}
                            >
                                <Mail size={16} color="var(--color-text-secondary)" />
                                {property.agent.email}
                            </a>
                            {property.agent.phone && (
                                <a
                                    href={`tel:${property.agent.phone}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    <Phone size={16} color="var(--color-text-secondary)" />
                                    {property.agent.phone}
                                </a>
                            )}
                        </div>

                        {/* Contact Buttons */}
                        <a
                            href={`mailto:${property.agent.email}?subject=Inquiry about ${property.title}`}
                            className="btn btn-primary"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                width: '100%',
                                marginBottom: 'var(--space-sm)',
                                textDecoration: 'none',
                                color: 'white',
                            }}
                        >
                            Send Email
                        </a>
                        {property.agent.phone && (
                            <a
                                href={`tel:${property.agent.phone}`}
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    width: '100%',
                                    padding: 'var(--space-md)',
                                    background: 'var(--color-brand-gold)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    textDecoration: 'none',
                                    fontSize: 'var(--font-size-base)',
                                }}
                            >
                                Call Now
                            </a>
                        )}
                    </aside>
                )}
            </div>


            {/* ── Inline Media Query For Two-Column Layout ── */}
            <style>{`
                @media (min-width: 1024px) {
                    .property-detail-grid {
                        grid-template-columns: 1fr 380px !important;
                    }
                }
            `}</style>
        </div>
    );
}


// ─────────────────────────────────────────────────────────
// SpecCard — Reusable mini-component for property specs
// ─────────────────────────────────────────────────────────
function SpecCard({ icon, value, label }) {
    return (
        <div
            style={{
                background: 'var(--color-bg-surface)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    color: 'var(--color-brand-navy)',
                    marginBottom: 'var(--space-xs)',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </div>
            <p
                style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                }}
            >
                {value}
            </p>
            <p
                style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}
            >
                {label}
            </p>
        </div>
    );
}