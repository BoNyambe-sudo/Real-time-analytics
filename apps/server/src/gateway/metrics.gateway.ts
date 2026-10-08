import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { SocketAuthGuard } from '../auth/socket-auth.guard.js';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:3000'],
    credentials: true,
  },
  path: '/socket.io',
})
@UseGuards(SocketAuthGuard)
export class MetricsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly socketAuthGuard: SocketAuthGuard) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.socketAuthGuard.authenticate(client);
      if (!user) {
        client.emit('unauthorized', { message: 'Authentication required' });
        client.disconnect(true);
        return;
      }
      client.data.user = user;
      console.log(`Client connected: ${client.id} (user ${user.id})`);
    } catch {
      client.emit('unauthorized', { message: 'Authentication required' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:org')
  async handleJoinOrg(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orgId: string }
  ): Promise<void> {
    const user = client.data.user;
    if (!user || (user.role !== 'admin' && user.orgId !== payload.orgId)) {
      client.emit('error', { event: 'join:org', message: 'Forbidden' });
      return;
    }
    await client.join(`org:${payload.orgId}`);
    client.emit('connected', { orgId: payload.orgId, latency: 0 });
  }

  @SubscribeMessage('leave:org')
  async handleLeaveOrg(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orgId: string }
  ): Promise<void> {
    await client.leave(`org:${payload.orgId}`);
  }

  @SubscribeMessage('ping')
  async handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { ts: number }
  ): Promise<{ ts: number; serverTs: number }> {
    return { ts: payload.ts, serverTs: Date.now() };
  }

  emitToOrg(orgId: string, event: string, data: unknown) {
    this.server.to(`org:${orgId}`).emit(event, data);
  }
}
