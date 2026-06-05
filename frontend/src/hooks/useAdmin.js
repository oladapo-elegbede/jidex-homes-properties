/**
 * useAdmin Hooks
 * ===============
 * React Query hooks for admin-only operations.
 *
 * All hooks require the user to be logged in as an admin
 * (enforced by the backend, not the frontend).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';


// ── Query Keys ────────────────────────────────────────────────────────────────
export const adminKeys = {
    all: ['admin'],
    dashboard: () => [...adminKeys.all, 'dashboard'],
    users: () => [...adminKeys.all, 'users'],
    usersList: (params) => [...adminKeys.users(), params],
    properties: () => [...adminKeys.all, 'properties'],
    propertiesList: (params) => [...adminKeys.properties(), params],
};


// ── Fetch Dashboard Stats ────────────────────────────────────────────────────
/**
 * Hook to fetch admin dashboard statistics.
 *
 * @returns {Object} { data, isLoading, isError, error }
 *
 * Data shape:
 *   total_users, total_agents, total_admins, active_users,
 *   total_properties, pending_properties, approved_properties,
 *   rejected_properties, total_inquiries
 */
export function useAdminDashboard() {
    return useQuery({
        queryKey: adminKeys.dashboard(),
        queryFn: () => adminApi.getDashboardStats(),
    });
}


// ── Fetch All Users (Paginated) ──────────────────────────────────────────────
/**
 * Hook to fetch all platform users.
 *
 * @param {Object} params - { page, limit }
 * @returns {Object} React Query result with paginated users
 */
export function useAdminUsers(params = {}) {
    return useQuery({
        queryKey: adminKeys.usersList(params),
        queryFn: () => adminApi.listUsers(params),
    });
}


// ── Fetch All Properties (Paginated, Any Status) ─────────────────────────────
/**
 * Hook to fetch all properties for admin review.
 *
 * @param {Object} params - { page, limit, listing_status }
 * @returns {Object} React Query result with paginated properties
 */
export function useAdminProperties(params = {}) {
    return useQuery({
        queryKey: adminKeys.propertiesList(params),
        queryFn: () => adminApi.listProperties(params),
    });
}


// ── Update User Activation (Mutation) ────────────────────────────────────────
/**
 * Hook for activating or deactivating a user.
 *
 * Usage:
 *   const { mutate, isPending } = useUpdateUserActivation();
 *   mutate({ userId: '...', isActive: false });
 */
export function useUpdateUserActivation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, isActive }) =>
            adminApi.updateUserActivation(userId, isActive),
        onSuccess: () => {
            // Invalidate users list AND dashboard (active count changes)
            queryClient.invalidateQueries({ queryKey: adminKeys.users() });
            queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
    });
}


// ── Review Property (Approve/Reject) ─────────────────────────────────────────
/**
 * Hook for approving or rejecting a property listing.
 *
 * Usage:
 *   const { mutate, isPending } = useReviewProperty();
 *
 *   // Approve:
 *   mutate({ propertyId: '...', approvalData: { listing_status: 'approved' } });
 *
 *   // Reject:
 *   mutate({
 *     propertyId: '...',
 *     approvalData: {
 *       listing_status: 'rejected',
 *       rejection_reason: 'Missing photos'
 *     }
 *   });
 */
export function useReviewProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ propertyId, approvalData }) =>
            adminApi.reviewProperty(propertyId, approvalData),
        onSuccess: () => {
            // Invalidate ALL property-related queries (admin + public)
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() });
            queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
}