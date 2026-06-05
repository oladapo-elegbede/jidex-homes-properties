/**
 * useProperties Hooks
 * ====================
 * React Query hooks for property-related data.
 *
 * Why React Query instead of manual useState/useEffect?
 * - Automatic caching (same query won't refetch unnecessarily)
 * - Built-in loading and error states
 * - Auto-refetch when window regains focus (optional)
 * - Easy invalidation when data changes
 * - DevTools for debugging
 *
 * Naming convention:
 * - useXxx          → hook that fetches data (queries)
 * - useCreateXxx    → hook that mutates data (mutations)
 * - useUpdateXxx    → hook that updates data
 * - useDeleteXxx    → hook that deletes data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../api/propertiesApi';


// ── Query Keys ────────────────────────────────────────────────────────────────
// React Query uses keys to identify cached data.
// Standardizing them prevents typos and makes cache invalidation easy.
//
// Example: invalidating ['properties'] will refresh ALL property queries.
//          invalidating ['properties', 'list', filters] only refreshes that filter.
export const propertyKeys = {
    all: ['properties'],
    lists: () => [...propertyKeys.all, 'list'],
    list: (filters) => [...propertyKeys.lists(), filters],
    details: () => [...propertyKeys.all, 'detail'],
    detail: (id) => [...propertyKeys.details(), id],
    myListings: () => [...propertyKeys.all, 'mine'],
};


// ── Fetch Public Properties List ──────────────────────────────────────────────
/**
 * Hook to fetch the public property listings with optional filters.
 *
 * @param {Object} filters - { page, limit, city, min_price, etc. }
 * @returns {Object} { data, isLoading, isError, error, refetch }
 *
 * Usage:
 *   const { data, isLoading } = useProperties({ city: 'Lagos' });
 *   if (isLoading) return <Spinner />;
 *   return data.items.map(prop => <Card key={prop.id} {...prop} />);
 */
export function useProperties(filters = {}) {
    return useQuery({
        queryKey: propertyKeys.list(filters),
        queryFn: () => propertiesApi.list(filters),
    });
}


// ── Fetch Single Property Details ─────────────────────────────────────────────
/**
 * Hook to fetch one property's full details by ID.
 *
 * @param {string} propertyId - Property UUID
 * @param {Object} options - React Query options (enabled, etc.)
 * @returns {Object} { data, isLoading, isError, error }
 */
export function useProperty(propertyId, options = {}) {
    return useQuery({
        queryKey: propertyKeys.detail(propertyId),
        queryFn: () => propertiesApi.getById(propertyId),
        enabled: !!propertyId,    // Don't fetch if no ID provided
        ...options,
    });
}


// ── Fetch Agent's Own Listings ────────────────────────────────────────────────
/**
 * Hook to fetch the authenticated agent's listings.
 * Requires the user to be logged in as an agent.
 *
 * @param {Object} params - { page, limit }
 * @returns {Object} React Query result
 */
export function useMyProperties(params = {}) {
    return useQuery({
        queryKey: [...propertyKeys.myListings(), params],
        queryFn: () => propertiesApi.listMine(params),
    });
}


// ── Create Property (Mutation) ────────────────────────────────────────────────
/**
 * Hook for creating a new property listing.
 *
 * Usage:
 *   const { mutate, isPending } = useCreateProperty();
 *   mutate(formData, {
 *     onSuccess: (newProperty) => { ... },
 *     onError: (error) => { ... },
 *   });
 */
export function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (propertyData) => propertiesApi.create(propertyData),
        onSuccess: () => {
            // Invalidate all property queries so the lists refresh
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
        },
    });
}


// ── Update Property (Mutation) ────────────────────────────────────────────────
/**
 * Hook for updating an existing property.
 */
export function useUpdateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ propertyId, updates }) =>
            propertiesApi.update(propertyId, updates),
        onSuccess: (updatedProperty) => {
            // Invalidate the specific property and the lists
            queryClient.invalidateQueries({
                queryKey: propertyKeys.detail(updatedProperty.id),
            });
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
        },
    });
}


// ── Delete Property (Mutation) ────────────────────────────────────────────────
/**
 * Hook for deleting a property.
 */
export function useDeleteProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (propertyId) => propertiesApi.delete(propertyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
        },
    });
}