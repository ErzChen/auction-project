import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io(CONFIG.API_BASE, {
            withCredentials: true,
        });
    }
    return socket;
}