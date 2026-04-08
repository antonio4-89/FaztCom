import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotasService } from '../../../core/services/notas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Nota, ComandaItem } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-comandas-admin',
  templateUrl: 'comandas-admin.page.html',
  styleUrls: ['comandas-admin.page.scss'],
  standalone: false,
})
export class ComandasAdminPage implements OnInit, OnDestroy {
  notas: Nota[] = [];
  loading = false;
  private subs: Subscription[] = [];

  constructor(
    private svc: NotasService,
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
    this.svc.getMisNotas().subscribe({
      next: d => { this.notas = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  allItems(nota: Nota): ComandaItem[] {
    return (nota.comandas ?? []).reduce((acc: ComandaItem[], c) => acc.concat(c.items ?? []), []);
  }

  notaTotal(nota: Nota): number {
    return this.allItems(nota).reduce((s: number, i: ComandaItem) => s + i.price * i.qty, 0);
  }

  allReady(nota: Nota): boolean {
    return (nota.comandas?.length ?? 0) > 0 &&
      nota.comandas!.every(c => c.status === 'listo' || c.status === 'entregado');
  }

  pendingCount(nota: Nota): number {
    return nota.comandas?.filter(c => c.status === 'pendiente' || c.status === 'en_preparacion').length ?? 0;
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { pendiente: 'Pendiente', en_preparacion: 'En prep.', listo: 'Listo', entregado: 'Entregado' };
    return m[s] ?? s;
  }

  statusClass(s: string): string { return 'status-' + s; }

  seccionClass(mesa: Nota['mesa']): string {
    return mesa?.seccion === 'T' ? 'sec-T' : 'sec-PM';
  }

  itemName(item: any): string {
    return item.producto?.name || item.customName || '—';
  }
}
