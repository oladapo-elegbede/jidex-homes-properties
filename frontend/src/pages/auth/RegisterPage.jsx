/**
 * Register Page
 * ==============
 * Sign up page for new users.
 *
 * Connected to backend endpoint: POST /api/v1/auth/register
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';


// ── Validation Schema ─────────────────────────────────────────────────────────
const registerSchema = yup.object({
    full_name: yup
        .string()
        .min(2, 'Name must be at least 2 characters.')
        .max(255, 'Name is too long.')
        .required('Full name is required.'),

    email: yup
        .string()
        .email('Please enter a valid email address.')
        .required('Email is required.'),

    phone: yup
        .string()
        .max(20, 'Phone number is too long.')
        .nullable(),

    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .required('Password is required.'),

    confirm_password: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords do not match.')
        .required('Please confirm your password.'),

    role: yup
        .string()
        .oneOf(['user', 'agent'], 'Please select a valid role.')
        .required('Role is required.'),
});


// ── Register Page Component ───────────────────────────────────────────────────
export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            role: 'user',
        },
    });

    // Watch the role value so we can highlight the selected button
    const selectedRole = watch('role');


    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || null,
                password: formData.password,
                role: formData.role,
            };

            const response = await authApi.register(payload);

            login(response.access_token, response.user);

            toast.success(`Welcome to Jidex Homes, ${response.user.full_name}!`);
            navigate('/');
        } catch (error) {
            const errorMessage =
                error.response?.data?.detail ||
                'Registration failed. Please try again.';

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div>
            {/* ── Page Heading ──────────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-2xl)', textAlign: 'center' }}>
                <h2 style={{ marginBottom: 'var(--space-xs)' }}>Create Account</h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Join thousands of property seekers and agents
                </p>
            </div>


            {/* ── Registration Form ─────────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* ── Full Name ────────────────────────────── */}
                <FormField
                    label="Full Name"
                    error={errors.full_name?.message}
                    icon={<User size={18} />}
                >
                    <input
                        type="text"
                        placeholder="Jane Doe"
                        {...register('full_name')}
                        style={inputStyle(errors.full_name)}
                    />
                </FormField>

                {/* ── Email ────────────────────────────────── */}
                <FormField
                    label="Email Address"
                    error={errors.email?.message}
                    icon={<Mail size={18} />}
                >
                    <input
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        style={inputStyle(errors.email)}
                    />
                </FormField>

                {/* ── Phone (Optional) ──────────────────────── */}
                <FormField
                    label="Phone Number (Optional)"
                    error={errors.phone?.message}
                    icon={<Phone size={18} />}
                >
                    <input
                        type="tel"
                        placeholder="+234 800 000 0000"
                        {...register('phone')}
                        style={inputStyle(errors.phone)}
                    />
                </FormField>

                {/* ── Password ─────────────────────────────── */}
                <FormField
                    label="Password"
                    error={errors.password?.message}
                    icon={<Lock size={18} />}
                >
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        {...register('password')}
                        style={{ ...inputStyle(errors.password), paddingRight: '2.75rem' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={eyeButtonStyle}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </FormField>

                {/* ── Confirm Password ─────────────────────── */}
                <FormField
                    label="Confirm Password"
                    error={errors.confirm_password?.message}
                    icon={<Lock size={18} />}
                >
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        {...register('confirm_password')}
                        style={{ ...inputStyle(errors.confirm_password), paddingRight: '2.75rem' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={eyeButtonStyle}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </FormField>

                {/* ── Role Selector ─────────────────────────── */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--space-sm)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        I am registering as
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <RoleButton
                            value="user"
                            label="Property Seeker"
                            isSelected={selectedRole === 'user'}
                            onClick={() => setValue('role', 'user', { shouldValidate: true })}
                        />
                        <RoleButton
                            value="agent"
                            label="Real Estate Agent"
                            isSelected={selectedRole === 'agent'}
                            onClick={() => setValue('role', 'agent', { shouldValidate: true })}
                        />
                    </div>
                    {errors.role && (
                        <p style={errorTextStyle}>{errors.role.message}</p>
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
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>


            {/* ── Footer: Login Link ───────────────────────── */}
            <p
                style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-xl)',
                    marginBottom: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                }}
            >
                Already have an account?{' '}
                <Link
                    to="/login"
                    style={{
                        color: 'var(--color-brand-navy)',
                        fontWeight: 'var(--font-weight-semibold)',
                    }}
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Form Field Wrapper ────────────────────────────────────────────────────────
function FormField({ label, error, icon, children }) {
    return (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label
                style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--space-xs)',
                    color: 'var(--color-text-primary)',
                }}
            >
                {label}
            </label>

            <div style={{ position: 'relative' }}>
                <span
                    style={{
                        position: 'absolute',
                        left: 'var(--space-md)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-light)',
                        display: 'flex',
                        pointerEvents: 'none',
                    }}
                >
                    {icon}
                </span>
                {children}
            </div>

            {error && <p style={errorTextStyle}>{error}</p>}
        </div>
    );
}


// ── Role Button (Properly React-Managed) ─────────────────────────────────────
function RoleButton({ value, label, isSelected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                flex: 1,
                padding: 'var(--space-md)',
                border: `2px solid ${isSelected ? 'var(--color-brand-navy)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                background: isSelected ? 'var(--color-brand-navy-light)' : 'var(--color-bg-primary)',
                color: isSelected ? 'var(--color-brand-navy)' : 'var(--color-text-primary)',
                transition: 'all var(--transition-fast)',
                outline: 'none',
            }}
        >
            {label}
        </button>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════════════

const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
});

const eyeButtonStyle = {
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
};

const errorTextStyle = {
    color: 'var(--color-error)',
    fontSize: 'var(--font-size-sm)',
    marginTop: 'var(--space-xs)',
    marginBottom: 0,
};