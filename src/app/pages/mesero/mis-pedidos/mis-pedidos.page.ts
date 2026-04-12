import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NotasService } from '../../../core/services/notas.service';
import { ComandasService } from '../../../core/services/comandas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Nota, Comanda, ComandaItem } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: 'mis-pedidos.page.html',
  styleUrls: ['mis-pedidos.page.scss'],
  standalone: false
})
export class MisPedidosPage implements OnInit, OnDestroy {
  notas: Nota[] = [];
  loading = false;
  skeletonItems = Array(3); // 3 skeleton cards al cargar

  // Notas que están siendo cerradas en este momento (muestra skeleton individual)
  closingIds = new Set<number>();

  private subs: Subscription[] = [];

  constructor(
    private notasService: NotasService,
    private comandasService: ComandasService,
    private socket: SocketService,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  ngOnInit() {
    this.loadNotas();
    this.socket.connect();
    this.subs.push(
      this.socket.onComandaActualizada().subscribe(() => this.loadNotas(true)),
      this.socket.onNuevaComandaCocina().subscribe(() => this.loadNotas(true)),
      this.socket.onNuevaComandaBarra().subscribe(() => this.loadNotas(true)),
      this.socket.onPedidoListo().subscribe(() => this.loadNotas(true)),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadNotas(silent = false) {
    if (!silent) this.loading = true;
    this.notasService.getMisNotas().subscribe({
      next: n => { this.notas = n; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  // ── Validación: ¿se puede cerrar la nota? ──────────────────────────────────
  canClose(nota: Nota): boolean {
    if (!nota.comandas || nota.comandas.length === 0) return true;
    return nota.comandas.every(
      c => c.status === 'listo' || c.status === 'entregado'
    );
  }

  pendingComandas(nota: Nota): number {
    return (nota.comandas || []).filter(
      c => c.status === 'pendiente' || c.status === 'en_preparacion'
    ).length;
  }

  isClosing(notaId: number): boolean {
    return this.closingIds.has(notaId);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  getTotal(nota: Nota): number {
    if (!nota.comandas) return nota.total || 0;
    return nota.comandas.reduce((sum, c) => {
      return sum + (c.items || []).reduce((s, i) => s + i.price * i.qty, 0);
    }, 0);
  }

  getItemName(item: ComandaItem): string {
    return item.producto?.name || item.customName || item.name || 'Item';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-pendiente',
      en_preparacion: 'badge-preparando',
      listo: 'badge-listo',
      entregado: 'badge-entregado',
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      en_preparacion: 'Preparando',
      listo: 'Listo',
      entregado: 'Entregado',
    };
    return map[status] || status;
  }

  // ── Cancelar producto ────────────────────────────────────────────────────────
  async removeItem(comanda: Comanda, item: ComandaItem) {
    const a = await this.alert.create({
      header: 'Cancelar producto',
      message: `¿Cancelar "${this.getItemName(item)}"? Se notificará a cocina/barra.`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Cancelar producto',
          handler: () => {
            this.comandasService.removeItem(comanda.id, item.id).subscribe({
              next: async () => {
                const t = await this.toast.create({ message: 'Producto cancelado', duration: 2000, color: 'success', position: 'top' });
                await t.present();
                this.loadNotas(true);
              },
              error: async () => {
                const t = await this.toast.create({ message: 'Error al cancelar', duration: 2000, color: 'danger', position: 'top' });
                await t.present();
              },
            });
          },
        },
      ],
    });
    await a.present();
  }

  // ── Cerrar cuenta ────────────────────────────────────────────────────────────
  async closeNota(nota: Nota) {
    // Bloquear si hay pedidos pendientes
    const pending = this.pendingComandas(nota);
    if (pending > 0) {
      const t = await this.toast.create({
        message: `Aún hay ${pending} comanda${pending > 1 ? 's' : ''} en proceso. Espera a que estén listas.`,
        duration: 3500,
        color: 'warning',
        position: 'top',
      });
      await t.present();
      return;
    }

    const label = nota.paraLlevar ? 'Para Llevar' : `Mesa ${nota.mesa?.identifier}`;
    const a = await this.alert.create({
      header: 'Cerrar cuenta',
      message: `¿Cerrar cuenta de ${label}? Total: $${this.getTotal(nota)}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar cuenta',
          handler: () => {
            // Activar skeleton en esta nota
            this.closingIds = new Set(this.closingIds).add(nota.id);

            this.notasService.closeNota(nota.id).subscribe({
              next: async () => {
                this.closingIds.delete(nota.id);
                this.closingIds = new Set(this.closingIds);
                const t = await this.toast.create({ message: 'Cuenta cerrada correctamente', duration: 2500, color: 'success', position: 'top' });
                await t.present();
                this.loadNotas();
              },
              error: async (err) => {
                this.closingIds.delete(nota.id);
                this.closingIds = new Set(this.closingIds);
                const msg = err?.error?.error || 'Error al cerrar cuenta';
                const t = await this.toast.create({ message: msg, duration: 2500, color: 'danger', position: 'top' });
                await t.present();
              },
            });
          },
        },
      ],
    });
    await a.present();
  }
}
