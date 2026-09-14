import express from 'express';
import bcrypt from 'bcrypt';
import db from '../middleware/db.js';
import crypto from 'crypto';
import { FRONTEND_URL, JWT_SECRET_KEY, resend } from '../config.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
	deleteSession,
	deleteUser,
	expirePasswordReset,
	getPasswordResetByToken,
	getUserByEmail,
	getUserByEmailOrUsername,
	getUserById,
	getUserByUsername,
	insertPasswordReset,
	insertSession,
	insertUser,
	updateUserPassword,
} from '../middleware/users-db.js';
import { authenticate } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { cancelBidByUserId } from '../middleware/bids-db.js';
import { cancelPreBidByUserId } from '../middleware/prebids-db.js';
import { deleteAuctionByUserId } from '../middleware/auctions-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RESET_TOKEN_TIME_LIMIT = 30 * 60 * 1000;
const router = express.Router();

function validatePassword(password) {
	if (password.length < 8) return 'Password must be atleast 8 characters';
	if (password.length > 128)
		return 'Password cannot be greater than 128 characters';
	if (password.toLowerCase() == password)
		return 'Password must contain a capital letter';
	if (password.toUpperCase() === password)
		return 'Password must contain a lowercase letter';
	if (!/\d/.test(password)) return 'Password must contain a number';
	if (!/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\';`/~]/.test(password))
		return 'Password must contain a special character';
	if (/\s/.test(password)) return 'Password cannot contain spaces';
	return null;
}

function createJwtToken(sessionId, rememberMe = false) {
	const expiresIn = rememberMe ? '30d' : '24h';
	return jwt.sign({ sessionId }, JWT_SECRET_KEY, { expiresIn });
}

function createLoginSession(db, res, userId, rememberMe = false) {
	const sessionId = crypto.randomBytes(32).toString('hex');
	const age = rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24;
	const expiresAt = Date.now() + age;

	insertSession.run(sessionId, userId, expiresAt);

	const token = createJwtToken(sessionId, rememberMe);

	res.cookie('sessionId', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: age,
	});

	return token;
}

router.post('/api/register', async (req, res) => {
	try {
		const { password } = req.body;
		let { username, email } = req.body;

		if (!username || !email || !password)
			return res.status(400).json({ message: 'Please fill in all fields' });

		email = email.toLowerCase().trim();
		username = username.toLowerCase().trim();

		const existing = getUserByEmailOrUsername.get(email, username);
		if (existing)
			return res.status(409).json({ message: 'Username or email already taken' });

		const passwordErr = validatePassword(password);
		if (passwordErr) return res.status(422).json({ message: passwordErr });

		const password_hash = await bcrypt.hash(password, 12);
		const info = insertUser.run(username, email, password_hash);
		const token = createLoginSession(db, res, info.lastInsertRowid);
		const user = { id: info.lastInsertRowid, username, email };

		res.status(201).json({ user, token });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

router.post('/api/login', async (req, res) => {
	try {
		const { password, rememberMe } = req.body;
		let { username } = req.body;

		if (!username || !password)
			return res.status(400).json({ message: 'Please fill in a fields' });

		username = username.toLowerCase().trim();

		const userRow = getUserByUsername.get(username);
		if (!userRow)
			return res.status(401).json({ message: 'Invalid username or password' });

		const valid = await bcrypt.compare(password, userRow.password_hash);
		if (!valid)
			return res.status(401).json({ message: 'Invalid username or password' });

		const token = createLoginSession(db, res, userRow.user_id, rememberMe);
		const user = { id: userRow.user_id, username: userRow.username, email: userRow.email };

		res.status(200).json({ user, token });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

router.post('/api/logout', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		const bearerToken = authHeader && authHeader.split(' ')[1];
		const cookieToken = req.cookies?.sessionId;
		const token = bearerToken || cookieToken;

		if (token) {
			jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
				if (!err && decoded?.sessionId) {
					deleteSession.run(decoded.sessionId);
				}
			});
		}

		res.clearCookie('sessionId', {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		});

		res.status(200).json({ message: 'Logged out' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

router.post('/api/forgot-password', async (req, res) => {
	try {
		let { email } = req.body;
		if (!email)
			return res.status(400).json({ message: 'Please enter your email' });

		email = email.toLowerCase().trim();

		const user = getUserByEmail.get(email);

		if (user) {
			const rawToken = crypto.randomBytes(32).toString('hex');
			const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
			const expiresAt = Date.now() + RESET_TOKEN_TIME_LIMIT;

			insertPasswordReset.run(user.user_id, tokenHash, expiresAt);

			const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

			await resend.emails.send({
				from: 'onboarding@resend.dev',
				to: email,
				subject: 'Password Reset',
				html: `
					<p>Click below to reset your password. This link expires in ${RESET_TOKEN_TIME_LIMIT / 1000 / 60} minutes.</p>
					<p><a href="${resetLink}">RESET PASSWORD</a></p>
				`,
			});
		}

		res.status(200).json({ message: 'Reset link sent to email provided.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

router.post('/api/reset-password', async (req, res) => {
	try {
		const { token, password } = req.body;

		if (!password)
			return res.status(400).json({ message: 'Please enter a new password' });
		if (!token)
			return res.status(400).json({ message: 'Invalid or expired reset link' });

		const passwordError = validatePassword(password);
		if (passwordError) return res.status(422).json({ message: passwordError });

		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

		const record = getPasswordResetByToken.get(tokenHash);

		if (!record || record.expires_at < Date.now())
			return res.status(400).json({ message: 'Invalid or expired reset link' });

		const password_hash = await bcrypt.hash(password, 12);
		updateUserPassword.run(password_hash, record.user_id);
		expirePasswordReset.run(record.reset_id);

		res.status(200).json({ message: 'Password updated' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

router.get('/reset-password', (req, res) => {
	res.sendFile(
		path.join(__dirname, '../public/pages/reset-password.html'),
		(err) => {
			if (err) {
				console.error(err);
				res.status(500).send('Something went wrong');
			}
		},
	);
});

router.get('/api/user/:user_id', async (req, res) => {
	try {
		if (!req.params.user_id)
			return res.status(400).json({ message: 'Invalid user id' });

		const row = getUserById.get(req.params.user_id);

		if (!row) return res.status(404).json({ message: 'User not found' });

		res
			.status(200)
			.json({ id: row.user_id, username: row.username, email: row.email });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

router.delete('/api/delete', authenticate, async (req, res) => {
	deleteUser.run(req.userId);
});

router.get('/api/me', authenticate, async (req, res) => {
	try {
		const row = getUserById.get(req.userId);
		if (!row) return res.status(404).json({ message: 'User not found' });
		res
			.status(200)
			.json({ id: req.userId, username: row.username, email: row.email });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

export default router;
