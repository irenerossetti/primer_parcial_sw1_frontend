import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class OpenAIService {
  // OpenRouter API endpoint (compatible con OpenAI)
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = environment.openaiApiKey;

  constructor(private http: HttpClient) {}

  chat(messages: ChatMessage[]): Observable<OpenAIResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': window.location.origin, // Requerido por OpenRouter
      'X-Title': 'Workflow Management System' // Opcional pero recomendado
    });

    const body = {
      model: 'openai/gpt-3.5-turbo', // Modelo de OpenAI a través de OpenRouter
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    };

    return this.http.post<OpenAIResponse>(this.apiUrl, body, { headers });
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Nota: OpenRouter no soporta Whisper directamente
    // Para transcripción de audio, necesitarías usar OpenAI directo
    // o un servicio alternativo como Deepgram
    console.warn('Audio transcription not available through OpenRouter');
    throw new Error('Audio transcription requires direct OpenAI API access');
  }

  searchTemplates(query: string, templates: any[]): Observable<any[]> {
    const systemPrompt = `Eres un asistente que ayuda a buscar plantillas de políticas de negocio. 
    Analiza la consulta del usuario y devuelve los IDs de las plantillas más relevantes en formato JSON.
    Responde SOLO con un array JSON de IDs, ejemplo: ["template1", "template3"]`;

    const userPrompt = `Consulta: "${query}"
    
Plantillas disponibles:
${templates.map(t => `ID: ${t.id}, Nombre: ${t.nombre}, Descripción: ${t.descripcion}, Tags: ${t.tags.join(', ')}`).join('\n')}

Devuelve los IDs de las plantillas más relevantes:`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return from(
      this.chat(messages).toPromise().then(response => {
        try {
          const content = response?.choices[0]?.message?.content || '[]';
          const ids = JSON.parse(content);
          return templates.filter(t => ids.includes(t.id));
        } catch {
          // Fallback: búsqueda simple por texto
          const lowerQuery = query.toLowerCase();
          return templates.filter(t => 
            t.nombre.toLowerCase().includes(lowerQuery) ||
            t.descripcion.toLowerCase().includes(lowerQuery) ||
            t.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
          );
        }
      })
    );
  }
}
