import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HistorialCocinaPage } from './historial-cocina.page';

const routes: Routes = [{ path: '', component: HistorialCocinaPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [HistorialCocinaPage],
})
export class HistorialCocinaPageModule {}
