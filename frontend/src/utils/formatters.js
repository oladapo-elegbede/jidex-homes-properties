/**
 * Formatters
 * ===========
 * Utility functions for formatting raw data into human-readable strings.
 *
 * All display formatting lives here — components should NEVER format directly.
 *
 * Why centralize formatting?
 * - Consistency across the entire app
 * - Easy to change (e.g., switch currency, date format)
 * - Easy to test
 * - Easy to localize (multi-language support later)
 */


// ── Currency Formatting ──────────────────────────────────────────────────────

/**
 * Format a price as Nigerian Naira with commas.
 *
 * @param {number|string} price - Raw price value
 * @returns {string} Formatted like "₦75,000,000"
 *
 * Examples:
 *   formatPrice(75000000)     → "₦75,000,000"
 *   formatPrice("250000.50")  → "₦250,001" (rounds for display)
 *   formatPrice(null)         → "Price on request"
 */
export function formatPrice(price) {
    if (price === null || price === undefined || price === '') {
        return 'Price on request';
    }

    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numericPrice)) {
        return 'Price on request';
    }

    // Use Intl.NumberFormat for proper locale formatting
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericPrice);
}


// ── Area Formatting ──────────────────────────────────────────────────────────

/**
 * Format square footage with commas and unit label.
 *
 * @param {number|string} sqft
 * @returns {string} Formatted like "3,500 sqft"
 *
 * Examples:
 *   formatArea(3500)   → "3,500 sqft"
 *   formatArea(null)   → ""
 */
export function formatArea(sqft) {
    if (sqft === null || sqft === undefined || sqft === '') {
        return '';
    }

    const numericSqft = typeof sqft === 'string' ? parseFloat(sqft) : sqft;

    if (isNaN(numericSqft)) {
        return '';
    }

    return new Intl.NumberFormat('en-US').format(numericSqft) + ' sqft';
}


// ── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Format a date as a relative time string ("2 days ago").
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Like "Just now", "5 hours ago", "3 days ago"
 */
export function formatRelativeDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMinutes < 1)  return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24)   return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 30)    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffMonths < 12)  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}


/**
 * Format a date as a long-form readable date.
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Like "January 15, 2026"
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}


// ── Text Helpers ─────────────────────────────────────────────────────────────

/**
 * Capitalize the first letter of a string.
 *
 * @param {string} str
 * @returns {string} Like "Apartment" from "apartment"
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * Truncate text to a max length with ellipsis.
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string} Like "This is a long descrip..." if maxLength is 25
 */
export function truncate(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}


// ── Status Helpers ───────────────────────────────────────────────────────────

/**
 * Get the display label and color for a listing status.
 *
 * @param {string} status - 'pending', 'approved', 'rejected'
 * @returns {Object} { label, color, bgColor }
 */
export function getListingStatusInfo(status) {
    const statusMap = {
        pending: {
            label: 'Pending Review',
            color: 'var(--color-warning)',
            bgColor: 'var(--color-warning-bg)',
        },
        approved: {
            label: 'Approved',
            color: 'var(--color-success)',
            bgColor: 'var(--color-success-bg)',
        },
        rejected: {
            label: 'Rejected',
            color: 'var(--color-error)',
            bgColor: 'var(--color-error-bg)',
        },
    };

    return statusMap[status] || {
        label: capitalize(status),
        color: 'var(--color-text-secondary)',
        bgColor: 'var(--color-bg-surface)',
    };
}


/**
 * Get the display label and color for availability status.
 *
 * @param {string} status - 'available', 'sold', 'rented'
 * @returns {Object} { label, color, bgColor }
 */
export function getAvailabilityStatusInfo(status) {
    const statusMap = {
        available: {
            label: 'Available',
            color: 'var(--color-success)',
            bgColor: 'var(--color-success-bg)',
        },
        sold: {
            label: 'Sold',
            color: 'var(--color-text-secondary)',
            bgColor: 'var(--color-bg-surface)',
        },
        rented: {
            label: 'Rented',
            color: 'var(--color-info)',
            bgColor: 'var(--color-info-bg)',
        },
    };

    return statusMap[status] || {
        label: capitalize(status),
        color: 'var(--color-text-secondary)',
        bgColor: 'var(--color-bg-surface)',
    };
}