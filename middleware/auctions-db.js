import { getWinningBid, insertBid } from './bids-db.js';
import db from './db.js';
import { getPreBidsForAuction } from './prebids-db.js';
import { FRONTEND_URL, resend } from '../config.js';
import { getUserById } from './users-db.js';
import { getIo } from './socket.js';


export const insertAuction = db.prepare(`
	INSERT INTO auctions (
		user_id, starting_price, current_price, bid_increment_rules, currency,
		title, description, condition, category, image_paths,
		location, is_shipping_available, shipping_pickup_description, shipping_cost,
		start_time, end_time, status, updated_at
	) VALUES (
		@user_id, @starting_price, @current_price, @bid_increment_rules, @currency,
		@title, @description, @condition, @category, @image_paths,
		@location, @is_shipping_available, @shipping_pickup_description, @shipping_cost,
		@start_time, @end_time, @status, datetime('now')
	)
`);

export const updateAuction = db.prepare(`
  	UPDATE auctions
  	SET
		starting_price = @starting_price,
		bid_increment_rules = @bid_increment_rules,
		currency = @currency,
		title = @title,
		description = @description,
		condition = @condition,
		category = @category,
		image_paths = @image_paths,
		location = @location,
		is_shipping_available = @is_shipping_available,
		shipping_pickup_description = @shipping_pickup_description,
		shipping_cost = @shipping_cost,
		start_time = @start_time,
		end_time = @end_time,
		status = @status,
		updated_at = datetime('now')
  	WHERE auction_id = @auction_id
`);

export const getAuctionById = db.prepare(`
	SELECT * FROM auctions WHERE auction_id = ? AND deleted = 0
`);

export const softDeleteAuction = db.prepare(`
	UPDATE auctions
	SET deleted = 1, deleted_at = datetime('now'), updated_at = datetime('now')
	WHERE auction_id = ?
`);

export const updateAuctionCurrentPrice = db.prepare(`
	UPDATE auctions SET current_price = ?, updated_at = datetime('now') WHERE auction_id = ?
`);

export const setAuctionWinner = db.prepare(`
    UPDATE auctions SET winning_user_id = ?, winning_bid_id = ?, updated_at = datetime('now')
    WHERE auction_id = ?
`);

export const deleteAuctionByUserId = db.prepare(`
    DELETE FROM auctions WHERE user_id = ?
`);

export function searchAuctions(filters = {}) {
	const {
		statuses,
		category,
		keyword,
		start_price,
		end_price,
		user_id,
		id,
		limit,
		offset,
	} = filters;

	const conditions = [];
	const params = [];

	const statusList = statuses
		? Array.isArray(statuses)
			? statuses
			: [statuses]
		: [];

	if (statusList.length) {
		const placeholders = statusList.map(() => 'status = ?').join(' OR ');
		conditions.push(`(${placeholders})`);
		params.push(...statusList);
	}

	if (category) {
		conditions.push('category = ?');
		params.push(category);
	}

	if (keyword) {
		conditions.push('(title LIKE ? OR description LIKE ?)');
		params.push(`%${keyword}%`, `%${keyword}%`);
	}

	if (start_price !== undefined && start_price !== '') {
		conditions.push('current_price >= ?');
		params.push(Number(start_price));
	}

	if (end_price !== undefined && end_price !== '') {
		conditions.push('current_price <= ?');
		params.push(Number(end_price));
	}

	if (user_id) {
		conditions.push('user_id = ?');
		params.push(Number(user_id));
	}

	if (id) {
		conditions.push('auction_id = ?');
		params.push(Number(id));
	}

	const safeLimit = Number(limit) || 20;
	const safeOffset = Number(offset) || 0;
	params.push(safeLimit, safeOffset);

	const getAuction = db.prepare(`
		SELECT *
		FROM auctions
		WHERE deleted = 0
		${conditions.length ? 'AND ' + conditions.join(' AND ') : ''}
		ORDER BY auction_id DESC
		LIMIT ? OFFSET ?
	`);

	return getAuction.all(...params);
}

const getDueUpcomingAuctions = db.prepare(`
	SELECT * FROM auctions
	WHERE status = 'upcoming' AND deleted = 0 AND datetime(start_time) <= datetime('now')
`);

const setAuctionStatus = db.prepare(`
	UPDATE auctions SET status = ?, updated_at = datetime('now') WHERE auction_id = ?
`);

export function activateUpcomingAuctions() {
	const dueAuctions = getDueUpcomingAuctions.all();
	if (dueAuctions.length === 0) return;

	const activateAuction = db.transaction((auction) => {
		setAuctionStatus.run('active', auction.auction_id);

		const queued = getPreBidsForAuction.all(auction.auction_id);

		queued.forEach((preBid, i) => {
			insertBid.run({
				auction_id: auction.auction_id,
				user_id: preBid.user_id,
				amount: auction.starting_price,
				is_winning: i === 0 ? 1 : 0,
				is_cancelled: 0,
			});
		});

		if (queued.length > 0) {
			updateAuctionCurrentPrice.run(auction.starting_price, auction.auction_id);
		}
	});

	for (const auction of dueAuctions) {
		activateAuction(auction);
		getIo().to(`auction:${auction.auction_id}`).emit('update-auction-status', {
			auction_id: auction.auction_id,
			status: 'active',
		});
	}
}

const getDueActiveAuctions = db.prepare(`
	SELECT * FROM auctions
	WHERE status = 'active' AND deleted = 0 AND datetime(end_time) <= datetime('now')
`);

export async function expireActiveAuctions() {
	const dueAuctions = getDueActiveAuctions.all();
	if (dueAuctions.length === 0) return;

	const expireAuction = db.transaction((auction) => {
		const winningBid = getWinningBid.get(auction.auction_id);

		if (!winningBid) {
			setAuctionStatus.run('expired', auction.auction_id);
			return { winner: null, status: 'expired' };
		}

		setAuctionStatus.run('sold', auction.auction_id);
		setAuctionWinner.run(
			winningBid.user_id,
			winningBid.bid_id,
			auction.auction_id,
		);

		const winner = getUserById.get(winningBid.user_id);
		return { winner, status: 'sold' };
	});

	for (const auction of dueAuctions) {
		const { winner, status } = expireAuction(auction);
		getIo()
			.to(`auction:${auction.auction_id}`)
			.emit('update-auction-status', { auction_id: auction.auction_id, status });

		if (winner) {
			await resend.emails
				.send({
					from: 'onboarding@resend.dev',
					to: winner.email,
					subject: auction.title,
					html: `
					<p>You have won the auction for a ${auction.title}</p>
					<p><a href="${FRONTEND_URL}/listing/${auction.auction_id}">Pay at the listing page</a></p>
				`,
				})
				.catch((err) =>
					console.error(`Failed to send email to ${winner.email}:`, err),
				);
		}
	}
}

export const insertView = db.prepare(`
    INSERT OR IGNORE INTO auction_views (auction_id, viewer_key)
    VALUES (?, ?)
`);

export const getViewCount = db.prepare(
	`SELECT COUNT(*) FROM auction_views WHERE auction_id = ?`,
);
