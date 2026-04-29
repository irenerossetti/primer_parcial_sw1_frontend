import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OpenAIService } from './openai.service';
import { environment } from '../../../environments/environment';

export interface BottleneckAnalysis {
  nodo: string;
  severidad: 'alta' | 'media' | 'baja';
  tiempoPromedio: number;
  tramitesAcumulados: number;
  prediccion: string;
  sugerencias: string[];
}

export interface FlowAnalysis {
  politicaId: number;
  politicaNombre: string;
  cuellosDetectados: BottleneckAnalysis[];
  eficienciaGeneral: number;
  recomendaciones: string[];
}

@Injectable({ providedIn: 'root' })
export class BottleneckAnalyzerService {
  private http = inject(HttpClient);
  private openaiService = inject(OpenAIService);

  analyzeFlow(politicaId: number): Observable<FlowAnalysis> {
    return this.http.get<any>(`${environment.apiUrl}/tramites`).pipe(
      map(tramites => {
        // Filtrar trámites de esta política
        const tramitesPolitica = tramites.filter((t: any) => t.politicaId === politicaId);
        
        if (tramitesPolitica.length === 0) {
          return this.createEmptyAnalysis(politicaId);
        }

        // Analizar tiempos por nodo
        const nodosStats = this.calculateNodeStats(tramitesPolitica);
        
        // Detectar cuellos de botella
        const cuellos = this.detectBottlenecks(nodosStats);
        
        // Calcular eficiencia general
        const eficiencia = this.calculateEfficiency(tramitesPolitica);

        return {
          politicaId,
          politicaNombre: tramitesPolitica[0]?.politicaNombre || 'Política',
          cuellosDetectados: cuellos,
          eficienciaGeneral: eficiencia,
          recomendaciones: this.generateRecommendations(cuellos)
        };
      }),
      catchError(() => of(this.createEmptyAnalysis(politicaId)))
    );
  }

  analyzeWithAI(politicaId: number): Observable<FlowAnalysis> {
    return from(
      this.analyzeFlow(politicaId).toPromise().then(async analysis => {
        if (!analysis || analysis.cuellosDetectados.length === 0) {
          return analysis;
        }

        // Enriquecer análisis con AI
        const aiInsights = await this.getAIInsights(analysis);
        
        return {
          ...analysis,
          recomendaciones: [...analysis.recomendaciones, ...aiInsights]
        };
      })
    );
  }

  private calculateNodeStats(tramites: any[]): Map<string, any> {
    const stats = new Map<string, any>();

    tramites.forEach(tramite => {
      const nodoActual = tramite.nodoActual || 'Desconocido';
      
      if (!stats.has(nodoActual)) {
        stats.set(nodoActual, {
          nombre: nodoActual,
          tramites: [],
          tiempos: []
        });
      }

      const stat = stats.get(nodoActual);
      stat.tramites.push(tramite);
      
      // Calcular tiempo en el nodo (simulado)
      const fechaCreacion = new Date(tramite.fechaCreacion);
      const ahora = new Date();
      const diasEnNodo = Math.floor((ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
      stat.tiempos.push(diasEnNodo);
    });

    return stats;
  }

  private detectBottlenecks(nodosStats: Map<string, any>): BottleneckAnalysis[] {
    const cuellos: BottleneckAnalysis[] = [];

    nodosStats.forEach((stat, nodo) => {
      const tramitesAcumulados = stat.tramites.length;
      const tiempoPromedio = stat.tiempos.reduce((a: number, b: number) => a + b, 0) / stat.tiempos.length;

      // Detectar cuello de botella
      let severidad: 'alta' | 'media' | 'baja' = 'baja';
      let prediccion = '';
      const sugerencias: string[] = [];

      if (tramitesAcumulados > 10 && tiempoPromedio > 5) {
        severidad = 'alta';
        prediccion = `Se acumularán ${Math.floor(tramitesAcumulados * 1.5)} trámites en los próximos 7 días`;
        sugerencias.push('Asignar más recursos a este nodo');
        sugerencias.push('Revisar el proceso para simplificarlo');
        sugerencias.push('Considerar automatización');
      } else if (tramitesAcumulados > 5 || tiempoPromedio > 3) {
        severidad = 'media';
        prediccion = `Posible acumulación de ${Math.floor(tramitesAcumulados * 1.2)} trámites`;
        sugerencias.push('Monitorear de cerca este nodo');
        sugerencias.push('Optimizar tiempos de respuesta');
      } else {
        severidad = 'baja';
        prediccion = 'Flujo normal, sin problemas detectados';
        sugerencias.push('Mantener el ritmo actual');
      }

      if (severidad !== 'baja') {
        cuellos.push({
          nodo,
          severidad,
          tiempoPromedio: Math.round(tiempoPromedio * 10) / 10,
          tramitesAcumulados,
          prediccion,
          sugerencias
        });
      }
    });

    return cuellos.sort((a, b) => {
      const severityOrder = { alta: 3, media: 2, baja: 1 };
      return severityOrder[b.severidad] - severityOrder[a.severidad];
    });
  }

  private calculateEfficiency(tramites: any[]): number {
    if (tramites.length === 0) return 100;

    const completados = tramites.filter(t => t.estado === 'COMPLETADO').length;
    const enProceso = tramites.filter(t => t.estado === 'EN_PROCESO').length;
    const rechazados = tramites.filter(t => t.estado === 'RECHAZADO').length;

    // Fórmula de eficiencia: (completados * 1.0 + enProceso * 0.5) / total * 100
    const eficiencia = ((completados * 1.0 + enProceso * 0.5) / tramites.length) * 100;
    
    return Math.round(eficiencia * 10) / 10;
  }

  private generateRecommendations(cuellos: BottleneckAnalysis[]): string[] {
    const recomendaciones: string[] = [];

    if (cuellos.length === 0) {
      recomendaciones.push('✓ El flujo está funcionando correctamente');
      recomendaciones.push('Continuar monitoreando el rendimiento');
      return recomendaciones;
    }

    const altaSeveridad = cuellos.filter(c => c.severidad === 'alta').length;
    const mediaSeveridad = cuellos.filter(c => c.severidad === 'media').length;

    if (altaSeveridad > 0) {
      recomendaciones.push(`⚠️ URGENTE: ${altaSeveridad} cuello(s) de botella crítico(s) detectado(s)`);
      recomendaciones.push('Priorizar la resolución de nodos con severidad alta');
    }

    if (mediaSeveridad > 0) {
      recomendaciones.push(`⚡ ${mediaSeveridad} nodo(s) requiere(n) atención`);
    }

    recomendaciones.push('Revisar la distribución de carga de trabajo');
    recomendaciones.push('Considerar paralelización de tareas cuando sea posible');

    return recomendaciones;
  }

  private async getAIInsights(analysis: FlowAnalysis): Promise<string[]> {
    const systemPrompt = `Eres un experto en optimización de procesos de negocio.
Analiza los cuellos de botella detectados y proporciona 2-3 recomendaciones específicas y accionables.
Responde en formato de lista, una recomendación por línea, sin numeración.`;

    const userPrompt = `Análisis de flujo:
- Política: ${analysis.politicaNombre}
- Eficiencia: ${analysis.eficienciaGeneral}%
- Cuellos detectados: ${analysis.cuellosDetectados.length}

Detalles:
${analysis.cuellosDetectados.map(c => 
  `- ${c.nodo}: ${c.tramitesAcumulados} trámites, ${c.tiempoPromedio} días promedio (${c.severidad})`
).join('\n')}

Proporciona recomendaciones específicas:`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]).toPromise();

      const content = response?.choices[0]?.message?.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return [];
    }
  }

  private createEmptyAnalysis(politicaId: number): FlowAnalysis {
    return {
      politicaId,
      politicaNombre: 'Política',
      cuellosDetectados: [],
      eficienciaGeneral: 100,
      recomendaciones: ['No hay datos suficientes para análisis']
    };
  }
}
