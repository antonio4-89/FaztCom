import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Notificacion {
  id: number; message: string; tipo: string; read: boolean; createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  constructor(private api: ApiService) {}
  getNotificaciones(): Observable<Notificacion[]> { return this.api.get<Notificacion[]>('/notificaciones'); }
  markRead(id: number): Observable<any> { return this.api.put<any>(`/notificaciones/${id}/read`, {}); }
  markAllRead(): Observable<any> { return this.api.put<any>('/notificaciones/read-all', {}); }
}
