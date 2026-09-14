import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import {
	insertAuction,
	searchAuctions,
	updateAuction,
	softDeleteAuction,
	getAuctionById,
} from '../middleware/auctions-db.js';
import db from '../middleware/db.js';
import { authenticate } from '../middleware/auth.js';
import { DB_DIR } from '../config.js';

const router = express.Router();

const UPLOAD_DIR = path.join(DB_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024, files: 8 },
	fileFilter: (req, file, cb) => {
		if (!file.mimetype.startsWith('image/')) {
			return cb(new Error('Only image files are allowed'));
		}
		cb(null, true);
	},
});

router.post(
	'/api/auctions/uploads',
	authenticate,
	upload.array('images', 8),
	async (req, res) => {
		if (!req.files || req.files.length == 0) {
			return res.status(400).json({ message: 'No images provided' });
		}

		try {
			const paths = await Promise.all(
				req.files.map(async (file) => {
					const filename = `${crypto.randomUUID()}.webp`;
					const destinationPath = path.join(UPLOAD_DIR, filename);

					await sharp(file.buffer)
						.rotate()
						.resize({ width: 1600, withoutEnlargement: true })
						.webp({ quality: 80 })
						.toFile(destinationPath);

					return filename;
				}),
			);

			res.json({ paths });
		} catch (err) {
			console.error('Failed uploading images:', err);
			res.status(500).json({ message: 'Failed to process images' });
		}
	},
);

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

router.patch('/api/auctions/:auction_id', authenticate, async (req, res) => {
	try {
		const auctionId = Number(req.params.auction_id);
		const existing = getAuctionById.get(auctionId);

		if (!existing) {
			return res.status(404).json({ message: 'Auction not found' });
		}
		if (existing.user_id !== req.userId) {
			return res
				.status(403)
				.json({ message: 'Not authorized to edit this auction' });
		}
		if (existing.status === 'sold') {
			return res
				.status(400)
				.json({ message: 'Sold listings can\u2019t be edited' });
		}

		const now = new Date();
		const hasStarted =
			existing.status !== 'upcoming' || new Date(existing.start_time) <= now;
		const hasExpired =
			existing.status === 'expired' || new Date(existing.end_time) <= now;

		const {
			auction_id,
			user_id,
			starting_price,
			current_price,
			winning_user_id,
			winning_bid_id,
			status,
			start_time,
			end_time,
			...editableFields
		} = req.body;

		const payload = {
			...existing,
			...editableFields,
			auction_id: auctionId,
			user_id: existing.user_id,
			starting_price: existing.starting_price,
			current_price: existing.current_price,
			winning_user_id: existing.winning_user_id,
			winning_bid_id: existing.winning_bid_id,
			status: existing.status,
			start_time: hasStarted
				? existing.start_time
				: (start_time ?? existing.start_time),
			end_time: hasExpired ? existing.end_time : (end_time ?? existing.end_time),
		};

		updateAuction.run(payload);
		const updated = getAuctionById.get(auctionId);
		res.status(200).json(updated);
	} catch (err) {
		console.error('Error updating auction:', err);
		res.status(500).json({ message: 'Failed to update auction' });
	}
});

router.post('/api/auctions', authenticate, async (req, res) => {
	try {
		const result = insertAuction.run({
			...req.body,
			user_id: req.userId,
			status: 'upcoming',
		});
		const auction = getAuctionById.get(result.lastInsertRowid);
		res.status(201).json(auction);
	} catch (err) {
		console.error('Error posting auction:', err);
		res.status(500).json({ message: 'Failed to post auction' });
	}
});

router.delete('/api/auctions/:auction_id', authenticate, async (req, res) => {
	try {
		const auctionId = Number(req.params.auction_id);
		const existing = getAuctionById.get(auctionId);

		if (!existing) return res.status(404).json({ message: 'Auction not found' });
		if (existing.user_id !== req.userId)
			return res
				.status(403)
				.json({ message: 'Not authorized to delete this auction' });

		const hasEnded =
			existing.status === 'expired' ||
			existing.status === 'sold' ||
			new Date(existing.end_time) <= new Date();

		if (hasEnded)
			return res
				.status(400)
				.json({ message: "This listing has already ended and can't be deleted" });

		softDeleteAuction.run(auctionId);
		getIo().to(`auction:${auctionId}`).emit('delete-auction', auctionId);
		res.status(204).json({ message: 'Auction successfully deleted' });
	} catch (err) {
		console.error('Error deleting auction:', err);
		res.status(500).json({ message: 'Failed to delete auction' });
	}
});

router.use((err, req, res, next) => {
	if (
		err instanceof multer.MulterError ||
		err.message === 'Only image files are allowed'
	) {
		return res.status(400).json({ message: err.message });
	}
	next(err);
});

export default router;
