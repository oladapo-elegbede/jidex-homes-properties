/**
 * Login Page
 * ===========
 * Authentication page for existing users.
 *
 * Features:
 * - Form managed by React Hook Form (no manual useState for each field)
 * - Validation via Yup schema
 * - Calls /api/v1/auth/login on submit
 * - Saves token + user to AuthContext on success
 * - Shows loading state during API call
 * - Toast notifications for success/error
 * - Redirects to home page after login
 *
 * Connected to backend endpoint: POST /api/v1/auth/login
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';


// ── Validation Schema ─────────────────────────────────────────────────────────
// Yup validates the form data BEFORE it reaches the API.
// This gives users instant feedback without waiting for the server.
const loginSchema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email address.')
        .required('Email is required.'),

    password: yup
        .string()
        .min(1, 'Password is required.')
        .required('Password is required.'),
});


// ── Login Page Component ──────────────────────────────────────────────────────
export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Toggle password visibility (eye icon)
    const [showPassword, setShowPassword] = useState(false);

    // Track loading state during API call
    const [isSubmitting, setIsSubmitting] = useState(false);


    // ── React Hook Form Setup ────────────────────────────────
    // Manages form state, validation, and submission.
    // The resolver connects Yup validation to the form.
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });


    // ── Form Submission Handler ──────────────────────────────
    // Called when user clicks Sign In and validation passes.
    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            // Call the backend login endpoint
            const response = await authApi.login({
                email: formData.email,
                password: formData.password,
            });

            // Save token + user to AuthContext (and localStorage)
            login(response.access_token, response.user);

            // Show success toast
            toast.success(`Welcome back, ${response.user.full_name}!`);

            // Redirect to home page
            navigate('/');
        } catch (error) {
            // Handle API errors
            const errorMessage =
                error.response?.data?.detail ||
                'Login failed. Please check your credentials and try again.';

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div>
            {/* ── Page Heading ──────────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
                <h2 style={{ marginBottom: 'var(--space-xs)' }}>Welcome Back</h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Sign in to your account to continue
                </p>
            </div>

            {/* ── Login Form ────────────────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* ── Email Field ───────────────────────────── */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <label
                        htmlFor="email"
                        style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--space-xs)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Email Address
                    </label>

                    <div style={{ position: 'relative' }}>
                        <Mail
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 'var(--space-md)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-light)',
                            }}
                        />
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            {...register('email')}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                border: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-body)',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)',
                            }}
                        />
                    </div>

                    {errors.email && (
                        <p
                            style={{
                                color: 'var(--color-error)',
                                fontSize: 'var(--font-size-sm)',
                                marginTop: 'var(--space-xs)',
                                marginBottom: 0,
                            }}
                        >
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* ── Password Field ────────────────────────── */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <label
                        htmlFor="password"
                        style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--space-xs)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Password
                    </label>

                    <div style={{ position: 'relative' }}>
                        <Lock
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 'var(--space-md)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-light)',
                            }}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Enter your password"
                            {...register('password')}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                                border: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-body)',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)',
                            }}
                        />

                        {/* Eye toggle to show/hide password */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: 'var(--space-md)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-text-light)',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {errors.password && (
                        <p
                            style={{
                                color: 'var(--color-error)',
                                fontSize: 'var(--font-size-sm)',
                                marginTop: 'var(--space-xs)',
                                marginBottom: 0,
                            }}
                        >
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* ── Submit Button ─────────────────────────── */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        padding: 'var(--space-md) var(--space-xl)',
                        background: isSubmitting
                            ? 'var(--color-text-light)'
                            : 'var(--color-brand-navy)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'background var(--transition-fast)',
                    }}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            {/* ── Footer: Register Link ────────────────────── */}
            <p
                style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-xl)',
                    marginBottom: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                }}
            >
                Don't have an account?{' '}
                <Link
                    to="/register"
                    style={{
                        color: 'var(--color-brand-navy)',
                        fontWeight: 'var(--font-weight-semibold)',
                    }}
                >
                    Create one
                </Link>
            </p>
        </div>
    );
}