/**
 * Authentication API
 * ===================
 * Wraps all authentication-related API calls in clean, named functions.
 *
 * Why wrap API calls in functions?
 * - Components don't need to know URLs or HTTP methods
 * - Easy to change the API (just update this one file)
 * - Easy to test (mock these functions)
 * - Easy to add features (logging, transforms, etc.)
 *
 * All functions return promises (async).
 * Components use them like:
 *   const data = await authApi.login({ email, password });
 */

import apiClient from './axios';


export const authApi = {

    /**
     * Register a new user account.
     *
     * @param {Object} userData
     * @param {string} userData.full_name
     * @param {string} userData.email
     * @param {string} userData.phone (optional)
     * @param {string} userData.password
     * @param {string} userData.role - "user" or "agent"
     *
     * @returns {Promise} { access_token, token_type, user }
     */
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },


    /**
     * Login with email and password.
     *
     * @param {Object} credentials
     * @param {string} credentials.email
     * @param {string} credentials.password
     *
     * @returns {Promise} { access_token, token_type, user }
     */
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },


    /**
     * Get the currently authenticated user's profile.
     * Token is automatically attached by axios interceptor.
     *
     * @returns {Promise} { id, full_name, email, role, ... }
     */
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};