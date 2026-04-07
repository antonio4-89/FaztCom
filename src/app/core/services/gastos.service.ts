import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Gasto } from '../models/gasto.model';

@Injectable({ providedIn: 'root' })
export class GastosService {
  constructor(private api: ApiService) {}
  getGastos(): Observable<Gasto[]> { return this.api.get<Gasto[]>('/gastos'); }
  createGasto(g: Partial<Gasto>): Observable<Gasto> { return this.api.post<Gasto>('/gastos', g); }
  deleteGasto(id: number): Observable<any> { return this.api.delete<any>(`/gastos/${id}`); }
}
