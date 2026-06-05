/**
 * useAuth Hook
 * =============
 * Custom hook for accessing auth state and actions.
 *
 * Why a custom hook instead of just useContext?
 * - Cleaner usage: useAuth() vs useContext(AuthContext)
 * - Built-in error if used outside AuthProvider
 * - Easier to change implementation later
 *
 * Usage in any component:
 *   const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error(
            'useAuth must be used within an AuthProvider. ' +
            'Wrap your app with <AuthProvider> in main.jsx.'
        );
    }

    return context;
}