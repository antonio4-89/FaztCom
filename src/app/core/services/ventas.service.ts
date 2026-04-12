import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface VentasSummary {
  ventasT: number;
  ventasPM: number;
  ventasPL: number;
  total: number;
  gastos: number;
  enCaja: number;
  notasCerradas: any[];
  gastosDetalle?: any[];
}

export interface DailySummary {
  fecha: string;
  ventasT: number;
  ventasPM: number;
  ventasPL: number;
  total: number;
  notas: number;
}

export interface MonthlySummary {
  mes: number;
  nombre: string;
  ventasT: number;
  ventasPM: number;
  ventasPL: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  constructor(private api: ApiService) {}

  getVentas(): Observable<VentasSummary> {
    return this.api.get<VentasSummary>('/ventas');
  }

  getHistorialVentas(desde?: string, hasta?: string): Observable<VentasSummary> {
    const params: string[] = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    const qs = params.length ? '?' + params.join('&') : '';
    return this.api.get<VentasSummary>(`/ventas/historial${qs}`);
  }

  getVentasMensuales(year?: number): Observable<MonthlySummary[]> {
    const qs = year ? `?year=${year}` : '';
    return this.api.get<MonthlySummary[]>(`/ventas/mensuales${qs}`);
  }

  getVentasDiarias(desde: string, hasta: string): Observable<{ dias: DailySummary[]; total: number }> {
    return this.api.get(`/ventas/diarias?desde=${desde}&hasta=${hasta}`);
  }
}
