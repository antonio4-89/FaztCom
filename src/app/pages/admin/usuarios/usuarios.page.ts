import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: 'usuarios.page.html',
  styleUrls: ['usuarios.page.scss'],
  standalone: false
})
export class UsuariosPage implements OnInit {
  usuarios: User[] = [];
  loading = false;

  // Inline form state
  formVisible = false;
  editingUser: User | null = null;
  formName = '';
  formEmail = '';
  formRole: Role = 'mesero';
  formLoading = false;

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

  roleIcon(role: Role): string {
    return { admin: 'shield-outline', mesero: 'clipboard-outline', cocinero: 'flame-outline', bartender: 'wine-outline' }[role] ?? 'person-outline';
  }

  roleBadgeClass(role: Role): string { return 'role-' + role; }

  // Form helpers
  openForm(user?: User) {
    this.editingUser = user || null;
    this.formName = user?.name || '';
    this.formEmail = user?.email || '';
    this.formRole = user?.role || 'mesero';
    this.formVisible = true;
  }

  cancelForm() {
    this.formVisible = false;
    this.editingUser = null;
  }

  editUsuario(u: User) { this.openForm(u); }

  submitForm() {
    if (!this.formName.trim()) {
      this.showToast('Ingresa un nombre', 'warning');
      return;
    }
    if (!this.formRole) {
      this.showToast('Selecciona un rol', 'warning');
      return;
    }

    this.formLoading = true;

    if (this.editingUser) {
      // Edit
      this.svc.updateUsuario(this.editingUser.id, {
        name: this.formName.trim(),
        role: this.formRole,
      }).subscribe({
        next: () => {
          this.formLoading = false;
          this.cancelForm();
          this.load();
          this.showToast('Usuario actualizado');
        },
        error: () => { this.formLoading = false; this.showToast('Error al actualizar', 'danger'); },
      });
    } else {
      // Create
      if (!this.formEmail.trim()) {
        this.formLoading = false;
        this.showToast('Ingresa un correo', 'warning');
        return;
      }
      this.svc.createUsuario({
        name: this.formName.trim(),
        email: this.formEmail.trim(),
        role: this.formRole,
      }).subscribe({
        next: () => {
          this.formLoading = false;
          this.cancelForm();
          this.load();
          this.showToast('Usuario registrado — codigo enviado al correo');
        },
        error: (e) => {
          this.formLoading = false;
          this.showToast(e?.error?.error || 'Error al registrar', 'danger');
        },
      });
    }
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
