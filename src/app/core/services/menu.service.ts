import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Producto, LOCAL_MENU, MenuGroup } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private api: ApiService) {}

  getMenu(): Observable<Record<string, MenuGroup[]>> {
    return this.api.get<any>('/menu').pipe(
      map(raw => {
        // Backend returns { comida: { Cat: Producto[] }, bebida: { Cat: Produto[] } }
        // Frontend needs { comida: MenuGroup[], bebida: MenuGroup[] }
        const result: Record<string, MenuGroup[]> = { comida: [], bebida: [] };
        for (const tipo of ['comida', 'bebida']) {
          const grouped: Record<string, Producto[]> = raw[tipo] || {};
          result[tipo] = Object.keys(grouped).map(cat => ({ cat, items: grouped[cat] }));
        }
        return result;
      }),
      catchError(() => of(LOCAL_MENU))
    );
  }

  createProducto(p: Partial<Producto>): Observable<Producto> { return this.api.post<Producto>('/menu', p); }
  updateProducto(id: number, p: Partial<Producto>): Observable<Producto> { return this.api.put<Producto>(`/menu/${id}`, p); }
  deleteProducto(id: number): Observable<any> { return this.api.delete<any>(`/menu/${id}`); }
  toggleAgotado(id: number): Observable<Producto> { return this.api.patch<Producto>(`/menu/${id}/stock`, {}); }
}
