/**
 * Auth Context
 * =============
 * Provides global authentication state to the entire app.
 *
 * Manages:
 * - The currently logged-in user (or null if not logged in)
 * - Login/logout actions
 * - Loading state during initial auth check
 *
 * On app startup:
 * - Checks localStorage for a saved JWT token
 * - If found, verifies it by calling /auth/me
 * - If valid, sets the user as logged in
 * - If invalid, clears the bad token
 *
 * Components use this via the useAuth() hook:
 *   const { user, login, logout, isLoading } = useAuth();
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';


// ── Create The Context ────────────────────────────────────────────────────────
// This is the actual context object. Components access it via useContext.
// We export it so the useAuth hook can use it.
export const AuthContext = createContext(null);


// ── Storage Keys ──────────────────────────────────────────────────────────────
// Centralized constants so we don't hardcode strings everywhere.
const TOKEN_STORAGE_KEY = 'jidex_token';
const USER_STORAGE_KEY = 'jidex_user';


// ── Provider Component ────────────────────────────────────────────────────────
// Wraps the entire app in main.jsx so all components have access to auth state.
export function AuthProvider({ children }) {

    // ── State ────────────────────────────────────────────────
    // user: the logged-in user's profile (or null if not logged in)
    // isLoading: true during initial auth check on startup
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    // ── On Startup: Verify Existing Token ────────────────────
    //
    // When the app first loads, check localStorage for a saved token.
    // If we find one, verify it's still valid by calling /auth/me.
    // This handles the case where a user refreshes the page after logging in.
    useEffect(() => {
        const verifyExistingSession = async () => {
            const token = localStorage.getItem(TOKEN_STORAGE_KEY);

            if (!token) {
                // No token saved — user is not logged in
                setIsLoading(false);
                return;
            }

            try {
                // Token exists. Verify it's still valid.
                const currentUser = await authApi.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                // Token is invalid/expired. Clear it.
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyExistingSession();
    }, []);


    // ── Login Action ─────────────────────────────────────────
    //
    // Called by the LoginPage after a successful login API call.
    // Saves the token and user to localStorage AND to state.
    //
    // useCallback memoizes this function so it doesn't change
    // on every render (better performance).
    const login = useCallback((token, userData) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
    }, []);


    // ── Logout Action ────────────────────────────────────────
    //
    // Clears the token and user from both localStorage and state.
    // Called by the logout button or after token expiry.
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
    }, []);


    // ── Computed Values ──────────────────────────────────────
    // Derived from state. Saves components from doing this calculation.
    const isAuthenticated = user !== null;
    const isAdmin = user?.role === 'admin';
    const isAgent = user?.role === 'agent' || user?.role === 'admin';


    // ── Context Value ────────────────────────────────────────
    // This object is what useAuth() returns to components.
    const value = {
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isAgent,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}