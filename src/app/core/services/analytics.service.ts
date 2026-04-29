import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DepartamentoAnalytics {
  nombre: string;
  tramitesEnEspera: number;
  tiempoPromedioHoras: number;
  capacidadUtilizada: number;
  estado: 'CRITICO' | 'ADVERTENCIA' | 'NORMAL';
}

export interface TramiteAtrasado {
  codigo: string;
  cliente: string;
  demoraDias: number;
  departamentoActual: string;
}

export interface CuelloBottellaData {
  departamentos: DepartamentoAnalytics[];
  tramitesAtrasados: TramiteAtrasado[];
  totalTramitesEnEspera: number;
  departamentoCritico: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  getCuellosBottella(): Observable<CuelloBottellaData> {
    return this.http.get<CuelloBottellaData>(`${this.apiUrl}/cuellos-botella`);
  }
}
