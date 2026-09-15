import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/main-page.css';
import '../styles/themes.css';
import TopBar from '../components/TopBar.jsx';
import { AuctionProvider } from '../context/AuctionProvider.jsx';
import { AuthProvider } from '../context/AuthProvider.jsx';
import AuctionFilter from '../components/AuctionFilter.jsx';
import AuctionListing from '../components/AuctionListings.jsx';

export function MainPage() {
	return (
		<>
			<TopBar />
			<section className="main-section">
				<AuctionFilter />
				<AuctionListing />
			</section>
		</>
	);
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<AuctionProvider>
				<MainPage />
			</AuctionProvider>
		</AuthProvider>
	</StrictMode>,
);
