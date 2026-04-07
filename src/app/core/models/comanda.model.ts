export type ComandaStatus = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';
export type ComandaDestino = 'cocina' | 'barra';

export interface ComandaItem {
  id: number;
  productoId?: number;
  customName?: string;
  qty: number;
  price: number;
  tipo: 'comida' | 'bebida';
  producto?: { name: string };
  name?: string;
}

export interface Comanda {
  id: number;
  notaId: number;
  destino: ComandaDestino;
  status: ComandaStatus;
  createdAt: string;
  items: ComandaItem[];
  nota?: {
    mesa: { identifier: string; seccion: string };
    mesero: { id: number; name: string };
  };
}

export interface Nota {
  id: number;
  mesaId: number;
  meseroId: number;
  status: 'abierta' | 'cerrada';
  total: number;
  createdAt: string;
  closedAt?: string;
  mesa?: { id: number; identifier: string; seccion: string };
  mesero?: { id: number; name: string };
  comandas?: Comanda[];
}
