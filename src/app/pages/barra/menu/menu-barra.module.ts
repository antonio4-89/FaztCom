import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MenuBarraPage } from './menu-barra.page';

const routes: Routes = [{ path: '', component: MenuBarraPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MenuBarraPage],
})
export class MenuBarraPageModule {}
