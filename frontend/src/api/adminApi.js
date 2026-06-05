/**
 * Admin API
 * ==========
 * Wraps all admin-only API calls.
 *
 * Endpoints covered:
 * - GET  /admin/dashboard                       → Dashboard stats
 * - GET  /admin/users                            → List all users (paginated)
 * - PUT  /admin/users/{id}                       → Activate/deactivate user
 * - GET  /admin/properties                       → List all properties (any status)
 * - PUT  /admin/properties/{id}/approval         → Approve/reject a property
 *
 * All endpoints require admin role on the backend.
 */

import apiClient from './axios';


export const adminApi = {

    /**
     * Get platform-wide statistics for the admin dashboard.
     *
     * @returns {Promise} {
     *   total_users, total_agents, total_admins, active_users,
     *   total_properties, pending_properties, approved_properties,
     *   rejected_properties, total_inquiries
     * }
     */
    getDashboardStats: async () => {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    },


    /**
     * List all users on the platform (paginated).
     *
     * @param {Object} params - { page, limit }
     * @returns {Promise} Paginated list of users
     */
    listUsers: async (params = {}) => {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    },


    /**
     * Activate or deactivate a user account.
     *
     * @param {string} userId - User UUID
     * @param {boolean} isActive - True to activate, False to deactivate
     * @returns {Promise} Updated user object
     */
    updateUserActivation: async (userId, isActive) => {
        const response = await apiClient.put(`/admin/users/${userId}`, {
            is_active: isActive,
        });
        return response.data;
    },


    /**
     * List all properties on the platform (any status).
     * Useful for admin review queues.
     *
     * @param {Object} params - { page, limit, listing_status }
     *   listing_status can be 'pending', 'approved', or 'rejected'
     * @returns {Promise} Paginated list of properties
     */
    listProperties: async (params = {}) => {
        const response = await apiClient.get('/admin/properties', { params });
        return response.data;
    },


    /**
     * Approve or reject a property listing.
     *
     * @param {string} propertyId - Property UUID
     * @param {Object} approvalData
     * @param {string} approvalData.listing_status - 'approved' or 'rejected'
     * @param {string} approvalData.rejection_reason - Required if rejecting
     * @returns {Promise} Updated property object
     */
    reviewProperty: async (propertyId, approvalData) => {
        const response = await apiClient.put(
            `/admin/properties/${propertyId}/approval`,
            approvalData,
        );
        return response.data;
    },
};