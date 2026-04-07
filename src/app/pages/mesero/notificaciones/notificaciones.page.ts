import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacionesService, Notificacion } from '../../../core/services/notificaciones.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: 'notificaciones.page.html',
  styleUrls: ['notificaciones.page.scss'],
  standalone: false
})
export class NotificacionesPage implements OnInit, OnDestroy {
  notifs: Notificacion[] = [];
  loading = false;
  private socketSub?: Subscription;

  constructor(
    private notifService: NotificacionesService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.loadNotificaciones();
    this.socketService.connect();
    this.socketSub = this.socketService.onPedidoListo().subscribe(() => {
      this.loadNotificaciones();
    });
  }

  ngOnDestroy() {
    this.socketSub?.unsubscribe();
  }

  loadNotificaciones() {
    this.loading = true;
    this.notifService.getNotificaciones().subscribe({
      next: n => { this.notifs = n; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get unreadCount(): number {
    return this.notifs.filter(n => !n.read).length;
  }

  markRead(notif: Notificacion) {
    if (notif.read) return;
    this.notifService.markRead(notif.id).subscribe({
      next: () => { notif.read = true; },
    });
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe({
      next: () => { this.notifs.forEach(n => n.read = true); },
    });
  }

  getIcon(tipo: string): string {
    if (tipo === 'cocina') return 'flame-outline';
    if (tipo === 'barra') return 'wine-outline';
    return 'notifications-outline';
  }

  getIconColor(tipo: string): string {
    if (tipo === 'cocina') return 'var(--fc-accent)';
    if (tipo === 'barra') return 'var(--fc-blue)';
    return 'var(--fc-muted)';
  }
}
