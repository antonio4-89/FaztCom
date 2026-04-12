import { Component, OnInit } from '@angular/core';
import { VentasService, VentasSummary, MonthlySummary } from '../../../core/services/ventas.service';

@Component({
  selector: 'app-ventas',
  templateUrl: 'ventas.page.html',
  styleUrls: ['ventas.page.scss'],
  standalone: false
})
export class VentasPage implements OnInit {
  summary: VentasSummary | null = null;
  loading = false;
  activeFilter = 'mes';

  // Day picker (same month view always)
  selectedDay: number = new Date().getDate();
  todayDay: number = new Date().getDate();
  daysInMonth: number[] = [];
  calendarDays: (number | null)[] = []; // null = empty cell before day 1
  currentMonthLabel = '';

  // Monthly/annual view
  showMonthly = false;
  monthlyData: MonthlySummary[] = [];
  monthlyYear = new Date().getFullYear();
  monthlyTotal = 0;
  loadingMonthly = false;

  constructor(private svc: VentasService) {}

  ngOnInit() {
    this.buildDays();
    // Load today on startup
    this.loadDay(this.todayDay);
  }

  buildDays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    this.daysInMonth = Array.from({ length: lastDay }, (_, i) => i + 1);

    // getDay() → 0=Dom, 1=Lun, ..., 6=Sáb  (semana empieza en domingo)
    const firstDow = new Date(year, month, 1).getDay();
    this.calendarDays = [
      ...Array(firstDow).fill(null),          // celdas vacías antes del día 1
      ...this.daysInMonth,
    ];

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    this.currentMonthLabel = meses[month] + ' ' + year;
  }

  isFutureDay(day: number): boolean {
    return day > this.todayDay;
  }

  selectDay(day: number) {
    if (this.isFutureDay(day)) return;
    this.showMonthly = false;
    this.activeFilter = 'mes';
    this.selectedDay = day;
    this.loadDay(day);
  }

  setMesCompleto() {
    this.showMonthly = false;
    this.activeFilter = 'mes-total';
    this.selectedDay = 0; // none selected
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.loadRange(firstDay.toISOString().split('T')[0], now.toISOString().split('T')[0]);
  }

  setAnio() {
    this.activeFilter = 'anio';
    this.showMonthly = true;
    this.loadMonthly();
  }

  private loadDay(day: number) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const iso = date.toISOString().split('T')[0];
    this.loadRange(iso, iso);
  }

  private loadRange(desde: string, hasta: string) {
    this.loading = true;
    this.svc.getHistorialVentas(desde, hasta).subscribe({
      next: s => { this.summary = s; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  private loadMonthly() {
    this.loadingMonthly = true;
    this.svc.getVentasMensuales(this.monthlyYear).subscribe({
      next: data => {
        this.monthlyData = data;
        this.monthlyTotal = data.reduce((s, m) => s + m.total, 0);
        this.loadingMonthly = false;
      },
      error: () => { this.loadingMonthly = false; },
    });
  }

  get selectedDateLabel(): string {
    if (this.activeFilter === 'mes-total') return 'Todo el mes';
    if (this.activeFilter === 'anio') return String(this.monthlyYear);
    return `${this.selectedDay} de ${this.currentMonthLabel}`;
  }
}
