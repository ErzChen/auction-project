import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../components/auth-form.css';
import '../themes.css';

function getTokenFromUrl() {
    return new URLSearchParams(window.location.search).get('token');
}

export function ResetPasswordPage() {
    const [token] = useState(getTokenFromUrl);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (!token) {
            setError('This reset link is missing or invalid.');
            return;
        }

        if (password != confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!password) {
            setError('Please enter a new password');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${CONFIG.API_BASE}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ token, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Something went wrong');
                return;
            }
            setSent(true);
        } catch (err) {
            setError(err || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }
	
	return (
		<div className="auth-form-panel" style={{width: "100%", height: "100vh"}}>
			<div className="auth-card">
				{sent ? (
					<div className="auth-form">
						<h1 style={{textAlign: "center", color: "var(--success)"}}>Password Successfully Reset</h1>
						<p style={{textAlign: "center", color: "var(--navy)"}}>Your password has been successfully reset.</p>
						<p style={{textAlign: "center", color: "var(--navy)"}}>You may close this page.</p>
					</div>
				) : (
					<form className="auth-form" autoComplete="off" onSubmit={handleSubmit}>
						<h1>Reset your password</h1>
						<p>Enter a new password you would like to change your password to.</p>
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
							{submitting ? 'Reseting...' : 'Reset password'}
						</button>
						<p className="auth-switch-line">
							Remembered your password?{' '}
							<button type="button" className="link" >
								Back to sign in
							</button>
						</p>
					</form>
				)}
			</div>
		</div>
	);
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ResetPasswordPage />
	</StrictMode>,
);
