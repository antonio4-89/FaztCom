import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SocketService } from '../../../core/services/socket.service';
import { Comanda } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-historial-cocina',
  templateUrl: 'historial-cocina.page.html',
  styleUrls: ['historial-cocina.page.scss'],
  standalone: false
})
export class HistorialCocinaPage implements OnInit, OnDestroy {
  comandas: Comanda[] = [];
  recentListo: Comanda[] = [];
  loading = false;
  private subs: Subscription[] = [];
  private timers: any[] = [];

  constructor(
    private api: ApiService,
    private socket: SocketService,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.api.get<Comanda[]>('/comandas?destino=cocina').subscribe({
      next: d => {
        this.comandas = d.filter(c => c.status === 'listo' || c.status === 'entregado');
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });

    this.socket.connect();
    this.subs.push(
      this.socket.onComandaActualizada().subscribe((c: Comanda) => {
        if (c.destino === 'cocina' && c.status === 'listo') {
          if (!this.recentListo.find(x => x.id === c.id)) {
            this.recentListo = [c, ...this.recentListo];
            const timer = setTimeout(() => {
              this.recentListo = this.recentListo.filter(x => x.id !== c.id);
            }, 10000);
            this.timers.push(timer);
          }
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.timers.forEach(t => clearTimeout(t));
  }

  itemNames(c: Comanda): string {
    return c.items.map(i => (i.producto as any)?.name || i.customName || '').filter(Boolean).join(', ');
  }
}
