import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private api: ApiService) {}
  getUsuarios(): Observable<User[]> { return this.api.get<User[]>('/usuarios'); }
  createUsuario(u: any): Observable<User> { return this.api.post<User>('/usuarios', u); }
  updateUsuario(id: number, u: any): Observable<User> { return this.api.put<User>(`/usuarios/${id}`, u); }
  deleteUsuario(id: number): Observable<any> { return this.api.delete<any>(`/usuarios/${id}`); }
  changePassword(_id: number, newPassword: string): Observable<any> {
    return this.api.put<any>('/auth/change-password', { newPassword });
  }
}
