import db from './db.js';

export const insertPreBid = db.prepare(`
	INSERT INTO pre_bids (auction_id, user_id, amount)
	VALUES (@auction_id, @user_id, @amount)
`);

export const getPreBidsForAuction = db.prepare(`
	SELECT * FROM pre_bids
	WHERE auction_id = ? 
	ORDER BY created_at ASC
`);

export const getUserPreBid = db.prepare(`
	SELECT * FROM pre_bids WHERE auction_id = ? AND user_id = ?
`);

export const getPreBidById = db.prepare(
	`SELECT * FROM pre_bids WHERE pre_bid_id = ?`,
);

export const cancelPreBidById = db.prepare(`
	DELETE FROM pre_bids WHERE pre_bid_id = ?
`);

export const cancelPreBidByUserId = db.prepare(`
	DELETE FROM pre_bids WHERE user_id = ?
`);
