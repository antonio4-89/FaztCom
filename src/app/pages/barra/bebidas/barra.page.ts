import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ComandasService } from '../../../core/services/comandas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Comanda, ComandaStatus, ComandaItem } from '../../../core/models/comanda.model';

const ORDER: Record<ComandaStatus, number> = {
  pendiente: 0, en_preparacion: 1, listo: 2, entregado: 3,
};

interface GroupedItem {
  name: string;
  totalQty: number;
  sources: { comandaId: number; mesa: string; qty: number }[];
}

@Component({
  selector: 'app-barra',
  templateUrl: 'barra.page.html',
  styleUrls: ['barra.page.scss'],
  standalone: false
})
export class BarraPage implements OnInit, OnDestroy {
  comandas: Comanda[] = [];
  loading = false;
  showGrouped = false;
  groupedItems: GroupedItem[] = [];
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
      this.socket.onNuevaComandaBarra().subscribe((c: Comanda) => {
        if (!this.comandas.find(x => x.id === c.id)) {
          this.comandas = [c, ...this.comandas];
        }
        this.sort();
        this.buildGrouped();
      }),
      this.socket.onComandaActualizada().subscribe((u: Comanda) => {
        if (u.destino === 'barra') {
          this.comandas = this.comandas.map(c => (c.id === u.id ? u : c));
          this.sort();
          this.buildGrouped();
        }
      }),
    );
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  load() {
    this.loading = true;
    this.svc.getComandasBarra().subscribe({
      next: d => { this.comandas = d; this.sort(); this.buildGrouped(); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  sort() { this.comandas.sort((a, b) => ORDER[a.status] - ORDER[b.status]); }
  count(s: ComandaStatus) { return this.comandas.filter(c => c.status === s).length; }

  toggleItemListo(c: Comanda, item: ComandaItem) {
    this.svc.toggleItemListo(c.id, item.id).subscribe({
      next: () => { item.listo = !item.listo; },
    });
  }

  preparar(c: Comanda) {
    this.svc.updateStatus(c.id, 'en_preparacion').subscribe({
      next: (u: Comanda) => { this.comandas = this.comandas.map(x => (x.id === u.id ? u : x)); this.sort(); this.buildGrouped(); },
    });
  }

  marcarListo(c: Comanda) {
    this.svc.updateStatus(c.id, 'listo').subscribe({
      next: async (u: Comanda) => {
        this.comandas = this.comandas.map(x => (x.id === u.id ? u : x));
        this.sort();
        this.buildGrouped();
        const t = await this.toast.create({ message: 'Bebida lista — mesero notificado', duration: 2000, color: 'success', position: 'top' });
        await t.present();
      },
    });
  }

  buildGrouped() {
    const map = new Map<string, GroupedItem>();
    const active = this.comandas.filter(c => c.status !== 'listo' && c.status !== 'entregado');
    for (const c of active) {
      const mesa = c.nota?.mesa?.identifier || '—';
      for (const it of c.items) {
        const name = this.itemName(it);
        if (!map.has(name)) {
          map.set(name, { name, totalQty: 0, sources: [] });
        }
        const g = map.get(name)!;
        g.totalQty += it.qty;
        g.sources.push({ comandaId: c.id, mesa, qty: it.qty });
      }
    }
    this.groupedItems = Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
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
