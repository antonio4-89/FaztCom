import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { VistasPage } from './vistas.page';

const routes: Routes = [{ path: '', component: VistasPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [VistasPage],
})
export class VistasPageModule {}
