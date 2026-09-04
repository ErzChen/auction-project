import express from 'express';
import db from '../middleware/db.js';
import { authenticate } from '../middleware/auth.js';
import { cancelPreBidById, getPreBidById, getUserPreBid, insertPreBid } from '../middleware/prebids-db.js';
import { getAuctionById } from '../middleware/auctions-db.js';

const router = express.Router();

router.get('/api/pre-bids/:auction_id', authenticate, async (req, res) => {
	try {
		const preBid = getUserPreBid.get(req.params.auction_id, req.userId);
		res.status(200).json({ preBid: preBid || null });
	} catch (err) {
		console.error('Error fetching pre-bid:', err);
		res.status(500).json({ message: 'Failed to fetch pre-bid' });
	}
});

router.post('/api/pre-bids', authenticate, async (req, res) => {
	try {
		const { auction_id } = req.body;
		const user_id = req.userId;

		if (!auction_id) {
			return res.status(400).json({ message: 'Please provide an auction' });
		}

		const auction = getAuctionById.get(auction_id);
		if (!auction) return res.status(404).json({ message: 'Auction not found' });
		if (auction.status !== 'upcoming') {
			return res.status(400).json({ message: 'Pre-bids can only be queued on upcoming auctions' });
		}
		if (auction.user_id === user_id) {
			return res.status(403).json({ message: 'You cannot bid on your own listing' });
		}
		if (getUserPreBid.get(auction_id, user_id)) {
			return res.status(409).json({ message: 'You already have a pre-bid queued for this auction' });
		}

		const { lastInsertRowid } = insertPreBid.run({
			auction_id,
			user_id,
			amount: auction.starting_price,
		});

		res.status(200).json({ message: 'Pre-bid queued', pre_bid_id: lastInsertRowid });
	} catch (err) {
		console.error('Error creating pre-bid:', err);
		res.status(500).json({ message: 'Failed to queue pre-bid' });
	}
});

router.put('/api/pre-bids/:pre_bid_id/cancel', authenticate, async (req, res) => {
	try {
		const { pre_bid_id } = req.params;
		const preBid = getPreBidById.get(pre_bid_id);

		if (!preBid) return res.status(400).json({ message: 'Pre-bid already cancelled' });
		if (preBid.user_id !== req.userId) return res.status(403).json({ message: 'You can only cancel your own pre-bid' });

		cancelPreBidById.run(pre_bid_id);
		res.status(200).json({ message: 'Pre-bid cancelled' });
	} catch (err) {
		console.error('Error cancelling pre-bid:', err);
		res.status(500).json({ message: 'Failed to cancel pre-bid' });
	}
});

export default router;