import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MesasService } from '../../../core/services/mesas.service';
import { SocketService } from '../../../core/services/socket.service';
import { Mesa } from '../../../core/models/mesa.model';

@Component({
  selector: 'app-mesas',
  templateUrl: 'mesas.page.html',
  styleUrls: ['mesas.page.scss'],
  standalone: false
})
export class MesasPage implements OnInit, OnDestroy {
  mesasPM: Mesa[] = [];
  mesasT: Mesa[] = [];
  loading = false;
  private socketSub?: Subscription;

  constructor(
    private mesasService: MesasService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMesas();
    this.socketService.connect();
    this.socketSub = this.socketService.onMesaActualizada().subscribe(() => {
      this.loadMesas();
    });
  }

  ngOnDestroy() {
    this.socketSub?.unsubscribe();
  }

  loadMesas() {
    this.loading = true;
    this.mesasService.getMesas().subscribe({
      next: (mesas) => {
        this.mesasPM = mesas.filter(m => m.seccion === 'PM');
        this.mesasT = mesas.filter(m => m.seccion === 'T');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Fallback demo data
        const demoMesas: Mesa[] = [
          { id: 1, identifier: '1PM', seccion: 'PM', tipo: 'mesa', status: 'libre' },
          { id: 2, identifier: '2PM', seccion: 'PM', tipo: 'mesa', status: 'abierta' },
          { id: 3, identifier: '3PM', seccion: 'PM', tipo: 'mesa', status: 'libre' },
          { id: 4, identifier: '4PM', seccion: 'PM', tipo: 'mesa', status: 'cerrada' },
          { id: 5, identifier: '5PM', seccion: 'PM', tipo: 'mesa', status: 'libre' },
          { id: 6, identifier: 'SALA', seccion: 'PM', tipo: 'mesa', status: 'abierta' },
          { id: 7, identifier: '1T', seccion: 'T', tipo: 'mesa', status: 'libre' },
          { id: 8, identifier: '2T', seccion: 'T', tipo: 'mesa', status: 'abierta' },
          { id: 9, identifier: '3T', seccion: 'T', tipo: 'mesa', status: 'libre' },
          { id: 10, identifier: '4T', seccion: 'T', tipo: 'mesa', status: 'libre' },
          { id: 11, identifier: '5T', seccion: 'T', tipo: 'mesa', status: 'abierta' },
          { id: 12, identifier: '6T', seccion: 'T', tipo: 'mesa', status: 'libre' },
          { id: 13, identifier: '7T', seccion: 'T', tipo: 'mesa', status: 'cerrada' },
          { id: 14, identifier: '8T', seccion: 'T', tipo: 'mesa', status: 'libre' },
          { id: 15, identifier: '1P', seccion: 'T', tipo: 'periquera', status: 'libre' },
          { id: 16, identifier: '2P', seccion: 'T', tipo: 'periquera', status: 'abierta' },
          { id: 17, identifier: '3P', seccion: 'T', tipo: 'periquera', status: 'libre' },
          { id: 18, identifier: '4P', seccion: 'T', tipo: 'periquera', status: 'libre' },
          { id: 19, identifier: '5P', seccion: 'T', tipo: 'periquera', status: 'libre' },
        ];
        this.mesasPM = demoMesas.filter(m => m.seccion === 'PM');
        this.mesasT = demoMesas.filter(m => m.seccion === 'T');
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      libre: 'Disponible',
      abierta: 'Ocupada',
      cerrada: 'Cerrada',
      limpiar: 'Por limpiar',
    };
    return labels[status] || status;
  }

  selectMesa(mesa: Mesa) {
    if (mesa.status === 'cerrada' || mesa.status === 'limpiar') return;
    this.router.navigate(['/mesero/nueva-comanda'], {
      queryParams: { mesa: mesa.identifier, mesaId: mesa.id },
    });
  }

  marcarLimpia(mesa: Mesa) {
    this.mesasService.updateMesaStatus(mesa.id, 'libre').subscribe({
      next: () => { mesa.status = 'libre'; },
    });
  }

  nuevaParaLlevar() {
    this.router.navigate(['/mesero/nueva-comanda'], {
      queryParams: { paraLlevar: 'true' },
    });
  }
}
