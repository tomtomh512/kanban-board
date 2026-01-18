import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
})
export class CardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private projectRooms: Map<string, Set<string>> = new Map();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        // Clean up project rooms
        this.projectRooms.forEach((clients, projectId) => {
            clients.delete(client.id);
            if (clients.size === 0) {
                this.projectRooms.delete(projectId);
            }
        });
    }

    @SubscribeMessage('joinProject')
    handleJoinProject(client: Socket, projectId: string) {
        client.join(`project:${projectId}`);

        if (!this.projectRooms.has(projectId)) {
            this.projectRooms.set(projectId, new Set());
        }
        this.projectRooms.get(projectId)!.add(client.id);

        console.log(`Client ${client.id} joined project ${projectId}`);
    }

    @SubscribeMessage('leaveProject')
    handleLeaveProject(client: Socket, projectId: string) {
        client.leave(`project:${projectId}`);

        const room = this.projectRooms.get(projectId);
        if (room) {
            room.delete(client.id);
            if (room.size === 0) {
                this.projectRooms.delete(projectId);
            }
        }

        console.log(`Client ${client.id} left project ${projectId}`);
    }

    // Emit events to all clients in a project room
    emitToProject(projectId: string, event: string, data: any) {
        this.server.to(`project:${projectId}`).emit(event, data);
    }

    cardCreated(projectId: string, card: any) {
        this.emitToProject(projectId, 'cardCreated', card);
    }

    cardUpdated(projectId: string, card: any) {
        this.emitToProject(projectId, 'cardUpdated', card);
    }

    cardDeleted(projectId: string, cardId: string) {
        this.emitToProject(projectId, 'cardDeleted', { cardId });
    }

    cardMoved(projectId: string, card: any) {
        this.emitToProject(projectId, 'cardMoved', card);
    }
}