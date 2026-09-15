import { APPLICATION_SECRET_KEY, JWT_SECRET_KEY } from '../config.js';
import db from './db.js';
import { getSession } from './users-db.js';
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
	const authHeader = req.headers.authorization;
	const bearerToken = authHeader && authHeader.split(' ')[1];
	const token = bearerToken || req.cookies?.sessionId;

	if (!token) return res.status(401).json({ message: 'Not authenticated' });

	jwt.verify(token, JWT_SECRET_KEY, (err, decodedPayload) => {
		if (err) return res.status(403).json({ message: 'Invalid or expired token' });

		const { sessionId } = decodedPayload;

		if (!sessionId)
			return res.status(401).json({ message: 'Invalid session structure' });

		const session = getSession.get(sessionId);

		if (!session || session.expires_at < Date.now())
			return res.status(401).json({ message: 'Session expired' });

		req.userId = session.user_id;

		next();
	});
}

export function verifyApplication(req, res, next) {
	const requestOrigin = req.headers.origin;
	const selfOrigin = `${req.protocol}://${req.get('host')}`;

	if (!requestOrigin || requestOrigin === selfOrigin) {
		return next();
	}

	const token = req.header('X-Auction-Application-Key');
	if (token == APPLICATION_SECRET_KEY) return next();

	return res.status(401).json({ message: 'Unauthorized: Access Denied.' });
}
