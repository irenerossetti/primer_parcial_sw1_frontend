import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistorialPaso {
  nodoId: string;
  nombreNodo: string;
  departamentoId: string;
  estado: 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO';
  iniciadoEn: Date;
  completadoEn?: Date;
}

export interface Tramite {
  id?: string;
  codigo: string;
  clienteId: string;
  politicaId?: string;
  clienteNombre?: string;
  estado: 'NUEVO' | 'EN_PROCESO' | 'PENDIENTE' | 'EN_MORA' | 'COMPLETADO' | 'RECHAZADO';
  nodoActualId: string;
  creadoEn: Date;
  actualizadoEn: Date;
  finalizadoEn?: Date;
  historial: HistorialPaso[];
  departamentoActual?: string;
  tipo?: string;
  descripcion?: string;
}

export interface TramiteEjecucion {
  id: string;
  codigo: string;
  estadoActual: Tramite['estado'];
  departamentoActual?: string;
  nodoActual?: {
    nodoId?: string;
    nombre?: string;
    departamentoId?: string;
    siguientes?: string[];
    camposFormulario?: string[];
  };
  nodosSiguientes?: Array<{
    nodoId: string;
    nombre?: string;
    departamentoId?: string;
    tipo?: string;
  }>;
  politicaId?: string;
  politicaNombre?: string;
  totalNodos?: number;
  nodosCompletados?: number;
  porcentajeAvance?: number;
  porcentajeRestante?: number;
}

@Injectable({ providedIn: 'root' })
export class TramiteService {
  private apiUrl = `${environment.apiUrl}/tramites`;

  constructor(private http: HttpClient) {}

  getTramites(): Observable<Tramite[]> {
    return this.http.get<Tramite[]>(this.apiUrl);
  }

  getTramiteById(id: string): Observable<Tramite> {
    return this.http.get<Tramite>(`${this.apiUrl}/${id}`);
  }

  getTramitesByEstado(estado: string): Observable<Tramite[]> {
    return this.http.get<Tramite[]>(`${this.apiUrl}/estado/${estado}`);
  }

  crearTramite(tramite: Partial<Tramite>): Observable<Tramite> {
    return this.http.post<Tramite>(this.apiUrl, tramite);
  }

  actualizarEstado(id: string, estado: string): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  eliminarTramite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // SOLO UN MÉTODO, NO DUPLICADO
  actualizarEstadoCompleto(id: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado-completo`, updateData);
  }

  avanzarTramite(
    id: string,
    payload: {
      comentario?: string;
      datos?: Record<string, unknown>;
      departamentoDestino?: string;
      siguienteNodoId?: string;
    }
  ): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/avanzar`, payload);
  }

  rechazarTramite(id: string, motivo: string): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.apiUrl}/${id}/rechazar`, { motivo });
  }

  getEstadoEjecucion(id: string): Observable<TramiteEjecucion> {
    return this.http.get<TramiteEjecucion>(`${this.apiUrl}/${id}/ejecucion`);
  }

  descargarPdfTramite(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
  }
}