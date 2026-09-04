let ioInstance = null;

export function initSocket(io) {
    ioInstance = io;

    io.on("connection", (socket) => {
        socket.on("join-auction", (auctionId) => {
            socket.join(`auction:${auctionId}`);
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
