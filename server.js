import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import auctionRoutes from './routes/routes-auctions.js';
import prebidRoutes from './routes/routes-prebids.js'
import bidRoutes from './routes/routes-bids.js'
import userRoutes from './routes/routes-users.js'
import { seedDatabase } from './seed-auctions.js';
import { FRONTEND_URL, PORT, SEED_DB } from './config.js';
import cookieParser from 'cookie-parser';
import { activateUpcomingAuctions, expireActiveAuctions } from './middleware/auctions-db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket } from './middleware/socket.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: { origin: FRONTEND_URL, credentials: true },
});

app.set('socketio', io);
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
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

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});