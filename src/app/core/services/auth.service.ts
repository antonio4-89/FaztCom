import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'fc_token';
  private userKey = 'fc_user';

  token$ = new BehaviorSubject<string | null>(null);
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.restore();
  }

  private restore() {
    const token = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    if (token && user) {
      this.token$.next(token);
      this.currentUser$.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.token$.next(res.token);
        this.currentUser$.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token$.next(null);
    this.currentUser$.next(null);
    this.router.navigateByUrl('/login');
  }

  isLoggedIn(): boolean { return !!this.token$.value; }
  getRole(): Role | null { return this.currentUser$.value?.role || null; }
  getToken(): string | null { return this.token$.value; }
  get currentUser(): User | null { return this.currentUser$.value; }

  getDefaultRoute(): string {
    const routes: Record<Role, string> = {
      admin: '/admin/dashboard',
      mesero: '/mesero/mesas',
      cocinero: '/cocina/comandas',
      bartender: '/barra/bebidas',
    };
    return routes[this.getRole() || 'mesero'] || '/login';
  }
}
