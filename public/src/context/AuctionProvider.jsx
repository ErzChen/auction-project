import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAuctions } from '../lib/auctionActions.js';
import { AuctionContext, DEFAULT_FILTERS } from './AuctionContext.js';
import { getSocket } from '../lib/socket.js';

const NUM_LISTINGS = 30;

export function AuctionProvider({ children, initialFilters = DEFAULT_FILTERS }) {
	const [appliedFilters, setAppliedFilters] = useState(initialFilters);
	const [auctions, setAuctions] = useState([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const socketRef = useRef(null);
	if (socketRef.current === null) socketRef.current = getSocket();
	const joinedRoomsRef = useRef(new Set());

	const fetchAuctions = useCallback((filters, pageNum) => {
		setLoading(true);
		setError(null);

		getAuctions({
			...filters,
			limit: NUM_LISTINGS + 1,
			offset: pageNum * NUM_LISTINGS,
		})
			.then((results) => {
				const list = results || [];
				const more = list.length === NUM_LISTINGS + 1;
				setHasMore(more);
				setAuctions(more ? list.slice(0, NUM_LISTINGS) : list);
			})
			.catch((err) => {
				console.error('Failed to load auctions:', err);
				setError('Could not load listings right now. Try again in a moment.');
				setAuctions([]);
				setHasMore(false);
			})
			.finally(() => setLoading(false));
	}, []);

	const applyFilters = useCallback(
		(filters) => {
			setAppliedFilters(filters);
			setPage(0);
			fetchAuctions(filters, 0);
		},
		[fetchAuctions],
	);

	const resetFilters = useCallback(
		(overrides = {}) => {
			const filters = { ...DEFAULT_FILTERS, ...overrides };
			setAppliedFilters(filters);
			setPage(0);
			fetchAuctions(filters, 0);
		},
		[fetchAuctions],
	);

	const prevPage = useCallback(() => {
		const next = Math.max(0, page - 1);
		if (next === page) return;
		setPage(next);
		fetchAuctions(appliedFilters, next);
	}, [page, appliedFilters, fetchAuctions]);

	const nextPage = useCallback(() => {
		if (!hasMore) return;
		const next = page + 1;
		setPage(next);
		fetchAuctions(appliedFilters, next);
	}, [page, hasMore, appliedFilters, fetchAuctions]);

	useEffect(() => {
	const socket = socketRef.current;
		const currentIds = new Set(auctions.map((auction) => auction.auction_id));

		for (const id of currentIds) {
			if (!joinedRoomsRef.current.has(id)) {
				socket.emit('join-auction', id);
				joinedRoomsRef.current.add(id);
			}
		}

		for (const id of joinedRoomsRef.current) {
			if (!currentIds.has(id)) {
				socket.emit('leave-auction', id);
				joinedRoomsRef.current.delete(id);
			}
		}
	}, [auctions]);	

	useEffect(() => {
		const socket = socketRef.current;

		function updateAuction(auctionId, toUpdate) {
			setAuctions((prev) =>
				prev.map((auction) =>
					auction.auction_id === auctionId ? { ...auction, ...toUpdate } : auction,
				),
			);
		}

		function handleNewBid(data) {
			updateAuction(data.auction_id, { current_price: data.current_price });
		}

		function handleBidCancelled(data) {
			updateAuction(data.auction_id, { current_price: data.current_price });
		}

		function handleUpdateStatus(data) {
			setAuctions((prev) => prev.map((auction) => auction.auction_id === data.auction_id ? { ...auction, status: data.status } : auction));
		}

		socket.on('new-bid', handleNewBid);
		socket.on('bid-cancelled', handleBidCancelled);
		socket.on('update-auction-status', handleUpdateStatus);

		return () => {
			socket.off('new-bid', handleNewBid);
			socket.off('bid-cancelled', handleBidCancelled);
			socket.off('update-auction-status', handleUpdateStatus);

			for (const id of joinedRoomsRef.current) {
				socket.emit('leave-auction', id);
			}
			joinedRoomsRef.current.clear();
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchAuctions(initialFilters, 0);
	}, [fetchAuctions, initialFilters]);

	const value = useMemo(
		() => ({
			auctions,
			loading,
			error,
			page,
			hasMore,
			pageSize: NUM_LISTINGS,
			appliedFilters,
			applyFilters,
			resetFilters,
			prevPage,
			nextPage,
		}),
		[
			auctions,
			loading,
			error,
			page,
			hasMore,
			appliedFilters,
			applyFilters,
			resetFilters,
			prevPage,
			nextPage,
		],
	);

	return (
		<AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
	);
}
