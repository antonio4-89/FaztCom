import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MenuService } from '../../../core/services/menu.service';
import { SocketService } from '../../../core/services/socket.service';
import { Producto, MenuGroup } from '../../../core/models/producto.model';

@Component({
  selector: 'app-menu-cocina',
  templateUrl: 'menu-cocina.page.html',
  styleUrls: ['menu-cocina.page.scss'],
  standalone: false
})
export class MenuCocinaPage implements OnInit, OnDestroy {
  menu: MenuGroup[] = [];
  loading = false;
  private sub?: Subscription;

  constructor(
    private svc: MenuService,
    private socket: SocketService,
    private toast: ToastController,
  ) {}

  ngOnInit() {
    this.load();
    this.socket.connect();
    this.sub = this.socket.onMenuActualizado().subscribe(() => this.load());
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  load() {
    this.loading = true;
    this.svc.getMenu().subscribe({
      next: m => { this.menu = m['comida'] || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggleAgotado(p: Producto) {
    this.svc.toggleAgotado(p.id).subscribe({
      next: () => { this.load(); this.showToast(p.agotado ? 'Producto disponible' : 'Marcado como agotado'); },
      error: () => this.showToast('Error al cambiar stock', 'danger'),
    });
  }

  private async showToast(msg: string, color = 'success') {
    const t = await this.toast.create({ message: msg, duration: 2000, position: 'top', color });
    await t.present();
  }
}
