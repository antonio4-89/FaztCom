import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ComandasService } from '../../../core/services/comandas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Comanda, ComandaStatus, ComandaItem } from '../../../core/models/comanda.model';

const ORDER: Record<ComandaStatus, number> = {
  pendiente: 0, en_preparacion: 1, listo: 2, entregado: 3,
};

interface GroupedItemSource {
  comandaId: number;
  itemId: number;
  mesa: string;
  qty: number;
  listo: boolean;
}

interface GroupedItem {
  name: string;
  totalQty: number;
  allListo: boolean;
  sources: GroupedItemSource[];
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
  groupedItems: GroupedItem[] = [];
  preparando = new Set<number>();
  private subs: Subscription[] = [];

  constructor(
    private svc: ComandasService,
    private socket: SocketService,
    private toast: ToastController,
  ) {}

  ngOnInit() {
    this.socket.connect();
    this.load();
    // Recarga completa en cada evento — mismo patron que admin Comandas Activas
    this.subs.push(
      this.socket.onNuevaComandaBarra().subscribe(() => this.load(true)),
      this.socket.onComandaActualizada().subscribe((u: Comanda) => {
        if (u.destino === 'barra') this.load(true);
      }),
    );
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  load(silent: boolean = false) {
    if (!silent) this.loading = true;
    this.svc.getComandasBarra().subscribe({
      next: d => {
        this.comandas = d.filter(c => c.status !== 'listo' && c.status !== 'entregado');
        this.sort();
        this.buildGrouped();
        this.loading = false;
      },
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
    this.preparando.add(c.id);
    this.svc.updateStatus(c.id, 'en_preparacion').subscribe({
      next: (u: Comanda) => {
        this.comandas = this.comandas.map(x => (x.id === u.id ? u : x));
        this.sort();
        this.buildGrouped();
        this.preparando.delete(c.id);
      },
      error: () => { this.preparando.delete(c.id); },
    });
  }

  marcarListo(c: Comanda) {
    this.preparando.add(c.id);
    this.svc.updateStatus(c.id, 'listo').subscribe({
      next: async () => {
        this.comandas = this.comandas.filter(x => x.id !== c.id);
        this.buildGrouped();
        this.preparando.delete(c.id);
        const t = await this.toast.create({ message: 'Bebida lista — mesero notificado. Movida a historial.', duration: 2000, color: 'success', position: 'top' });
        await t.present();
      },
      error: () => { this.preparando.delete(c.id); },
    });
  }

  isPreparando(id: number): boolean { return this.preparando.has(id); }

  buildGrouped() {
    const map = new Map<string, GroupedItem>();
    const active = this.comandas.filter(c => c.status !== 'listo' && c.status !== 'entregado');
    for (const c of active) {
      const mesa = c.nota?.mesa?.identifier || 'P/L';
      for (const it of c.items) {
        const name = this.itemName(it);
        if (!map.has(name)) {
          map.set(name, { name, totalQty: 0, allListo: true, sources: [] });
        }
        const g = map.get(name)!;
        g.totalQty += it.qty;
        if (!it.listo) g.allListo = false;
        g.sources.push({ comandaId: c.id, itemId: it.id, mesa, qty: it.qty, listo: !!it.listo });
      }
    }
    // Only show items that are repeated across different mesas/comandas
    this.groupedItems = Array.from(map.values())
      .filter(g => {
        const uniqueMesas = new Set(g.sources.map(s => s.mesa));
        return g.sources.length > 1 && uniqueMesas.size > 1;
      })
      .sort((a, b) => b.totalQty - a.totalQty);
  }

  toggleGroupedListo(g: GroupedItem) {
    const markAs = !g.allListo;
    const promises = g.sources
      .filter(s => s.listo !== markAs)
      .map(s => this.svc.toggleItemListo(s.comandaId, s.itemId).toPromise().then(() => {
        s.listo = markAs;
        const comanda = this.comandas.find(c => c.id === s.comandaId);
        if (comanda) {
          const item = comanda.items.find(i => i.id === s.itemId);
          if (item) item.listo = markAs;
        }
      }));
    Promise.all(promises).then(() => {
      g.allListo = markAs;
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
