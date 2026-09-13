import express from 'express';
import { searchAuctions } from '../middleware/auctions-db.js';
import db from '../middleware/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/api/auctions', async (req, res) => {
	try {
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
		} = req.query;
		const results = searchAuctions({
			statuses: statuses ? [].concat(statuses) : undefined,
			category,
			keyword,
			start_price,
			end_price,
			user_id,
			id,
			limit,
			offset,
		});
		res.status(200).json({ auctions: results });
	} catch (err) {
		console.error('Error fetching auctions:', err);
		res.status(500).json({ message: 'Failed to fetch auctions' });
	}
});

export default router;
