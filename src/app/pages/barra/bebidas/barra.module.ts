import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { BarraPage } from './barra.page';

const routes: Routes = [{ path: '', component: BarraPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [BarraPage],
})
export class BarraPageModule {}
