/**
 * CreateListingPage
 * ==================
 * Page for agents to create new property listings.
 *
 * This page is now much smaller because the form logic
 * is extracted into the reusable PropertyForm component.
 *
 * Connected to backend: POST /api/v1/agent/properties
 *
 * Responsibilities:
 * - Render page header + back button
 * - Pass empty form to PropertyForm
 * - Handle create API call
 * - Show success toast and redirect
 */

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

import PropertyForm from '../../components/property/PropertyForm';
import { useCreateProperty } from '../../hooks/useProperties';


export default function CreateListingPage() {
    const navigate = useNavigate();
    const createMutation = useCreateProperty();


    // ── Handle Form Submission ────────────────────────────────
    const handleCreate = async (propertyData) => {
        try {
            await createMutation.mutateAsync(propertyData);

            toast.success(
                'Listing created! It will be reviewed by an admin before going live.',
                { duration: 5000 }
            );
            navigate('/agent/listings');
        } catch (error) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to create listing. Please try again.';
            toast.error(errorMessage);
        }
    };


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
                    Create New Listing
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Fill in the details below. Your listing will be reviewed by an admin before going live.
                </p>
            </div>


            {/* ── The Reusable Form ─────────────────────────── */}
            <PropertyForm
                initialData={null}
                isSubmitting={createMutation.isPending}
                onSubmit={handleCreate}
                onCancel={() => navigate('/agent/listings')}
                submitLabel="Create Listing"
            />
        </div>
    );
}