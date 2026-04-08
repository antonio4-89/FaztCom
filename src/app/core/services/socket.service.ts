import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private subjects = new Map<string, Subject<any>>();

  constructor(private auth: AuthService) {}

  connect() {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }
    this.socket = io(environment.socketUrl, {
      auth: { token: this.auth.getToken() },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    this.socket.on('connect', () => {
      const user = this.auth.currentUser;
      if (user) this.socket!.emit('join-room', { role: user.role, userId: user.id });
    });

    // Wire up all known events to their subjects
    const events = [
      'nueva-comanda-cocina', 'nueva-comanda-barra',
      'comanda-actualizada', 'pedido-listo', 'mesa-actualizada',
      'menu-actualizado',
    ];
    for (const event of events) {
      this.socket.on(event, (data: any) => {
        this.getSubject(event).next(data);
      });
    }
  }

  disconnect() { this.socket?.disconnect(); }

  private getSubject(event: string): Subject<any> {
    if (!this.subjects.has(event)) {
      this.subjects.set(event, new Subject<any>());
    }
    return this.subjects.get(event)!;
  }

  on<T>(event: string): Observable<T> {
    return this.getSubject(event).asObservable();
  }

  onNuevaComandaCocina() { return this.on<any>('nueva-comanda-cocina'); }
  onNuevaComandaBarra() { return this.on<any>('nueva-comanda-barra'); }
  onComandaActualizada() { return this.on<any>('comanda-actualizada'); }
  onPedidoListo() { return this.on<any>('pedido-listo'); }
  onMesaActualizada() { return this.on<any>('mesa-actualizada'); }
  onMenuActualizado() { return this.on<any>('menu-actualizado'); }
}
