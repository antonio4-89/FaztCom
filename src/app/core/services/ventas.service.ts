import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface VentasSummary {
  ventasT: number;
  ventasPM: number;
  total: number;
  gastos: number;
  enCaja: number;
  notasCerradas: any[];
  gastosDetalle?: any[];
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
}
