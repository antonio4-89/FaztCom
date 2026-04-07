import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface VentasSummary {
  ventasT: number; ventasPM: number; total: number;
  gastos: number; enCaja: number; notasCerradas: any[];
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  constructor(private api: ApiService) {}
  getVentas(): Observable<VentasSummary> { return this.api.get<VentasSummary>('/ventas'); }
}
