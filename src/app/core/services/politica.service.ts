import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Politica {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  tipoFlujo?: 'LINEAL' | 'ALTERNATIVO' | 'INTERACTIVO' | 'PROCESO';
}

@Injectable({ providedIn: 'root' })
export class PoliticaService {
  private apiUrl = `${environment.apiUrl}/politicas`;

  constructor(private http: HttpClient) {}

  getPoliticasActivas(): Observable<Politica[]> {
    return this.http.get<Politica[]>(this.apiUrl);
  }

  getPoliticaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearPolitica(politica: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, politica);
  }

  actualizarPolitica(id: string, politica: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, politica);
  }

  actualizarDiagrama(id: string, diagramaJson: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/diagrama`, { diagramaJson });
  }

  eliminarPolitica(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
