import express from 'express';
import {
	getAuctionById,
	updateAuctionCurrentPrice,
} from '../middleware/auctions-db.js';
import db from '../middleware/db.js';
import { authenticate } from '../middleware/auth.js';
import {
	cancelBidById,
	clearWinningBids,
	getBidById,
	getBidsFromAuction,
	getHighestActiveBid,
	incrementFor,
	insertBid,
	setBidWinning,
} from '../middleware/bids-db.js';
import { getIo } from '../middleware/socket.js';

const router = express.Router();

router.get('/api/bids/:auction_id', async (req, res) => {
	try {
		const results = getBidsFromAuction.all(req.params.auction_id);
		res.status(200).json({ bids: results });
	} catch (err) {
		console.error('Error fetching bids:', err);
		res.status(500).json({ message: 'Failed to fetch bids' });
	}
});

router.post('/api/bids', authenticate, async (req, res) => {
	try {
		const io = req.app.get('socketio');

		const { auction_id, amount } = req.body;
		const user_id = req.userId;

		if (!auction_id) return res.status(400).json({ message: 'Invalid auction' });
		if (!amount)
			return res.status(400).json({ message: 'Please provide a bid amount' });

		const bidAmount = Number(amount);
		if (Number.isNaN(bidAmount) || bidAmount <= 0)
			return res
				.status(400)
				.json({ message: 'Bid amount must be a positive number' });

		const auction = getAuctionById.get(auction_id);
		if (!auction) return res.status(404).json({ message: 'Auction not found' });
		if (auction.status !== 'active')
			return res
				.status(400)
				.json({ message: 'This auction is not open for bidding' });
		if (new Date(auction.end_time).getTime() < Date.now())
			return res.status(400).json({ message: 'This auction has already ended' });
		if (auction.user_id === user_id)
			return res
				.status(403)
				.json({ message: 'You cannot bid on your own listing' });

		const rules = JSON.parse(auction.bid_increment_rules || '[]');
		const minBid =
			auction.current_price + incrementFor(rules, auction.current_price);
		if (bidAmount < minBid)
			return res.status(422).json({ message: `Bid must be at least ${minBid}` });

		const placeBid = db.transaction(() => {
			clearWinningBids.run(auction_id);
			const { lastInsertRowid } = insertBid.run({
				auction_id,
				user_id,
				amount: bidAmount,
				is_winning: 1,
				is_cancelled: 0,
			});
			updateAuctionCurrentPrice.run(bidAmount, auction_id);
			return lastInsertRowid;
		});

		const bidId = placeBid();

		getIo()
			.to(`auction:${auction_id}`)
			.emit('new-bid', {
				bid: getBidById.get(bidId),
				current_price: bidAmount,
			});
		res.status(200).json({ message: 'Bid successful', bid_id: bidId });
	} catch (err) {
		console.error('Error creating bid:', err);
		res.status(500).json({ message: 'Failed to create bid' });
	}
});

router.put('/api/bids/:bid_id/cancel', authenticate, async (req, res) => {
	try {
		const { bid_id } = req.params;
		const user_id = req.userId;

		const bid = getBidById.get(bid_id);
		if (!bid) return res.status(404).json({ message: 'Bid not found' });
		if (bid.user_id !== user_id)
			return res
				.status(403)
				.json({ message: 'You can only cancel your own bids' });
		if (bid.is_cancelled)
			return res.status(400).json({ message: 'Bid already cancelled' });

		const auction = getAuctionById.get(bid.auction_id);
		if (!auction || auction.status !== 'active') {
			return res.status(400).json({ message: 'This auction is no longer open' });
		}

		const cancelAndRecalculate = db.transaction(() => {
			cancelBidById.run(bid_id);
			const nextHighest = getHighestActiveBid.get(bid.auction_id);

			let newPrice;
			if (nextHighest) {
				setBidWinning.run(nextHighest.bid_id);
				newPrice = nextHighest.amount;
			} else {
				newPrice = auction.starting_price;
			}
			updateAuctionCurrentPrice.run(newPrice, bid.auction_id);

			return newPrice;
		});

		const newPrice = cancelAndRecalculate();

		getIo()
			.to(`auction:${bid.auction_id}`)
			.emit('bid-cancelled', {
				bid_id: Number(bid_id),
				current_price: newPrice,
			});

		res.status(200).json({ message: 'Cancel successful' });
	} catch (err) {
		console.error('Error canceling bid:', err);
		res.status(500).json({ message: 'Failed to cancel bid' });
	}
});

export default router;
