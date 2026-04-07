import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { NotasService } from '../../../core/services/notas.service';
import { ComandasService } from '../../../core/services/comandas.service';
import { Nota, Comanda, ComandaItem } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: 'mis-pedidos.page.html',
  styleUrls: ['mis-pedidos.page.scss'],
  standalone: false
})
export class MisPedidosPage implements OnInit {
  notas: Nota[] = [];
  loading = false;

  constructor(
    private notasService: NotasService,
    private comandasService: ComandasService,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  ngOnInit() {
    this.loadNotas();
  }

  loadNotas() {
    this.loading = true;
    this.notasService.getMisNotas().subscribe({
      next: n => { this.notas = n; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getTotal(nota: Nota): number {
    if (!nota.comandas) return nota.total || 0;
    return nota.comandas.reduce((sum, c) => {
      return sum + (c.items || []).reduce((s, i) => s + i.price * i.qty, 0);
    }, 0);
  }

  getItemName(item: ComandaItem): string {
    return item.producto?.name || item.customName || item.name || 'Item';
  }

  getSeccion(identifier: string): string {
    const pm = ['1PM','2PM','3PM','4PM','5PM','SALA'];
    return pm.includes(identifier) ? 'PM' : 'T';
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

  async removeItem(comanda: Comanda, item: ComandaItem) {
    const a = await this.alert.create({
      header: 'Eliminar item',
      message: `Eliminar "${this.getItemName(item)}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.comandasService.removeItem(comanda.id, item.id).subscribe({
              next: () => this.loadNotas(),
              error: async () => {
                const t = await this.toast.create({ message: 'Error al eliminar', duration: 2000, color: 'danger', position: 'top' });
                await t.present();
              },
            });
          },
        },
      ],
    });
    await a.present();
  }

  async closeNota(nota: Nota) {
    const a = await this.alert.create({
      header: 'Cerrar cuenta',
      message: `Cerrar cuenta de mesa ${nota.mesa?.identifier}? Total: $${this.getTotal(nota)}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar cuenta',
          handler: () => {
            this.notasService.closeNota(nota.id).subscribe({
              next: async () => {
                const t = await this.toast.create({ message: 'Cuenta cerrada correctamente', duration: 2500, color: 'success', position: 'top' });
                await t.present();
                this.loadNotas();
              },
              error: async () => {
                const t = await this.toast.create({ message: 'Error al cerrar cuenta', duration: 2000, color: 'danger', position: 'top' });
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
