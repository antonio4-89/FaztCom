import { Component, OnInit } from '@angular/core';
import { VentasService, VentasSummary } from '../../../core/services/ventas.service';

@Component({
  selector: 'app-ventas',
  templateUrl: 'ventas.page.html',
  styleUrls: ['ventas.page.scss'],
  standalone: false
})
export class VentasPage implements OnInit {
  summary: VentasSummary | null = null;
  loading = false;
  desde = '';
  hasta = '';

  constructor(private svc: VentasService) {}

  ngOnInit() { this.setHoy(); }

  setHoy() {
    const today = new Date().toISOString().split('T')[0];
    this.desde = today;
    this.hasta = today;
    this.loadHistorial();
  }

  clearFilter() {
    this.desde = '';
    this.hasta = '';
    this.loadHistorial();
  }

  loadHistorial() {
    this.loading = true;
    this.svc.getHistorialVentas(this.desde || undefined, this.hasta || undefined).subscribe({
      next: s => { this.summary = s; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
