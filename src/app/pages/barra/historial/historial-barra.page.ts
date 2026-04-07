import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Comanda } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-historial-barra',
  templateUrl: 'historial-barra.page.html',
  styleUrls: ['historial-barra.page.scss'],
})
export class HistorialBarraPage implements OnInit {
  comandas: Comanda[] = [];
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.get<Comanda[]>('/comandas?destino=barra&status=entregado').subscribe({
      next: d => { this.comandas = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
