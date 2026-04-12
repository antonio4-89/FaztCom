import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface VistaItem { label: string; route: string; icon: string; }

@Component({
  selector: 'app-admin-vistas',
  templateUrl: 'vistas.page.html',
  styleUrls: ['vistas.page.scss'],
  standalone: false,
})
export class VistasPage {
  meseroItems: VistaItem[] = [
    { label: 'Mesas', route: '/mesero/mesas', icon: 'grid-outline' },
    // { label: 'Nueva Comanda', route: '/mesero/nueva-comanda', icon: 'add-circle-outline' },
    { label: 'Mis Pedidos', route: '/mesero/mis-pedidos', icon: 'receipt-outline' },
    { label: 'Historial', route: '/mesero/historial', icon: 'time-outline' },
    { label: 'Notificaciones', route: '/mesero/notificaciones', icon: 'notifications-outline' },
  ];

  cocinaItems: VistaItem[] = [
    { label: 'Comandas', route: '/cocina/comandas', icon: 'flame-outline' },
    { label: 'Menu Comidas', route: '/cocina/menu', icon: 'restaurant-outline' },
    { label: 'Historial', route: '/cocina/historial', icon: 'time-outline' },
  ];

  barraItems: VistaItem[] = [
    { label: 'Bebidas', route: '/barra/bebidas', icon: 'wine-outline' },
    { label: 'Menu Bebidas', route: '/barra/menu', icon: 'beer-outline' },
    { label: 'Historial', route: '/barra/historial', icon: 'time-outline' },
  ];

  constructor(private router: Router) {}

  go(route: string) { this.router.navigateByUrl(route); }
}
