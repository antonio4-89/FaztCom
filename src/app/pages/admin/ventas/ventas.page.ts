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
  activeFilter = 'hoy';

  constructor(private svc: VentasService) {}

  ngOnInit() { this.setHoy(); }

  setHoy() {
    const today = new Date().toISOString().split('T')[0];
    this.desde = today;
    this.hasta = today;
    this.activeFilter = 'hoy';
    this.loadHistorial();
  }

  setSemana() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    this.desde = monday.toISOString().split('T')[0];
    this.hasta = now.toISOString().split('T')[0];
    this.activeFilter = 'semana';
    this.loadHistorial();
  }

  setMes() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.desde = firstDay.toISOString().split('T')[0];
    this.hasta = now.toISOString().split('T')[0];
    this.activeFilter = 'mes';
    this.loadHistorial();
  }

  setAnio() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    this.desde = firstDay.toISOString().split('T')[0];
    this.hasta = now.toISOString().split('T')[0];
    this.activeFilter = 'anio';
    this.loadHistorial();
  }

  clearFilter() {
    this.desde = '';
    this.hasta = '';
    this.activeFilter = 'todo';
    this.loadHistorial();
  }

  onDateChange() {
    this.activeFilter = 'custom';
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
