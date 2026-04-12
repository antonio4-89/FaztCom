import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-change-password',
  templateUrl: 'change-password.page.html',
  styleUrls: ['change-password.page.scss'],
  standalone: false,
})
export class ChangePasswordPage {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  showPass = false;

  constructor(
    private auth: AuthService,
    private svc: UsuariosService,
    private router: Router,
    private toast: ToastController,
  ) {}

  get userId(): number { return this.auth.currentUser?.id ?? 0; }

  async save() {
    if (this.newPassword.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'warning');
      return;
    }
    this.loading = true;
    this.svc.changePassword(this.userId, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.auth.clearMustChangePassword();
        this.showToast('Contrasena establecida. Bienvenido!');
        this.router.navigateByUrl(this.auth.getDefaultRoute());
      },
      error: () => {
        this.loading = false;
        this.showToast('Error al cambiar contraseña', 'danger');
      },
    });
  }

  private async showToast(msg: string, color = 'success') {
    const t = await this.toast.create({ message: msg, duration: 3000, position: 'top', color });
    await t.present();
  }
}
