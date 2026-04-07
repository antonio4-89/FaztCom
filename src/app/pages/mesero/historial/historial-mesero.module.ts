import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HistorialMeseroPage } from './historial-mesero.page';

const routes: Routes = [{ path: '', component: HistorialMeseroPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [HistorialMeseroPage],
})
export class HistorialMeseroPageModule {}
