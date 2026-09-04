import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './profile-page.css';
import '../themes.css';
import TopBar from '../components/TopBar.jsx';
import { AuctionProvider } from '../context/AuctionProvider.jsx';
import { AuthProvider } from '../context/AuthProvider.jsx';
import { DEFAULT_FILTERS } from '../context/AuctionContext.js';
import AuctionFilter from '../components/AuctionFilter.jsx';
import AuctionListing from '../components/AuctionListings.jsx';
import { getIdFromUrl } from '../lib/library.js';
import { getUser } from '../lib/userActions.js';

export function ProfilePage() {
    const [id] = useState(getIdFromUrl());
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

	useEffect(() => {
        if (!id) return; 

        let cancelled = false;

        getUser(id).then((data) => {
            if (cancelled) return;
            const user = data ? data : null;
            setUser(user);
            if (!user) setError('Profile not found');
        })
        .catch((err) => {
            console.error('Failed to load profile:', err);
            if (!cancelled) setError('Could not load this profile right now.');
        })


        return () => {
            cancelled = true;
        };
    }, [id]);

	return (
		<>
			<TopBar />
            {user ? (
                <AuctionProvider initialFilters={{ ...DEFAULT_FILTERS, user_id: user.id }}>
                    <section className="profile-page">
                        <AuctionFilter userId={user.id} />
                        <AuctionListing user={user} />
                    </section>
                </AuctionProvider>
            ) : (
                <div className="status-page">
                    <p className="error-text page-status">{error || 'Profile not found.'}</p>
                </div>
            )}
		</>
	);
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<ProfilePage />
		</AuthProvider>
	</StrictMode>,
);