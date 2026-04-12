import { Component, OnInit } from '@angular/core';
import { VentasService, DailySummary } from '../../../core/services/ventas.service';

interface DayRow extends DailySummary {
  dayLabel: string;
  dayName: string;
}

@Component({
  selector: 'app-reportes',
  templateUrl: 'reportes.page.html',
  styleUrls: ['reportes.page.scss'],
  standalone: false,
})
export class ReportesPage implements OnInit {
  activeTab: 'semana' | 'mes' = 'semana';

  // Semana
  semanaRows: DayRow[] = [];
  semanaTotal = 0;
  semanaTotalT = 0;
  semanaTotalPM = 0;
  semanaTotalPL = 0;
  semanaTotalNotas = 0;
  semanaDesde = '';
  semanaHasta = '';
  loadingSemana = false;

  // Mes
  mesRows: DayRow[] = [];
  mesTotal = 0;
  mesTotalT = 0;
  mesTotalPM = 0;
  mesTotalPL = 0;
  mesActual = '';
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  loadingMes = false;

  private readonly DIAS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  private readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  constructor(private svc: VentasService) {}

  ngOnInit() { this.loadSemana(); }

  setTab(tab: 'semana' | 'mes') {
    this.activeTab = tab;
    if (tab === 'semana') this.loadSemana();
    else this.loadMes();
  }

  // ── Semana ──────────────────────────────────────────────

  loadSemana() {
    this.loadingSemana = true;
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    this.semanaDesde = this.toISO(monday);
    this.semanaHasta = this.toISO(now);

    this.svc.getVentasDiarias(this.semanaDesde, this.semanaHasta).subscribe({
      next: r => {
        this.semanaRows = r.dias.map(d => this.toRow(d));
        this.semanaTotal = r.total;
        this.semanaTotalT = this.semanaRows.reduce((s, d) => s + d.ventasT, 0);
        this.semanaTotalPM = this.semanaRows.reduce((s, d) => s + d.ventasPM, 0);
        this.semanaTotalPL = this.semanaRows.reduce((s, d) => s + d.ventasPL, 0);
        this.semanaTotalNotas = this.semanaRows.reduce((s, d) => s + d.notas, 0);
        this.loadingSemana = false;
      },
      error: () => { this.loadingSemana = false; },
    });
  }

  // ── Mes ─────────────────────────────────────────────────

  loadMes() {
    this.loadingMes = true;
    const firstDay = new Date(this.selectedYear, this.selectedMonth, 1);
    const today = new Date();
    const isCurrent = this.selectedMonth === today.getMonth() && this.selectedYear === today.getFullYear();
    const lastDay = isCurrent ? today : new Date(this.selectedYear, this.selectedMonth + 1, 0);

    this.mesActual = `${this.MESES[this.selectedMonth]} ${this.selectedYear}`;
    const desde = this.toISO(firstDay);
    const hasta = this.toISO(lastDay);

    this.svc.getVentasDiarias(desde, hasta).subscribe({
      next: r => {
        this.mesRows = r.dias.map(d => this.toRow(d));
        this.mesTotal = r.total;
        this.mesTotalT = this.mesRows.reduce((s, d) => s + d.ventasT, 0);
        this.mesTotalPM = this.mesRows.reduce((s, d) => s + d.ventasPM, 0);
        this.mesTotalPL = this.mesRows.reduce((s, d) => s + d.ventasPL, 0);
        this.loadingMes = false;
      },
      error: () => { this.loadingMes = false; },
    });
  }

  prevMonth() {
    if (this.selectedMonth === 0) { this.selectedMonth = 11; this.selectedYear--; }
    else this.selectedMonth--;
    this.loadMes();
  }

  nextMonth() {
    if (this.isCurrentMonth) return;
    if (this.selectedMonth === 11) { this.selectedMonth = 0; this.selectedYear++; }
    else this.selectedMonth++;
    this.loadMes();
  }

  get isCurrentMonth(): boolean {
    const today = new Date();
    return this.selectedMonth === today.getMonth() && this.selectedYear === today.getFullYear();
  }

  barWidth(total: number, rows: DayRow[]): number {
    const max = Math.max(...rows.map(r => r.total), 1);
    return Math.round((total / max) * 100);
  }

  private toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private toRow(d: DailySummary): DayRow {
    const date = new Date(d.fecha + 'T12:00:00');
    return {
      ...d,
      dayName: this.DIAS[date.getDay()],
      dayLabel: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
    };
  }
}
