import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { MenuService } from '../../../core/services/menu.service';
import { ComandasService } from '../../../core/services/comandas.service';
import { MenuGroup, Producto } from '../../../core/models/producto.model';

interface CartItem {
  key: string;
  name: string;
  price: number;
  qty: number;
  tipo: string;
  productoId?: number;
  isCustom?: boolean;
}

@Component({
  selector: 'app-nueva-comanda',
  templateUrl: 'nueva-comanda.page.html',
  styleUrls: ['nueva-comanda.page.scss'],
  standalone: false
})
export class NuevaComandaPage implements OnInit {
  mesa = '';
  mesaId = 0;
  tipo: 'comida' | 'bebida' = 'comida';
  catFilter = 'all';
  menu: Record<string, MenuGroup[]> = { comida: [], bebida: [] };
  items: CartItem[] = [];
  showCustom = false;
  customName = '';
  customPrice = 0;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private comandasService: ComandasService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.mesa = p['mesa'] || '';
      this.mesaId = Number(p['mesaId']) || 0;
    });
    this.menuService.getMenu().subscribe({
      next: m => { this.menu = m; },
      error: () => {},
    });
  }

  get filteredMenu(): MenuGroup[] {
    const groups = this.menu[this.tipo] || [];
    if (this.catFilter === 'all') return groups;
    return groups.filter(g => g.cat === this.catFilter);
  }

  get cats(): string[] {
    const groups = this.menu[this.tipo] || [];
    return groups.map(g => g.cat);
  }

  get total(): number {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  get totalItems(): number {
    return this.items.reduce((s, i) => s + i.qty, 0);
  }

  addItem(producto: Producto) {
    const key = `p-${producto.id}-${producto.name}`;
    const existing = this.items.find(i => i.key === key);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({
        key,
        name: producto.name,
        price: producto.price,
        qty: 1,
        tipo: this.tipo,
        productoId: producto.id || undefined,
      });
    }
  }

  increaseItem(item: CartItem) {
    item.qty++;
  }

  decreaseItem(item: CartItem) {
    if (item.qty > 1) {
      item.qty--;
    } else {
      this.removeItem(item.key);
    }
  }

  removeItem(key: string) {
    this.items = this.items.filter(i => i.key !== key);
  }

  addCustom() {
    if (!this.customName.trim()) return;
    const key = `c-${Date.now()}`;
    this.items.push({
      key,
      name: this.customName.trim(),
      price: this.customPrice || 0,
      qty: 1,
      tipo: this.tipo,
      isCustom: true,
    });
    this.customName = '';
    this.customPrice = 0;
    this.showCustom = false;
  }

  async sendComanda() {
    if (this.items.length === 0) {
      const t = await this.toast.create({ message: 'Agrega al menos un producto', duration: 2000, color: 'warning', position: 'top' });
      await t.present();
      return;
    }
    this.loading = true;
    const payload = {
      mesaId: this.mesaId,
      items: this.items.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        tipo: i.tipo,
        productoId: i.productoId || null,
      })),
    };
    this.comandasService.createComanda(payload).subscribe({
      next: async () => {
        this.loading = false;
        const t = await this.toast.create({ message: 'Comanda enviada correctamente', duration: 2500, color: 'success', position: 'top' });
        await t.present();
        this.router.navigateByUrl('/mesero/mesas');
      },
      error: async () => {
        this.loading = false;
        const t = await this.toast.create({ message: 'Error al enviar comanda', duration: 3000, color: 'danger', position: 'top' });
        await t.present();
      },
    });
  }

  goBack() {
    this.router.navigateByUrl('/mesero/mesas');
  }
}
