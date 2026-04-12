import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NuevaComandaPage } from './nueva-comanda.page';

const routes: Routes = [{ path: '', component: NuevaComandaPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [NuevaComandaPage],
})
export class NuevaComandaPageModule {}