export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol: 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';
  departamentoId?: string;
  activo?: boolean;
}

export interface Departamento {
  id?: string;
  nombre: string;
  descripcion?: string;
  responsableId?: string;
  miembrosIds?: string[];
}

export interface Nodo {
  nodoId: string;
  nombre: string;
  descripcion?: string;
  departamentoId?: string;
  tipo: 'INICIO' | 'TAREA' | 'DECISION' | 'PARALELO' | 'FIN';
  siguientes?: string[];
  ordenEjecucion?: number;
}

export interface PoliticaNegocio {
  id?: string;
  nombre: string;
  descripcion?: string;
  flujo: Nodo[];
  tipoFlujo: 'LINEAL' | 'ALTERNATIVO' | 'INTERACTIVO' | 'PROCESO';
  activo?: boolean;
}

export interface HistorialPaso {
  nodoId: string;
  nombreNodo: string;
  departamentoId?: string;
  funcionarioId?: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';
  comentario?: string;
  iniciadoEn?: string;
  completadoEn?: string;
}

export interface Tramite {
  id?: string;
  codigo?: string;
  clienteId?: string;
  politicaId?: string;
  estado: 'NUEVO' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO' | 'PAUSADO';
  nodoActualId?: string;
  historial?: HistorialPaso[];
  creadoEn?: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  nombre: string;
  userId: string;
}