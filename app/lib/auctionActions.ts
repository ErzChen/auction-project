import { AuctionFilter } from '../constants/types';

export async function getAuctions(filters: AuctionFilter) {
	const params = new URLSearchParams();

	if (filters.statuses?.length) {
		filters.statuses.forEach((status) => params.append('statuses', status));
	}
	if (filters.category) params.set('category', filters.category);
	if (filters.keyword) params.set('keyword', filters.keyword);
	if (filters.start_price)
		params.set('start_price', String(filters.start_price));
	if (filters.end_price) params.set('end_price', String(filters.end_price));
	if (filters.id) params.set('id', String(filters.id));
	if (filters.user_id) params.set('user_id', String(filters.user_id));
	if (filters.limit) params.set('limit', String(filters.limit));
	if (filters.offset) params.set('offset', String(filters.offset));

	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_BASE}/api/auctions?${params.toString()}`,
		{
			method: 'GET',
			headers: {
				'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
			},
		},
	);
	if (!res.ok) throw new Error('Failed to fetch auctions');
	const data = await res.json();
	return data.auctions;
}

export async function getBids(auctionId: number) {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_BASE}/api/bids/${auctionId}`,
		{
			method: 'GET',
			headers: {
				'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
			},
		},
	);
	if (!res.ok) throw new Error('Failed to fetch bids');
	const data = await res.json();
	return data.bids;
}

export function getImageUrl(filename: string): string {
	return `${process.env.EXPO_PUBLIC_API_BASE}/uploads/${filename}`;
}
