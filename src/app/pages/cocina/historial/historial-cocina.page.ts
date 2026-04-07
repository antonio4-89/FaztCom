import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Comanda } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-historial-cocina',
  templateUrl: 'historial-cocina.page.html',
  styleUrls: ['historial-cocina.page.scss'],
})
export class HistorialCocinaPage implements OnInit {
  comandas: Comanda[] = [];
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.get<Comanda[]>('/comandas?destino=cocina&status=entregado').subscribe({
      next: d => { this.comandas = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  itemNames(c: Comanda): string {
    return c.items.map(i => (i.producto as any)?.name || i.customName || '').filter(Boolean).join(', ');
  }
}
