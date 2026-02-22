import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

export default function Login({ setAuthToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/login`, {
                username,
                password,
            });
            localStorage.setItem('adminToken', res.data.token);
            setAuthToken(res.data.token);
        } catch (err) {
            setError('Invalid credentials. Access denied.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-root">
            {/* Animated background blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            {/* Grid overlay */}
            <div className="grid-overlay" />

            <div className={`login-wrapper ${mounted ? 'login-mounted' : ''}`}>
                {/* Logo / Branding */}
                <div className="login-brand">
                    <div className="brand-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="10" fill="url(#grad1)" />
                            <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="grad1" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div>
                        <h1 className="brand-title">RGPV Admin</h1>
                        <p className="brand-subtitle">Resource Management Portal</p>
                    </div>
                </div>

                {/* Card */}
                <div className="login-card">
                    <div className="login-card-header">
                        <h2 className="login-heading">Welcome back</h2>
                        <p className="login-subheading">Sign in to access the admin dashboard</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="error-banner">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
                        {/* Username field */}
                        <div className="field-group">
                            <label className="field-label" htmlFor="username">Username</label>
                            <div className="field-wrapper">
                                <span className="field-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    className="field-input"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="field-group">
                            <label className="field-label" htmlFor="password">Password</label>
                            <div className="field-wrapper">
                                <span className="field-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="field-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className={`login-btn ${isLoading ? 'login-btn-loading' : ''}`}
                            disabled={isLoading}
                            id="login-submit-btn"
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    Authenticating…
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Access Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    {/* Hint */}
                    <div className="login-hint">
                        <span className="hint-badge">Demo credentials</span>
                        <code className="hint-code">admin&nbsp;/&nbsp;admin123</code>
                    </div>
                </div>

                {/* Footer */}
                <p className="login-footer">
                    © {new Date().getFullYear()} RGPV Admin Panel &nbsp;·&nbsp; Secure Access Only
                </p>
            </div>

            <style>{`
                /* ---------- RESET & BASE ---------- */
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    background: #060b18;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                }

                /* ---------- ANIMATED BG BLOBS ---------- */
                .blob {
                    position: absolute;
                    border-radius: 9999px;
                    filter: blur(80px);
                    opacity: 0.25;
                    animation: blobFloat 8s ease-in-out infinite;
                }
                .blob-1 {
                    width: 540px; height: 540px;
                    background: radial-gradient(circle, #3b82f6, #6366f1);
                    top: -180px; left: -140px;
                    animation-delay: 0s;
                }
                .blob-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #8b5cf6, #ec4899);
                    bottom: -120px; right: -100px;
                    animation-delay: -3s;
                }
                .blob-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #06b6d4, #3b82f6);
                    bottom: 60px; left: 30%;
                    animation-delay: -5.5s;
                }
                @keyframes blobFloat {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }

                /* ---------- GRID OVERLAY ---------- */
                .grid-overlay {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
                    background-size: 48px 48px;
                    pointer-events: none;
                }

                /* ---------- WRAPPER / ENTRY ANIMATION ---------- */
                .login-wrapper {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 440px;
                    padding: 24px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    opacity: 0;
                    transform: translateY(28px);
                    transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1);
                }
                .login-wrapper.login-mounted {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* ---------- BRANDING ---------- */
                .login-brand {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .brand-icon {
                    flex-shrink: 0;
                    filter: drop-shadow(0 0 16px rgba(99,102,241,0.6));
                }
                .brand-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    background: linear-gradient(135deg, #93c5fd, #a5b4fc, #e879f9);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1.1;
                }
                .brand-subtitle {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    margin-top: 2px;
                }

                /* ---------- CARD ---------- */
                .login-card {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.75);
                    border: 1px solid rgba(99,102,241,0.2);
                    border-radius: 24px;
                    padding: 36px 32px;
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.04) inset,
                        0 24px 64px rgba(0,0,0,0.5),
                        0 0 80px rgba(99,102,241,0.08);
                }

                /* ---------- CARD HEADER ---------- */
                .login-card-header { margin-bottom: 28px; }
                .login-heading {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                }
                .login-subheading {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin-top: 6px;
                    font-weight: 400;
                }

                /* ---------- ERROR ---------- */
                .error-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.25);
                    color: #f87171;
                    font-size: 0.825rem;
                    font-weight: 500;
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin-bottom: 20px;
                    animation: errorSlide 0.3s ease;
                }
                @keyframes errorSlide {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ---------- FORM ---------- */
                .login-form { display: flex; flex-direction: column; gap: 20px; }

                .field-group { display: flex; flex-direction: column; gap: 8px; }
                .field-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                }
                .field-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .field-icon {
                    position: absolute;
                    left: 14px;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                    transition: color 0.2s;
                }
                .field-input {
                    width: 100%;
                    background: rgba(15,23,42,0.8);
                    border: 1.5px solid rgba(71,85,105,0.4);
                    border-radius: 12px;
                    padding: 13px 44px 13px 44px;
                    color: #e2e8f0;
                    font-size: 0.9375rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                }
                .field-input::placeholder { color: #334155; }
                .field-input:focus {
                    border-color: #6366f1;
                    background: rgba(15,23,42,1);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.08);
                }
                .field-input:focus ~ .field-icon,
                .field-wrapper:focus-within .field-icon { color: #818cf8; }

                .toggle-password {
                    position: absolute;
                    right: 14px;
                    background: none;
                    border: none;
                    color: #475569;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    border-radius: 6px;
                    transition: color 0.2s;
                }
                .toggle-password:hover { color: #818cf8; }

                /* ---------- SUBMIT BUTTON ---------- */
                .login-btn {
                    margin-top: 4px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    font-family: inherit;
                    letter-spacing: 0.01em;
                    cursor: pointer;
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%);
                    color: white;
                    box-shadow: 0 4px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    position: relative;
                    overflow: hidden;
                }
                .login-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
                    border-radius: inherit;
                }
                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(99,102,241,0.55), 0 0 0 1px rgba(255,255,255,0.1) inset;
                }
                .login-btn:active:not(:disabled) { transform: translateY(0); }
                .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                /* ---------- SPINNER ---------- */
                .spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    flex-shrink: 0;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }



                /* ---------- FOOTER ---------- */
                .login-footer {
                    font-size: 0.75rem;
                    color: #334155;
                    text-align: center;
                    font-weight: 400;
                }

                /* ---------- RESPONSIVE ---------- */
                @media (max-width: 480px) {
                    .login-card { padding: 28px 22px; border-radius: 18px; }
                    .login-heading { font-size: 1.5rem; }
                    .blob-1 { width: 320px; height: 320px; }
                    .blob-2 { width: 260px; height: 260px; }
                }
            `}</style>
        </div>
    );
}
