import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { GastosService } from '../../../core/services/gastos.service';
import { Gasto } from '../../../core/models/gasto.model';

@Component({
  selector: 'app-gastos',
  templateUrl: 'gastos.page.html',
  styleUrls: ['gastos.page.scss'],
})
export class GastosPage implements OnInit {
  gastos: Gasto[] = [];
  loading = false;

  constructor(
    private svc: GastosService,
    private alertCtrl: AlertController,
    private toast: ToastController,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getGastos().subscribe({
      next: d => { this.gastos = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get total(): number { return this.gastos.reduce((s, g) => s + g.amount, 0); }

  async newGasto() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo Gasto',
      inputs: [
        { name: 'description', type: 'text', placeholder: 'Descripción' },
        { name: 'amount', type: 'number', placeholder: 'Monto ($)' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: data => {
            if (!data.description || !data.amount) return false;
            this.svc.createGasto({ description: data.description, amount: Number(data.amount) }).subscribe({
              next: () => { this.load(); this.showToast('Gasto registrado'); },
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteGasto(gasto: Gasto) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar gasto',
      message: `¿Eliminar "${gasto.description}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.svc.deleteGasto(gasto.id).subscribe({ next: () => { this.load(); this.showToast('Gasto eliminado'); } });
          },
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
