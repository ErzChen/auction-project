export async function getAuctions(filters) {
	const params = new URLSearchParams();

	if (filters.statuses?.length) {
		filters.statuses.forEach((status) => params.append('statuses', status));
	}
	if (filters.category) params.set('category', filters.category);
	if (filters.keyword) params.set('keyword', filters.keyword);
	if (filters.start_price) params.set('start_price', filters.start_price);
	if (filters.end_price) params.set('end_price', filters.end_price);
	if (filters.id) params.set('id', filters.id);
	if (filters.user_id) params.set('user_id', filters.user_id);
	if (filters.limit) params.set('limit', filters.limit);
	if (filters.offset) params.set('offset', filters.offset);

	const res = await fetch(`${CONFIG.API_BASE}/api/auctions?${params.toString()}`);
	if (!res.ok) throw new Error('Failed to fetch auctions');
	const data = await res.json();
	return data.auctions;
}

export async function getBids(auctionId) {
	const res = await fetch(`${CONFIG.API_BASE}/api/bids/${auctionId}`);
	if (!res.ok) throw new Error('Failed to fetch bids');
	const data = await res.json();
	return data.bids;
}

export async function createBid(auctionId, amount) {
	const res = await fetch(`${CONFIG.API_BASE}/api/bids`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ auction_id: auctionId, amount }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message || 'Failed to place bid');
	return data;
}

export async function cancelBid(bidId) {
	const res = await fetch(`${CONFIG.API_BASE}/api/bids/${bidId}/cancel`, {
		method: 'PUT',
		credentials: 'include',
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message || 'Failed to cancel bid');
	return data;
}

export async function getPreBid(auctionId) {
	const res = await fetch(`${CONFIG.API_BASE}/api/pre-bids/${auctionId}`, { credentials: 'include' });
	if (res.status === 401) return null;
	if (!res.ok) throw new Error('Failed to fetch pre-bid');
	const data = await res.json();
	return data.preBid;
}

export async function createPreBid(auctionId) {
	const res = await fetch(`${CONFIG.API_BASE}/api/pre-bids`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ auction_id: auctionId }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message || 'Failed to queue pre-bid');
	return data;
}

export async function cancelPreBid(preBidId) {
	const res = await fetch(`${CONFIG.API_BASE}/api/pre-bids/${preBidId}/cancel`, {
		method: 'PUT',
		credentials: 'include',
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message || 'Failed to cancel pre-bid');
	return data;
}
