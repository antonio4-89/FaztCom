import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MenuCocinaPage } from './menu-cocina.page';

const routes: Routes = [{ path: '', component: MenuCocinaPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MenuCocinaPage],
})
export class MenuCocinaPageModule {}
