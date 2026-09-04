import { useEffect, useState } from 'react';
import { useAuctionContext } from '../context/AuctionContext.js';
import { getUser } from '../lib/userActions.js';
import { formatPrice, formatDate } from '../lib/library.js';
import './auction-listings.css';

function getFirstImage(imagePathsJson) {
	try {
		const paths = JSON.parse(imagePathsJson || '[]');
		return paths.length > 0 ? paths[0] : null;
	} catch {
		return null;
	}
}

function AuctionCard({ auction }) {
	const {
		user_id: userId,
		starting_price: startingPrice,
		current_price: currentPrice,
		currency,
		title,
		location,
		description,
		is_shipping_available: isShippingAvailable,
		status,
		image_paths: imagePaths,
		start_time: startDate,
		end_time: endDate,
	} = auction;

	const [username, setUsername] = useState(null);
	const [imgError, setImgError] = useState(false);

	useEffect(() => {
		let cancelled = false;
		getUser(userId)
			.then((data) => {
				if (!cancelled) setUsername(data.username);
			})
			.catch((err) => console.error('Failed to load username:', err));
		return () => {
			cancelled = true;
		};
	}, [userId]);

	const imageUrl = getFirstImage(imagePaths);
	const isSold = status === 'sold';
	const isUpcoming = status === 'upcoming';
	const isExpired = status === 'expired';

	return (
		<article className="listing-card">
			<div className="listing-card-media">
				{!imgError ? (
					<img src={imageUrl} alt={title} onError={() => setImgError(true)} />
				) : (
					<i
						className="fa-solid fa-gavel listing-card-placeholder-icon"
						aria-hidden="true"
					></i>
				)}
			</div>
			<div className="listing-card-body">
				<h3 className="listing-title">{title}</h3>

				<div className="listing-info-row">
					<span className="listing-info-item">
						<i className="fa-solid fa-user" aria-hidden="true"></i>
						{username || 'Username unknown'}
					</span>

					<span className="listing-info-item">
						<i className="fa-solid fa-location-dot" aria-hidden="true"></i>
						{location || 'Location unknown'}
					</span>

					<span className="listing-info-item">
						<i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
						{formatDate(startDate)} – {formatDate(endDate)}
					</span>
					{isShippingAvailable ? 
						<span className="listing-info-item">
							<i className="fa-solid fa-truck" aria-hidden="true"></i>
							Shipping available
						</span>
					: ''}
				</div>

				<p className="listing-description">{description}</p>

				<div className="listing-price-block">
					<span className="listing-price-label">
						{isSold ? 'Sold for' : isUpcoming ? 'Starting at' : isExpired ? 'Ended, no bids won' : 'Current bid'}
					</span>
					<span className="listing-price-value">
						{(isUpcoming ? formatPrice(startingPrice, currency) : formatPrice(currentPrice, currency)) || '-'}
					</span>
				</div>
				<button type="button" className="listing-view-btn">
					View listing <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
				</button>
			</div>
		</article>
	);
}

function AuctionCardSkeleton() {
	return (
		<div className="listing-card" aria-hidden="true">
			<div className="listing-card-media skeleton-block"></div>
			<div className="listing-card-body">
				<div className="skeleton-line skeleton-line-title"></div>
				<div className="skeleton-line skeleton-line-word"></div>
				<div className="skeleton-line skeleton-line-word"></div>
				<div className="skeleton-line skeleton-line-word"></div>
				<div className="skeleton-line skeleton-line-body"></div>
				<div className="skeleton-line skeleton-line-word"></div>
				<div className="skeleton-line skeleton-line-title"></div>
				<div className="skeleton-line skeleton-line-button-small"></div>
			</div>
		</div>
	);
}

export function AuctionListing({ user = null }) {
	const {
		auctions,
		loading,
		error,
		page,
		hasMore,
		pageSize,
		prevPage,
		nextPage,
	} = useAuctionContext();

	const { username, email } = user || {};

	return (
		<div className="auction-listing-section">
			<div className="listing-header">
				<div>
					<h1 style={user ? { marginBottom: 8 } : null}>{user && `${username}'s `}Listings</h1>
					{user && <span>Email: {email}</span>}
				</div>
				
				{!loading && !error && (
					<span className="listing-count">
						{auctions.length} listing{auctions.length === 1 ? '' : 's'} shown
					</span>
				)}
			</div>

			{error && <p className="listing-error">{error}</p>}

			{loading ? (
				<div className="listing-grid">
					{Array.from({ length: pageSize }).map((_, i) => (
						<AuctionCardSkeleton key={i} />
					))}
				</div>
			) : auctions.length === 0 && !error ? (
				<div className="listing-empty">
					<i className="fa-solid fa-gavel" aria-hidden="true"></i>
					<h3>No listings match those filters</h3>
					<p>Try widening your price range or clearing a filter.</p>
				</div>
			) : (
				<>
					<div className="listing-grid">
						{auctions.map((auction) => (
							<AuctionCard key={auction.auction_id} auction={auction} />
						))}
					</div>

					{(page > 0 || hasMore) && (
						<div className="listing-page-nav">
							<button
								type="button"
								className="page-nav-arrow-btn"
								onClick={prevPage}
								disabled={page === 0 || loading}
								aria-label="Previous page"
							>
								<i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
							</button>
							<span className="page-nav-label">Page {page + 1}</span>
							<button
								type="button"
								className="page-nav-arrow-btn"
								onClick={nextPage}
								disabled={!hasMore || loading}
								aria-label="Next page"
							>
								<i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default AuctionListing;
