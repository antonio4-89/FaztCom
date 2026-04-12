import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ReportesPage } from './reportes.page';

const routes: Routes = [{ path: '', component: ReportesPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ReportesPage],
})
export class ReportesPageModule {}
