/**
 * Axios HTTP Client Configuration
 * ================================
 * Pre-configured axios instance for ALL API calls in the app.
 *
 * Features:
 * - Base URL pre-configured from environment variable
 * - Request interceptor: auto-attaches JWT token to every request
 * - Response interceptor: handles common error cases
 *
 * Why a custom instance instead of using axios directly?
 * - Single source of truth for base URL
 * - JWT token attached automatically (no repetition)
 * - Centralized error handling
 * - Easy to add features later (retries, logging, etc.)
 */

import axios from 'axios';


// ── Create The Axios Instance ────────────────────────────────────────────────
//
// All API calls in the app use this instance.
// It's pre-configured with the backend URL and default headers.

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,    // 10 seconds — fail fast on slow networks
});


// ── Request Interceptor ──────────────────────────────────────────────────────
//
// This runs BEFORE every API call goes out.
// It checks if we have a JWT token in localStorage,
// and if so, attaches it to the Authorization header.
//
// This means components NEVER need to manually attach the token.
// Just call apiClient.get() / apiClient.post() — auth is automatic.

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jidex_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// ── Response Interceptor ─────────────────────────────────────────────────────
//
// This runs AFTER every API call returns.
// It can handle errors globally — for example:
// - 401 Unauthorized → token expired, log user out
// - 500 Server Error → show a generic error message
//
// For now we just pass through, but this is where we'd add global handling.

apiClient.interceptors.response.use(
    (response) => {
        // Successful responses pass through unchanged
        return response;
    },
    (error) => {
        // Handle 401 globally — token expired or invalid
        if (error.response?.status === 401) {
            // Clear the bad token
            localStorage.removeItem('jidex_token');
            localStorage.removeItem('jidex_user');

            // Redirect to login (only if not already there)
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);


export default apiClient;