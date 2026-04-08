import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';

interface LoginResponse {
  token: string;
  user: User & { mustChangePassword?: boolean };
}

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

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.token$.next(res.token);
        this.currentUser$.next(res.user);
      })
    );
  }

  /** Call after login: redirects to change-password if needed, else default route */
  handlePostLogin(res: LoginResponse) {
    if (res.user.mustChangePassword) {
      this.router.navigateByUrl('/change-password');
    } else {
      this.router.navigateByUrl(this.getDefaultRoute());
    }
  }

  /** Called after password changed — removes flag from local storage */
  clearMustChangePassword() {
    const user = this.currentUser$.value;
    if (user) {
      const updated = { ...user, mustChangePassword: false };
      localStorage.setItem(this.userKey, JSON.stringify(updated));
      this.currentUser$.next(updated);
    }
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
