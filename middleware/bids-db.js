import db from "./db.js";

export const insertBid = db.prepare(`
	INSERT INTO bids (auction_id, user_id, amount, is_winning, is_cancelled)
	VALUES (@auction_id, @user_id, @amount, @is_winning, @is_cancelled)
`);

export const getBidById = db.prepare(`SELECT * FROM bids WHERE bid_id = ?`);

export const getBidsFromAuction = db.prepare(`
    SELECT * 
    FROM bids
    WHERE auction_id = ?
    AND is_cancelled = 0
    ORDER BY amount	DESC
`);

export const getHighestActiveBid = db.prepare(`
	SELECT * FROM bids
	WHERE auction_id = ? AND is_cancelled = 0
	ORDER BY amount DESC, created_at ASC
	LIMIT 1
`);

export const getWinningBid = db.prepare(`
	SELECT * FROM bids 
	WHERE auction_id = ? 
	AND is_winning = 1
	AND is_cancelled = 0
`);

export const cancelBidById = db.prepare(`
	UPDATE bids SET is_cancelled = 1, is_winning = 0 WHERE bid_id = ?
`);

export const setBidWinning = db.prepare(`UPDATE bids SET is_winning = 1 WHERE bid_id = ?`);

export const clearWinningBids = db.prepare(`
	UPDATE bids SET is_winning = 0 WHERE auction_id = ? AND is_winning = 1
`);

export const cancelBidByUserId = db.prepare(`
	DELETE FROM bids WHERE user_id = ?
`);

export function incrementFor(rules, price) {
	const rule = rules.find(
		(rule) => price >= rule.min && (rule.max === null || price < rule.max),
	);
	return rule ? rule.increment : rules[rules.length - 1].increment;
}
