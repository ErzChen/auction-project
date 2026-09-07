import { APPLICATION_SECRET_KEY } from '../config.js';
import db from './db.js';
import { getSession } from './users-db.js';

export function authenticate(req, res, next) {
	const sessionId = req.cookies?.sessionId;
	if (!sessionId) return res.status(401).json({ message: 'Not authenticated' });

	const session = getSession.get(sessionId);

	if (!session || session.expires_at < Date.now())
		return res.status(401).json({ message: 'Session expired' });

	req.userId = session.user_id;
	next();
}

export function verifyApplication(req, res, next) {
	const token = req.header('X-Auction-Application-Key');

	if (token == APPLICATION_SECRET_KEY) {
		return next();
	}

	return res.status(401).json({ message: 'Unauthorized: Access Denied.' });
}
