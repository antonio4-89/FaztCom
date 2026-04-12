import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function setIO(server: HttpServer): void {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:8100',
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] client connected: ${socket.id}`);

    /**
     * Client sends:
     *   { role: 'cocinero' | 'bartender' | 'mesero', userId: number }
     *
     * Rooms:
     *   - cocineros  → 'cocina'
     *   - bartenders → 'barra'
     *   - meseros    → `mesero-${userId}`
     *   - admins     → 'admin'
     */
    socket.on('join-room', (data: { role: string; userId: number }) => {
      const { role, userId } = data;

      switch (role) {
        case 'cocinero':
          socket.join('cocina');
          console.log(`[Socket] ${socket.id} joined room: cocina`);
          break;
        case 'bartender':
          socket.join('barra');
          console.log(`[Socket] ${socket.id} joined room: barra`);
          break;
        case 'mesero':
          socket.join(`mesero-${userId}`);
          console.log(`[Socket] ${socket.id} joined room: mesero-${userId}`);
          break;
        case 'admin':
          socket.join('admin');
          socket.join('cocina');
          socket.join('barra');
          console.log(`[Socket] ${socket.id} joined rooms: admin, cocina, barra`);
          break;
        default:
          console.warn(`[Socket] unknown role: ${role}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] client disconnected: ${socket.id}`);
    });
  });
}

// ─── Emit helpers used by controllers ────────────────────────────────────────

export function emitNuevaComandaCocina(comanda: object): void {
  if (io) io.to('cocina').emit('nueva-comanda-cocina', comanda);
}

export function emitNuevaComandaBarra(comanda: object): void {
  if (io) io.to('barra').emit('nueva-comanda-barra', comanda);
}

export function emitComandaActualizada(comanda: object): void {
  if (io) io.emit('comanda-actualizada', comanda);
}

export function emitPedidoListoMesero(meseroId: number, payload: object): void {
  if (io) io.to(`mesero-${meseroId}`).emit('pedido-listo', payload);
}

export function emitMesaActualizada(mesa: object): void {
  if (io) io.emit('mesa-actualizada', mesa);
}

export function emitMenuActualizado(producto: object): void {
  if (io) io.emit('menu-actualizado', producto);
}

export function emitNotaCerrada(notaId: number): void {
  if (io) io.emit('nota-cerrada', { notaId });
}
