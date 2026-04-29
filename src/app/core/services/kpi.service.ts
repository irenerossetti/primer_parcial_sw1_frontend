import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ResumenKPI {
  total: number;
  nuevos: number;
  enProceso: number;
  completados: number;
  rechazados: number;
  tasaExito: number;
  tiempoPromedioHoras: number;
  totalTramites?: number;
  tramitesEnProceso?: number;
  tramitesCompletados?: number;
}

export interface EstadoKPI {
  estado: string;
  cantidad: number;
}

export interface DepartamentoKPI {
  departamento: string;
  cantidad: number;
}

export interface TendenciaKPI {
  fecha: string;
  cantidad: number;
}

export interface RendimientoDepartamento {
  departamento: string;
  totalTramites: number;
  completados: number;
  enProceso: number;
  tiempoPromedio: number;
  tasaExito: number;
}

export interface ComparativaMensual {
  mes: string;
  completados: number;
  rechazados: number;
  enProceso: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class KPIService {
  private apiUrl = `${environment.apiUrl}/kpis`;

  constructor(private http: HttpClient) {}

  getResumen(): Observable<ResumenKPI> {
    return this.http.get<ResumenKPI>(`${this.apiUrl}/resumen`);
  }

  getPorEstado(): Observable<EstadoKPI[]> {
    return this.http.get<EstadoKPI[]>(`${this.apiUrl}/por-estado`);
  }

  getPorDepartamento(): Observable<DepartamentoKPI[]> {
    return this.http.get<DepartamentoKPI[]>(`${this.apiUrl}/por-departamento`);
  }

  getTendencia(dias: number = 30): Observable<TendenciaKPI[]> {
    return this.http.get<TendenciaKPI[]>(`${this.apiUrl}/tendencia?dias=${dias}`);
  }

  getRendimientoDepartamentos(): Observable<RendimientoDepartamento[]> {
    return this.http.get<RendimientoDepartamento[]>(`${this.apiUrl}/rendimiento-departamentos`);
  }

  getComparativaMensual(): Observable<ComparativaMensual[]> {
    return this.http.get<ComparativaMensual[]>(`${this.apiUrl}/comparativa-mensual`);
  }
}
