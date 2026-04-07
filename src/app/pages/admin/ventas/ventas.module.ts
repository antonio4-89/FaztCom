import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { VentasPage } from './ventas.page';

const routes: Routes = [{ path: '', component: VentasPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [VentasPage],
})
export class VentasPageModule {}
