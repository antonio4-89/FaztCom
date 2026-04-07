import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ComandasAdminPage } from './comandas-admin.page';

const routes: Routes = [{ path: '', component: ComandasAdminPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ComandasAdminPage],
})
export class ComandasAdminPageModule {}
