import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import auctionRoutes from './routes/routes-auctions.js';
import prebidRoutes from './routes/routes-prebids.js'
import bidRoutes from './routes/routes-bids.js'
import userRoutes from './routes/routes-users.js'
import { seedDatabase } from './seed-auctions.js';
import { DB_DIR, FRONTEND_URL, PORT, SEED_DB } from './config.js';
import cookieParser from 'cookie-parser';
import { activateUpcomingAuctions, expireActiveAuctions } from './middleware/auctions-db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket } from './middleware/socket.js';
import { verifyApplication } from './middleware/auth.js';

const app = express();
const httpServer = createServer(app);
export const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		if (FRONTEND_URL == origin || 'http://localhost:8081' == origin) return callback(null, true);

		callback(null, false);
	},

	allowedHeaders: ['Content-Type', 'Authorization', 'X-Auction-Application-Key'],
	credentials: true,
};

const io = new Server(httpServer, {
	cors: corsOptions,
});

app.set('socketio', io);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(DB_DIR, 'uploads')));
app.use(verifyApplication);
app.use(auctionRoutes);
app.use(prebidRoutes);
app.use(bidRoutes);
app.use(userRoutes);

initSocket(io);

setInterval(() => {
	activateUpcomingAuctions();
	expireActiveAuctions();
}, [1000]);

if (SEED_DB) {
	seedDatabase();
}

httpServer.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});