import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Producto, LOCAL_MENU, MenuGroup } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private api: ApiService) {}
  getMenu(): Observable<Record<string, MenuGroup[]>> {
    return this.api.get<Record<string, MenuGroup[]>>('/menu').pipe(catchError(() => of(LOCAL_MENU)));
  }
  createProducto(p: Partial<Producto>): Observable<Producto> { return this.api.post<Producto>('/menu', p); }
  updateProducto(id: number, p: Partial<Producto>): Observable<Producto> { return this.api.put<Producto>(`/menu/${id}`, p); }
  deleteProducto(id: number): Observable<any> { return this.api.delete<any>(`/menu/${id}`); }
}
