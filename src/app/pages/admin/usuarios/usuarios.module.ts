import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosPage } from './usuarios.page';

const routes: Routes = [{ path: '', component: UsuariosPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [UsuariosPage],
})
export class UsuariosPageModule {}
