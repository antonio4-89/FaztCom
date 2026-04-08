import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Comanda, ComandaStatus } from '../models/comanda.model';

@Injectable({ providedIn: 'root' })
export class ComandasService {
  constructor(private api: ApiService) {}
  getComandasCocina(): Observable<Comanda[]> { return this.api.get<Comanda[]>('/comandas?destino=cocina'); }
  getComandasBarra(): Observable<Comanda[]> { return this.api.get<Comanda[]>('/comandas?destino=barra'); }

  // getComandasActivas(): Observable<Comanda[]> { return this.api.get<Comanda[]>('/comandas/activas'); }
  getComandasActivas(): Observable<any[]> { return this.api.get<Comanda[]>('/comandas/activas'); }
  createComanda(payload: any): Observable<any> { return this.api.post<any>('/comandas', payload); }
  updateStatus(id: number, status: ComandaStatus): Observable<any> { return this.api.put<any>(`/comandas/${id}/status`, { status }); }
  removeItem(comandaId: number, itemId: number): Observable<any> { return this.api.delete<any>(`/comandas/${comandaId}/items/${itemId}`); }
}
