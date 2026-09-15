import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gavelLogo from '../../images/gavel-logo.png';
import '../styles/auth-page.css';
import '../styles/themes.css';
import { getAuctions } from '../lib/auctionActions.js';
import { AuthForm } from '../components/AuthForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import { AuthProvider } from '../context/AuthProvider.jsx';
import { useAuthContext } from '../context/AuthContext.js';

const FALLBACK_LISTINGS = [
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
];

export function AuthPage() {
	const [listings, setListings] = useState(FALLBACK_LISTINGS);
	const [view, setView] = useState('auth');

	useEffect(() => {
		let cancelled = false;

		getAuctions({ statuses: ['sold'], limit: 30 })
			.then((auctions) => {
				if (cancelled) return;
				if (!auctions || auctions.length < 20) {
					setListings(FALLBACK_LISTINGS);
					return;
				}
				setListings(
					auctions.map(
						(auction) => `LISTING ${auction.auction_id} - ${auction.title} - SOLD`,
					),
				);
			})
			.catch((err) => {
				console.error('Failed to load sold auctions:', err);
				if (!cancelled) setListings(FALLBACK_LISTINGS);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const { loading } = useAuthContext();

	if (loading)
		return (
			<div className="status-page">
				<p className="page-status">Loading...</p>
			</div>
		);

	return (
		<section className="auth-page">
			<div className="auth-brand-panel">
				<div className="auth-branding">
					<img src={gavelLogo} alt="Gavel logo" className="auth-brand-logo" />
					<span>Erz's Auction</span>
				</div>
				<div className="auth-listing-display" aria-hidden="true">
					<ul className="auth-listing">
						{[...listings, ...listings].map((listing, i) => (
							<li key={i}>{listing}</li>
						))}
					</ul>
				</div>
			</div>
			{view === 'auth' ? (
				<AuthForm onForgotPassword={() => setView('forgot')} />
			) : (
				<ForgotPasswordForm onBackToSignIn={() => setView('auth')} />
			)}
		</section>
	);
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<AuthPage />
		</AuthProvider>
	</StrictMode>,
);
