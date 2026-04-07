import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ComandasService } from '../../../core/services/comandas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Nota } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-comandas-admin',
  templateUrl: 'comandas-admin.page.html',
  styleUrls: ['comandas-admin.page.scss'],
})
export class ComandasAdminPage implements OnInit, OnDestroy {
  notas: Nota[] = [];
  loading = false;
  private subs: Subscription[] = [];

  constructor(
    private svc: ComandasService,
    private socket: SocketService,
  ) {}

  ngOnInit() {
    this.load();
    this.subs.push(
      this.socket.onComandaActualizada().subscribe(() => this.load()),
      this.socket.onNuevaComandaCocina().subscribe(() => this.load()),
      this.socket.onNuevaComandaBarra().subscribe(() => this.load()),
    );
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  load() {
    this.loading = true;
    this.svc.getComandasActivas().subscribe({
      next: d => { this.notas = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  notaTotal(nota: Nota): number {
    return nota.items?.reduce((s, i) => s + i.precio * i.cantidad, 0) ?? 0;
  }

  statusLabel(status: string): string {
    return { pendiente: 'Pendiente', en_preparacion: 'En preparación', listo: 'Listo', entregado: 'Entregado' }[status] ?? status;
  }

  statusClass(status: string): string {
    return 'status-' + status;
  }

  seccionClass(mesa: string): string {
    return mesa?.startsWith('T') ? 'sec-T' : 'sec-PM';
  }

  allItemsReady(nota: Nota): boolean {
    return nota.items?.every(i => i.status === 'listo' || i.status === 'entregado') ?? false;
  }

  pendingCount(nota: Nota): number {
    return nota.items?.filter(i => i.status === 'pendiente' || i.status === 'en_preparacion').length ?? 0;
  }
}
