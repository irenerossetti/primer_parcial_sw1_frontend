import { Injectable } from '@angular/core';
import { TipoNodoUML, NodoUML, Swimlane, CONFIGURACION_NODOS_UML } from '../models/uml-types';

@Injectable({
  providedIn: 'root'
})
export class UMLConverterService {

  /**
   * Convierte nodos del backend a formato GoJS
   */
  convertirNodosAGoJS(nodos: NodoUML[], swimlanes: Swimlane[]): any {
    const nodeDataArray: any[] = [];
    const linkDataArray: any[] = [];

    // Agregar swimlanes
    swimlanes.forEach((swimlane, index) => {
      nodeDataArray.push({
        key: swimlane.id,
        isGroup: true,
        category: 'Lane',
        text: swimlane.nombre,
        headerColor: swimlane.color,
        color: this.hexToRgba(swimlane.color, 0.07),
        loc: `${20 + (index * 230)} 20`,
        size: '220 480'
      });
    });

    // Agregar nodos
    nodos.forEach(nodo => {
      const config = CONFIGURACION_NODOS_UML[nodo.tipo];
      const nodeData: any = {
        key: nodo.nodoId,
        text: nodo.nombre,
        category: this.obtenerCategoriaGoJS(nodo.tipo),
        figure: config.figura,
        fill: nodo.color || config.color,
        stroke: config.colorBorde,
        size: `${config.ancho} ${config.alto}`,
        tipo: nodo.tipo
      };

      // Agregar al swimlane si existe
      if (nodo.swimlane) {
        nodeData.group = nodo.swimlane;
      }

      // Posición
      if (nodo.posicion) {
        nodeData.loc = `${nodo.posicion.x} ${nodo.posicion.y}`;
      }

      // Propiedades específicas por tipo
      switch (nodo.tipo) {
        case TipoNodoUML.DECISION:
        case TipoNodoUML.MERGE:
          nodeData.figure = 'Diamond';
          break;
        case TipoNodoUML.FORK:
        case TipoNodoUML.JOIN:
          nodeData.figure = 'Rectangle';
          nodeData.size = '150 10';
          break;
        case TipoNodoUML.INICIO:
        case TipoNodoUML.FIN:
          nodeData.figure = 'Circle';
          nodeData.size = '55 55';
          break;
        case TipoNodoUML.OBJETO:
          nodeData.text = `[${nodo.objetoEstado || 'Estado'}]\\n${nodo.nombre}`;
          break;
        case TipoNodoUML.EVENTO_TIEMPO:
          nodeData.text = `⏰ ${nodo.tiempoEspera || ''}\\n${nodo.nombre}`;
          break;
        case TipoNodoUML.REGION_EXPANSION:
          nodeData.text = `<<${nodo.tipoExpansion?.toLowerCase() || 'iterative'}>>\\n${nodo.nombre}`;
          break;
      }

      nodeDataArray.push(nodeData);

      // Agregar links
      if (nodo.siguientes && nodo.siguientes.length > 0) {
        nodo.siguientes.forEach((siguiente, index) => {
          linkDataArray.push({
            from: nodo.nodoId,
            to: siguiente,
            text: nodo.condicion && index === 0 ? nodo.condicion : '',
            fromPort: 'B',
            toPort: 'T'
          });
        });
      }
    });

    return {
      class: 'go.GraphLinksModel',
      linkFromPortIdProperty: 'fromPort',
      linkToPortIdProperty: 'toPort',
      nodeDataArray,
      linkDataArray
    };
  }

  /**
   * Convierte modelo GoJS a nodos del backend
   */
  convertirGoJSANodos(modelData: any): { nodos: NodoUML[], swimlanes: Swimlane[] } {
    const nodos: NodoUML[] = [];
    const swimlanes: Swimlane[] = [];

    // Extraer swimlanes
    modelData.nodeDataArray
      .filter((node: any) => node.isGroup && node.category === 'Lane')
      .forEach((lane: any, index: number) => {
        swimlanes.push({
          id: lane.key,
          nombre: lane.text,
          color: lane.headerColor,
          orden: index,
          orientacion: 'VERTICAL' as any
        });
      });

    // Extraer nodos
    modelData.nodeDataArray
      .filter((node: any) => !node.isGroup)
      .forEach((node: any) => {
        const nodo: NodoUML = {
          nodoId: node.key,
          nombre: node.text?.replace(/\\n/g, ' ') || 'Sin nombre',
          tipo: node.tipo || this.inferirTipoDesdeGoJS(node),
          swimlane: node.group,
          posicion: node.loc ? this.parsearPosicion(node.loc) : undefined,
          color: node.fill,
          siguientes: []
        };

        nodos.push(nodo);
      });

    // Agregar conexiones
    modelData.linkDataArray.forEach((link: any) => {
      const nodoOrigen = nodos.find(n => n.nodoId === link.from);
      if (nodoOrigen) {
        if (!nodoOrigen.siguientes) {
          nodoOrigen.siguientes = [];
        }
        nodoOrigen.siguientes.push(link.to);
        if (link.text) {
          nodoOrigen.condicion = link.text;
        }
      }
    });

    return { nodos, swimlanes };
  }

  private obtenerCategoriaGoJS(tipo: TipoNodoUML): string {
    switch (tipo) {
      case TipoNodoUML.INICIO:
      case TipoNodoUML.FIN:
        return 'Start';
      case TipoNodoUML.DECISION:
      case TipoNodoUML.MERGE:
        return 'Conditional';
      case TipoNodoUML.FORK:
      case TipoNodoUML.JOIN:
        return 'Parallel';
      default:
        return 'Activity';
    }
  }

  private inferirTipoDesdeGoJS(node: any): TipoNodoUML {
    if (node.figure === 'Circle') {
      return node.fill?.includes('green') || node.fill?.includes('#4CAF50') 
        ? TipoNodoUML.INICIO 
        : TipoNodoUML.FIN;
    }
    if (node.figure === 'Diamond') {
      return TipoNodoUML.DECISION;
    }
    if (node.figure === 'Rectangle' && node.size?.includes('10')) {
      return TipoNodoUML.FORK;
    }
    return TipoNodoUML.TAREA;
  }

  private parsearPosicion(loc: string): { x: number, y: number } {
    const [x, y] = loc.split(' ').map(Number);
    return { x, y };
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
