import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenAIService } from './openai.service';
import { environment } from '../../../environments/environment';

export interface ClassificationResult {
  politicaSugerida: {
    id: number;
    nombre: string;
    confianza: number;
  };
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  razonamiento: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class TramiteClassifierService {
  private http = inject(HttpClient);
  private openaiService = inject(OpenAIService);

  classifyTramite(descripcion: string, titulo?: string): Observable<ClassificationResult> {
    return from(
      this.http.get<any[]>(`${environment.apiUrl}/politicas`).toPromise().then(async politicas => {
        if (!politicas || politicas.length === 0) {
          return this.createFallbackClassification();
        }

        // Clasificar con AI
        const classification = await this.classifyWithAI(descripcion, titulo || '', politicas);
        return classification;
      })
    );
  }

  private async classifyWithAI(descripcion: string, titulo: string, politicas: any[]): Promise<ClassificationResult> {
    const systemPrompt = `Eres un experto en clasificación de trámites y procesos de negocio.
Analiza la descripción del trámite y clasifícalo según las políticas disponibles.

Responde SOLO con un JSON válido con esta estructura:
{
  "politicaId": number,
  "confianza": number (0-100),
  "prioridad": "ALTA" | "MEDIA" | "BAJA",
  "razonamiento": "explicación breve",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const userPrompt = `Trámite a clasificar:
Título: ${titulo}
Descripción: ${descripcion}

Políticas disponibles:
${politicas.map(p => `ID: ${p.id}, Nombre: ${p.nombre}, Descripción: ${p.descripcion || 'N/A'}`).join('\n')}

Clasifica el trámite:`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]).toPromise();

      const content = response?.choices[0]?.message?.content || '{}';
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(jsonStr);

      const politica = politicas.find(p => p.id === data.politicaId) || politicas[0];

      return {
        politicaSugerida: {
          id: politica.id,
          nombre: politica.nombre,
          confianza: data.confianza || 75
        },
        prioridad: data.prioridad || 'MEDIA',
        razonamiento: data.razonamiento || 'Clasificación basada en análisis de contenido',
        tags: data.tags || []
      };
    } catch (error) {
      console.error('Error classifying with AI:', error);
      return this.createFallbackClassification(politicas[0]);
    }
  }

  private createFallbackClassification(politica?: any): ClassificationResult {
    return {
      politicaSugerida: {
        id: politica?.id || 1,
        nombre: politica?.nombre || 'Política General',
        confianza: 50
      },
      prioridad: 'MEDIA',
      razonamiento: 'Clasificación automática no disponible',
      tags: ['general']
    };
  }

  suggestPriority(descripcion: string): Observable<'ALTA' | 'MEDIA' | 'BAJA'> {
    return from(
      this.analyzePriority(descripcion)
    );
  }

  private async analyzePriority(descripcion: string): Promise<'ALTA' | 'MEDIA' | 'BAJA'> {
    const systemPrompt = `Analiza la descripción de un trámite y determina su prioridad.
Responde SOLO con una palabra: ALTA, MEDIA o BAJA.

Criterios:
- ALTA: Urgente, crítico, plazo corto, impacto alto
- MEDIA: Normal, plazo estándar, impacto moderado
- BAJA: No urgente, plazo flexible, impacto bajo`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: descripcion }
      ]).toPromise();

      const content = response?.choices[0]?.message?.content?.trim().toUpperCase() || 'MEDIA';
      
      if (content.includes('ALTA')) return 'ALTA';
      if (content.includes('BAJA')) return 'BAJA';
      return 'MEDIA';
    } catch (error) {
      console.error('Error analyzing priority:', error);
      return 'MEDIA';
    }
  }

  extractTags(descripcion: string): Observable<string[]> {
    return from(
      this.extractTagsWithAI(descripcion)
    );
  }

  private async extractTagsWithAI(descripcion: string): Promise<string[]> {
    const systemPrompt = `Extrae 3-5 palabras clave relevantes de la descripción del trámite.
Responde SOLO con las palabras separadas por comas, sin numeración ni formato adicional.`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: descripcion }
      ]).toPromise();

      const content = response?.choices[0]?.message?.content || '';
      return content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).slice(0, 5);
    } catch (error) {
      console.error('Error extracting tags:', error);
      return [];
    }
  }
}
