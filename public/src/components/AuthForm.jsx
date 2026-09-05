import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import './auth-form.css';

export function AuthForm({ onForgotPassword }) {
	const [usingSignIn, setSignIn] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);

	const { user, setUser } = useAuth();
	const navigate = useNavigate();

	if (user) return <Navigate to="/auctions" replace />;

    function onAuthSuccess(user) {
        setUser(user);
        navigate('/auctions');
    }

    async function handleSignIn(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${CONFIG.API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Something went wrong');
                return;
            }
            const user = await res.json();
            onAuthSuccess(user);
        } catch (err) {
            setError(err || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${CONFIG.API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Something went wrong');
                return;
            }
            const user = await res.json();
            onAuthSuccess(user);
        } catch (err) {
            setError(err || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }

	return (
		<div className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={`auth-tab ${usingSignIn ? 'active' : ''}`}
                            onClick={() => setSignIn(true)}
                        >
                            Sign in
                        </button>
                        <button
                            type="button"
                            className={`auth-tab ${!usingSignIn ? 'active' : ''}`}
                            onClick={() => setSignIn(false)}
                        >
                            Register
                        </button>
                        <div
                            className="auth-tab-indicator"
                            style={{ transform: usingSignIn ? 'translateX(0)' : 'translateX(100%)' }}
                            aria-hidden="true"
                        ></div>
                    </div>
                    {usingSignIn ? (
                        <form className="auth-form" autoComplete="off" onSubmit={handleSignIn}>
                            <h1>Welcome back</h1>
                            <p>Sign in to place your bids.</p>
                            <label className="field">
                                <span>Username</span>
                                <span className="input-wrap">
                                    <i
                                        className="fa-solid fa-user input-icon"
                                        aria-hidden="true"
                                    ></i>
                                    <input key="username" type="text" name="username" placeholder="Enter your username" />
                                </span>
                            </label>
                            <label className="field">
                                <span>Password</span>
                                <span className="input-wrap">
                                    <i className="fa-solid fa-lock input-icon" aria-hidden="true"></i>
                                    <input key="password" type="password" name="password" placeholder="••••••••" />
                                </span>
                            </label>
                            <div className="auth-row">
                                <label className="auth-checkbox">
                                    <input type="checkbox" name="remember" />
                                    <span>Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    className="link"
                                    onClick={onForgotPassword}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            {error && <p className="error-text">{error}</p>}
                            <button type="submit" className="submit" disabled={submitting}>
                                {submitting ? 'Signing in…' : 'Sign in'}
                            </button>
                            <p className="auth-switch-line">
                                New here?{' '}
                                <button
                                    type="button"
                                    className="link"
                                    onClick={() => setSignIn(false)}
                                >
                                    Register to bid
                                </button>
                            </p>
                        </form>
                    ) : (
                        <form className="auth-form" autoComplete="off" onSubmit={handleRegister}>
                            <h1>Register to bid</h1>
                            <p>Create an account to enter the room.</p>
                            <label className="field">
                                <span>Username</span>
                                <span className="input-wrap">
                                    <i className="fa-solid fa-user input-icon" aria-hidden="true"></i>
                                    <input key="username" type="text" name="username" placeholder="Choose a username" />
                                </span>
                            </label>
                            <label className="field">
                                <span>Email</span>
                                <span className="input-wrap">
                                    <i
                                        className="fa-solid fa-envelope input-icon"
                                        aria-hidden="true"
                                    ></i>
                                    <input key="email" type="email" name="email" placeholder="example@example.com" />
                                </span>
                            </label>
                            <label className="field">
                                <span>Password</span>
                                <span className="input-wrap">
                                    <i className="fa-solid fa-lock input-icon" aria-hidden="true"></i>
                                    <input key="password" type="password" name="password" placeholder="••••••••" />
                                </span>
                            </label>
                            <label className="field">
                                <span>Confirm password</span>
                                <span className="input-wrap">
                                    <i className="fa-solid fa-lock input-icon" aria-hidden="true"></i>
                                    <input key="confirmPassword" type="password" name="confirmPassword" placeholder="••••••••" />
                                </span>
                            </label>
                            {error && <p className="error-text">{error}</p>}
                            <button type="submit" className="submit" disabled={submitting}>
                                {submitting ? 'Creating account…' : 'Create account'}
                            </button>
                            <p className="auth-switch-line">
                                Already registered?{' '}
                                <button
                                    type="button"
                                    className="link"
                                    onClick={() => setSignIn(true)}
                                >
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
	);
}