import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL;

export function useWebSocket(projectId: string | undefined, callbacks: {
    onCardCreated?: (card: any) => void;
    onCardUpdated?: (card: any) => void;
    onCardDeleted?: (data: { cardId: string }) => void;
    onCardMoved?: (card: any) => void;
}) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!projectId) return;

        // Create socket connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('WebSocket connected');
            socket.emit('joinProject', projectId);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        // Listen for card events
        if (callbacks.onCardCreated) {
            socket.on('cardCreated', callbacks.onCardCreated);
        }

        if (callbacks.onCardUpdated) {
            socket.on('cardUpdated', callbacks.onCardUpdated);
        }

        if (callbacks.onCardDeleted) {
            socket.on('cardDeleted', callbacks.onCardDeleted);
        }

        if (callbacks.onCardMoved) {
            socket.on('cardMoved', callbacks.onCardMoved);
        }

        // Cleanup on unmount
        return () => {
            socket.emit('leaveProject', projectId);
            socket.off('cardCreated');
            socket.off('cardUpdated');
            socket.off('cardDeleted');
            socket.off('cardMoved');
            socket.disconnect();
        };
    }, [projectId, callbacks.onCardCreated, callbacks.onCardUpdated, callbacks.onCardDeleted, callbacks.onCardMoved]);

    return socketRef.current;
}