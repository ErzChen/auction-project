import { StrictMode, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
	getAuctions,
	getBids,
	createBid,
	getPreBid,
	createPreBid,
	cancelPreBid,
	sortBids,
	getNextMinBid,
	getImageUrl,
} from '../lib/auctionActions.js';
import { getUser } from '../lib/userActions.js';
import {
	formatPrice,
	formatDateTime,
	getIdFromUrl,
	formatTimeRemaining,
} from '../lib/library.js';
import '../styles/listing-page.css';
import '../styles/themes.css';
import TopBar from '../components/TopBar.jsx';
import { AuthProvider } from '../context/AuthProvider.jsx';
import { useAuthContext } from '../context/AuthContext.js';
import { getSocket } from '../lib/socket.js';

export function ListingPage() {
	function markImageFailed(src) {
		setFailedImages((prev) => {
			if (prev.has(src)) return prev;
			const next = new Set(prev);
			next.add(src);
			return next;
		});
	}

	function openPlaceBidModal() {
		if (!user) {
			window.location.href = '/pages/auth.html';
			return;
		}
		setBidError(null);
		setBidAmount(nextMinBid != null ? String(nextMinBid) : '');
		setPlaceBidModalOpen(true);
	}

	async function handlePlaceBid(e) {
		e.preventDefault();
		if (!user) {
			setBidError('Please sign in to place a bid.');
			return;
		}
		if (auctionEnded) {
			setBidError('This auction has ended.');
			return;
		}
		const value = Number(bidAmount);
		if (Number.isNaN(value) || value <= 0) {
			setBidError('Enter a valid bid amount.');
			return;
		}
		if (nextMinBid != null && value < nextMinBid) {
			setBidError(
				`Bid must be at least ${formatPrice(nextMinBid, auction.currency)}.`,
			);
			return;
		}

		setBidSubmitting(true);
		setBidError(null);
		try {
			await createBid(auction.auction_id, value);
			const [freshAuctions, freshBids] = await Promise.all([
				getAuctions({ id: auction.auction_id }),
				getBids(auction.auction_id),
			]);
			const updatedAuction = freshAuctions?.[0];
			if (updatedAuction) setAuction(updatedAuction);
			setBids(freshBids);

			const updatedPrice = updatedAuction
				? updatedAuction.current_price || updatedAuction.starting_price
				: displayPrice;
			const updatedRules = updatedAuction
				? JSON.parse(updatedAuction.bid_increment_rules || '[]')
				: bidIncrementRules;
			const updatedNextMinBid =
				updatedAuction?.status === 'active'
					? getNextMinBid(updatedPrice, updatedRules)
					: null;
			setBidAmount(updatedNextMinBid != null ? String(updatedNextMinBid) : '');
		} catch (err) {
			setBidError(err.message || 'Something went wrong');
		} finally {
			setBidSubmitting(false);
		}
	}

	function handleBidAmountChange(e) {
		const raw = e.target.value.replace(/[^\d.]/g, '');
		const parts = raw.split('.');
		const normalized =
			parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : raw;
		setBidAmount(normalized);
	}

	async function handleQueuePreBid() {
		setPreBidSubmitting(true);
		setPreBidError(null);
		try {
			await createPreBid(auction.auction_id);
			setPreBid(await getPreBid(auction.auction_id));
		} catch (err) {
			setPreBidError(err.message || 'Something went wrong');
		} finally {
			setPreBidSubmitting(false);
		}
	}

	async function handleCancelPreBid() {
		if (!preBid) return;
		setPreBidSubmitting(true);
		setPreBidError(null);
		try {
			await cancelPreBid(preBid.pre_bid_id);
			setPreBid(null);
		} catch (err) {
			setPreBidError(err.message || 'Something went wrong');
		} finally {
			setPreBidSubmitting(false);
		}
	}

	const [auction, setAuction] = useState(null);
	const [listingUser, setListingUser] = useState(null);
	const [bids, setBids] = useState([]);
	const [winnerUsername, setWinnerUsername] = useState(null);
	const [listingLoading, setListingLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeImage, setActiveImage] = useState(0);
	const [failedImages, setFailedImages] = useState(() => new Set());
	const [bidModalOpen, setBidModalOpen] = useState(false);
	const [placeBidModalOpen, setPlaceBidModalOpen] = useState(false);
	const [bidAmount, setBidAmount] = useState('');
	const [bidFocused, setBidFocused] = useState(false);
	const [bidError, setBidError] = useState(null);
	const [bidSubmitting, setBidSubmitting] = useState(false);
	const [now, setNow] = useState(() => Date.now());
	const [preBid, setPreBid] = useState(undefined);
	const [preBidSubmitting, setPreBidSubmitting] = useState(false);
	const [preBidError, setPreBidError] = useState(null);

	const { user } = useAuthContext();

	const {
		starting_price: startingPrice,
		current_price: currentPrice,
		bid_increment_rules: bidIncrementRulesJson,
		currency,
		title,
		description,
		condition,
		details: detailsJson,
		category,
		image_paths: imagePaths,
		location,
		is_shipping_available: isShippingAvailable,
		shipping_cost: shippingCost,
		shipping_pickup_description: shippingPickupDescription,
		start_time: startTime,
		end_time: endTime,
		status,
	} = auction || {};

	const socketRef = useRef(null);
	if (socketRef.current === null) socketRef.current = getSocket();
	const isLive = status === 'active';
	const isUpcoming = status === 'upcoming';
	const isSold = status === 'sold';
	const isExpired = status === 'expired';

	const displayPrice = currentPrice || startingPrice;
	const bidIncrementRules = JSON.parse(bidIncrementRulesJson || '[]');
	const nextMinBid = isLive
		? getNextMinBid(displayPrice, bidIncrementRules)
		: null;

	const auctionEnded = auction
		? new Date(auction.end_time).getTime() - now <= 0
		: false;

	const details = JSON.parse(detailsJson || '[]');
	const images = JSON.parse(imagePaths || '[]');
	const sortedBids = sortBids(bids);
	const userActiveBids = user
		? bids.filter((bid) => !bid.is_cancelled && bid.user_id === user.id)
		: [];

	const userBidCount = userActiveBids.length;
	const userHighestBid = userBidCount
		? Math.max(...userActiveBids.map((bid) => bid.amount))
		: null;

	const isUserHighBidder =
		userHighestBid != null &&
		displayPrice != null &&
		userHighestBid === Number(displayPrice);

	const displayValue = bidFocused
		? bidAmount
		: bidAmount
			? formatPrice(Number(bidAmount), currency)
			: '';
	const { username, email } = listingUser || {};

	useEffect(() => {
		let cancelled = false;
		const id = 33;

		if (!id) return;

		getAuctions({ id })
			.then((data) => {
				if (cancelled) return;
				const listing = data && data.length > 0 ? data[0] : null;
				setAuction(listing);
				if (!listing) setError('Listing not found.');
			})
			.catch((err) => {
				console.error('Failed to load auction:', err);
				if (!cancelled) setError('Could not load this listing right now.');
			})
			.finally(() => {
				if (!cancelled) setListingLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!auction) return;
		const auctionId = auction.auction_id;
		if (!auctionId) return;

		const socket = socketRef.current;
		socket.emit('join-auction', auctionId, user.id);

		return () => socket.emit('leave-auction', auctionId);
	}, [auction?.auction_id]);

	useEffect(() => {
		const socket = socketRef.current;

		function updateAuction(toUpdate) {
			setAuction((prev) => ({ ...prev, ...toUpdate }));
		}

		function handleUpdateStatus(data) {
			updateAuction({ status: data.status });
		}

		function handleNewBid(data) {
			updateAuction({ current_price: data.current_price });
			setBids((prev) => [...prev, data.bid]);
		}

		function handleBidCancelled(data) {
			updateAuction({ current_price: data.current_price });
			setBids((prev) =>
				prev.map((bid) =>
					bid.bid_id == data.bid_id ? { ...bid, is_cancelled: true } : bid,
				),
			);
		}

		socket.on('new-bid', handleNewBid);
		socket.on('bid-cancelled', handleBidCancelled);
		socket.on('update-auction-status', handleUpdateStatus);

		return () => {
			socket.off('new-bid', handleNewBid);
			socket.off('bid-cancelled', handleBidCancelled);
			socket.off('update-auction-status', handleUpdateStatus);
		};
	}, []);

	useEffect(() => {
		if (!auction) return;
		let cancelled = false;

		document.title = `${auction.title} | Erz's Auction`;
		getUser(auction.user_id)
			.then((data) => {
				if (!cancelled) setListingUser(data);
			})
			.catch((err) => console.error('Failed to load seller:', err));
		getBids(auction.auction_id)
			.then((data) => {
				if (!cancelled) setBids(data);
			})
			.catch((err) => console.error('Failed to load bids:', err));

		if (auction.winning_user_id) {
			getUser(auction.winning_user_id)
				.then((data) => {
					if (!cancelled) setWinnerUsername(data.username || null);
				})
				.catch((err) => console.error('Failed to load winner username:', err));
		}

		return () => {
			cancelled = true;
		};
	}, [auction]);

	useEffect(() => {
		if (!auctionEnded || !auction || auction.status !== 'active') return;
		let cancelled = false;
		getAuctions({ id: auction.auction_id })
			.then((data) => {
				if (!cancelled && data?.[0]) setAuction(data[0]);
			})
			.catch((err) => console.error('Failed to refresh ended auction:', err));
		return () => {
			cancelled = true;
		};
	}, [auctionEnded, auction]);

	useEffect(() => {
		if (!auction || !user || auction.status !== 'upcoming') return;
		let cancelled = false;
		getPreBid(auction.auction_id)
			.then((data) => {
				if (!cancelled) setPreBid(data);
			})
			.catch((err) => console.error('Failed to load pre-bid:', err));
		return () => {
			cancelled = true;
		};
	}, [auction, user]);

	return (
		<>
			<TopBar />
			{listingLoading ? (
				<section className="listing-page">
					<div className="listing-gallery">
						<div className="skeleton-block listing-gallery-main"></div>

						<section className="listing-description">
							<div className="skeleton-line skeleton-line-label"></div>
							<div className="skeleton-line skeleton-line-body"></div>
						</section>

						<section className="listing-description">
							<div className="skeleton-line skeleton-line-label"></div>
							<div className="listing-timing">
								<div className="listing-timing-row">
									<div className="skeleton-line skeleton-line-word"></div>
									<div className="skeleton-line skeleton-line-word"></div>
								</div>
								<div className="listing-timing-row">
									<div className="skeleton-line skeleton-line-word"></div>
									<div className="skeleton-line skeleton-line-word"></div>
								</div>
								<div className="listing-timing-row">
									<div className="skeleton-line skeleton-line-word"></div>
									<div className="skeleton-line skeleton-line-word"></div>
								</div>
							</div>
						</section>

						<section className="listing-description">
							<div className="skeleton-line skeleton-line-label"></div>
							<div className="skeleton-line skeleton-line-body"></div>
						</section>

						<section className="listing-description">
							<div className="skeleton-line skeleton-line-label"></div>
							<div className="listing-timing">
								<div className="listing-timing-row">
									<div className="skeleton-line skeleton-line-word"></div>
									<div className="skeleton-line skeleton-line-word"></div>
								</div>
								<div className="listing-timing-row">
									<div className="skeleton-line skeleton-line-word"></div>
									<div className="skeleton-line skeleton-line-word"></div>
								</div>
							</div>
						</section>
					</div>

					<aside className="listing-panel">
						<div className="skeleton-line skeleton-line-title"></div>

						<div className="listing-info">
							<div className="skeleton-line skeleton-line-panel-info"></div>
							<div className="skeleton-line skeleton-line-panel-info"></div>
						</div>

						<div className="listing-price-block">
							<div className="skeleton-line skeleton-line-label"></div>
							<div className="skeleton-line skeleton-line-title"></div>
							<div className="skeleton-line skeleton-line-word"></div>
						</div>

						<div className="listing-timing">
							<div className="listing-timing-row">
								<div className="skeleton-line skeleton-line-word"></div>
								<div className="skeleton-line skeleton-line-word"></div>
							</div>
						</div>

						<div className="listing-timing">
							<div className="listing-timing-row">
								<div className="skeleton-line skeleton-line-word"></div>
								<div className="skeleton-line skeleton-line-word"></div>
							</div>
							<div className="listing-timing-row">
								<div className="skeleton-line skeleton-line-word"></div>
								<div className="skeleton-line skeleton-line-word"></div>
							</div>
						</div>

						<div className="skeleton-line skeleton-line-button"></div>

						<div className="listing-seller">
							<div className="skeleton-line skeleton-line-label"></div>
							<div className="listing-info">
								<div className="skeleton-line skeleton-line-word"></div>
								<div className="skeleton-line skeleton-line-word"></div>
							</div>
						</div>
					</aside>
				</section>
			) : error || !auction ? (
				<section className="status-page">
					<p className="error-text page-status">{error || 'Listing not found.'}</p>
				</section>
			) : (
				<>
					<section className="listing-page">
						<div className="listing-gallery">
							<div className="listing-gallery-main">
								{images.length > 0 && !failedImages.has(images[activeImage]) ? (
									<img
										src={getImageUrl(images[activeImage])}
										alt={title}
										onError={() => markImageFailed(images[activeImage])}
									/>
								) : (
									<i
										className="fa-solid fa-image listing-card-placeholder-icon"
										aria-hidden="true"
									></i>
								)}
							</div>
							{images.length > 1 && (
								<div className="listing-gallery-images">
									{images.map((src, i) => (
										<button
											key={src + i}
											type="button"
											className={`listing-gallery-image ${i === activeImage ? 'active' : ''}`}
											onClick={() => setActiveImage(i)}
										>
											{!failedImages.has(src) ? (
												<img
													src={src}
													alt={`${title} thumbnail ${i + 1}`}
													onError={() => markImageFailed(src)}
												/>
											) : (
												<i
													className="fa-solid fa-image listing-card-placeholder-icon"
													aria-hidden="true"
												></i>
											)}
										</button>
									))}
								</div>
							)}

							<section className="listing-description">
								<span className="listing-section-label">Description</span>
								<p>{description}</p>
							</section>

							{bidIncrementRules.length > 0 && (
								<section className="listing-description">
									<span className="listing-section-label">Bid Increments</span>
									<div className="listing-timing">
										{bidIncrementRules.map((rule, i) => (
											<div key={rule.min + String(i)} className="listing-timing-row">
												<span>
													{formatPrice(rule.min, currency)}{' '}
													{rule.max ? `- ${formatPrice(rule.max, currency)}` : 'and above'}
												</span>
												<span>{formatPrice(rule.increment, currency)}</span>
											</div>
										))}
									</div>
								</section>
							)}

							{shippingPickupDescription && (
								<section className="listing-description">
									<span className="listing-section-label">Shipping / Pickup</span>
									<p>{shippingPickupDescription}</p>
								</section>
							)}

							<section className="listing-description">
								<span className="listing-section-label">Item details</span>
								<div className="listing-timing">
									{condition && (
										<div className="listing-timing-row">
											<span>Condition</span>
											<span>{condition}</span>
										</div>
									)}
									<div className="listing-timing-row">
										<span>Shipping</span>
										<span>
											{isShippingAvailable
												? shippingCost != null
													? `${formatPrice(shippingCost, currency)}`
													: '$0.00'
												: 'Local pickup only'}
										</span>
									</div>
									{details.map((detail, i) => (
										<div key={detail.detail + i} className="listing-timing-row">
											<span>{detail.detail}</span>
											<span>{detail.info}</span>
										</div>
									))}
								</div>
							</section>
						</div>

						<aside className="listing-panel">
							<h1 className="listing-title">{title}</h1>

							<div className="listing-info">
								<span className="listing-info-item">
									<i className="fa-solid fa-location-dot" aria-hidden="true"></i>
									{location || 'Location not listed'}
								</span>
								<span className="listing-info-item">
									<i className="fa-solid fa-tag" aria-hidden="true"></i>
									{category || 'Uncategorized'}
								</span>
							</div>

							<div className="listing-price-block">
								<span className="listing-price-label">
									{isSold
										? 'Sold for'
										: isUpcoming
											? 'Starting bid'
											: isExpired
												? 'Final bid (no winner)'
												: 'Highest bid'}
								</span>
								<span className="listing-price-value">
									{formatPrice(displayPrice, currency)}
								</span>
								{!isUpcoming && (
									<button
										type="button"
										className="link"
										style={{ marginTop: 0, width: 'max-content' }}
										onClick={() => setBidModalOpen(true)}
									>
										{bids.length === 1 ? `${bids.length} bid` : `${bids.length} bids`}
									</button>
								)}
							</div>

							{nextMinBid != null && isLive && (
								<div className="listing-timing">
									<div className="listing-timing-row">
										<span>Minimum next bid</span>
										<span>{formatPrice(nextMinBid, currency)}</span>
									</div>
								</div>
							)}

							<div className="listing-timing">
								<div className="listing-timing-row">
									<span>{isUpcoming ? 'Starts' : 'Started'}</span>
									<span>
										{isUpcoming
											? formatTimeRemaining(startTime, now)
											: formatDateTime(startTime)}
									</span>
								</div>
								<div className="listing-timing-row">
									<span>{isSold || isExpired ? 'Ended' : 'Ends'}</span>
									<span>
										{isLive ? formatTimeRemaining(endTime, now) : formatDateTime(endTime)}
									</span>
								</div>
							</div>

							<button
								type="button"
								className="submit"
								disabled={isSold || isExpired}
								onClick={isLive || isUpcoming ? openPlaceBidModal : undefined}
							>
								{isLive
									? 'Place a bid'
									: isUpcoming
										? 'View bid details'
										: isExpired
											? 'Auction expired'
											: 'Bidding closed'}
							</button>

							{isSold && winnerUsername && (
								<div className="listing-timing">
									<div className="listing-timing-row">
										<span>Winning bidder</span>
										<span>{winnerUsername}</span>
									</div>
								</div>
							)}

							<div className="listing-seller">
								<span className="listing-seller-label">Seller</span>
								<div className="listing-info">
									<span className="listing-info-item">
										<i className="fa-solid fa-circle-user" aria-hidden="true"></i>
										{username || 'Unknown seller'}
									</span>
									<span className="listing-info-item">
										<i className="fa-solid fa-envelope" aria-hidden="true"></i>
										{email || 'Unknown seller'}
									</span>
								</div>
							</div>
						</aside>
					</section>
					<div
						className={`bids-overlay ${bidModalOpen ? 'active' : ''}`}
						onClick={() => setBidModalOpen(false)}
					></div>
					<div className={`bids-modal ${bidModalOpen ? 'active' : ''}`}>
						<button
							className="bids-close-btn"
							aria-label="Close"
							onClick={() => setBidModalOpen(false)}
						>
							<i className="fa-solid fa-xmark" aria-hidden="true"></i>
						</button>
						<h1 className="listing-title">{title}</h1>
						{sortedBids.length > 0 ? (
							<table className="bids-table">
								<thead>
									<tr>
										<th>Bidder</th>
										<th># Bids</th>
										<th>Highest Bid</th>
										<th>Last Bid</th>
									</tr>
								</thead>
								<tbody>
									{sortedBids.map((b) => (
										<tr key={b.userId}>
											<td>{b.label}</td>
											<td>{b.count}</td>
											<td>{formatPrice(b.highest, currency)}</td>
											<td>{formatDateTime(b.lastBidAt)}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p
								className="listing-page-status"
								style={{ fontSize: 'var(--label-size) !important' }}
							>
								No bids yet.
							</p>
						)}
					</div>

					<div
						className={`bids-overlay ${placeBidModalOpen ? 'active' : ''}`}
						onClick={() => setPlaceBidModalOpen(false)}
					></div>
					<div className={`bids-modal ${placeBidModalOpen ? 'active' : ''}`}>
						<button
							className="bids-close-btn"
							aria-label="Close"
							onClick={() => setPlaceBidModalOpen(false)}
						>
							<i className="fa-solid fa-xmark" aria-hidden="true"></i>
						</button>
						<h1 className="listing-title">{title}</h1>

						<div className="bid-info">
							<div className="bid-info-column">
								{isUpcoming ? (
									<>
										<span className="column-title">Starts</span>
										<span>{formatTimeRemaining(startTime, now)}</span>
									</>
								) : (
									<>
										<span className="column-title">Time left</span>
										<span>{formatTimeRemaining(endTime, now)}</span>
									</>
								)}
							</div>
							<div className="bid-info-column">
								<span className="column-title">
									{isUpcoming ? 'Starting' : 'Highest'} bid
								</span>
								<span>{formatPrice(displayPrice, currency)}</span>
							</div>
							{user && !isUpcoming && (
								<>
									<div className="bid-info-column">
										<span className="column-title">Your bid</span>
										<span>
											{userHighestBid != null
												? formatPrice(userHighestBid, currency)
												: 'No bids yet'}
										</span>
										{isUserHighBidder && (
											<span className="bid-info-leading">Leading</span>
										)}
									</div>
									<div className="bid-info-column">
										<span className="column-title">Bids placed</span>
										<span>{userBidCount}</span>
									</div>
								</>
							)}
						</div>

						{isLive ? (
							<form className="place-bid-form" onSubmit={handlePlaceBid}>
								<label className="field">
									<span>Your bid ({formatPrice(nextMinBid ?? 0, currency)} min)</span>
									<span className="input-wrap">
										<i className="fa-solid fa-coins input-icon" aria-hidden="true"></i>
										<input
											type="text"
											inputMode="decimal"
											value={displayValue}
											onChange={handleBidAmountChange}
											onFocus={() => setBidFocused(true)}
											onBlur={() => setBidFocused(false)}
											disabled={bidSubmitting}
										/>
									</span>
								</label>
								{bidError && <p className="error-text">{bidError}</p>}
								<button type="submit" className="submit" disabled={bidSubmitting}>
									{bidSubmitting ? 'Placing bid…' : 'Place bid'}
								</button>
							</form>
						) : isUpcoming ? (
							<div className="place-bid-form">
								{!user ? (
									<p
										className="listing-page-status"
										style={{
											fontSize: 'var(--label-size) !important',
											textAlign: 'center',
											marginTop: 0,
										}}
									>
										Sign in to queue a bid.
									</p>
								) : preBid === undefined ? (
									<p
										className="listing-page-status"
										style={{
											fontSize: 'var(--label-size) !important',
											textAlign: 'center',
											marginTop: 0,
										}}
									>
										Checking your pre-bid…
									</p>
								) : preBid ? (
									<>
										<p
											className="listing-page-status"
											style={{
												fontSize: 'var(--label-size) !important',
												textAlign: 'center',
												marginTop: 0,
											}}
										>
											You're queued to pre-bid the moment bidding opens.
										</p>
										{preBidError && <p className="error-text">{preBidError}</p>}
										<button
											type="button"
											className="submit submit-danger"
											disabled={preBidSubmitting}
											onClick={handleCancelPreBid}
										>
											{preBidSubmitting ? 'Cancelling…' : 'Cancel pre-bid'}
										</button>
									</>
								) : (
									<>
										{preBidError && (
											<p
												className="error-text"
												style={{ textAlign: 'center', marginTop: 0 }}
											>
												{preBidError}
											</p>
										)}
										<button
											type="button"
											className="submit"
											disabled={preBidSubmitting}
											onClick={handleQueuePreBid}
										>
											{preBidSubmitting ? 'Queueing…' : 'Queue starting bid'}
										</button>
									</>
								)}
							</div>
						) : (
							<p
								className="listing-page-status"
								style={{ fontSize: 'var(--label-size) !important' }}
							>
								Bidding is closed.
							</p>
						)}
					</div>
				</>
			)}
		</>
	);
}
createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<ListingPage />
		</AuthProvider>
	</StrictMode>,
);
