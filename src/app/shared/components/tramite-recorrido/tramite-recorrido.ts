import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tramite, HistorialPaso } from '../../../core/services/tramite.service';

@Component({
  selector: 'app-tramite-recorrido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tramite-recorrido.html',
  styleUrls: ['./tramite-recorrido.css']
})
export class TramiteRecorridoComponent {
  @Input() tramite!: Tramite;

  get historialOrdenado(): HistorialPaso[] {
    if (!this.tramite?.historial) return [];
    return [...this.tramite.historial].sort((a, b) => 
      new Date(a.iniciadoEn).getTime() - new Date(b.iniciadoEn).getTime()
    );
  }

  get nodosUnicos(): HistorialPaso[] {
    const nodos = new Map<string, HistorialPaso>();
    for (const paso of this.historialOrdenado) {
      nodos.set(paso.nodoId, paso);
    }
    return Array.from(nodos.values());
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'completado';
      case 'PENDIENTE': return 'pendiente';
      case 'RECHAZADO': return 'rechazado';
      default: return '';
    }
  }

  getTiempoTranscurrido(paso: HistorialPaso): string {
    if (!paso.completadoEn) return 'En progreso...';
    
    const inicio = new Date(paso.iniciadoEn).getTime();
    const fin = new Date(paso.completadoEn).getTime();
    const diffMs = fin - inicio;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHoras < 1) {
      const diffMin = Math.floor(diffMs / (1000 * 60));
      return `${diffMin} min`;
    }
    if (diffHoras < 24) return `${diffHoras}h`;
    return `${Math.floor(diffHoras / 24)}d`;
  }

  getIconoEstado(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'check_circle';
      case 'PENDIENTE': return 'schedule';
      case 'RECHAZADO': return 'cancel';
      default: return 'help';
    }
  }

  getPorcentajeCompletados(): number {
    // Si está completado, mostrar 100%
    if (this.tramite?.estado === 'COMPLETADO') {
      return 100;
    }

    // Si está en mora o rechazado, no contar como "completado"
    if (this.tramite?.estado === 'EN_MORA' || this.tramite?.estado === 'RECHAZADO') {
      // Calcular basado en nodos pero no llegar a 100%
      if (this.nodosUnicos.length === 0) return 0;
      const completados = this.nodosUnicos.filter(n => n.estado === 'COMPLETADO').length;
      const porcentaje = Math.round((completados / this.nodosUnicos.length) * 100);
      return Math.min(porcentaje, 95); // Máximo 95% si está en mora
    }

    // Para otros estados, calcular normalmente
    if (this.nodosUnicos.length === 0) return 0;
    const completados = this.nodosUnicos.filter(n => n.estado === 'COMPLETADO').length;
    return Math.round((completados / this.nodosUnicos.length) * 100);
  }
}
