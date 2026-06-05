/**
 * PropertyCard Component
 * =======================
 * Beautiful card displaying a property in list/grid views.
 *
 * Features:
 * - Premium card design with hover effect
 * - Image with overlay status badge
 * - Placeholder image when no photo available
 * - Truncated title (two lines)
 * - Formatted price + listing type
 * - Location with pin icon
 * - Beds/Baths/Area icons row
 * - Entire card is clickable (navigates to detail page)
 *
 * Props:
 * - property: Property object from API
 */

import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin, ImageIcon } from 'lucide-react';

import {
    formatPrice,
    formatArea,
    capitalize,
    getAvailabilityStatusInfo,
    buildImageUrl,
} from '../../utils/formatters';


export default function PropertyCard({ property }) {

    // Get availability status display info (color, label, etc.)
    const statusInfo = getAvailabilityStatusInfo(property.availability_status);

    // Build full image URL (handles relative paths from backend)
    const imageUrl = buildImageUrl(property.primary_image_url);


    return (
        <Link
            to={`/properties/${property.id}`}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
            }}
        >
            <article
                className="property-card"
                style={{
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--color-border)',
                    transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
            >
                {/* ── Image Area ─────────────────────────────────── */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '220px',
                        background: 'var(--color-bg-surface)',
                        overflow: 'hidden',
                    }}
                >
                    {imageUrl ? (
                        // Real image when available
                        <img
                            src={imageUrl}
                            alt={property.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        // Placeholder when no image
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
                                size={48}
                                color="var(--color-text-light)"
                                strokeWidth={1.5}
                            />
                        </div>
                    )}

                    {/* ── Availability Status Badge ──────────────── */}
                    <span
                        style={{
                            position: 'absolute',
                            top: 'var(--space-md)',
                            left: 'var(--space-md)',
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

                    {/* ── Featured Badge ───────────────────────────── */}
                    {property.is_featured && (
                        <span
                            style={{
                                position: 'absolute',
                                top: 'var(--space-md)',
                                right: 'var(--space-md)',
                                background: 'var(--color-brand-gold)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 'var(--font-weight-semibold)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            ⭐ Featured
                        </span>
                    )}
                </div>

                {/* ── Card Body ──────────────────────────────────── */}
                <div
                    style={{
                        padding: 'var(--space-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        flex: 1,
                    }}
                >
                    {/* Price + Listing Type Row */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <p
                            style={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-brand-navy)',
                                margin: 0,
                            }}
                        >
                            {formatPrice(property.price)}
                        </p>
                        <span
                            style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 'var(--font-weight-medium)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            For {capitalize(property.listing_type)}
                        </span>
                    </div>

                    {/* Title */}
                    <h3
                        style={{
                            fontSize: 'var(--font-size-lg)',
                            color: 'var(--color-text-primary)',
                            margin: 0,
                            lineHeight: 'var(--line-height-snug)',
                            // Limit to 2 lines with ellipsis
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {property.title}
                    </h3>

                    {/* Location */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        <MapPin size={14} />
                        <span>
                            {property.city}, {property.state}
                        </span>
                    </div>

                    {/* Specs Row (Beds, Baths, Area) */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 'var(--space-lg)',
                            paddingTop: 'var(--space-md)',
                            borderTop: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            marginTop: 'auto',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Bed size={16} />
                            <span>{property.bedrooms} Bed{property.bedrooms === 1 ? '' : 's'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Bath size={16} />
                            <span>{property.bathrooms} Bath{property.bathrooms === 1 ? '' : 's'}</span>
                        </div>
                        {property.area_sqft && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Square size={16} />
                                <span>{formatArea(property.area_sqft)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}