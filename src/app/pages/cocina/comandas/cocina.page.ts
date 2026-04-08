import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ComandasService } from '../../../core/services/comandas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Comanda, ComandaStatus } from '../../../core/models/comanda.model';

const ORDER: Record<ComandaStatus, number> = {
  pendiente: 0, en_preparacion: 1, listo: 2, entregado: 3,
};

@Component({
  selector: 'app-cocina',
  templateUrl: 'cocina.page.html',
  styleUrls: ['cocina.page.scss'],
  standalone: false
})
export class CocinaPage implements OnInit, OnDestroy {
  comandas: Comanda[] = [];
  loading = false;
  private subs: Subscription[] = [];

  constructor(
    private svc: ComandasService,
    private socket: SocketService,
    private toast: ToastController,
  ) {}

  ngOnInit() {
    this.socket.connect();
    this.load();
    this.subs.push(
      this.socket.onNuevaComandaCocina().subscribe((c: Comanda) => {
        this.comandas = [c, ...this.comandas];
        this.sort();
      }),
      this.socket.onComandaActualizada().subscribe((u: Comanda) => {
        this.comandas = this.comandas.map(c => (c.id === u.id ? u : c));
        this.sort();
      }),
    );
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  load() {
    this.loading = true;
    this.svc.getComandasCocina().subscribe({
      next: d => { this.comandas = d; this.sort(); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  sort() { this.comandas.sort((a, b) => ORDER[a.status] - ORDER[b.status]); }
  count(s: ComandaStatus) { return this.comandas.filter(c => c.status === s).length; }

  preparar(c: Comanda) {
    this.svc.updateStatus(c.id, 'en_preparacion').subscribe({
      next: (u: Comanda) => { this.comandas = this.comandas.map(x => (x.id === u.id ? u : x)); this.sort(); },
    });
  }

  marcarListo(c: Comanda) {
    this.svc.updateStatus(c.id, 'listo').subscribe({
      next: async (u: Comanda) => {
        this.comandas = this.comandas.map(x => (x.id === u.id ? u : x));
        this.sort();
        const t = await this.toast.create({ message: 'Pedido listo — mesero notificado', duration: 2000, color: 'success', position: 'top' });
        await t.present();
      },
    });
  }

  getBorder(s: ComandaStatus): string {
    const m: Record<ComandaStatus, string> = {
      pendiente: 'var(--fc-yellow)', en_preparacion: 'var(--fc-blue)',
      listo: 'var(--fc-green)', entregado: 'var(--fc-purple)',
    };
    return m[s];
  }

  itemName(item: any) { return item.producto?.name || item.customName || item.name || ''; }
}
