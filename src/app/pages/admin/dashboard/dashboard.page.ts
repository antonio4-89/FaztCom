import { Component, OnInit } from '@angular/core';
import { VentasService, VentasSummary } from '../../../core/services/ventas.service';

interface Stat { label: string; value: string; color: string; bg: string; icon: string; }

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  summary: VentasSummary | null = null;
  loading = false;
  stats: Stat[] = [];

  constructor(private ventasService: VentasService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.ventasService.getVentas().subscribe({
      next: s => { this.summary = s; this.buildStats(); this.loading = false; },
      error: () => {
        // Use zeros on error so page still renders
        this.summary = { ventasT: 0, ventasPM: 0, ventasPL: 0, total: 0, gastos: 0, enCaja: 0, notasCerradas: [] };
        this.buildStats();
        this.loading = false;
      },
    });
  }

  buildStats() {
    const s = this.summary!;
    this.stats = [
      { label: 'Ventas Terraza',   value: '$' + s.ventasT.toLocaleString(),  color: 'var(--fc-accent)',  bg: 'var(--fc-accent-soft)',  icon: 'trending-up-outline' },
      { label: 'Ventas PM/Sala',   value: '$' + s.ventasPM.toLocaleString(), color: 'var(--fc-purple)',  bg: 'var(--fc-purple-soft)',  icon: 'bar-chart-outline' },
      { label: 'Ventas Totales',   value: '$' + s.total.toLocaleString(),     color: 'var(--fc-green)',   bg: 'var(--fc-green-soft)',   icon: 'cash-outline' },
      { label: 'Gastos',           value: '$' + s.gastos.toLocaleString(),    color: 'var(--fc-red)',     bg: 'var(--fc-red-soft)',     icon: 'trending-down-outline' },
      { label: 'En Caja',          value: '$' + s.enCaja.toLocaleString(),    color: 'var(--fc-blue)',    bg: 'var(--fc-blue-soft)',    icon: 'wallet-outline' },
      { label: 'Notas Cerradas',   value: String(s.notasCerradas.length),     color: 'var(--fc-yellow)',  bg: 'var(--fc-yellow-soft)',  icon: 'receipt-outline' },
    ];
  }
}
