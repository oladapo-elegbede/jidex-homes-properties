/**
 * useProperties Hooks
 * ====================
 * React Query hooks for property-related data and operations.
 *
 * Naming convention:
 * - useXxx          → fetches data (queries)
 * - useCreateXxx    → creates data (mutations)
 * - useUpdateXxx    → updates data (mutations)
 * - useDeleteXxx    → deletes data (mutations)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../api/propertiesApi';


// ── Query Keys ────────────────────────────────────────────────────────────────
export const propertyKeys = {
    all: ['properties'],
    lists: () => [...propertyKeys.all, 'list'],
    list: (filters) => [...propertyKeys.lists(), filters],
    details: () => [...propertyKeys.all, 'detail'],
    detail: (id) => [...propertyKeys.details(), id],
    myListings: () => [...propertyKeys.all, 'mine'],
    myListing: (id) => [...propertyKeys.all, 'mine', id],
};


// ── Fetch Public Properties List ──────────────────────────────────────────────
export function useProperties(filters = {}) {
    return useQuery({
        queryKey: propertyKeys.list(filters),
        queryFn: () => propertiesApi.list(filters),
    });
}


// ── Fetch Single Public Property ──────────────────────────────────────────────
export function useProperty(propertyId, options = {}) {
    return useQuery({
        queryKey: propertyKeys.detail(propertyId),
        queryFn: () => propertiesApi.getById(propertyId),
        enabled: !!propertyId,
        ...options,
    });
}


// ── Fetch One Of Agent's Own Properties ───────────────────────────────────────
export function useMyProperty(propertyId, options = {}) {
    return useQuery({
        queryKey: propertyKeys.myListing(propertyId),
        queryFn: () => propertiesApi.getMineById(propertyId),
        enabled: !!propertyId,
        ...options,
    });
}


// ── Fetch Agent's Own Listings (List) ─────────────────────────────────────────
export function useMyProperties(params = {}) {
    return useQuery({
        queryKey: [...propertyKeys.myListings(), params],
        queryFn: () => propertiesApi.listMine(params),
    });
}


// ── Create Property (Mutation) ────────────────────────────────────────────────
export function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (propertyData) => propertiesApi.create(propertyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
        },
    });
}


// ── Update Property (Mutation) ────────────────────────────────────────────────
export function useUpdateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ propertyId, updates }) =>
            propertiesApi.update(propertyId, updates),
        onSuccess: (updatedProperty) => {
            queryClient.invalidateQueries({
                queryKey: propertyKeys.detail(updatedProperty.id),
            });
            queryClient.invalidateQueries({
                queryKey: propertyKeys.myListing(updatedProperty.id),
            });
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: propertyKeys.myListings() });
        },
    });
}


// ── Delete Property (Mutation) ────────────────────────────────────────────────
export function useDeleteProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (propertyId) => propertiesApi.delete(propertyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
        },
    });
}


// ═══════════════════════════════════════════════════════════════════════════
// IMAGE MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

// ── Upload Property Image ─────────────────────────────────────────────────────
/**
 * Hook for uploading an image to a property.
 *
 * Usage:
 *   const { mutate, isPending } = useUploadPropertyImage();
 *   mutate({ propertyId: '...', file: fileObject });
 */
export function useUploadPropertyImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ propertyId, file }) =>
            propertiesApi.uploadImage(propertyId, file),
        onSuccess: (newImage, variables) => {
            // Invalidate the property detail (both agent + public versions)
            // so the new image appears immediately
            queryClient.invalidateQueries({
                queryKey: propertyKeys.myListing(variables.propertyId),
            });
            queryClient.invalidateQueries({
                queryKey: propertyKeys.detail(variables.propertyId),
            });
            // Also invalidate lists (primary image might change)
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: propertyKeys.myListings() });
        },
    });
}


// ── Delete Property Image ─────────────────────────────────────────────────────
/**
 * Hook for deleting an image from a property.
 *
 * Usage:
 *   const { mutate, isPending } = useDeletePropertyImage();
 *   mutate({ propertyId: '...', imageId: '...' });
 */
export function useDeletePropertyImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ propertyId, imageId }) =>
            propertiesApi.deleteImage(propertyId, imageId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: propertyKeys.myListing(variables.propertyId),
            });
            queryClient.invalidateQueries({
                queryKey: propertyKeys.detail(variables.propertyId),
            });
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: propertyKeys.myListings() });
        },
    });
}


// ── Set Primary Image ─────────────────────────────────────────────────────────
/**
 * Hook for marking an image as the primary (cover) image.
 *
 * Usage:
 *   const { mutate, isPending } = useSetPrimaryImage();
 *   mutate({ propertyId: '...', imageId: '...' });
 */
export function useSetPrimaryImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ propertyId, imageId }) =>
            propertiesApi.setPrimaryImage(propertyId, imageId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: propertyKeys.myListing(variables.propertyId),
            });
            queryClient.invalidateQueries({
                queryKey: propertyKeys.detail(variables.propertyId),
            });
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: propertyKeys.myListings() });
        },
    });
}