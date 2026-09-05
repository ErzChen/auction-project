import { useState } from 'react';
import './auth-form.css';

const API_BASE = CONFIG.API_BASE || 'http://localhost:3000';

export function ForgotPasswordForm({ onBackToSignIn }) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [sent, setSent] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const email = formData.get('email');

		if (!email) {
			setError('Please enter your email');
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE}/api/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email }),
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
		<div className="auth-form-panel">
			<div className="auth-card">
				{sent ? (
					<div className="auth-form">
						<h1>Check your email</h1>
						<p>If an account exists for that address, we've sent a link to reset your password.</p>
						<button type="button" className="submit" onClick={onBackToSignIn}>
							Back to sign in
						</button>
					</div>
				) : (
					<form className="auth-form" autoComplete="off" onSubmit={handleSubmit}>
						<h1>Reset your password</h1>
						<p>Enter your email and we'll send you a reset link.</p>
						<label className="field">
							<span>Email</span>
							<span className="input-wrap">
								<i className="fa-solid fa-envelope input-icon" aria-hidden="true"></i>
								<input key="email" type="email" name="email" placeholder="example@example.com" />
							</span>
						</label>
						{error && <p className="error-text">{error}</p>}
						<button type="submit" className="submit" disabled={submitting}>
							{submitting ? 'Sending…' : 'Send reset link'}
						</button>
						<p className="auth-switch-line">
							Remembered your password?{' '}
							<button type="button" className="link" onClick={onBackToSignIn}>
								Back to sign in
							</button>
						</p>
					</form>
				)}
			</div>
		</div>
	);
}
