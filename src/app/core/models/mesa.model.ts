export type MesaStatus = 'libre' | 'abierta' | 'cerrada' | 'limpiar';
export type Seccion = 'PM' | 'T';

export interface Mesa {
  id: number;
  identifier: string;
  seccion: Seccion;
  tipo: 'mesa' | 'periquera';
  status: MesaStatus;
}

export const SECCIONES_DATA = {
  PM: { label: 'PM - Planta Media / Sala', ids: ['1PM','2PM','3PM','4PM','5PM','SALA'] },
  T: { label: 'T - Terraza + Periqueras', ids: ['1T','2T','3T','4T','5T','6T','7T','8T','1P','2P','3P','4P','5P'] },
};

export function getSeccion(identifier: string): Seccion {
  return SECCIONES_DATA.PM.ids.includes(identifier) ? 'PM' : 'T';
}
