import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'change-password', canActivate: [AuthGuard], loadChildren: () => import('./pages/change-password/change-password.module').then(m => m.ChangePasswordPageModule) },

  // Mesero
  { path: 'mesero/mesas', canActivate: [AuthGuard], loadChildren: () => import('./pages/mesero/mesas/mesas.module').then(m => m.MesasPageModule) },
  { path: 'mesero/nueva-comanda', canActivate: [AuthGuard], loadChildren: () => import('./pages/mesero/nueva-comanda/nueva-comanda.module').then(m => m.NuevaComandaPageModule) },
  { path: 'mesero/mis-pedidos', canActivate: [AuthGuard], loadChildren: () => import('./pages/mesero/mis-pedidos/mis-pedidos.module').then(m => m.MisPedidosPageModule) },
  { path: 'mesero/historial', canActivate: [AuthGuard], loadChildren: () => import('./pages/mesero/historial/historial-mesero.module').then(m => m.HistorialMeseroPageModule) },
  { path: 'mesero/notificaciones', canActivate: [AuthGuard], loadChildren: () => import('./pages/mesero/notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule) },

  // Cocina
  { path: 'cocina/comandas', canActivate: [AuthGuard], loadChildren: () => import('./pages/cocina/comandas/cocina.module').then(m => m.CocinaPageModule) },
  { path: 'cocina/historial', canActivate: [AuthGuard], loadChildren: () => import('./pages/cocina/historial/historial-cocina.module').then(m => m.HistorialCocinaPageModule) },
  { path: 'cocina/menu', canActivate: [AuthGuard], loadChildren: () => import('./pages/cocina/menu/menu-cocina.module').then(m => m.MenuCocinaPageModule) },

  // Barra
  { path: 'barra/bebidas', canActivate: [AuthGuard], loadChildren: () => import('./pages/barra/bebidas/barra.module').then(m => m.BarraPageModule) },
  { path: 'barra/historial', canActivate: [AuthGuard], loadChildren: () => import('./pages/barra/historial/historial-barra.module').then(m => m.HistorialBarraPageModule) },
  { path: 'barra/menu', canActivate: [AuthGuard], loadChildren: () => import('./pages/barra/menu/menu-barra.module').then(m => m.MenuBarraPageModule) },

  // Admin
  { path: 'admin/dashboard', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then(m => m.DashboardPageModule) },
  { path: 'admin/ventas', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/ventas/ventas.module').then(m => m.VentasPageModule) },
  { path: 'admin/reportes', canActivate:[AuthGuard, RoleGuard], data: {roles: ['admin']}, loadChildren: () => import('./pages/admin/reportes/reportes.module'). then(m => m.ReportesPageModule) },
  { path: 'admin/gastos', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/gastos/gastos.module').then(m => m.GastosPageModule) },
  { path: 'admin/menu', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/menu/menu-admin.module').then(m => m.MenuAdminPageModule) },
  { path: 'admin/usuarios', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/usuarios/usuarios.module').then(m => m.UsuariosPageModule) },
  { path: 'admin/comandas', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/comandas/comandas-admin.module').then(m => m.ComandasAdminPageModule) },
  { path: 'admin/vistas', canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./pages/admin/vistas/vistas.module').then(m => m.VistasPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
