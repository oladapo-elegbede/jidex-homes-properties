/**
 * ImageUploader Component
 * ========================
 * Manages property image uploads, display, and operations.
 *
 * Used by EditListingPage to let agents:
 * - Upload new images (click-to-upload)
 * - Preview existing images in a grid
 * - Mark an image as primary (cover)
 * - Delete images
 *
 * Props:
 * - propertyId: The property UUID (required for API calls)
 * - images: Array of PropertyImage objects (current images)
 * - maxImages: Maximum allowed images (default 10)
 *
 * Features:
 * - File validation (type, size) before upload
 * - Primary image gets a gold star badge
 * - Confirmation before delete
 * - Loading spinners during operations
 * - Toast notifications for feedback
 */

import { useRef, useState } from 'react';
import {
    Upload,
    Star,
    Trash2,
    Loader2,
    ImageIcon,
    AlertCircle,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
    useUploadPropertyImage,
    useDeletePropertyImage,
    useSetPrimaryImage,
} from '../../hooks/useProperties';
import { buildImageUrl } from '../../utils/formatters';


// ── Configuration ────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/webp';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


export default function ImageUploader({ propertyId, images = [], maxImages = 10 }) {
    const fileInputRef = useRef(null);
    const [imageToDelete, setImageToDelete] = useState(null);

    const uploadMutation = useUploadPropertyImage();
    const deleteMutation = useDeletePropertyImage();
    const setPrimaryMutation = useSetPrimaryImage();


    // ── Handle File Selection ─────────────────────────────────
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input so the same file can be selected again later
        event.target.value = '';

        // Client-side validation (before sending to server)
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Please select a JPEG, PNG, or WebP image.');
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            toast.error(`File too large (${sizeMB}MB). Max ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        // Check max images limit
        if (images.length >= maxImages) {
            toast.error(`Maximum ${maxImages} images per property reached.`);
            return;
        }

        // Upload to backend
        try {
            await uploadMutation.mutateAsync({ propertyId, file });
            toast.success('Image uploaded successfully!');
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                'Failed to upload image. Please try again.';
            toast.error(errorMessage);
        }
    };


    // ── Handle Set As Primary ─────────────────────────────────
    const handleSetPrimary = async (imageId) => {
        try {
            await setPrimaryMutation.mutateAsync({ propertyId, imageId });
            toast.success('Primary image updated.');
        } catch (err) {
            toast.error('Failed to set primary image.');
        }
    };


    // ── Handle Delete Confirmation ────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!imageToDelete) return;

        try {
            await deleteMutation.mutateAsync({
                propertyId,
                imageId: imageToDelete.id,
            });
            toast.success('Image deleted.');
            setImageToDelete(null);
        } catch (err) {
            toast.error('Failed to delete image.');
        }
    };


    // ── Trigger File Input Click ──────────────────────────────
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };


    const canUploadMore = images.length < maxImages;


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
            {/* ── Section Header ─────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-lg)',
                    paddingBottom: 'var(--space-sm)',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                <h3 style={{ color: 'var(--color-brand-navy)', margin: 0 }}>
                    Property Images
                </h3>
                <span
                    style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 'var(--font-weight-medium)',
                    }}
                >
                    {images.length} / {maxImages}
                </span>
            </div>


            {/* ── Upload Button ──────────────────────────────── */}
            {canUploadMore && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <button
                        type="button"
                        onClick={triggerFileSelect}
                        disabled={uploadMutation.isPending}
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-sm)',
                            padding: 'var(--space-2xl)',
                            background: 'var(--color-bg-surface)',
                            border: '2px dashed var(--color-border-strong)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: uploadMutation.isPending ? 'not-allowed' : 'pointer',
                            transition: 'all var(--transition-fast)',
                            color: 'var(--color-text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                            if (!uploadMutation.isPending) {
                                e.currentTarget.style.borderColor = 'var(--color-brand-navy)';
                                e.currentTarget.style.background = 'var(--color-brand-navy-light)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                            e.currentTarget.style.background = 'var(--color-bg-surface)';
                        }}
                    >
                        {uploadMutation.isPending ? (
                            <>
                                <Loader2
                                    size={32}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />
                                <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                    Uploading...
                                </span>
                                <style>
                                    {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                                </style>
                            </>
                        ) : (
                            <>
                                <Upload size={32} />
                                <span
                                    style={{
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    Click to upload an image
                                </span>
                                <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                    JPEG, PNG, or WebP · Max {MAX_FILE_SIZE_MB}MB
                                </span>
                            </>
                        )}
                    </button>
                </div>
            )}


            {/* ── Max Limit Reached Message ──────────────────── */}
            {!canUploadMore && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-md) var(--space-lg)',
                        background: 'var(--color-warning-bg)',
                        border: '1px solid var(--color-warning)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)',
                        color: 'var(--color-warning)',
                        fontSize: 'var(--font-size-sm)',
                    }}
                >
                    <AlertCircle size={18} />
                    <span>
                        Maximum {maxImages} images reached. Delete some to upload more.
                    </span>
                </div>
            )}


            {/* ── Empty State ────────────────────────────────── */}
            {images.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: 'var(--space-2xl) 0',
                        color: 'var(--color-text-light)',
                    }}
                >
                    <ImageIcon size={48} style={{ margin: '0 auto var(--space-sm)' }} />
                    <p style={{ margin: 0 }}>No images yet. Upload your first one above!</p>
                </div>
            )}


            {/* ── Image Grid ─────────────────────────────────── */}
            {images.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 'var(--space-md)',
                    }}
                >
                    {images.map((image) => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            onSetPrimary={() => handleSetPrimary(image.id)}
                            onDelete={() => setImageToDelete(image)}
                            isUpdating={setPrimaryMutation.isPending}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))}
                </div>
            )}


            {/* ── Delete Confirmation Modal ──────────────────── */}
            {imageToDelete && (
                <DeleteImageModal
                    image={imageToDelete}
                    isDeleting={deleteMutation.isPending}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setImageToDelete(null)}
                />
            )}
        </section>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Single Image Card ─────────────────────────────────────────────────────────
function ImageCard({ image, onSetPrimary, onDelete, isUpdating, isDeleting }) {
    return (
        <div
            style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '4/3',
                background: 'var(--color-bg-surface)',
                border: image.is_primary
                    ? '3px solid var(--color-brand-gold)'
                    : '1px solid var(--color-border)',
            }}
        >
            {/* Image */}
            <img
                src={buildImageUrl(image.image_url)}
                alt="Property"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
            />

            {/* Primary Badge */}
            {image.is_primary && (
                <span
                    style={{
                        position: 'absolute',
                        top: 'var(--space-xs)',
                        left: 'var(--space-xs)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'var(--color-brand-gold)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-bold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    <Star size={10} fill="currentColor" />
                    Primary
                </span>
            )}

            {/* Action Buttons Overlay */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 'var(--space-xs)',
                    right: 'var(--space-xs)',
                    display: 'flex',
                    gap: '0.25rem',
                }}
            >
                {/* Set As Primary Button (hidden if already primary) */}
                {!image.is_primary && (
                    <button
                        type="button"
                        onClick={onSetPrimary}
                        disabled={isUpdating}
                        title="Set as primary image"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            color: 'var(--color-brand-gold)',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            if (!isUpdating) {
                                e.currentTarget.style.background = 'var(--color-brand-gold)';
                                e.currentTarget.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.currentTarget.style.color = 'var(--color-brand-gold)';
                        }}
                    >
                        <Star size={16} />
                    </button>
                )}

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    title="Delete image"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        color: 'var(--color-error)',
                        transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        if (!isDeleting) {
                            e.currentTarget.style.background = 'var(--color-error)';
                            e.currentTarget.style.color = 'white';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.currentTarget.style.color = 'var(--color-error)';
                    }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}


// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteImageModal({ image, isDeleting, onConfirm, onCancel }) {
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
                        background: 'var(--color-error-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-lg)',
                    }}
                >
                    <Trash2 size={28} color="var(--color-error)" />
                </div>

                <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                    Delete Image?
                </h3>

                <p
                    style={{
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-lg)',
                    }}
                >
                    This image will be permanently deleted. This action cannot be undone.
                </p>

                {/* Preview the image being deleted */}
                <div
                    style={{
                        marginBottom: 'var(--space-lg)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        background: 'var(--color-bg-surface)',
                    }}
                >
                    <img
                        src={buildImageUrl(image.image_url)}
                        alt="To be deleted"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
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