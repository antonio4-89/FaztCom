import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { MenuService } from '../../../core/services/menu.service';
import { Producto, MenuGroup } from '../../../core/models/producto.model';

@Component({
  selector: 'app-menu-admin',
  templateUrl: 'menu-admin.page.html',
  styleUrls: ['menu-admin.page.scss'],
  standalone: false
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

  // Form state for new product
  formVisible = false;
  fName = ''; fCategoria = ''; fNewCategoria = ''; fPrice = 0; fTipo: 'comida' | 'bebida' = 'comida';
  categorias: Record<string, string[]> = { comida: [], bebida: [] };

  openNewForm() {
    this.fName = ''; this.fCategoria = ''; this.fNewCategoria = ''; this.fPrice = 0; this.fTipo = 'comida';
    this.formVisible = true;
    this.loadCategorias();
  }

  loadCategorias() {
    this.svc.getCategorias().subscribe({
      next: c => { this.categorias = c; },
      error: () => {},
    });
  }

  get categoriasForTipo(): string[] {
    return this.categorias[this.fTipo] || [];
  }

  onTipoChange() {
    this.fCategoria = '';
    this.fNewCategoria = '';
  }

  get resolvedCategoria(): string {
    if (this.fCategoria === '__new__') return this.fNewCategoria.trim();
    return this.fCategoria;
  }

  submitNewProduct() {
    const cat = this.resolvedCategoria;
    if (!this.fName.trim() || !cat) {
      this.showToast('Nombre y categoría requeridos', 'warning');
      return;
    }
    this.svc.createProducto({ name: this.fName.trim(), categoria: cat, price: this.fPrice || 0, tipo: this.fTipo, active: true }).subscribe({
      next: () => { this.formVisible = false; this.load(); this.showToast('Producto agregado'); },
      error: () => this.showToast('Error al agregar', 'danger'),
    });
  }

  toggleAgotado(p: Producto) {
    this.svc.toggleAgotado(p.id).subscribe({
      next: () => { this.load(); this.showToast(p.agotado ? 'Producto disponible' : 'Marcado como agotado'); },
      error: () => this.showToast('Error al cambiar stock', 'danger'),
    });
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

  private async showToast(msg: string, color = 'success') {
    const t = await this.toast.create({ message: msg, duration: 2000, position: 'top', color });
    await t.present();
  }
}
