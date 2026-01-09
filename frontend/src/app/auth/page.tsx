'use client';

import React, { useState, useEffect, use } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/lib/services';
import { useToast } from '@/store/use-toast';
import { validateEmail, validatePassword } from '@/lib/utils/validators';
import './auth.css';

export default function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
    const resolvedSearchParams = use(searchParams);
    const router = useRouter();
    const { login, register, loading } = useAuthStore();
    const { addToast } = useToast();
    const [isActive, setIsActive] = useState(resolvedSearchParams?.mode === 'register');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    // Forgot Password state
    const [isForgot, setIsForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    // Password visibility state
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Cooldown state
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email: loginEmail, password: loginPassword });
            addToast('Login successful!', 'success');
            router.push('/dashboard');
        } catch (error: any) {
            addToast(error.response?.data?.detail || 'Login failed', 'error');
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (regPassword !== regConfirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await register({ name: regName, email: regEmail, password: regPassword });

            // If the backend didn't return tokens, it means verification is required
            if (!useAuthStore.getState().isAuthenticated) {
                router.push('/auth/verify-request');
                return;
            }
            addToast('Account created!', 'success');
            router.push('/dashboard');
        } catch (error: any) {
            addToast(error.response?.data?.detail || 'Registration failed', 'error');
        }
    };


    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cooldown > 0) return;

        try {
            await authService.requestPasswordReset({ email: forgotEmail });
            addToast('If an account exists, a reset link has been sent.', 'success');
            setCooldown(60);
        } catch (error: any) {
            if (error.response?.status === 429) {
                addToast(error.response?.data?.detail || 'Please wait before requesting again.', 'error');
                setCooldown(60); // Sync cooldown if backend says too many requests
            } else {
                addToast(error.response?.data?.detail || 'Request failed', 'error');
            }
        }
    };

    return (
        <div className="auth-page">
            <div className={`container ${isActive ? 'active' : ''}`}>
                {/* Curved Shapes */}
                <div className="curved-shape"></div>
                <div className="curved-shape2"></div>

                {/* Login Form */}
                <div className="form-box Login">
                    {!isForgot ? (
                        <>
                            <h2 className="animation" style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>
                                Login
                            </h2>
                            <form onSubmit={handleLoginSubmit}>
                                <div className="input-box animation" style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
                                    <label>Business Email</label>
                                    <Mail className="icon" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="name@company.com"
                                    />
                                </div>

                                <div className="input-box animation" style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
                                    <label>Security Key</label>
                                    <Lock className="icon" size={20} />
                                    <input
                                        type={showLoginPassword ? "text" : "password"}
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-btn"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    >
                                        {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <div className="animation text-right mt-2" style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
                                    <a
                                        onClick={() => setIsForgot(true)}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>

                                <div className="input-box animation" style={{ '--D': 4, '--S': 25 } as React.CSSProperties}>
                                    <button className="btn" type="submit" disabled={loading}>
                                        {loading ? 'Authorizing...' : 'Authorize Access'}
                                    </button>
                                </div>

                                <div className="regi-link animation" style={{ '--D': 5, '--S': 26 } as React.CSSProperties}>
                                    <p>
                                        Don&apos;t have an account? <br />
                                        <a onClick={() => setIsActive(true)}>Sign Up</a>
                                    </p>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="animation" style={{ '--D': 0, '--S': 21 } as React.CSSProperties}>
                                Reset Password
                            </h2>
                            <form onSubmit={handleForgotSubmit}>
                                <div className="input-box animation" style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
                                    <label>Registered Email</label>
                                    <Mail className="icon" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="name@company.com"
                                    />
                                </div>

                                <div className="input-box animation" style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
                                    <button
                                        className="btn"
                                        type="submit"
                                        disabled={loading || cooldown > 0}
                                        style={cooldown > 0 ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                    >
                                        {loading ? 'Sending...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send Reset Link'}
                                    </button>
                                </div>

                                <div className="regi-link animation" style={{ '--D': 3, '--S': 24 } as React.CSSProperties}>
                                    <p>
                                        Remembered your password? <br />
                                        <a onClick={() => setIsForgot(false)}>Back to Login</a>
                                    </p>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                {/* Login Info Content */}
                <div className="info-content Login">
                    <h2 className="animation" style={{ '--D': 0, '--S': 20 } as React.CSSProperties}>
                        WELCOME<br />BACK!
                    </h2>
                    <p className="animation" style={{ '--D': 1, '--S': 21 } as React.CSSProperties}>
                        We are happy to have you with us again. If you need anything, we are here to help.
                    </p>
                </div>

                {/* Register Form */}
                <div className="form-box Register">
                    <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
                        Register
                    </h2>
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="input-box animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
                            <label>Full Name</label>
                            <User className="icon" size={20} />
                            <input
                                type="text"
                                required
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div className="input-box animation" style={{ '--li': 19, '--S': 2 } as React.CSSProperties}>
                            <label>Business Email</label>
                            <Mail className="icon" size={20} />
                            <input
                                type="email"
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="input-box animation" style={{ '--li': 19, '--S': 3 } as React.CSSProperties}>
                            <label>Security Key</label>
                            <Lock className="icon" size={20} />
                            <input
                                type={showRegPassword ? "text" : "password"}
                                required
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="Min 8 chars"
                            />
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                            >
                                {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="input-box animation" style={{ '--li': 20, '--S': 4 } as React.CSSProperties}>
                            <label>Confirm Key</label>
                            <Lock className="icon" size={20} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="input-box animation" style={{ '--li': 21, '--S': 5 } as React.CSSProperties}>
                            <button className="btn" type="submit" disabled={loading}>
                                {loading ? 'Initializing...' : 'Register'}
                            </button>
                        </div>

                        <div className="regi-link animation" style={{ '--li': 22, '--S': 6 } as React.CSSProperties}>
                            <p>
                                Already have an account? <br />
                                <a onClick={() => setIsActive(false)}>Sign In</a>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Register Info Content */}
                <div className="info-content Register">
                    <h2 className="animation" style={{ '--li': 17, '--S': 0 } as React.CSSProperties}>
                        WELCOME!
                    </h2>
                    <p className="animation" style={{ '--li': 18, '--S': 1 } as React.CSSProperties}>
                        We&apos;re delighted to have you here. If you need any assistance, feel free to reach out.
                    </p>
                </div>
            </div>
        </div>
    );
}
