/**
 * PropertyForm Component
 * ========================
 * Reusable form for creating and editing properties.
 *
 * Used by:
 * - CreateListingPage (initialData = null, mode='create')
 * - EditListingPage (initialData = property, mode='edit')
 *
 * Props:
 * - initialData: existing property to edit (or null for new)
 * - isSubmitting: loading state from parent
 * - onSubmit: callback function that receives the form data
 * - submitLabel: text for the submit button (e.g., "Create" or "Save Changes")
 * - onCancel: callback when cancel is clicked
 *
 * The parent component handles:
 * - The API call (create vs update)
 * - Navigation after success
 * - Toast notifications
 *
 * This component focuses ONLY on the form UI and validation.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Plus } from 'lucide-react';


// ── Constants ─────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
    'apartment', 'house', 'villa', 'duplex',
    'studio', 'office', 'land', 'commercial',
];

const LISTING_TYPES = ['sale', 'rent'];

const COMMON_AMENITIES = [
    'Swimming Pool', 'Gym', 'Parking', 'Security', 'Generator',
    'Solar Panels', 'Garden', 'Balcony', 'Air Conditioning',
    'Furnished', 'Pet Friendly', 'CCTV', 'Elevator', 'Water Heater',
];


// ── Validation Schema ─────────────────────────────────────────────────────────
const propertySchema = yup.object({
    title: yup.string()
        .min(10, 'Title must be at least 10 characters.')
        .max(255, 'Title is too long.')
        .required('Title is required.'),

    description: yup.string()
        .min(50, 'Description must be at least 50 characters.')
        .required('Description is required.'),

    price: yup.number()
        .typeError('Price must be a number.')
        .positive('Price must be greater than 0.')
        .required('Price is required.'),

    property_type: yup.string()
        .oneOf(PROPERTY_TYPES, 'Invalid property type.')
        .required('Property type is required.'),

    listing_type: yup.string()
        .oneOf(LISTING_TYPES, 'Must be sale or rent.')
        .required('Listing type is required.'),

    bedrooms: yup.number()
        .typeError('Bedrooms must be a number.')
        .integer('Must be a whole number.')
        .min(0, 'Cannot be negative.')
        .max(50, 'Too many bedrooms.')
        .required('Bedrooms is required.'),

    bathrooms: yup.number()
        .typeError('Bathrooms must be a number.')
        .integer('Must be a whole number.')
        .min(0, 'Cannot be negative.')
        .max(50, 'Too many bathrooms.')
        .required('Bathrooms is required.'),

    area_sqft: yup.number()
        .typeError('Area must be a number.')
        .positive('Area must be greater than 0.')
        .nullable()
        .transform((val, original) => original === '' ? null : val),

    address: yup.string()
        .min(5, 'Address is too short.')
        .max(500, 'Address is too long.')
        .required('Address is required.'),

    city: yup.string()
        .min(2, 'City is too short.')
        .required('City is required.'),

    state: yup.string()
        .min(2, 'State is too short.')
        .required('State is required.'),

    country: yup.string()
        .required('Country is required.'),

    latitude: yup.number()
        .typeError('Latitude must be a number.')
        .min(-90, 'Invalid latitude.')
        .max(90, 'Invalid latitude.')
        .nullable()
        .transform((val, original) => original === '' ? null : val),

    longitude: yup.number()
        .typeError('Longitude must be a number.')
        .min(-180, 'Invalid longitude.')
        .max(180, 'Invalid longitude.')
        .nullable()
        .transform((val, original) => original === '' ? null : val),
});


// ── Component ─────────────────────────────────────────────────────────────────
export default function PropertyForm({
    initialData = null,
    isSubmitting = false,
    onSubmit,
    submitLabel = 'Save',
    onCancel,
}) {

    // Amenities state (managed separately from React Hook Form)
    const [selectedAmenities, setSelectedAmenities] = useState(
        initialData?.amenities || []
    );
    const [customAmenity, setCustomAmenity] = useState('');


    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(propertySchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            property_type: '',
            listing_type: 'sale',
            bedrooms: 1,
            bathrooms: 1,
            area_sqft: '',
            address: '',
            city: '',
            state: '',
            country: 'Nigeria',
            latitude: '',
            longitude: '',
        },
    });


    // ── Populate Form When Initial Data Loads (Edit Mode) ────
    // useEffect runs when initialData changes (e.g., when fetched from API)
    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title || '',
                description: initialData.description || '',
                price: initialData.price || '',
                property_type: initialData.property_type || '',
                listing_type: initialData.listing_type || 'sale',
                bedrooms: initialData.bedrooms ?? 0,
                bathrooms: initialData.bathrooms ?? 0,
                area_sqft: initialData.area_sqft || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                country: initialData.country || 'Nigeria',
                latitude: initialData.latitude || '',
                longitude: initialData.longitude || '',
            });
            setSelectedAmenities(initialData.amenities || []);
        }
    }, [initialData, reset]);


    // ── Amenities Handlers ────────────────────────────────────
    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const addCustomAmenity = () => {
        const trimmed = customAmenity.trim();
        if (trimmed && !selectedAmenities.includes(trimmed)) {
            setSelectedAmenities([...selectedAmenities, trimmed]);
            setCustomAmenity('');
        }
    };

    const removeAmenity = (amenity) => {
        setSelectedAmenities((prev) => prev.filter((a) => a !== amenity));
    };


    // ── Form Submission Handler ───────────────────────────────
    const handleFormSubmit = (formData) => {
        // Build the payload with amenities merged in
        const payload = {
            ...formData,
            amenities: selectedAmenities,
            area_sqft: formData.area_sqft || null,
            latitude: formData.latitude || null,
            longitude: formData.longitude || null,
        };

        // Pass to parent component for API call
        onSubmit(payload);
    };


    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>

            {/* ═══════════════════════════════════════════════════
                SECTION: Basic Information
                ═══════════════════════════════════════════════════ */}
            <Section title="Basic Information">

                <Field label="Property Title" error={errors.title?.message}>
                    <input
                        type="text"
                        placeholder="e.g., Luxurious 4-Bedroom Duplex in Lekki Phase 1"
                        {...register('title')}
                        style={inputStyle(errors.title)}
                    />
                </Field>

                <Field label="Description" error={errors.description?.message}>
                    <textarea
                        rows={5}
                        placeholder="Describe the property in detail..."
                        {...register('description')}
                        style={{
                            ...inputStyle(errors.description),
                            resize: 'vertical',
                            fontFamily: 'var(--font-body)',
                        }}
                    />
                </Field>

                <Row>
                    <Field label="Listing Type" error={errors.listing_type?.message}>
                        <select
                            {...register('listing_type')}
                            style={inputStyle(errors.listing_type)}
                        >
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                        </select>
                    </Field>

                    <Field label="Property Type" error={errors.property_type?.message}>
                        <select
                            {...register('property_type')}
                            style={inputStyle(errors.property_type)}
                        >
                            <option value="">Select type...</option>
                            {PROPERTY_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </Field>
                </Row>

                <Field label="Price (NGN)" error={errors.price?.message}>
                    <input
                        type="number"
                        step="1000"
                        placeholder="75000000"
                        {...register('price')}
                        style={inputStyle(errors.price)}
                    />
                </Field>
            </Section>


            {/* ═══════════════════════════════════════════════════
                SECTION: Property Details
                ═══════════════════════════════════════════════════ */}
            <Section title="Property Details">
                <Row>
                    <Field label="Bedrooms" error={errors.bedrooms?.message}>
                        <input
                            type="number"
                            min="0"
                            {...register('bedrooms')}
                            style={inputStyle(errors.bedrooms)}
                        />
                    </Field>

                    <Field label="Bathrooms" error={errors.bathrooms?.message}>
                        <input
                            type="number"
                            min="0"
                            {...register('bathrooms')}
                            style={inputStyle(errors.bathrooms)}
                        />
                    </Field>

                    <Field label="Area (sqft) — Optional" error={errors.area_sqft?.message}>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="3500"
                            {...register('area_sqft')}
                            style={inputStyle(errors.area_sqft)}
                        />
                    </Field>
                </Row>
            </Section>


            {/* ═══════════════════════════════════════════════════
                SECTION: Location
                ═══════════════════════════════════════════════════ */}
            <Section title="Location">

                <Field label="Street Address" error={errors.address?.message}>
                    <input
                        type="text"
                        placeholder="e.g., 15 Admiralty Way, Lekki Phase 1"
                        {...register('address')}
                        style={inputStyle(errors.address)}
                    />
                </Field>

                <Row>
                    <Field label="City" error={errors.city?.message}>
                        <input
                            type="text"
                            placeholder="e.g., Lagos"
                            {...register('city')}
                            style={inputStyle(errors.city)}
                        />
                    </Field>

                    <Field label="State" error={errors.state?.message}>
                        <input
                            type="text"
                            placeholder="e.g., Lagos"
                            {...register('state')}
                            style={inputStyle(errors.state)}
                        />
                    </Field>

                    <Field label="Country" error={errors.country?.message}>
                        <input
                            type="text"
                            {...register('country')}
                            style={inputStyle(errors.country)}
                        />
                    </Field>
                </Row>

                <Row>
                    <Field label="Latitude — Optional" error={errors.latitude?.message}>
                        <input
                            type="number"
                            step="any"
                            placeholder="e.g., 6.4474"
                            {...register('latitude')}
                            style={inputStyle(errors.latitude)}
                        />
                    </Field>

                    <Field label="Longitude — Optional" error={errors.longitude?.message}>
                        <input
                            type="number"
                            step="any"
                            placeholder="e.g., 3.4548"
                            {...register('longitude')}
                            style={inputStyle(errors.longitude)}
                        />
                    </Field>
                </Row>
            </Section>


            {/* ═══════════════════════════════════════════════════
                SECTION: Amenities
                ═══════════════════════════════════════════════════ */}
            <Section title="Amenities">
                <p
                    style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-md)',
                    }}
                >
                    Click to select amenities, or add custom ones below.
                </p>

                {/* Selected Amenities (Chips) */}
                {selectedAmenities.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--space-xs)',
                            marginBottom: 'var(--space-md)',
                            padding: 'var(--space-md)',
                            background: 'var(--color-bg-surface)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        {selectedAmenities.map((amenity) => (
                            <span
                                key={amenity}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    background: 'var(--color-brand-navy)',
                                    color: 'white',
                                    padding: '0.25rem 0.5rem 0.25rem 0.75rem',
                                    borderRadius: 'var(--radius-pill)',
                                    fontSize: 'var(--font-size-sm)',
                                }}
                            >
                                {amenity}
                                <button
                                    type="button"
                                    onClick={() => removeAmenity(amenity)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        padding: 0,
                                        marginLeft: '0.25rem',
                                    }}
                                    aria-label={`Remove ${amenity}`}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Common Amenities Buttons */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-xs)',
                        marginBottom: 'var(--space-md)',
                    }}
                >
                    {COMMON_AMENITIES.map((amenity) => {
                        const isSelected = selectedAmenities.includes(amenity);
                        return (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: isSelected
                                        ? 'var(--color-brand-navy-light)'
                                        : 'white',
                                    border: `1px solid ${isSelected
                                        ? 'var(--color-brand-navy)'
                                        : 'var(--color-border)'}`,
                                    color: isSelected
                                        ? 'var(--color-brand-navy)'
                                        : 'var(--color-text-primary)',
                                    borderRadius: 'var(--radius-pill)',
                                    fontSize: 'var(--font-size-sm)',
                                    cursor: 'pointer',
                                    fontWeight: isSelected
                                        ? 'var(--font-weight-semibold)'
                                        : 'var(--font-weight-medium)',
                                    transition: 'all var(--transition-fast)',
                                }}
                            >
                                {amenity}
                            </button>
                        );
                    })}
                </div>

                {/* Custom Amenity Input */}
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    <input
                        type="text"
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomAmenity();
                            }
                        }}
                        placeholder="Add custom amenity..."
                        style={{
                            ...inputStyle(false),
                            flex: 1,
                        }}
                    />
                    <button
                        type="button"
                        onClick={addCustomAmenity}
                        style={{
                            padding: 'var(--space-md) var(--space-lg)',
                            background: 'var(--color-brand-gold)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: 'var(--font-weight-semibold)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </Section>


            {/* ── Submit Buttons ────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    justifyContent: 'flex-end',
                    marginTop: 'var(--space-2xl)',
                    paddingTop: 'var(--space-xl)',
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    style={{
                        padding: 'var(--space-md) var(--space-xl)',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontWeight: 'var(--font-weight-semibold)',
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{
                        padding: 'var(--space-md) var(--space-2xl)',
                    }}
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS (same as before)
// ═══════════════════════════════════════════════════════════════════════════

function Section({ title, children }) {
    return (
        <section
            style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-xl)',
                marginBottom: 'var(--space-lg)',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            <h3
                style={{
                    color: 'var(--color-brand-navy)',
                    marginBottom: 'var(--space-lg)',
                    paddingBottom: 'var(--space-sm)',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                {title}
            </h3>
            {children}
        </section>
    );
}

function Field({ label, error, children }) {
    return (
        <div style={{ marginBottom: 'var(--space-lg)', flex: 1 }}>
            <label
                style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--space-xs)',
                    color: 'var(--color-text-primary)',
                }}
            >
                {label}
            </label>
            {children}
            {error && (
                <p
                    style={{
                        color: 'var(--color-error)',
                        fontSize: 'var(--font-size-sm)',
                        marginTop: 'var(--space-xs)',
                        marginBottom: 0,
                    }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}

function Row({ children }) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 'var(--space-md)',
                flexWrap: 'wrap',
            }}
        >
            {children}
        </div>
    );
}

const inputStyle = (hasError) => ({
    width: '100%',
    padding: 'var(--space-md)',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
    background: 'white',
});