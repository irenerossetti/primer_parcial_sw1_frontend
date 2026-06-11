import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CampoFormulario {
  nombre: string;
  etiqueta: string;
  tipo: 'TEXTO' | 'TEXTAREA' | 'NUMERO' | 'FECHA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'ARCHIVO';
  requerido: boolean;
  opciones?: string[];
  valorPorDefecto?: string;
}

export interface PlantillaFormulario {
  titulo: string;
  campos: CampoFormulario[];
  instrucciones: string;
}

export interface ConfiguracionFlujo {
  tiempoMaximoHoras: number;
  requiereAprobacion: boolean;
  departamentosSiguientes: string[];
  accionesPermitidas: string[];
  formulario: PlantillaFormulario;
}

export interface MetricasDesempenio {
  tramitesAtendidos: number;
  tramitesPendientes: number;
  tramitesEnMora: number;
  tiempoPromedioProcesamiento: number;
  eficiencia: number;
  ultimaActualizacion: Date;
}

export interface Departamento {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  responsableEmail: string;
  responsableNombre: string;
  tipo: 'ATENCION_CLIENTE' | 'EVALUACION' | 'LEGAL' | 'TECNICO' | 'ALMACEN' | 'FINANZAS' | 'CALIDAD' | 'SOPORTE' | 'OTROS';
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO';
  rolesPermitidos: string[];
  configuracionFlujo: ConfiguracionFlujo;
  metricas: MetricasDesempenio;
  creadoEn: Date;
  actualizadoEn: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  private apiUrl = `${environment.apiUrl}/departamentos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDepartamentosActivos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/activos`, { headers: this.getHeaders() });
  }

  getDepartamentoById(id: string): Observable<Departamento> {
    return this.http.get<Departamento>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDepartamentoByCodigo(codigo: string): Observable<Departamento> {
    return this.http.get<Departamento>(`${this.apiUrl}/codigo/${codigo}`, { headers: this.getHeaders() });
  }

  getDepartamentosByTipo(tipo: string): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/tipo/${tipo}`, { headers: this.getHeaders() });
  }

  getSiguientesDepartamentos(id: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/siguientes`, { headers: this.getHeaders() });
  }

  createDepartamento(departamento: Partial<Departamento>): Observable<Departamento> {
    return this.http.post<Departamento>(this.apiUrl, departamento, { headers: this.getHeaders() });
  }

  updateDepartamento(id: string, departamento: Partial<Departamento>): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.apiUrl}/${id}`, departamento, { headers: this.getHeaders() });
  }

  updateMetricas(id: string, metricas: Partial<MetricasDesempenio>): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.apiUrl}/${id}/metricas`, metricas, { headers: this.getHeaders() });
  }

  deleteDepartamento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}