/**
 * Properties API
 * ===============
 * Wraps all property-related API calls.
 *
 * Endpoints covered:
 * - GET  /properties              → Browse properties (public, with filters)
 * - GET  /properties/{id}         → Get property details
 * - GET  /agent/properties        → List my listings (agent only)
 * - POST /agent/properties        → Create a new listing (agent only)
 * - PUT  /agent/properties/{id}   → Update a listing (agent only)
 * - DEL  /agent/properties/{id}   → Delete a listing (agent only)
 *
 * All functions return promises (async).
 */

import apiClient from './axios';


export const propertiesApi = {

    /**
     * Browse public properties with optional filters and pagination.
     *
     * @param {Object} filters
     * @param {number} filters.page          - Page number (default 1)
     * @param {number} filters.limit         - Items per page (default 12)
     * @param {string} filters.city          - Filter by city
     * @param {number} filters.min_price     - Minimum price
     * @param {number} filters.max_price     - Maximum price
     * @param {string} filters.property_type - apartment, house, villa, etc.
     * @param {string} filters.listing_type  - 'sale' or 'rent'
     * @param {number} filters.bedrooms      - Minimum bedrooms
     * @param {number} filters.bathrooms     - Minimum bathrooms
     * @param {string} filters.sort_by       - created_at, price, bedrooms, area_sqft
     * @param {string} filters.sort_order    - 'asc' or 'desc'
     *
     * @returns {Promise} { items, total, page, limit, pages, has_next, has_prev }
     */
    list: async (filters = {}) => {
        const response = await apiClient.get('/properties', {
            params: filters,
        });
        return response.data;
    },


    /**
     * Get full details of a single property.
     * Increments view_count as a side effect.
     *
     * @param {string} propertyId - Property UUID
     * @returns {Promise} Full property object with images and agent info
     */
    getById: async (propertyId) => {
        const response = await apiClient.get(`/properties/${propertyId}`);
        return response.data;
    },


    /**
     * List the authenticated agent's own properties.
     * Requires agent role.
     *
     * @param {Object} params - { page, limit }
     * @returns {Promise} Paginated list of agent's properties
     */
    listMine: async (params = {}) => {
        const response = await apiClient.get('/agent/properties', { params });
        return response.data;
    },


    /**
     * Create a new property listing.
     * Requires agent role. agent_id is set from JWT automatically.
     *
     * @param {Object} propertyData - Full property data
     * @returns {Promise} Newly created property
     */
    create: async (propertyData) => {
        const response = await apiClient.post('/agent/properties', propertyData);
        return response.data;
    },


    /**
     * Update an existing property.
     * Requires agent role + ownership.
     *
     * @param {string} propertyId
     * @param {Object} updates - Partial property data
     * @returns {Promise} Updated property
     */
    update: async (propertyId, updates) => {
        const response = await apiClient.put(
            `/agent/properties/${propertyId}`,
            updates,
        );
        return response.data;
    },


    /**
     * Delete a property.
     * Requires agent role + ownership.
     *
     * @param {string} propertyId
     * @returns {Promise} (No response body — 204 No Content)
     */
    delete: async (propertyId) => {
        await apiClient.delete(`/agent/properties/${propertyId}`);
    },
};