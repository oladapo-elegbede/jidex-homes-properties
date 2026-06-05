/**
 * EditListingPage
 * ================
 * Page for agents to edit existing property listings.
 *
 * Now includes the ImageUploader for managing property photos!
 *
 * Connected to backend:
 * - GET /api/v1/agent/properties/{id}  → fetch current data
 * - PUT /api/v1/agent/properties/{id}  → update
 * - POST/DELETE/PUT for image operations (handled by ImageUploader)
 */

import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

import PropertyForm from '../../components/property/PropertyForm';
import ImageUploader from '../../components/property/ImageUploader';
import { useMyProperty, useUpdateProperty } from '../../hooks/useProperties';


export default function EditListingPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch the existing property (agent endpoint — works for any status)
    const { data: property, isLoading, isError, error } = useMyProperty(id);

    // Update mutation
    const updateMutation = useUpdateProperty();


    // ── Handle Form Submission ────────────────────────────────
    const handleUpdate = async (formData) => {
        try {
            await updateMutation.mutateAsync({
                propertyId: id,
                updates: formData,
            });

            toast.success('Listing updated successfully!');
            navigate('/agent/listings');
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                'Failed to update listing. Please try again.';
            toast.error(errorMessage);
        }
    };


    // ── Loading State ────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    gap: 'var(--space-md)',
                }}
            >
                <Loader2
                    size={40}
                    color="var(--color-brand-navy)"
                    style={{ animation: 'spin 1s linear infinite' }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Loading property...
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
                    padding: 'var(--space-3xl) 0',
                    gap: 'var(--space-md)',
                    textAlign: 'center',
                }}
            >
                <AlertCircle size={48} color="var(--color-error)" />
                <h3 style={{ color: 'var(--color-error)', margin: 0 }}>
                    Failed to load property
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    {error?.response?.data?.detail ||
                        'This property may not exist or you do not have access to it.'}
                </p>
                <button
                    onClick={() => navigate('/agent/listings')}
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--space-md)' }}
                >
                    Back to Listings
                </button>
            </div>
        );
    }


    // ── Success — Render Form With Pre-Filled Data ──────────
    return (
        <div style={{ maxWidth: '900px' }}>

            {/* ── Back Button ───────────────────────────────── */}
            <button
                onClick={() => navigate('/agent/listings')}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    padding: 'var(--space-sm) 0',
                    marginBottom: 'var(--space-lg)',
                }}
            >
                <ArrowLeft size={16} />
                Back to Listings
            </button>


            {/* ── Page Header ───────────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h1 style={{ color: 'var(--color-brand-navy)', marginBottom: 'var(--space-xs)' }}>
                    Edit Listing
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Update the details of "{property.title}".
                </p>
            </div>


            {/* ── IMAGE UPLOADER (NEW!) ─────────────────────── */}
            <ImageUploader
                propertyId={id}
                images={property.images || []}
                maxImages={10}
            />


            {/* ── The Reusable Form (Pre-Filled!) ──────────── */}
            <PropertyForm
                initialData={property}
                isSubmitting={updateMutation.isPending}
                onSubmit={handleUpdate}
                onCancel={() => navigate('/agent/listings')}
                submitLabel="Save Changes"
            />
        </div>
    );
}