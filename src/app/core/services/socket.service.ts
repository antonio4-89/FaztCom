import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  constructor(private auth: AuthService) {}

  connect() {
    if (this.socket?.connected) return;
    this.socket = io(environment.socketUrl, { auth: { token: this.auth.getToken() } });
    this.socket.on('connect', () => {
      const user = this.auth.currentUser;
      if (user) this.socket!.emit('join-room', { role: user.role, userId: user.id });
    });
  }

  disconnect() { this.socket?.disconnect(); this.socket = null; }

  on<T>(event: string): Observable<T> {
    return new Observable(observer => {
      this.socket?.on(event, (data: T) => observer.next(data));
      return () => this.socket?.off(event);
    });
  }

  onNuevaComandaCocina() { return this.on<any>('nueva-comanda-cocina'); }
  onNuevaComandaBarra() { return this.on<any>('nueva-comanda-barra'); }
  onComandaActualizada() { return this.on<any>('comanda-actualizada'); }
  onPedidoListo() { return this.on<any>('pedido-listo'); }
  onMesaActualizada() { return this.on<any>('mesa-actualizada'); }
}
