// Tipos de nodos UML 2.5 Activity Diagram
export enum TipoNodoUML {
  // Nodos básicos
  INICIO = 'INICIO',
  FIN = 'FIN',
  TAREA = 'TAREA',
  
  // Nodos de control
  DECISION = 'DECISION',
  MERGE = 'MERGE',
  FORK = 'FORK',
  JOIN = 'JOIN',
  
  // Nodos de objeto y señal
  OBJETO = 'OBJETO',
  SEÑAL_ENVIO = 'SEÑAL_ENVIO',
  SEÑAL_RECEPCION = 'SEÑAL_RECEPCION',
  EVENTO_TIEMPO = 'EVENTO_TIEMPO',
  
  // Nodos de actividad estructurada
  REGION_EXPANSION = 'REGION_EXPANSION',
  ACTIVIDAD_LLAMADA = 'ACTIVIDAD_LLAMADA',
  
  // Nodos de excepción
  EVENTO_ACEPTACION = 'EVENTO_ACEPTACION',
  INTERRUPCION = 'INTERRUPCION'
}

export enum TipoExpansion {
  ITERATIVA = 'ITERATIVA',
  PARALELA = 'PARALELA',
  STREAM = 'STREAM'
}

export enum OrientacionSwimlane {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

export interface PosicionNodo {
  x: number;
  y: number;
  ancho?: number;
  alto?: number;
}

export interface Swimlane {
  id: string;
  nombre: string;
  departamentoId?: string;
  color: string;
  orden: number;
  orientacion: OrientacionSwimlane;
}

export interface NodoUML {
  nodoId: string;
  nombre: string;
  descripcion?: string;
  departamentoId?: string;
  responsableId?: string;
  tipo: TipoNodoUML;
  siguientes?: string[];
  condicion?: string;
  ordenEjecucion?: number;
  camposFormulario?: string[];
  
  // Propiedades UML 2.5
  swimlane?: string;
  objetoEstado?: string;
  señalTipo?: string;
  tiempoEspera?: string;
  esInterrumpible?: boolean;
  actividadLlamada?: string;
  tipoExpansion?: TipoExpansion;
  
  // Propiedades visuales
  posicion?: PosicionNodo;
  color?: string;
  icono?: string;
}

// Configuración visual para cada tipo de nodo UML 2.5
export interface ConfiguracionVisualNodo {
  figura: string;        // Forma GoJS
  color: string;         // Color de fondo
  colorBorde: string;    // Color del borde
  ancho: number;
  alto: number;
  icono?: string;        // Material icon
  etiqueta: string;      // Nombre para mostrar en la paleta
  descripcion: string;   // Descripción del nodo
}

// Mapeo de tipos de nodo a configuración visual
export const CONFIGURACION_NODOS_UML: Record<TipoNodoUML, ConfiguracionVisualNodo> = {
  [TipoNodoUML.INICIO]: {
    figura: 'Circle',
    color: '#4CAF50',
    colorBorde: '#2E7D32',
    ancho: 50,
    alto: 50,
    icono: 'play_circle',
    etiqueta: 'Inicio',
    descripcion: 'Nodo inicial del flujo'
  },
  [TipoNodoUML.FIN]: {
    figura: 'Circle',
    color: '#F44336',
    colorBorde: '#C62828',
    ancho: 50,
    alto: 50,
    icono: 'stop_circle',
    etiqueta: 'Fin',
    descripcion: 'Nodo final del flujo'
  },
  [TipoNodoUML.TAREA]: {
    figura: 'RoundedRectangle',
    color: '#FFFFFF',
    colorBorde: '#1e3a8a',
    ancho: 120,
    alto: 60,
    icono: 'task',
    etiqueta: 'Actividad',
    descripcion: 'Actividad o tarea a realizar'
  },
  [TipoNodoUML.DECISION]: {
    figura: 'Diamond',
    color: '#FFF9C4',
    colorBorde: '#F57F17',
    ancho: 80,
    alto: 80,
    icono: 'call_split',
    etiqueta: 'Decisión',
    descripcion: 'Punto de decisión condicional'
  },
  [TipoNodoUML.MERGE]: {
    figura: 'Diamond',
    color: '#E1F5FE',
    colorBorde: '#0277BD',
    ancho: 80,
    alto: 80,
    icono: 'call_merge',
    etiqueta: 'Merge',
    descripcion: 'Unión de flujos alternativos'
  },
  [TipoNodoUML.FORK]: {
    figura: 'Rectangle',
    color: '#000000',
    colorBorde: '#000000',
    ancho: 150,
    alto: 10,
    icono: 'fork_right',
    etiqueta: 'Fork',
    descripcion: 'Inicio de ejecución paralela'
  },
  [TipoNodoUML.JOIN]: {
    figura: 'Rectangle',
    color: '#000000',
    colorBorde: '#000000',
    ancho: 150,
    alto: 10,
    icono: 'fork_left',
    etiqueta: 'Join',
    descripcion: 'Sincronización de flujos paralelos'
  },
  [TipoNodoUML.OBJETO]: {
    figura: 'Rectangle',
    color: '#F3E5F5',
    colorBorde: '#7B1FA2',
    ancho: 100,
    alto: 60,
    icono: 'inventory_2',
    etiqueta: 'Objeto',
    descripcion: 'Objeto o dato del sistema'
  },
  [TipoNodoUML.SEÑAL_ENVIO]: {
    figura: 'Pentagon',
    color: '#E8F5E9',
    colorBorde: '#2E7D32',
    ancho: 80,
    alto: 60,
    icono: 'send',
    etiqueta: 'Enviar Señal',
    descripcion: 'Envío de señal o mensaje'
  },
  [TipoNodoUML.SEÑAL_RECEPCION]: {
    figura: 'Pentagon',
    color: '#FFF3E0',
    colorBorde: '#E65100',
    ancho: 80,
    alto: 60,
    icono: 'inbox',
    etiqueta: 'Recibir Señal',
    descripcion: 'Recepción de señal o mensaje'
  },
  [TipoNodoUML.EVENTO_TIEMPO]: {
    figura: 'Circle',
    color: '#FCE4EC',
    colorBorde: '#C2185B',
    ancho: 60,
    alto: 60,
    icono: 'schedule',
    etiqueta: 'Evento Tiempo',
    descripcion: 'Evento basado en tiempo'
  },
  [TipoNodoUML.REGION_EXPANSION]: {
    figura: 'RoundedRectangle',
    color: '#E0F2F1',
    colorBorde: '#00695C',
    ancho: 140,
    alto: 80,
    icono: 'repeat',
    etiqueta: 'Región Expansión',
    descripcion: 'Región de expansión iterativa/paralela'
  },
  [TipoNodoUML.ACTIVIDAD_LLAMADA]: {
    figura: 'RoundedRectangle',
    color: '#E8EAF6',
    colorBorde: '#3F51B5',
    ancho: 120,
    alto: 60,
    icono: 'call_made',
    etiqueta: 'Llamar Actividad',
    descripcion: 'Llamada a otra actividad'
  },
  [TipoNodoUML.EVENTO_ACEPTACION]: {
    figura: 'Pentagon',
    color: '#FFF8E1',
    colorBorde: '#F57F17',
    ancho: 80,
    alto: 60,
    icono: 'event',
    etiqueta: 'Aceptar Evento',
    descripcion: 'Aceptación de evento'
  },
  [TipoNodoUML.INTERRUPCION]: {
    figura: 'RoundedRectangle',
    color: '#FFEBEE',
    colorBorde: '#D32F2F',
    ancho: 120,
    alto: 60,
    icono: 'cancel',
    etiqueta: 'Interrupción',
    descripcion: 'Región interrumpible'
  }
};
