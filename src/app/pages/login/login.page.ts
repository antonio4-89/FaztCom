import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  mode: 'login' | 'forgot' = 'login';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastController
  ) {}

  login() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.auth.getDefaultRoute());
      },
      error: async () => {
        this.loading = false;
        const t = await this.toast.create({
          message: 'Credenciales incorrectas',
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        await t.present();
      },
    });
  }

  loginAs(role: string) {
    this.email = `${role}@fastcom.mx`;
    this.password = 'admin123';
    this.login();
  }

  showForgot() {
    this.mode = 'forgot';
  }
}
