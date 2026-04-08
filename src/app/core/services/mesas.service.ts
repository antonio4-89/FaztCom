import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Mesa } from '../models/mesa.model';
import { Nota } from '../models/comanda.model';

@Injectable({ providedIn: 'root' })
export class MesasService {
  constructor(private api: ApiService) {}
  getMesas(): Observable<Mesa[]> { return this.api.get<Mesa[]>('/mesas'); }
  getNotaByMesa(mesaId: number): Observable<Nota> { return this.api.get<Nota>(`/mesas/${mesaId}/nota`); }
  updateMesaStatus(mesaId: number, status: string): Observable<Mesa> { return this.api.put<Mesa>(`/mesas/${mesaId}/status`, { status }); }
}
