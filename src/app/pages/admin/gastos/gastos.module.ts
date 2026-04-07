import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { GastosPage } from './gastos.page';

const routes: Routes = [{ path: '', component: GastosPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [GastosPage],
})
export class GastosPageModule {}
