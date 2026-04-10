import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

interface NavItem { label: string; route: string; icon: string; }

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  currentRoute = '';

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
    });
  }

  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get currentRole() { return this.auth.getRole() || ''; }
  get userName() { return this.auth.currentUser?.name || ''; }

  get menuItems(): NavItem[] {
    const role = this.auth.getRole();
    const nav: Record<string, NavItem[]> = {
      admin: [
        { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline' },
        { label: 'Ventas', route: '/admin/ventas', icon: 'bar-chart-outline' },
        { label: 'Gastos', route: '/admin/gastos', icon: 'wallet-outline' },
        { label: 'Menu', route: '/admin/menu', icon: 'restaurant-outline' },
        { label: 'Usuarios', route: '/admin/usuarios', icon: 'people-outline' },
        { label: 'Todas las Comandas', route: '/admin/comandas', icon: 'list-outline' },
        { label: 'Vistas Operativas', route: '/admin/vistas', icon: 'layers-outline' },
      ],
      mesero: [
        { label: 'Mesas', route: '/mesero/mesas', icon: 'grid-outline' },
        { label: 'Nueva Comanda', route: '/mesero/nueva-comanda', icon: 'add-circle-outline' },
        { label: 'Mis Pedidos', route: '/mesero/mis-pedidos', icon: 'receipt-outline' },
        { label: 'Historial', route: '/mesero/historial', icon: 'time-outline' },
        { label: 'Notificaciones', route: '/mesero/notificaciones', icon: 'notifications-outline' },
      ],
      cocinero: [
        { label: 'Comandas', route: '/cocina/comandas', icon: 'flame-outline' },
        { label: 'Menu Comidas', route: '/cocina/menu', icon: 'restaurant-outline' },
        { label: 'Historial', route: '/cocina/historial', icon: 'time-outline' },
      ],
      bartender: [
        { label: 'Bebidas', route: '/barra/bebidas', icon: 'wine-outline' },
        { label: 'Menu Bebidas', route: '/barra/menu', icon: 'beer-outline' },
        { label: 'Historial', route: '/barra/historial', icon: 'time-outline' },
      ],
    };
    return role ? (nav[role] || []) : [];
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  navigate(route: string) {
    this.router.navigateByUrl(route);
  }

  logout() {
    this.auth.logout();
  }
}
