import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { OpenAIService } from './openai.service';
import { PolicyTemplate } from './template.service';

@Injectable({ providedIn: 'root' })
export class AITemplateGeneratorService {
  constructor(private openaiService: OpenAIService) {}

  generateTemplate(description: string): Observable<PolicyTemplate> {
    const systemPrompt = `Eres un experto en diseño de procesos de negocio. 
Genera una plantilla de política basada en la descripción del usuario.

Responde SOLO con un JSON válido con esta estructura:
{
  "nombre": "Nombre del proceso",
  "descripcion": "Descripción detallada",
  "categoria": "Categoría (Financiero, RRHH, Operaciones, IT, etc.)",
  "tags": ["tag1", "tag2", "tag3"],
  "icono": "material_icon_name",
  "tipoFlujo": "LINEAL o CONDICIONAL",
  "nodos": [
    {"nombre": "Inicio", "tipo": "INICIO"},
    {"nombre": "Tarea 1", "tipo": "TAREA"},
    {"nombre": "¿Decisión?", "tipo": "DECISION"},
    {"nombre": "Fin", "tipo": "FIN"}
  ]
}

Tipos de nodo: INICIO, TAREA, DECISION, FIN
Iconos comunes: account_balance, person_search, shopping_cart, build, receipt_long, etc.`;

    const userPrompt = `Genera una plantilla de proceso para: ${description}`;

    return from(
      this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]).toPromise().then(response => {
        try {
          const content = response?.choices[0]?.message?.content || '{}';
          const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const data = JSON.parse(jsonStr);
          
          return this.convertToTemplate(data, description);
        } catch (error) {
          console.error('Error parsing AI response:', error);
          return this.createFallbackTemplate(description);
        }
      })
    );
  }

  private convertToTemplate(data: any, description: string): PolicyTemplate {
    const id = `template-generated-${Date.now()}`;
    
    // Generar diagrama JSON desde los nodos
    const diagramJson = this.generateDiagramJson(data.nodos || []);
    
    // Generar flujo desde los nodos
    const flujo = (data.nodos || []).map((nodo: any, index: number) => ({
      nodoId: (index + 1).toString(),
      nombre: nodo.nombre,
      tipo: nodo.tipo,
      siguientes: index < data.nodos.length - 1 ? [(index + 2).toString()] : []
    }));

    return {
      id,
      nombre: data.nombre || 'Proceso Generado',
      descripcion: data.descripcion || description,
      categoria: data.categoria || 'Personalizado',
      tags: data.tags || ['generado', 'ai'],
      icono: data.icono || 'auto_awesome',
      tipoFlujo: data.tipoFlujo || 'LINEAL',
      flujo,
      diagramaJson
    };
  }

  private generateDiagramJson(nodos: any[]): string {
    const nodeDataArray: any[] = [];
    const linkDataArray: any[] = [];
    
    // Crear lanes
    nodeDataArray.push(
      { key: 'L1', isGroup: true, category: 'Lane', text: 'Proceso', headerColor: '#2563eb', color: 'rgba(37,99,235,0.07)', loc: '20 20', size: '600 ' + (nodos.length * 120 + 100) }
    );

    // Crear nodos
    nodos.forEach((nodo, index) => {
      const key = index + 1;
      const yPos = 100 + (index * 120);
      
      let figure = 'RoundedRectangle';
      let fill = 'white';
      
      if (nodo.tipo === 'INICIO') {
        figure = 'Circle';
        fill = '#00AD5F';
      } else if (nodo.tipo === 'DECISION') {
        figure = 'Diamond';
        fill = 'lightskyblue';
      } else if (nodo.tipo === 'FIN') {
        fill = 'lightgreen';
      }

      nodeDataArray.push({
        key,
        text: nodo.nombre,
        figure,
        fill,
        group: 'L1',
        loc: `320 ${yPos}`
      });

      // Crear enlaces
      if (index < nodos.length - 1) {
        linkDataArray.push({
          from: key,
          to: key + 1,
          fromPort: 'B',
          toPort: 'T'
        });
      }
    });

    return JSON.stringify({
      class: 'go.GraphLinksModel',
      linkFromPortIdProperty: 'fromPort',
      linkToPortIdProperty: 'toPort',
      nodeDataArray,
      linkDataArray
    }, null, 2);
  }

  private createFallbackTemplate(description: string): PolicyTemplate {
    return {
      id: `template-fallback-${Date.now()}`,
      nombre: 'Proceso Personalizado',
      descripcion: description,
      categoria: 'Personalizado',
      tags: ['generado', 'personalizado'],
      icono: 'auto_awesome',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Inicio', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Proceso', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Fin', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Proceso", "headerColor": "#2563eb", "color": "rgba(37,99,235,0.07)", "loc": "20 20", "size": "600 400" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "fill": "#00AD5F", "group": "L1", "loc": "320 100" },
    { "key": 2, "text": "Proceso", "fill": "white", "group": "L1", "loc": "320 200" },
    { "key": 3, "text": "Fin", "fill": "lightgreen", "group": "L1", "loc": "320 300" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "B", "toPort": "T" }
  ]
}`
    };
  }
}
