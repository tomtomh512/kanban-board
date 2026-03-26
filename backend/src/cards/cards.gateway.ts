import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CardWithAssignees } from './cards.types';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class CardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private projectRooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.projectRooms.forEach((clients, projectId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.projectRooms.delete(projectId);
      }
    });
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(client: Socket, projectId: string): void {
    client.join(`project:${projectId}`);

    if (!this.projectRooms.has(projectId)) {
      this.projectRooms.set(projectId, new Set());
    }
    this.projectRooms.get(projectId)!.add(client.id);

    console.log(`Client ${client.id} joined project ${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(client: Socket, projectId: string): void {
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

  emitToProject(projectId: string, event: string, data: unknown): void {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  cardCreated(projectId: string, card: CardWithAssignees): void {
    this.emitToProject(projectId, 'cardCreated', card);
  }

  cardUpdated(projectId: string, card: CardWithAssignees): void {
    this.emitToProject(projectId, 'cardUpdated', card);
  }

  cardDeleted(projectId: string, cardId: string): void {
    this.emitToProject(projectId, 'cardDeleted', { cardId });
  }

  cardMoved(projectId: string, card: CardWithAssignees): void {
    this.emitToProject(projectId, 'cardMoved', card);
  }
}
