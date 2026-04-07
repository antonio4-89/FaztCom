import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Nota } from '../models/comanda.model';

@Injectable({ providedIn: 'root' })
export class NotasService {
  constructor(private api: ApiService) {}
  getMisNotas(): Observable<Nota[]> { return this.api.get<Nota[]>('/notas'); }
  getHistorial(): Observable<Nota[]> { return this.api.get<Nota[]>('/notas/historial'); }
  getNotaById(id: number): Observable<Nota> { return this.api.get<Nota>(`/notas/${id}`); }
  closeNota(id: number): Observable<any> { return this.api.put<any>(`/notas/${id}/close`, {}); }
}
