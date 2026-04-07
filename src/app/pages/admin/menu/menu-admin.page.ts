import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { MenuService } from '../../../core/services/menu.service';
import { Producto, MenuGroup } from '../../../core/models/producto.model';

@Component({
  selector: 'app-menu-admin',
  templateUrl: 'menu-admin.page.html',
  styleUrls: ['menu-admin.page.scss'],
})
export class MenuAdminPage implements OnInit {
  menu: Record<string, MenuGroup[]> = { comida: [], bebida: [] };
  loading = false;

  constructor(
    private svc: MenuService,
    private alertCtrl: AlertController,
    private toast: ToastController,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getMenu().subscribe({
      next: m => { this.menu = m; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get tipoKeys(): string[] { return Object.keys(this.menu); }

  async newProducto() {
    const alert = await this.alertCtrl.create({
      header: 'Agregar Producto',
      inputs: [
        { name: 'name',      type: 'text',   placeholder: 'Nombre' },
        { name: 'categoria', type: 'text',   placeholder: 'Categoría (ej: Pizzas)' },
        { name: 'price',     type: 'number', placeholder: 'Precio' },
        { name: 'tipo',      type: 'text',   placeholder: 'comida o bebida' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: data => {
            if (!data.name || !data.tipo) return false;
            this.svc.createProducto({ name: data.name, categoria: data.categoria, price: Number(data.price) || 0, tipo: data.tipo, active: true }).subscribe({
              next: () => { this.load(); this.showToast('Producto agregado'); },
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async editProducto(p: Producto) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Producto',
      inputs: [
        { name: 'name',  type: 'text',   value: p.name,          placeholder: 'Nombre' },
        { name: 'price', type: 'number', value: String(p.price), placeholder: 'Precio' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: data => {
            this.svc.updateProducto(p.id, { name: data.name, price: Number(data.price) }).subscribe({
              next: () => { this.load(); this.showToast('Producto actualizado'); },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteProducto(p: Producto) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: `¿Eliminar "${p.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: () => { this.svc.deleteProducto(p.id).subscribe({ next: () => { this.load(); this.showToast('Eliminado'); } }); },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 2000, position: 'top', color: 'success' });
    await t.present();
  }
}
