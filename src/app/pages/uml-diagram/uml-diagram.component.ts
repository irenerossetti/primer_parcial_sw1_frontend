import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as go from 'gojs';
import { PoliticaService } from '../../core/services/politica.service';
import { UMLPaletteComponent } from '../../components/uml-palette/uml-palette.component';
import { UMLConverterService } from '../../core/services/uml-converter.service';
import { TipoNodoUML, CONFIGURACION_NODOS_UML, NodoUML } from '../../core/models/uml-types';

@Component({
  selector: 'app-uml-diagram',
  standalone: true,
  imports: [CommonModule, FormsModule, UMLPaletteComponent],
  templateUrl: './uml-diagram.component.html',
  styleUrls: ['./uml-diagram.component.css']
})
export class UMLDiagramComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef;

  diagram!: go.Diagram;
  politicaId: string = '';
  politica: any = null;
  nodoSeleccionado: NodoUML | null = null;
  mostrandoAyuda = false;
  puedeDeshacer = false;
  puedeRehacer = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private politicaService: PoliticaService,
    private umlConverter: UMLConverterService
  ) {}

  ngOnInit(): void {
    this.politicaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.politicaId) {
      this.cargarPolitica();
    }
  }

  ngAfterViewInit(): void {
    this.inicializarDiagrama();
  }

  ngOnDestroy(): void {
    if (this.diagram) {
      this.diagram.div = null;
    }
  }

  inicializarDiagrama(): void {
    const $ = go.GraphObject.make;
    
    this.diagram = $(go.Diagram, this.diagramDiv.nativeElement, {
      'undoManager.isEnabled': true,
      layout: $(go.LayeredDigraphLayout, {
        direction: 90,
        layerSpacing: 50,
        columnSpacing: 30
      }),
      grid: $(go.Panel, 'Grid',
        $(go.Shape, 'LineH', { stroke: 'rgba(30, 58, 138, 0.08)', strokeWidth: 1 }),
        $(go.Shape, 'LineV', { stroke: 'rgba(30, 58, 138, 0.08)', strokeWidth: 1 })
      ),
      allowDrop: true,
      'toolManager.hoverDelay': 100
    });

    // Template para Swimlanes (Carriles) - Diseño mejorado con gradientes
    this.diagram.groupTemplate =
      $(go.Group, 'Vertical',
        {
          selectionObjectName: 'PANEL',
          ungroupable: true,
          layout: $(go.LayeredDigraphLayout, {
            direction: 90,
            columnSpacing: 20,
            layerSpacing: 20
          })
        },
        $(go.Panel, 'Auto',
          { name: 'PANEL' },
          $(go.Shape, 'Rectangle',
            {
              fill: 'rgba(100, 149, 237, 0.08)',
              stroke: '#6495ED',
              strokeWidth: 3,
              strokeDashArray: null,
              parameter1: 8
            },
            new go.Binding('fill', 'color'),
            new go.Binding('stroke', 'headerColor')
          ),
          $(go.Panel, 'Vertical',
            $(go.Panel, go.Panel.Horizontal,
              {
                stretch: go.Stretch.Horizontal,
                background: '#6495ED',
                height: 45
              },
              new go.Binding('background', 'headerColor'),
              $(go.TextBlock,
                {
                  font: 'bold 16px "Segoe UI", sans-serif',
                  stroke: 'white',
                  margin: 14,
                  alignment: go.Spot.Center
                },
                new go.Binding('text', 'text')
              )
            ),
            $(go.Placeholder, { padding: 30, alignment: go.Spot.TopLeft })
          )
        )
      );

    // Template para nodo INICIO (círculo verde con sombra y efecto)
    this.diagram.nodeTemplateMap.add('Start',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Circle',
          {
            width: 70,
            height: 70,
            fill: $(go.Brush, 'Linear', { 0: '#66BB6A', 1: '#4CAF50' }),
            stroke: '#2E7D32',
            strokeWidth: 4,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            shadowVisible: true,
            shadowColor: 'rgba(46, 125, 50, 0.4)',
            shadowBlur: 12,
            shadowOffset: new go.Point(0, 4)
          }
        ),
        $(go.Shape, 'Circle',
          {
            width: 20,
            height: 20,
            fill: 'white',
            stroke: null,
            alignment: go.Spot.Center
          }
        ),
        $(go.TextBlock, 'Inicio',
          {
            font: 'bold 13px "Segoe UI", sans-serif',
            stroke: 'white',
            margin: 0,
            alignment: new go.Spot(0.5, 1.4)
          },
          new go.Binding('text', 'text')
        )
      )
    );

    // Template para nodo FIN (círculo rojo con doble borde y sombra)
    this.diagram.nodeTemplateMap.add('End',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Circle',
          {
            width: 70,
            height: 70,
            fill: $(go.Brush, 'Linear', { 0: '#EF5350', 1: '#F44336' }),
            stroke: '#C62828',
            strokeWidth: 4,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            shadowVisible: true,
            shadowColor: 'rgba(198, 40, 40, 0.4)',
            shadowBlur: 12,
            shadowOffset: new go.Point(0, 4)
          }
        ),
        $(go.Shape, 'Circle',
          {
            width: 50,
            height: 50,
            fill: null,
            stroke: 'white',
            strokeWidth: 3,
            alignment: go.Spot.Center
          }
        ),
        $(go.TextBlock, 'Fin',
          {
            font: 'bold 13px "Segoe UI", sans-serif',
            stroke: 'white',
            margin: 0,
            alignment: new go.Spot(0.5, 1.4)
          },
          new go.Binding('text', 'text')
        )
      )
    );

    // Template para ACTIVIDAD/ACCIÓN (rectángulo redondeado con sombra)
    this.diagram.nodeTemplateMap.add('Activity',
      $(go.Node, 'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'RoundedRectangle',
          {
            fill: $(go.Brush, 'Linear', { 0: '#ffffff', 0.5: '#f8f9fa', 1: '#ffffff' }),
            stroke: '#1e3a8a',
            strokeWidth: 3,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            minSize: new go.Size(140, 70),
            parameter1: 12,
            shadowVisible: true,
            shadowColor: 'rgba(30, 58, 138, 0.25)',
            shadowBlur: 10,
            shadowOffset: new go.Point(0, 3)
          },
          new go.Binding('fill', 'fill')
        ),
        $(go.TextBlock,
          {
            margin: 16,
            font: '14px "Segoe UI", sans-serif',
            editable: true,
            textAlign: 'center',
            maxSize: new go.Size(160, NaN),
            wrap: go.Wrap.Fit,
            stroke: '#1e3a8a'
          },
          new go.Binding('text', 'text').makeTwoWay()
        )
      )
    );

    // Template para DECISIÓN (diamante con gradiente)
    this.diagram.nodeTemplateMap.add('Decision',
      $(go.Node, 'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Diamond',
          {
            width: 100,
            height: 100,
            fill: $(go.Brush, 'Linear', { 0: '#FFF9C4', 1: '#FFF59D' }),
            stroke: '#F57F17',
            strokeWidth: 3.5,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            shadowVisible: true,
            shadowColor: 'rgba(245, 127, 23, 0.3)',
            shadowBlur: 10,
            shadowOffset: new go.Point(0, 3)
          }
        ),
        $(go.TextBlock,
          {
            margin: 12,
            font: 'bold 13px "Segoe UI", sans-serif',
            editable: true,
            textAlign: 'center',
            maxSize: new go.Size(75, NaN),
            wrap: go.Wrap.Fit,
            stroke: '#F57F17'
          },
          new go.Binding('text', 'text').makeTwoWay()
        )
      )
    );

    // Template para NOTA (rectángulo con esquina doblada y sombra)
    this.diagram.nodeTemplateMap.add('Note',
      $(go.Node, 'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'File',
          {
            fill: $(go.Brush, 'Linear', { 0: '#FFFDE7', 1: '#FFF9C4' }),
            stroke: '#FBC02D',
            strokeWidth: 2.5,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            minSize: new go.Size(120, 80),
            shadowVisible: true,
            shadowColor: 'rgba(251, 192, 45, 0.3)',
            shadowBlur: 8,
            shadowOffset: new go.Point(0, 2)
          }
        ),
        $(go.TextBlock,
          {
            margin: 14,
            font: '12px "Segoe UI", sans-serif',
            editable: true,
            textAlign: 'left',
            maxSize: new go.Size(120, NaN),
            wrap: go.Wrap.Fit,
            stroke: '#F57F17'
          },
          new go.Binding('text', 'text').makeTwoWay()
        )
      )
    );

    // Template para FORK (barra negra horizontal - inicio de paralelismo)
    this.diagram.nodeTemplateMap.add('Fork',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Rectangle',
          {
            width: 250,
            height: 18,
            fill: '#000000',
            stroke: '#333333',
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            shadowVisible: true,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 12,
            shadowOffset: new go.Point(0, 3)
          }
        ),
        $(go.TextBlock, 'FORK',
          {
            font: 'bold 10px "Segoe UI", sans-serif',
            stroke: 'white',
            alignment: go.Spot.Center
          }
        )
      )
    );

    // Template para JOIN (barra negra horizontal - fin de paralelismo)
    this.diagram.nodeTemplateMap.add('Join',
      $(go.Node, 'Spot',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Rectangle',
          {
            width: 250,
            height: 18,
            fill: '#000000',
            stroke: '#333333',
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            shadowVisible: true,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 12,
            shadowOffset: new go.Point(0, 3)
          }
        ),
        $(go.TextBlock, 'JOIN',
          {
            font: 'bold 10px "Segoe UI", sans-serif',
            stroke: 'white',
            alignment: go.Spot.Center
          }
        )
      )
    );

    // Template por defecto
    this.diagram.nodeTemplate =
      $(go.Node, 'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'RoundedRectangle',
          {
            fill: 'white',
            stroke: '#666',
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer'
          }
        ),
        $(go.TextBlock,
          {
            margin: 10,
            font: '12px sans-serif',
            editable: true
          },
          new go.Binding('text', 'text').makeTwoWay()
        )
      );

    // Template para LINKS (flechas/conexiones con figuras UML 2.5)
    this.diagram.linkTemplate =
      $(go.Link,
        {
          routing: go.Routing.AvoidsNodes,
          corner: 10,
          toShortLength: 6,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          curve: go.Curve.JumpOver
        },
        $(go.Shape,
          {
            strokeWidth: 3,
            stroke: '#1e3a8a',
            strokeDashArray: null
          }
        ),
        $(go.Shape,
          {
            toArrow: 'Triangle',
            stroke: '#1e3a8a',
            fill: '#1e3a8a',
            scale: 2.2,
            strokeWidth: 2
          }
        ),
        $(go.Panel, 'Auto',
          {
            visible: true
          },
          new go.Binding('visible', 'text', (t) => t !== undefined && t !== ''),
          $(go.Shape, 'RoundedRectangle',
            {
              fill: 'white',
              stroke: '#1e3a8a',
              strokeWidth: 1.5,
              parameter1: 6
            }
          ),
          $(go.TextBlock,
            {
              segmentOffset: new go.Point(0, -10),
              segmentOrientation: go.Orientation.Upright,
              font: 'bold 12px "Segoe UI", sans-serif',
              editable: true,
              margin: new go.Margin(5, 8, 5, 8),
              stroke: '#1e3a8a'
            },
            new go.Binding('text', 'text').makeTwoWay()
          )
        )
      );

    // Template para CONTROL FLOW (flujo de control - flecha sólida)
    this.diagram.linkTemplateMap.add('ControlFlow',
      $(go.Link,
        {
          routing: go.Routing.AvoidsNodes,
          corner: 10,
          toShortLength: 6,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          curve: go.Curve.JumpOver
        },
        $(go.Shape,
          {
            strokeWidth: 3,
            stroke: '#1e3a8a',
            strokeDashArray: null
          }
        ),
        $(go.Shape,
          {
            toArrow: 'Triangle',
            stroke: '#1e3a8a',
            fill: '#1e3a8a',
            scale: 2.2,
            strokeWidth: 2
          }
        ),
        $(go.Panel, 'Auto',
          {
            visible: true
          },
          new go.Binding('visible', 'text', (t) => t !== undefined && t !== ''),
          $(go.Shape, 'RoundedRectangle',
            {
              fill: 'white',
              stroke: '#1e3a8a',
              strokeWidth: 1.5,
              parameter1: 6
            }
          ),
          $(go.TextBlock,
            {
              segmentOffset: new go.Point(0, -10),
              segmentOrientation: go.Orientation.Upright,
              font: 'bold 12px "Segoe UI", sans-serif',
              editable: true,
              margin: new go.Margin(5, 8, 5, 8),
              stroke: '#1e3a8a'
            },
            new go.Binding('text', 'text').makeTwoWay()
          )
        )
      )
    );

    // Template para OBJECT FLOW (flujo de objetos - flecha abierta)
    this.diagram.linkTemplateMap.add('ObjectFlow',
      $(go.Link,
        {
          routing: go.Routing.AvoidsNodes,
          corner: 10,
          toShortLength: 6,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          curve: go.Curve.JumpOver
        },
        $(go.Shape,
          {
            strokeWidth: 3,
            stroke: '#7c3aed',
            strokeDashArray: null
          }
        ),
        $(go.Shape,
          {
            toArrow: 'OpenTriangle',
            stroke: '#7c3aed',
            fill: null,
            scale: 2.5,
            strokeWidth: 3
          }
        ),
        $(go.Panel, 'Auto',
          {
            visible: true
          },
          new go.Binding('visible', 'text', (t) => t !== undefined && t !== ''),
          $(go.Shape, 'RoundedRectangle',
            {
              fill: 'white',
              stroke: '#7c3aed',
              strokeWidth: 1.5,
              parameter1: 6
            }
          ),
          $(go.TextBlock,
            {
              segmentOffset: new go.Point(0, -10),
              segmentOrientation: go.Orientation.Upright,
              font: 'bold 12px "Segoe UI", sans-serif',
              editable: true,
              margin: new go.Margin(5, 8, 5, 8),
              stroke: '#7c3aed'
            },
            new go.Binding('text', 'text').makeTwoWay()
          )
        )
      )
    );

    // Template para DEPENDENCY (dependencia - flecha punteada)
    this.diagram.linkTemplateMap.add('Dependency',
      $(go.Link,
        {
          routing: go.Routing.AvoidsNodes,
          corner: 10,
          toShortLength: 6,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          curve: go.Curve.JumpOver
        },
        $(go.Shape,
          {
            strokeWidth: 2.5,
            stroke: '#f59e0b',
            strokeDashArray: [8, 4]
          }
        ),
        $(go.Shape,
          {
            toArrow: 'OpenTriangle',
            stroke: '#f59e0b',
            fill: null,
            scale: 2.2,
            strokeWidth: 2.5
          }
        ),
        $(go.Panel, 'Auto',
          {
            visible: true
          },
          new go.Binding('visible', 'text', (t) => t !== undefined && t !== ''),
          $(go.Shape, 'RoundedRectangle',
            {
              fill: 'white',
              stroke: '#f59e0b',
              strokeWidth: 1.5,
              parameter1: 6
            }
          ),
          $(go.TextBlock,
            {
              segmentOffset: new go.Point(0, -10),
              segmentOrientation: go.Orientation.Upright,
              font: 'bold 11px "Segoe UI", sans-serif',
              editable: true,
              margin: new go.Margin(4, 7, 4, 7),
              stroke: '#f59e0b'
            },
            new go.Binding('text', 'text').makeTwoWay()
          )
        )
      )
    );

    // Eventos
    this.diagram.addDiagramListener('Modified', () => {
      this.puedeDeshacer = this.diagram.commandHandler.canUndo();
      this.puedeRehacer = this.diagram.commandHandler.canRedo();
    });

    this.diagram.addDiagramListener('ObjectSingleClicked', (e: go.DiagramEvent) => {
      const part = e.subject.part;
      if (part instanceof go.Node) {
        const data = part.data;
        if (!data.isGroup) {
          this.nodoSeleccionado = {
            nodoId: data.key,
            nombre: data.text,
            tipo: data.tipo || TipoNodoUML.TAREA,
            descripcion: data.descripcion
          };
        }
      }
    });

    // Crear diagrama de ejemplo
    this.crearDiagramaEjemplo();
  }

  cargarPolitica(): void {
    this.politicaService.getPoliticaById(this.politicaId).subscribe({
      next: (politica) => {
        this.politica = politica;
      },
      error: (err) => console.error('Error:', err)
    });
  }

  onNodoSeleccionado(tipo: TipoNodoUML): void {
    const config = CONFIGURACION_NODOS_UML[tipo];
    
    let category = 'Activity';
    if (tipo === TipoNodoUML.INICIO) category = 'Start';
    else if (tipo === TipoNodoUML.FIN) category = 'End';
    else if (tipo === TipoNodoUML.DECISION || tipo === TipoNodoUML.MERGE) category = 'Decision';
    else if (tipo === TipoNodoUML.FORK) category = 'Fork';
    else if (tipo === TipoNodoUML.JOIN) category = 'Join';
    
    const nuevoNodo = {
      key: `nodo_${Date.now()}`,
      text: config.etiqueta,
      tipo: tipo,
      category: category,
      loc: '100 100'
    };
    
    this.diagram.model.addNodeData(nuevoNodo);
  }

  crearDiagramaEjemplo(): void {
    // Crear swimlanes de ejemplo con colores vibrantes
    const swimlanes = [
      {
        key: 'lane_cliente',
        isGroup: true,
        text: '👤 Cliente',
        headerColor: '#5C6BC0',
        color: 'rgba(92, 107, 192, 0.08)',
        loc: '50 50'
      },
      {
        key: 'lane_sistema',
        isGroup: true,
        text: '⚙️ Sistema',
        headerColor: '#66BB6A',
        color: 'rgba(102, 187, 106, 0.08)',
        loc: '320 50'
      },
      {
        key: 'lane_pago',
        isGroup: true,
        text: '💳 Pago',
        headerColor: '#FFA726',
        color: 'rgba(255, 167, 38, 0.08)',
        loc: '590 50'
      }
    ];

    // Crear nodos de ejemplo con flujo paralelo
    const nodos = [
      { key: 'inicio', text: 'Inicio', category: 'Start', group: 'lane_cliente', loc: '120 130' },
      { key: 'solicitud', text: 'Crear\nSolicitud', category: 'Activity', group: 'lane_cliente', loc: '120 240' },
      { key: 'fork1', text: 'FORK', category: 'Fork', group: 'lane_sistema', loc: '390 240' },
      { key: 'validar', text: 'Validar\nDatos', category: 'Activity', group: 'lane_sistema', loc: '390 340' },
      { key: 'verificar', text: 'Verificar\nIdentidad', category: 'Activity', group: 'lane_sistema', loc: '390 450' },
      { key: 'join1', text: 'JOIN', category: 'Join', group: 'lane_sistema', loc: '390 560' },
      { key: 'decision', text: '¿Válido?', category: 'Decision', group: 'lane_sistema', loc: '390 670' },
      { key: 'procesar', text: 'Procesar\nPago', category: 'Activity', group: 'lane_pago', loc: '660 670' },
      { key: 'notificar', text: 'Notificar\nError', category: 'Activity', group: 'lane_sistema', loc: '390 800' },
      { key: 'fin', text: 'Fin', category: 'End', group: 'lane_cliente', loc: '120 800' }
    ];

    // Crear conexiones con flujo paralelo
    const links = [
      { from: 'inicio', to: 'solicitud' },
      { from: 'solicitud', to: 'fork1' },
      { from: 'fork1', to: 'validar' },
      { from: 'fork1', to: 'verificar' },
      { from: 'validar', to: 'join1' },
      { from: 'verificar', to: 'join1' },
      { from: 'join1', to: 'decision' },
      { from: 'decision', to: 'procesar', text: 'Sí' },
      { from: 'decision', to: 'notificar', text: 'No' },
      { from: 'procesar', to: 'fin' },
      { from: 'notificar', to: 'fin' }
    ];

    this.diagram.model = new go.GraphLinksModel(
      [...swimlanes, ...nodos],
      links
    );
  }

  agregarSwimlane(): void {
    const colores = [
      { header: '#5C6BC0', bg: 'rgba(92, 107, 192, 0.08)' },
      { header: '#66BB6A', bg: 'rgba(102, 187, 106, 0.08)' },
      { header: '#FFA726', bg: 'rgba(255, 167, 38, 0.08)' },
      { header: '#EF5350', bg: 'rgba(239, 83, 80, 0.08)' },
      { header: '#AB47BC', bg: 'rgba(171, 71, 188, 0.08)' },
      { header: '#26C6DA', bg: 'rgba(38, 198, 218, 0.08)' }
    ];
    
    const model = this.diagram.model as go.GraphLinksModel;
    const colorIndex = model.nodeDataArray.filter((n: any) => n.isGroup).length % colores.length;
    const color = colores[colorIndex];
    
    const nuevoSwimlane = {
      key: `lane_${Date.now()}`,
      isGroup: true,
      text: 'Nuevo Departamento',
      headerColor: color.header,
      color: color.bg,
      loc: `${50 + (colorIndex * 250)} 50`
    };

    model.addNodeData(nuevoSwimlane);
  }

  validarDiagrama(): void {
    const errores: string[] = [];
    const model = this.diagram.model as go.GraphLinksModel;
    const nodos = model.nodeDataArray.filter((n: any) => !n.isGroup);
    
    // Validar nodo de inicio
    const tieneInicio = nodos.some((n: any) => n.category === 'Start');
    if (!tieneInicio) {
      errores.push('• El diagrama debe tener un nodo de inicio (círculo verde)');
    }

    // Validar nodo de fin
    const tieneFin = nodos.some((n: any) => n.category === 'End');
    if (!tieneFin) {
      errores.push('• El diagrama debe tener al menos un nodo de fin (círculo rojo)');
    }

    // Validar que todos los nodos tengan nombre
    const nodosSinNombre = nodos.filter((n: any) => !n.text || n.text.trim() === '');
    if (nodosSinNombre.length > 0) {
      errores.push(`• Hay ${nodosSinNombre.length} nodo(s) sin nombre`);
    }

    if (errores.length > 0) {
      alert('⚠️ Errores de validación UML 2.5:\n\n' + errores.join('\n'));
    } else {
      alert('✅ El diagrama es válido según UML 2.5\n\n' +
            `• ${nodos.length} nodos\n` +
            `• ${model.linkDataArray.length} conexiones\n` +
            `• ${model.nodeDataArray.filter((n: any) => n.isGroup).length} swimlanes`);
    }
  }

  guardar(): void {
    const modelData = this.diagram.model.toJson();
    const { nodos, swimlanes } = this.umlConverter.convertirGoJSANodos(JSON.parse(modelData));

    if (this.politica) {
      const politicaActualizada = {
        ...this.politica,
        nodos,
        swimlanes
      };

      this.politicaService.actualizarPolitica(this.politicaId, politicaActualizada).subscribe({
        next: () => {
          alert('✅ Diagrama UML guardado correctamente');
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('❌ Error al guardar el diagrama');
        }
      });
    } else {
      alert('⚠️ No hay política cargada para guardar');
    }
  }

  zoomIn(): void {
    this.diagram.commandHandler.increaseZoom();
  }

  zoomOut(): void {
    this.diagram.commandHandler.decreaseZoom();
  }

  zoomFit(): void {
    this.diagram.commandHandler.zoomToFit();
  }

  deshacer(): void {
    this.diagram.commandHandler.undo();
  }

  rehacer(): void {
    this.diagram.commandHandler.redo();
  }

  cerrarPropiedades(): void {
    this.nodoSeleccionado = null;
  }

  mostrarAyudaUML(): void {
    this.mostrandoAyuda = true;
  }

  cerrarAyuda(): void {
    this.mostrandoAyuda = false;
  }

  volver(): void {
    this.router.navigate(['/politicas']);
  }
}
