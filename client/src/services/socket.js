import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to okDriver Real-time Event Bus');
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from Real-time Event Bus');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};
