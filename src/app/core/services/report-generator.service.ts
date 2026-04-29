import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenAIService } from './openai.service';
import { environment } from '../../../environments/environment';

export interface SystemReport {
  titulo: string;
  fecha: Date;
  resumenEjecutivo: string;
  estadisticas: {
    totalPoliticas: number;
    totalTramites: number;
    totalUsuarios: number;
    tramitesCompletados: number;
    tramitesEnProceso: number;
    tramitesRechazados: number;
    eficienciaPromedio: number;
  };
  analisisPorPolitica: {
    nombre: string;
    tramites: number;
    eficiencia: number;
    estado: string;
  }[];
  tendencias: string[];
  recomendaciones: string[];
  problemas: string[];
}

@Injectable({ providedIn: 'root' })
export class ReportGeneratorService {
  private http = inject(HttpClient);
  private openaiService = inject(OpenAIService);

  generateReport(): Observable<SystemReport> {
    return forkJoin({
      politicas: this.http.get<any[]>(`${environment.apiUrl}/politicas`),
      tramites: this.http.get<any[]>(`${environment.apiUrl}/tramites`),
      usuarios: this.http.get<any[]>(`${environment.apiUrl}/usuarios`)
    }).pipe(
      map(data => {
        const estadisticas = this.calculateStatistics(data);
        const analisisPorPolitica = this.analyzePolicies(data.politicas, data.tramites);
        
        return {
          titulo: 'Reporte del Sistema de Gestión de Flujos',
          fecha: new Date(),
          resumenEjecutivo: this.generateExecutiveSummary(estadisticas),
          estadisticas,
          analisisPorPolitica,
          tendencias: this.identifyTrends(data.tramites),
          recomendaciones: this.generateBasicRecommendations(estadisticas),
          problemas: this.identifyProblems(estadisticas, analisisPorPolitica)
        };
      })
    );
  }

  generateAIReport(): Observable<SystemReport> {
    return from(
      this.generateReport().toPromise().then(async report => {
        // Enriquecer con análisis AI
        const aiSummary = await this.generateAISummary(report);
        const aiRecommendations = await this.generateAIRecommendations(report);

        return {
          ...report,
          resumenEjecutivo: aiSummary || report.resumenEjecutivo,
          recomendaciones: [...report.recomendaciones, ...aiRecommendations]
        };
      })
    );
  }

  private calculateStatistics(data: any): SystemReport['estadisticas'] {
    const tramites = data.tramites || [];
    const completados = tramites.filter((t: any) => t.estado === 'COMPLETADO').length;
    const enProceso = tramites.filter((t: any) => t.estado === 'EN_PROCESO').length;
    const rechazados = tramites.filter((t: any) => t.estado === 'RECHAZADO').length;

    const eficiencia = tramites.length > 0 
      ? ((completados / tramites.length) * 100)
      : 100;

    return {
      totalPoliticas: data.politicas?.length || 0,
      totalTramites: tramites.length,
      totalUsuarios: data.usuarios?.length || 0,
      tramitesCompletados: completados,
      tramitesEnProceso: enProceso,
      tramitesRechazados: rechazados,
      eficienciaPromedio: Math.round(eficiencia * 10) / 10
    };
  }

  private analyzePolicies(politicas: any[], tramites: any[]): SystemReport['analisisPorPolitica'] {
    return politicas.map(politica => {
      const tramitesPolitica = tramites.filter(t => t.politicaId === politica.id);
      const completados = tramitesPolitica.filter(t => t.estado === 'COMPLETADO').length;
      const eficiencia = tramitesPolitica.length > 0
        ? (completados / tramitesPolitica.length) * 100
        : 100;

      let estado = 'Óptimo';
      if (eficiencia < 50) estado = 'Crítico';
      else if (eficiencia < 75) estado = 'Requiere atención';
      else if (eficiencia < 90) estado = 'Bueno';

      return {
        nombre: politica.nombre,
        tramites: tramitesPolitica.length,
        eficiencia: Math.round(eficiencia * 10) / 10,
        estado
      };
    });
  }

  private generateExecutiveSummary(stats: SystemReport['estadisticas']): string {
    const tasaCompletado = stats.totalTramites > 0 
      ? Math.round((stats.tramitesCompletados / stats.totalTramites) * 100)
      : 0;

    return `El sistema gestiona actualmente ${stats.totalPoliticas} políticas activas con ${stats.totalTramites} trámites en total. 
La tasa de completado es del ${tasaCompletado}% con una eficiencia promedio del ${stats.eficienciaPromedio}%. 
${stats.tramitesEnProceso} trámites están en proceso y ${stats.tramitesRechazados} han sido rechazados.`;
  }

  private identifyTrends(tramites: any[]): string[] {
    const trends: string[] = [];

    if (tramites.length === 0) {
      trends.push('No hay datos suficientes para identificar tendencias');
      return trends;
    }

    // Analizar tendencia de creación
    const ultimos7Dias = tramites.filter(t => {
      const fecha = new Date(t.fechaCreacion);
      const ahora = new Date();
      const diff = ahora.getTime() - fecha.getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;

    if (ultimos7Dias > tramites.length * 0.5) {
      trends.push('📈 Incremento significativo en la creación de trámites en los últimos 7 días');
    } else if (ultimos7Dias < tramites.length * 0.1) {
      trends.push('📉 Disminución en la creación de trámites recientes');
    } else {
      trends.push('➡️ Creación de trámites estable');
    }

    // Analizar estados
    const completados = tramites.filter(t => t.estado === 'COMPLETADO').length;
    const tasaCompletado = (completados / tramites.length) * 100;

    if (tasaCompletado > 80) {
      trends.push('✅ Alta tasa de completado de trámites');
    } else if (tasaCompletado < 50) {
      trends.push('⚠️ Baja tasa de completado, requiere atención');
    }

    return trends;
  }

  private generateBasicRecommendations(stats: SystemReport['estadisticas']): string[] {
    const recommendations: string[] = [];

    if (stats.eficienciaPromedio < 70) {
      recommendations.push('Revisar procesos con baja eficiencia y optimizar flujos');
      recommendations.push('Capacitar al personal en las políticas más problemáticas');
    }

    if (stats.tramitesEnProceso > stats.tramitesCompletados) {
      recommendations.push('Priorizar la resolución de trámites en proceso');
      recommendations.push('Asignar más recursos a los nodos con mayor carga');
    }

    if (stats.tramitesRechazados > stats.totalTramites * 0.2) {
      recommendations.push('Analizar causas de rechazo y mejorar validaciones iniciales');
    }

    if (recommendations.length === 0) {
      recommendations.push('El sistema está funcionando correctamente');
      recommendations.push('Continuar monitoreando el rendimiento');
    }

    return recommendations;
  }

  private identifyProblems(stats: SystemReport['estadisticas'], analisis: SystemReport['analisisPorPolitica']): string[] {
    const problems: string[] = [];

    // Políticas críticas
    const criticas = analisis.filter(p => p.estado === 'Crítico');
    if (criticas.length > 0) {
      problems.push(`${criticas.length} política(s) en estado crítico: ${criticas.map(p => p.nombre).join(', ')}`);
    }

    // Eficiencia baja
    if (stats.eficienciaPromedio < 60) {
      problems.push('Eficiencia general del sistema por debajo del 60%');
    }

    // Acumulación de trámites
    if (stats.tramitesEnProceso > stats.totalTramites * 0.6) {
      problems.push('Más del 60% de trámites están en proceso, posible cuello de botella');
    }

    if (problems.length === 0) {
      problems.push('No se detectaron problemas críticos');
    }

    return problems;
  }

  private async generateAISummary(report: SystemReport): Promise<string> {
    const systemPrompt = `Eres un analista de negocios experto. 
Genera un resumen ejecutivo profesional y conciso (máximo 150 palabras) basado en las estadísticas del sistema.
Usa un tono profesional y enfócate en insights clave.`;

    const userPrompt = `Estadísticas del sistema:
- Total políticas: ${report.estadisticas.totalPoliticas}
- Total trámites: ${report.estadisticas.totalTramites}
- Completados: ${report.estadisticas.tramitesCompletados}
- En proceso: ${report.estadisticas.tramitesEnProceso}
- Rechazados: ${report.estadisticas.tramitesRechazados}
- Eficiencia promedio: ${report.estadisticas.eficienciaPromedio}%

Problemas identificados:
${report.problemas.join('\n')}

Genera un resumen ejecutivo:`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]).toPromise();

      return response?.choices[0]?.message?.content || report.resumenEjecutivo;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return report.resumenEjecutivo;
    }
  }

  private async generateAIRecommendations(report: SystemReport): Promise<string[]> {
    const systemPrompt = `Eres un consultor de optimización de procesos.
Proporciona 3 recomendaciones específicas y accionables basadas en el análisis del sistema.
Responde en formato de lista, una recomendación por línea.`;

    const userPrompt = `Análisis del sistema:
- Eficiencia: ${report.estadisticas.eficienciaPromedio}%
- Trámites en proceso: ${report.estadisticas.tramitesEnProceso}
- Trámites rechazados: ${report.estadisticas.tramitesRechazados}

Problemas:
${report.problemas.join('\n')}

Tendencias:
${report.tendencias.join('\n')}

Proporciona 3 recomendaciones específicas:`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]).toPromise();

      const content = response?.choices[0]?.message?.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [];
    }
  }
}
