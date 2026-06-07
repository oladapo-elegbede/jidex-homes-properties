/**
 * Properties API
 * ===============
 * Wraps all property-related API calls (properties + images).
 *
 * Endpoints covered:
 * - GET    /properties              → Browse properties (public, with filters)
 * - GET    /properties/{id}         → Get property details (public, approved only)
 * - GET    /agent/properties        → List my listings (agent only, any status)
 * - GET    /agent/properties/{id}   → Get one of my listings (agent only, any status)
 * - POST   /agent/properties        → Create a new listing (agent only)
 * - PUT    /agent/properties/{id}   → Update a listing (agent only)
 * - DELETE /agent/properties/{id}   → Delete a listing (agent only)
 *
 * Image endpoints:
 * - POST   /agent/properties/{id}/images                      → Upload image
 * - DELETE /agent/properties/{id}/images/{image_id}           → Delete image
 * - PUT    /agent/properties/{id}/images/{image_id}/primary   → Set as primary
 *
 * All functions return promises (async).
 */

import apiClient from './axios';


export const propertiesApi = {

    /**
     * Browse public properties with optional filters and pagination.
     */
    list: async (filters = {}) => {
        const response = await apiClient.get('/properties', {
            params: filters,
        });
        return response.data;
    },


    /**
     * Get full details of a single property (PUBLIC endpoint).
     * Only works for approved properties.
     * Increments view_count.
     */
    getById: async (propertyId) => {
        const response = await apiClient.get(`/properties/${propertyId}`);
        return response.data;
    },


    /**
     * List the authenticated agent's own properties (any status).
     */
    listMine: async (params = {}) => {
        const response = await apiClient.get('/agent/properties', { params });
        return response.data;
    },


    /**
     * Get one of the agent's own properties by ID (AGENT endpoint).
     * Works for ANY status.
     */
    getMineById: async (propertyId) => {
        const response = await apiClient.get(`/agent/properties/${propertyId}`);
        return response.data;
    },


    /**
     * Create a new property listing.
     */
    create: async (propertyData) => {
        const response = await apiClient.post('/agent/properties', propertyData);
        return response.data;
    },


    /**
     * Update an existing property.
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
     */
    delete: async (propertyId) => {
        await apiClient.delete(`/agent/properties/${propertyId}`);
    },


    // ═══════════════════════════════════════════════════════════════════════
    // IMAGE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Upload an image for a property.
     *
     * Note: Uses FormData (multipart/form-data) because we're uploading a file.
     * This is the standard way browsers send files to a server.
     *
     * @param {string} propertyId - Property UUID
     * @param {File} file - The image file from an <input type="file">
     * @returns {Promise} Newly created PropertyImage record
     */
    uploadImage: async (propertyId, file) => {
        // Create FormData and append the file
        // FormData is a special object for sending files via HTTP
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(
            `/agent/properties/${propertyId}/images`,
            formData,
            {
                headers: {
                    // Important: tell axios this is a file upload, not JSON
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return response.data;
    },


    /**
     * Delete an image from a property.
     * Removes both the file from disk and the database record.
     *
     * @param {string} propertyId - Property UUID
     * @param {string} imageId    - Image UUID
     * @returns {Promise} (No response body — 204 No Content)
     */
    deleteImage: async (propertyId, imageId) => {
        await apiClient.delete(
            `/agent/properties/${propertyId}/images/${imageId}`,
        );
    },


    /**
     * Set an image as the primary (cover) image for a property.
     * Automatically unsets is_primary on all other images.
     *
     * @param {string} propertyId - Property UUID
     * @param {string} imageId    - Image UUID
     * @returns {Promise} Updated PropertyImage record
     */
    setPrimaryImage: async (propertyId, imageId) => {
        const response = await apiClient.put(
            `/agent/properties/${propertyId}/images/${imageId}/primary`,
        );
        return response.data;
    },
}; 