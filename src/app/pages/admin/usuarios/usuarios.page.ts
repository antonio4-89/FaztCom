import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: 'usuarios.page.html',
  styleUrls: ['usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  usuarios: User[] = [];
  loading = false;

  constructor(
    private svc: UsuariosService,
    private alertCtrl: AlertController,
    private toast: ToastController,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getUsuarios().subscribe({
      next: d => { this.usuarios = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  roleEmoji(role: Role): string {
    return { admin: '👑', mesero: '📋', cocinero: '🔥', bartender: '🍸' }[role] ?? '👤';
  }

  roleBadgeClass(role: Role): string {
    return 'role-' + role;
  }

  async newUsuario() {
    const alert = await this.alertCtrl.create({
      header: 'Registrar Usuario',
      inputs: [
        { name: 'name',     type: 'text',     placeholder: 'Nombre completo' },
        { name: 'email',    type: 'email',    placeholder: 'correo@fastcom.mx' },
        { name: 'password', type: 'password', placeholder: 'Contraseña' },
        { name: 'role',     type: 'text',     placeholder: 'admin | mesero | cocinero | bartender' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: data => {
            if (!data.name || !data.email || !data.password || !data.role) return false;
            this.svc.createUsuario(data).subscribe({
              next: () => { this.load(); this.showToast('Usuario registrado'); },
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async editUsuario(u: User) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Usuario',
      inputs: [
        { name: 'name', type: 'text', value: u.name, placeholder: 'Nombre' },
        { name: 'role', type: 'text', value: u.role, placeholder: 'admin | mesero | cocinero | bartender' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: data => {
            this.svc.updateUsuario(u.id, { name: data.name, role: data.role }).subscribe({
              next: () => { this.load(); this.showToast('Usuario actualizado'); },
            });
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
