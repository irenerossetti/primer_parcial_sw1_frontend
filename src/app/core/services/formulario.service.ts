import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CampoFormulario {
  nombre: string;
  etiqueta: string;
  tipo: 'TEXT' | 'EMAIL' | 'PHONE' | 'DATE' | 'NUMBER' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'FILE';
  requerido: boolean;
  validacion?: string;
  opciones?: { valor: string; etiqueta: string }[];
  ayuda?: string;
  orden: number;
}

export interface FormularioNodo {
  nodoId: string;
  nombreNodo: string;
  descripcion: string;
  campos: CampoFormulario[];
}

@Injectable({
  providedIn: 'root'
})
export class FormularioService {
  private apiUrl = `${environment.apiUrl}/formularios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener formulario dinámico para un nodo específico
   */
  getFormularioNodo(politicaId: string, nodoId: string): Observable<FormularioNodo> {
    return this.http.get<FormularioNodo>(`${this.apiUrl}/nodo/${politicaId}/${nodoId}`);
  }

  /**
   * Obtener todos los campos de una política
   */
  getFormularioPolitica(politicaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/politica/${politicaId}`);
  }

  /**
   * Actualizar campos de formulario de una política
   */
  actualizarCamposPolitica(politicaId: string, campos: CampoFormulario[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/politica/${politicaId}/campos`, campos);
  }
}
