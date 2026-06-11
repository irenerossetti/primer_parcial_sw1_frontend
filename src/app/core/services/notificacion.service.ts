import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tramiteId?: string;
  tramiteCodigo?: string;
  titulo: string;
  mensaje: string;
  tipo?: string;
  leida: boolean;
  creadoEn: string;
}

export interface ResumenNotificaciones {
  noLeidas: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  getNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl);
  }

  getNoLeidas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`);
  }

  getResumen(): Observable<ResumenNotificaciones> {
    return this.http.get<ResumenNotificaciones>(`${this.apiUrl}/resumen`);
  }

  marcarLeida(id: string): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}/leer`, {});
  }

  marcarTodasLeidas(): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/leer-todas`, {});
  }
}
