import { AuctionFilter } from "../constants/types";

export async function getAuctions(filters: AuctionFilter) {
	const params = new URLSearchParams();

	if (filters.statuses?.length) {
		filters.statuses.forEach((status) => params.append('statuses', status));
	}
	if (filters.category) params.set('category', filters.category);
	if (filters.keyword) params.set('keyword', filters.keyword);
	if (filters.start_price) params.set('start_price', String(filters.start_price));
	if (filters.end_price) params.set('end_price', String(filters.end_price));
	if (filters.id) params.set('id', String(filters.id));
	if (filters.user_id) params.set('user_id', String(filters.user_id));
	if (filters.limit) params.set('limit', String(filters.limit));
	if (filters.offset) params.set('offset', String(filters.offset));

	const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/auctions?${params.toString()}`, {
		method: 'GET',
		headers: {
			'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
		}
	});
	if (!res.ok) throw new Error('Failed to fetch auctions');
	const data = await res.json();
	return data.auctions;
}

export async function getBids(auctionId) {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/bids/${auctionId}`, {
		method: 'GET',
		headers: {
			'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
		}
	});
	if (!res.ok) throw new Error('Failed to fetch bids');
	const data = await res.json();
	return data.bids;
}

export function sortBids(bids) {
	const bidders = {};
	const activeBids = bids
		.filter((b) => !b.is_cancelled)
		.sort((a, b) => new Date(a.created_at).getMilliseconds() - new Date(b.created_at).getMilliseconds());

	for (const bid of activeBids) {
		const userId = bid.user_id;
		if (!bidders[userId]) {
			bidders[userId] = { count: 1, highest: bid.amount, lastBidAt: bid.created_at };
			continue;
		}
		const bidder = bidders[userId];
		bidder.count += 1;
		if (bid.amount > bidder.highest) bidder.highest = bid.amount;
		if (new Date(bid.created_at) > new Date(bidder.lastBidAt)) bidder.lastBidAt = bid.created_at;
	}

	return Object.keys(bidders)
		.map((userId, i) => ({
			userId,
			label: `Bidder ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ''}`,
			...bidders[userId],
		}))
		.sort((a, b) => b.highest - a.highest);
}

export function getImageUrl(filename: string): string {
	return `${process.env.EXPO_PUBLIC_API_BASE}/uploads/${filename}`;
}
