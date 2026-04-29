import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PolicyTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tags: string[];
  diagramaJson: string;
  flujo: any[];
  tipoFlujo: string;
  icono: string;
}

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private templates: PolicyTemplate[] = [
    {
      id: 'template-instalacion-electrica',
      nombre: 'Instalación Eléctrica Residencial',
      descripcion: 'Proceso completo para solicitud e instalación de servicio eléctrico en viviendas',
      categoria: 'Servicios Públicos',
      tags: ['electricidad', 'instalación', 'residencial', 'CRE'],
      icono: 'electrical_services',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Solicitud Cliente', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Validación Documentos', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Inspección Técnica', tipo: 'TAREA', siguientes: ['4'] },
        { nodoId: '4', nombre: 'Aprobación', tipo: 'DECISION', siguientes: ['5', '6'] },
        { nodoId: '5', nombre: 'Instalación', tipo: 'TAREA', siguientes: ['7'] },
        { nodoId: '6', nombre: 'Rechazo', tipo: 'FIN', siguientes: [] },
        { nodoId: '7', nombre: 'Activación Servicio', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Cliente", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 600" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Técnico", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 600" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Aprobación", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 600" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Solicitar\\nInstalación", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Validar\\nDocumentos", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "Inspección\\nTécnica", "fill": "white", "group": "L2", "loc": "360 320" },
    { "key": 5, "text": "¿Aprobado?", "figure": "Diamond", "fill": "lightskyblue", "group": "L3", "loc": "590 400" },
    { "key": 6, "text": "Instalación", "fill": "white", "group": "L2", "loc": "360 480" },
    { "key": 7, "text": "Activar\\nServicio", "fill": "lightgreen", "group": "L1", "loc": "130 550" },
    { "key": 8, "text": "Rechazar", "fill": "lightyellow", "group": "L3", "loc": "590 550" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "B", "toPort": "T" },
    { "from": 4, "to": 5, "fromPort": "R", "toPort": "L" },
    { "from": 5, "to": 6, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 5, "to": 8, "fromPort": "B", "toPort": "T", "text": "No" },
    { "from": 6, "to": 7, "fromPort": "L", "toPort": "R" }
  ]
}`
    },
    {
      id: 'template-credito-bancario',
      nombre: 'Aprobación de Crédito Bancario',
      descripcion: 'Flujo de evaluación y aprobación de solicitudes de crédito personal o hipotecario',
      categoria: 'Financiero',
      tags: ['crédito', 'banco', 'préstamo', 'financiero'],
      icono: 'account_balance',
      tipoFlujo: 'CONDICIONAL',
      flujo: [
        { nodoId: '1', nombre: 'Solicitud', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Análisis Crediticio', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Evaluación Riesgo', tipo: 'DECISION', siguientes: ['4', '5'] },
        { nodoId: '4', nombre: 'Aprobación', tipo: 'TAREA', siguientes: ['6'] },
        { nodoId: '5', nombre: 'Rechazo', tipo: 'FIN', siguientes: [] },
        { nodoId: '6', nombre: 'Desembolso', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Cliente", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 500" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Análisis", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 500" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Aprobación", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 500" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Solicitar\\nCrédito", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Análisis\\nCrediticio", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "¿Aprobado?", "figure": "Diamond", "fill": "lightskyblue", "group": "L3", "loc": "590 280" },
    { "key": 5, "text": "Desembolso", "fill": "lightgreen", "group": "L2", "loc": "360 380" },
    { "key": 6, "text": "Rechazar", "fill": "lightyellow", "group": "L3", "loc": "590 420" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "R", "toPort": "L" },
    { "from": 4, "to": 5, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 4, "to": 6, "fromPort": "B", "toPort": "T", "text": "No" }
  ]
}`
    },
    {
      id: 'template-reclutamiento',
      nombre: 'Proceso de Reclutamiento',
      descripcion: 'Flujo completo de selección y contratación de personal',
      categoria: 'Recursos Humanos',
      tags: ['rrhh', 'contratación', 'reclutamiento', 'personal'],
      icono: 'person_search',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Publicar Vacante', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Recibir CVs', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Filtro Inicial', tipo: 'TAREA', siguientes: ['4'] },
        { nodoId: '4', nombre: 'Entrevista', tipo: 'TAREA', siguientes: ['5'] },
        { nodoId: '5', nombre: 'Evaluación', tipo: 'DECISION', siguientes: ['6', '7'] },
        { nodoId: '6', nombre: 'Oferta Laboral', tipo: 'TAREA', siguientes: ['8'] },
        { nodoId: '7', nombre: 'Rechazar', tipo: 'FIN', siguientes: [] },
        { nodoId: '8', nombre: 'Contratación', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "RRHH", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 650" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Candidato", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 650" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Gerencia", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 650" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Publicar\\nVacante", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Enviar CV", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "Filtro\\nInicial", "fill": "white", "group": "L1", "loc": "130 320" },
    { "key": 5, "text": "Entrevista", "fill": "white", "group": "L1", "loc": "130 420" },
    { "key": 6, "text": "¿Aprobado?", "figure": "Diamond", "fill": "lightskyblue", "group": "L3", "loc": "590 480" },
    { "key": 7, "text": "Oferta\\nLaboral", "fill": "lightgreen", "group": "L1", "loc": "130 560" },
    { "key": 8, "text": "Rechazar", "fill": "lightyellow", "group": "L3", "loc": "590 600" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "L", "toPort": "R" },
    { "from": 4, "to": 5, "fromPort": "B", "toPort": "T" },
    { "from": 5, "to": 6, "fromPort": "R", "toPort": "L" },
    { "from": 6, "to": 7, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 6, "to": 8, "fromPort": "B", "toPort": "T", "text": "No" }
  ]
}`
    },
    {
      id: 'template-compras',
      nombre: 'Proceso de Compras',
      descripcion: 'Flujo de solicitud, aprobación y compra de materiales o servicios',
      categoria: 'Operaciones',
      tags: ['compras', 'adquisiciones', 'proveedores', 'logística'],
      icono: 'shopping_cart',
      tipoFlujo: 'CONDICIONAL',
      flujo: [
        { nodoId: '1', nombre: 'Solicitud Compra', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Cotización', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Aprobación', tipo: 'DECISION', siguientes: ['4', '5'] },
        { "key": 4, nombre: 'Orden Compra', tipo: 'TAREA', siguientes: ['6'] },
        { nodoId: '5', nombre: 'Rechazar', tipo: 'FIN', siguientes: [] },
        { nodoId: '6', nombre: 'Recepción', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Solicitante", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 500" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Compras", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 500" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Aprobación", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 500" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Solicitar\\nCompra", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Cotizar", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "¿Aprobar?", "figure": "Diamond", "fill": "lightskyblue", "group": "L3", "loc": "590 280" },
    { "key": 5, "text": "Orden de\\nCompra", "fill": "white", "group": "L2", "loc": "360 380" },
    { "key": 6, "text": "Recepción", "fill": "lightgreen", "group": "L1", "loc": "130 420" },
    { "key": 7, "text": "Rechazar", "fill": "lightyellow", "group": "L3", "loc": "590 420" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "R", "toPort": "L" },
    { "from": 4, "to": 5, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 4, "to": 7, "fromPort": "B", "toPort": "T", "text": "No" },
    { "from": 5, "to": 6, "fromPort": "L", "toPort": "R" }
  ]
}`
    },
    {
      id: 'template-soporte-tecnico',
      nombre: 'Ticket de Soporte Técnico',
      descripcion: 'Gestión de tickets de soporte y resolución de incidencias',
      categoria: 'IT',
      tags: ['soporte', 'helpdesk', 'tickets', 'IT', 'incidencias'],
      icono: 'support_agent',
      tipoFlujo: 'CONDICIONAL',
      flujo: [
        { nodoId: '1', nombre: 'Crear Ticket', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Clasificar', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Asignar Técnico', tipo: 'TAREA', siguientes: ['4'] },
        { nodoId: '4', nombre: 'Resolver', tipo: 'TAREA', siguientes: ['5'] },
        { nodoId: '5', nombre: '¿Resuelto?', tipo: 'DECISION', siguientes: ['6', '7'] },
        { nodoId: '6', nombre: 'Cerrar Ticket', tipo: 'FIN', siguientes: [] },
        { nodoId: '7', nombre: 'Escalar', tipo: 'TAREA', siguientes: ['4'] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Usuario", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 550" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Soporte", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 550" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Técnico", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 550" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Crear\\nTicket", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Clasificar", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "Asignar\\nTécnico", "fill": "white", "group": "L2", "loc": "360 300" },
    { "key": 5, "text": "Resolver", "fill": "white", "group": "L3", "loc": "590 300" },
    { "key": 6, "text": "¿Resuelto?", "figure": "Diamond", "fill": "lightskyblue", "group": "L2", "loc": "360 400" },
    { "key": 7, "text": "Cerrar", "fill": "lightgreen", "group": "L1", "loc": "130 480" },
    { "key": 8, "text": "Escalar", "fill": "lightyellow", "group": "L2", "loc": "360 500" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "B", "toPort": "T" },
    { "from": 4, "to": 5, "fromPort": "R", "toPort": "L" },
    { "from": 5, "to": 6, "fromPort": "L", "toPort": "R" },
    { "from": 6, "to": 7, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 6, "to": 8, "fromPort": "B", "toPort": "T", "text": "No" },
    { "from": 8, "to": 4, "fromPort": "T", "toPort": "B" }
  ]
}`
    },
    {
      id: 'template-vacaciones',
      nombre: 'Solicitud de Vacaciones',
      descripcion: 'Proceso de solicitud y aprobación de vacaciones del personal',
      categoria: 'Recursos Humanos',
      tags: ['vacaciones', 'permisos', 'ausencias', 'rrhh'],
      icono: 'beach_access',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Solicitar', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Revisar Disponibilidad', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Aprobación Jefe', tipo: 'DECISION', siguientes: ['4', '5'] },
        { nodoId: '4', nombre: 'Aprobar', tipo: 'FIN', siguientes: [] },
        { nodoId: '5', nombre: 'Rechazar', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Empleado", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 450" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "RRHH", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 450" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Jefe", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 450" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Solicitar\\nVacaciones", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Revisar\\nDisponibilidad", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "¿Aprobar?", "figure": "Diamond", "fill": "lightskyblue", "group": "L3", "loc": "590 280" },
    { "key": 5, "text": "Aprobar", "fill": "lightgreen", "group": "L2", "loc": "360 360" },
    { "key": 6, "text": "Rechazar", "fill": "lightyellow", "group": "L3", "loc": "590 400" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "R", "toPort": "L" },
    { "from": 4, "to": 5, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 4, "to": 6, "fromPort": "B", "toPort": "T", "text": "No" }
  ]
}`
    },
    {
      id: 'template-facturacion',
      nombre: 'Proceso de Facturación',
      descripcion: 'Emisión y gestión de facturas de venta',
      categoria: 'Financiero',
      tags: ['facturación', 'ventas', 'contabilidad', 'finanzas'],
      icono: 'receipt_long',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Generar Factura', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Validar Datos', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Emitir', tipo: 'TAREA', siguientes: ['4'] },
        { nodoId: '4', nombre: 'Enviar Cliente', tipo: 'TAREA', siguientes: ['5'] },
        { nodoId: '5', nombre: 'Registrar Contabilidad', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Ventas", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 500" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Facturación", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 500" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Contabilidad", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 500" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Generar\\nFactura", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Validar\\nDatos", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "Emitir", "fill": "white", "group": "L2", "loc": "360 300" },
    { "key": 5, "text": "Enviar\\nCliente", "fill": "white", "group": "L2", "loc": "360 380" },
    { "key": 6, "text": "Registrar", "fill": "lightgreen", "group": "L3", "loc": "590 420" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "B", "toPort": "T" },
    { "from": 4, "to": 5, "fromPort": "B", "toPort": "T" },
    { "from": 5, "to": 6, "fromPort": "R", "toPort": "L" }
  ]
}`
    },
    {
      id: 'template-mantenimiento',
      nombre: 'Mantenimiento Preventivo',
      descripcion: 'Programación y ejecución de mantenimiento preventivo de equipos',
      categoria: 'Operaciones',
      tags: ['mantenimiento', 'equipos', 'preventivo', 'operaciones'],
      icono: 'build',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Programar', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Notificar', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Ejecutar Mantenimiento', tipo: 'TAREA', siguientes: ['4'] },
        { nodoId: '4', nombre: 'Verificar', tipo: 'DECISION', siguientes: ['5', '6'] },
        { nodoId: '5', nombre: 'Completar', tipo: 'FIN', siguientes: [] },
        { nodoId: '6', nombre: 'Reparar', tipo: 'TAREA', siguientes: ['4'] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Planificación", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 500" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Técnico", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 500" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Supervisor", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 500" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Programar", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Notificar", "fill": "white", "group": "L1", "loc": "130 280" },
    { "key": 4, "text": "Ejecutar\\nMantenimiento", "fill": "white", "group": "L2", "loc": "360 280" },
    { "key": 5, "text": "¿OK?", "figure": "Diamond", "fill": "lightskyblue", "group": "L3", "loc": "590 340" },
    { "key": 6, "text": "Completar", "fill": "lightgreen", "group": "L1", "loc": "130 420" },
    { "key": 7, "text": "Reparar", "fill": "lightyellow", "group": "L2", "loc": "360 440" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "B", "toPort": "T" },
    { "from": 3, "to": 4, "fromPort": "R", "toPort": "L" },
    { "from": 4, "to": 5, "fromPort": "R", "toPort": "L" },
    { "from": 5, "to": 6, "fromPort": "L", "toPort": "R", "text": "Sí" },
    { "from": 5, "to": 7, "fromPort": "B", "toPort": "T", "text": "No" },
    { "from": 7, "to": 4, "fromPort": "T", "toPort": "B" }
  ]
}`
    },
    {
      id: 'template-onboarding',
      nombre: 'Onboarding de Empleados',
      descripcion: 'Proceso de integración de nuevos empleados a la empresa',
      categoria: 'Recursos Humanos',
      tags: ['onboarding', 'inducción', 'capacitación', 'nuevos empleados'],
      icono: 'how_to_reg',
      tipoFlujo: 'LINEAL',
      flujo: [
        { nodoId: '1', nombre: 'Bienvenida', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Documentación', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: 'Capacitación', tipo: 'TAREA', siguientes: ['4'] },
        { nodoId: '4', nombre: 'Asignación Equipo', tipo: 'TAREA', siguientes: ['5'] },
        { nodoId: '5', nombre: 'Evaluación', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "RRHH", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 550" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Nuevo Empleado", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 550" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Jefe Directo", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 550" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Bienvenida", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Completar\\nDocumentos", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "Capacitación\\nInicial", "fill": "white", "group": "L1", "loc": "130 320" },
    { "key": 5, "text": "Asignar\\nEquipo", "fill": "white", "group": "L3", "loc": "590 320" },
    { "key": 6, "text": "Evaluación\\n30 días", "fill": "lightgreen", "group": "L3", "loc": "590 450" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "L", "toPort": "R" },
    { "from": 4, "to": 5, "fromPort": "R", "toPort": "L" },
    { "from": 5, "to": 6, "fromPort": "B", "toPort": "T" }
  ]
}`
    },
    {
      id: 'template-devolucion',
      nombre: 'Devolución de Productos',
      descripcion: 'Gestión de devoluciones y reembolsos de productos',
      categoria: 'Operaciones',
      tags: ['devolución', 'reembolso', 'garantía', 'servicio al cliente'],
      icono: 'assignment_return',
      tipoFlujo: 'CONDICIONAL',
      flujo: [
        { nodoId: '1', nombre: 'Solicitud Devolución', tipo: 'INICIO', siguientes: ['2'] },
        { nodoId: '2', nombre: 'Validar Garantía', tipo: 'TAREA', siguientes: ['3'] },
        { nodoId: '3', nombre: '¿Válida?', tipo: 'DECISION', siguientes: ['4', '5'] },
        { nodoId: '4', nombre: 'Procesar Reembolso', tipo: 'TAREA', siguientes: ['6'] },
        { nodoId: '5', nombre: 'Rechazar', tipo: 'FIN', siguientes: [] },
        { nodoId: '6', nombre: 'Completar', tipo: 'FIN', siguientes: [] }
      ],
      diagramaJson: `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Cliente", "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)", "loc": "20 20", "size": "220 500" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Servicio Cliente", "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)", "loc": "250 20", "size": "220 500" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Finanzas", "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)", "loc": "480 20", "size": "220 500" },
    { "key": 1, "text": "Inicio", "figure": "Circle", "size": "55 55", "fill": "#00AD5F", "group": "L1", "loc": "130 100" },
    { "key": 2, "text": "Solicitar\\nDevolución", "fill": "white", "group": "L1", "loc": "130 200" },
    { "key": 3, "text": "Validar\\nGarantía", "fill": "white", "group": "L2", "loc": "360 200" },
    { "key": 4, "text": "¿Válida?", "figure": "Diamond", "fill": "lightskyblue", "group": "L2", "loc": "360 300" },
    { "key": 5, "text": "Procesar\\nReembolso", "fill": "white", "group": "L3", "loc": "590 360" },
    { "key": 6, "text": "Completar", "fill": "lightgreen", "group": "L1", "loc": "130 420" },
    { "key": 7, "text": "Rechazar", "fill": "lightyellow", "group": "L2", "loc": "360 440" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "B", "toPort": "T" },
    { "from": 4, "to": 5, "fromPort": "R", "toPort": "L", "text": "Sí" },
    { "from": 4, "to": 7, "fromPort": "B", "toPort": "T", "text": "No" },
    { "from": 5, "to": 6, "fromPort": "L", "toPort": "R" }
  ]
}`
    }
  ];

  constructor() {}

  getAllTemplates(): Observable<PolicyTemplate[]> {
    return of(this.templates);
  }

  getTemplateById(id: string): Observable<PolicyTemplate | undefined> {
    return of(this.templates.find(t => t.id === id));
  }

  getTemplatesByCategory(categoria: string): Observable<PolicyTemplate[]> {
    return of(this.templates.filter(t => t.categoria === categoria));
  }

  searchTemplates(query: string): Observable<PolicyTemplate[]> {
    const lowerQuery = query.toLowerCase();
    return of(
      this.templates.filter(t =>
        t.nombre.toLowerCase().includes(lowerQuery) ||
        t.descripcion.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        t.categoria.toLowerCase().includes(lowerQuery)
      )
    );
  }

  getCategories(): string[] {
    return [...new Set(this.templates.map(t => t.categoria))];
  }
}
