import { getViewCount, insertView } from "./auctions-db.js";

let ioInstance = null;

export function initSocket(io) {
    ioInstance = io;

    io.on("connection", (socket) => {
        socket.on("join-auction", (auctionId, userId) => {
            socket.join(`auction:${auctionId}`);
            if (userId != "none") {
                insertView.run(auctionId, userId || socket.handshake.address);
                const { count } = getViewCount.get(auctionId);
                io.to(`auction:${auctionId}`).emit('view-count-update', { auctionId, count });
            }
        });
        socket.on("leave-auction", (auctionId) => {
            socket.leave(`auction:${auctionId}`);
        });
    });
}

export function getIo() {
	if (!ioInstance) throw new Error('Socket.io not initialized');
	return ioInstance;
}
