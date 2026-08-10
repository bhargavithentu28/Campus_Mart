import { io, Socket } from 'socket.io-client';

const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
  || 'http://localhost:5000';

const SOCKET_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true
});
