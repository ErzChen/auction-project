import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
	if (!socket) {
		socket = io(process.env.EXPO_PUBLIC_API_BASE);
	}
	return socket;
}
