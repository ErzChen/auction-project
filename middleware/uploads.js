import fs from 'fs';
import path from 'path';
import { DB_DIR } from '../config.js';
import multer from 'multer';

export const UPLOAD_DIR = path.join(DB_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
export const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024, files: 8 },
	fileFilter: (req, file, cb) => {
		if (!file.mimetype.startsWith('image/')) {
			return cb(new Error('Only image files are allowed'));
		}
		cb(null, true);
	},
});

export async function deleteImageFiles(imagePathsJson) {
	let paths = [];
	try {
		paths = JSON.parse(imagePathsJson || '[]');
	} catch (err) {
		console.error('Failed to parse image_paths for cleanup:', err);
		return;
	}

	await Promise.all(
		paths.map(async (imagePath) => {
			const filename = path.basename(imagePath);
			const filePath = path.join(UPLOAD_DIR, filename);
			try {
				await fs.promises.unlink(filePath);
			} catch (err) {
				if (err.code !== 'ENOENT') {
					console.error(`Failed to delete image ${filePath}:`, err);
				}
			}
		}),
	);
}
