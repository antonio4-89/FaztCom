import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MenuAdminPage } from './menu-admin.page';

const routes: Routes = [{ path: '', component: MenuAdminPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MenuAdminPage],
})
export class MenuAdminPageModule {}
