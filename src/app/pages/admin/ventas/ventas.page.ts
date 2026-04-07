import { Component, OnInit } from '@angular/core';
import { VentasService, VentasSummary } from '../../../core/services/ventas.service';
import { getSeccion } from '../../../core/models/mesa.model';

@Component({
  selector: 'app-ventas',
  templateUrl: 'ventas.page.html',
  styleUrls: ['ventas.page.scss'],
})
export class VentasPage implements OnInit {
  summary: VentasSummary | null = null;
  loading = false;

  constructor(private svc: VentasService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getVentas().subscribe({
      next: s => { this.summary = s; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getSeccion(id: string) { return getSeccion(id); }

  notaTotal(nota: any): number {
    return nota.total || 0;
  }
}
