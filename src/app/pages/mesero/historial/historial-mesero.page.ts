import { Component, OnInit } from '@angular/core';
import { NotasService } from '../../../core/services/notas.service';
import { Nota, ComandaItem } from '../../../core/models/comanda.model';

@Component({
  selector: 'app-historial-mesero',
  templateUrl: 'historial-mesero.page.html',
  styleUrls: ['historial-mesero.page.scss'],
  standalone: false
})
export class HistorialMeseroPage implements OnInit {
  notas: Nota[] = [];
  loading = false;

  constructor(private notasService: NotasService) {}

  ngOnInit() {
    this.loadHistorial();
  }

  loadHistorial() {
    this.loading = true;
    this.notasService.getHistorial().subscribe({
      next: n => { this.notas = n; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getTotal(nota: Nota): number {
    if (nota.total) return nota.total;
    if (!nota.comandas) return 0;
    return nota.comandas.reduce((sum, c) => {
      return sum + (c.items || []).reduce((s, i) => s + i.price * i.qty, 0);
    }, 0);
  }

  getItemCount(nota: Nota): number {
    if (!nota.comandas) return 0;
    return nota.comandas.reduce((sum, c) => sum + (c.items || []).length, 0);
  }

  getItemName(item: ComandaItem): string {
    return item.producto?.name || item.customName || item.name || 'Item';
  }

  getSeccionClass(seccion: string): string {
    return seccion === 'PM' ? 'sec-PM' : 'sec-T';
  }
}
