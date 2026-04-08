import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { User, Role } from '../../../core/models/user.model';

const ROLES = [
  { label: '👑 Admin',      value: 'admin' },
  { label: '📋 Mesero',     value: 'mesero' },
  { label: '🔥 Cocinero',   value: 'cocinero' },
  { label: '🍸 Bartender',  value: 'bartender' },
];

@Component({
  selector: 'app-usuarios',
  templateUrl: 'usuarios.page.html',
  styleUrls: ['usuarios.page.scss'],
  standalone: false
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

  roleBadgeClass(role: Role): string { return 'role-' + role; }

  async newUsuario() {
    const alert = await this.alertCtrl.create({
      header: 'Registrar Usuario',
      subHeader: 'Se enviará un código de acceso al correo',
      cssClass: 'role-alert',
      inputs: [
        { name: 'name',  type: 'text',  placeholder: 'Nombre completo' },
        { name: 'email', type: 'email', placeholder: 'correo@fastcom.mx' },
        ...ROLES.map(r => ({
          name: 'role', type: 'radio' as any,
          label: r.label, value: r.value,
          checked: r.value === 'mesero',
        })),
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: data => {
            if (!data.name?.trim() || !data.email?.trim() || !data.role) {
              this.showToast('Completa todos los campos', 'warning');
              return false;
            }
            this.svc.createUsuario({ name: data.name.trim(), email: data.email.trim(), role: data.role }).subscribe({
              next: () => {
                this.load();
                this.showToast('Usuario registrado — código enviado al correo ✉️');
              },
              error: (e) => this.showToast(e?.error?.error || 'Error al registrar', 'danger'),
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
      cssClass: 'role-alert',
      inputs: [
        { name: 'name', type: 'text', value: u.name, placeholder: 'Nombre' },
        ...ROLES.map(r => ({
          name: 'role', type: 'radio' as any,
          label: r.label, value: r.value,
          checked: r.value === u.role,
        })),
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: data => {
            if (!data.name?.trim() || !data.role) return false;
            this.svc.updateUsuario(u.id, { name: data.name.trim(), role: data.role }).subscribe({
              next: () => { this.load(); this.showToast('Usuario actualizado'); },
              error: () => this.showToast('Error al actualizar', 'danger'),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteUsuario(u: User) {
    const confirm = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Confirmas eliminar a <strong>${u.name}</strong>? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', cssClass: 'alert-btn-danger',
          handler: () => {
            this.svc.deleteUsuario(u.id).subscribe({
              next: () => { this.load(); this.showToast('Usuario eliminado'); },
              error: () => this.showToast('Error al eliminar', 'danger'),
            });
          },
        },
      ],
    });
    await confirm.present();
  }

  private async showToast(msg: string, color = 'success') {
    const t = await this.toast.create({ message: msg, duration: 3000, position: 'top', color });
    await t.present();
  }
}
