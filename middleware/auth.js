import db from './db.js';
import { getSession } from './users-db.js';

export function authenticate(req, res, next) {
	const sessionId = req.cookies?.sessionId;
	if (!sessionId) return res.status(401).json({ message: 'Not authenticated' });

	const session = getSession.get(sessionId);

	if (!session || session.expires_at < Date.now()) return res.status(401).json({ message: 'Session expired' });

	req.userId = session.user_id;
	next();
}
