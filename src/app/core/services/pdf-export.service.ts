import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Exporta un trámite completado a PDF
   */
  async exportarTramiteAPdf(tramite: any): Promise<void> {
    try {
      // ============================================================
      // VALIDACIÓN ELIMINADA PARA DEMO
      // Permite descargar PDF en cualquier estado del trámite
      // ============================================================
      // if (tramite.estado !== 'COMPLETADO') {
      //   alert('Solo se pueden descargar PDFs de trámites completados');
      //   return;
      // }

      console.log('Descargando PDF para trámite:', tramite.id);

      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay sesión activa. Por favor inicia sesión.');
        return;
      }

      // Configurar headers con el token
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Hacer la petición al backend para obtener el PDF
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/tramites/${tramite.id}/pdf`, {
          headers,
          responseType: 'blob', // Importante: recibir como blob
          observe: 'response'
        })
      );

      // Verificar que la respuesta sea exitosa
      if (!response.body) {
        throw new Error('No se recibió el PDF del servidor');
      }

      // Crear un blob con el PDF
      const blob = new Blob([response.body], { type: 'application/pdf' });

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tramite-${tramite.codigo || tramite.id}.pdf`;
      
      // Simular click en el enlace
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      
      // Mensajes de error más específicos
      if (error.status === 403) {
        alert('No tienes permisos para descargar este PDF. Verifica tu sesión.');
      } else if (error.status === 404) {
        alert('No se encontró el trámite solicitado.');
      } else if (error.status === 400) {
        alert('El trámite aún no está finalizado.');
      } else {
        alert('Error al descargar el PDF. Por favor intenta nuevamente.');
      }
    }
  }

  /**
   * Exporta el recorrido de un trámite a PDF
   */
  async exportarRecorridoAPdf(tramite: any): Promise<void> {
    // Por ahora usa el mismo método que exportarTramiteAPdf
    await this.exportarTramiteAPdf(tramite);
  }
}
