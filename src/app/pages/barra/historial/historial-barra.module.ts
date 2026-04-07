import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HistorialBarraPage } from './historial-barra.page';

const routes: Routes = [{ path: '', component: HistorialBarraPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [HistorialBarraPage],
})
export class HistorialBarraPageModule {}
