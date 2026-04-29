import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as go from 'gojs';
import { PoliticaService } from '../../core/services/politica.service';
import { VoiceAssistantComponent, VoiceCommand } from '../../components/voice-assistant/voice-assistant';

const LANE_COLORS = [
  { header: '#5C6BC0', body: 'rgba(92,107,192,0.07)' },
  { header: '#43A047', body: 'rgba(67,160,71,0.07)' },
  { header: '#FB8C00', body: 'rgba(251,140,0,0.07)' },
  { header: '#E53935', body: 'rgba(229,57,53,0.07)' },
  { header: '#00ACC1', body: 'rgba(0,172,193,0.07)' },
  { header: '#8E24AA', body: 'rgba(142,36,170,0.07)' },
];

const DEFAULT_MODEL = `{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    { "key": "L1", "isGroup": true, "category": "Lane", "text": "Cliente",   "headerColor": "#5C6BC0", "color": "rgba(92,107,192,0.07)",  "loc": "20 20",  "size": "220 480" },
    { "key": "L2", "isGroup": true, "category": "Lane", "text": "Sistema",   "headerColor": "#43A047", "color": "rgba(67,160,71,0.07)",   "loc": "250 20", "size": "220 480" },
    { "key": "L3", "isGroup": true, "category": "Lane", "text": "Pago",      "headerColor": "#FB8C00", "color": "rgba(251,140,0,0.07)",  "loc": "480 20", "size": "220 480" },
    { "key": 1, "text": "Inicio",           "figure": "Circle",  "size": "55 55", "fill": "#00AD5F",    "group": "L1", "loc": "130 110" },
    { "key": 2, "text": "Crear\\nSolicitud","fill": "white",                                             "group": "L1", "loc": "130 250" },
    { "key": 3, "text": "Validar\\nDatos",  "fill": "white",                                             "group": "L2", "loc": "365 190" },
    { "key": 4, "text": "\\u00bfV\\u00e1lido?", "figure": "Diamond", "fill": "lightskyblue",           "group": "L2", "loc": "365 330" },
    { "key": 5, "text": "Procesar\\nPago",  "fill": "white",                                             "group": "L3", "loc": "595 330" },
    { "key": 6, "text": "Notificar\\nError","fill": "lightyellow",                                       "group": "L2", "loc": "365 450" },
    { "key": 7, "text": "Fin",              "figure": "Circle",  "size": "55 55", "fill": "#CE0620",    "group": "L1", "loc": "130 450" }
  ],
  "linkDataArray": [
    { "from": 1, "to": 2, "fromPort": "B", "toPort": "T" },
    { "from": 2, "to": 3, "fromPort": "R", "toPort": "L" },
    { "from": 3, "to": 4, "fromPort": "B", "toPort": "T" },
    { "from": 4, "to": 5, "fromPort": "R", "toPort": "L", "text": "S\\u00ed" },
    { "from": 4, "to": 6, "fromPort": "B", "toPort": "T", "text": "No" },
    { "from": 5, "to": 7, "fromPort": "B", "toPort": "R" },
    { "from": 6, "to": 7, "fromPort": "L", "toPort": "B" }
  ]
}`;

@Component({
  selector: 'app-activity-diagram',
  standalone: true,
  imports: [CommonModule, VoiceAssistantComponent],
  templateUrl: './activity-diagram.html',
  styleUrl: './activity-diagram.css'
})
export class ActivityDiagramComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv') diagramDiv!: ElementRef;
  @ViewChild('paletteDiv') paletteDiv!: ElementRef;
  @ViewChild('savedModel') savedModelEl!: ElementRef;

  private myDiagram!: go.Diagram;
  private myPalette!: go.Palette;
  private politicaId: string | null = null;
  politicaNombre: string = 'Nueva Política';
  voiceEnabled = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private politicaService: PoliticaService
  ) {}

  ngOnInit(): void {
    // Obtener el ID de la política desde la URL
    this.route.queryParams.subscribe(params => {
      this.politicaId = params['politicaId'] || null;
      if (this.politicaId) {
        this.cargarPolitica(this.politicaId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.savedModelEl.nativeElement.value = DEFAULT_MODEL;
    this.initDiagram();
  }

  ngOnDestroy(): void {
    if (this.myDiagram) this.myDiagram.div = null;
    if (this.myPalette) this.myPalette.div = null;
  }

  private initDiagram(): void {
    this.myDiagram = new go.Diagram(this.diagramDiv.nativeElement, {
      grid: new go.Panel('Grid').add(
        new go.Shape('LineH', { stroke: 'lightgray', strokeWidth: 0.5 }),
        new go.Shape('LineH', { stroke: 'gray', strokeWidth: 0.5, interval: 10 }),
        new go.Shape('LineV', { stroke: 'lightgray', strokeWidth: 0.5 }),
        new go.Shape('LineV', { stroke: 'gray', strokeWidth: 0.5, interval: 10 })
      ),
      'draggingTool.dragsLink': true,
      'draggingTool.isGridSnapEnabled': true,
      'linkingTool.isUnconnectedLinkValid': true,
      'linkingTool.portGravity': 20,
      'relinkingTool.isUnconnectedLinkValid': true,
      'relinkingTool.portGravity': 20,
      'relinkingTool.fromHandleArchetype': new go.Shape('Diamond', {
        segmentIndex: 0, cursor: 'pointer',
        desiredSize: new go.Size(8, 8), fill: 'tomato', stroke: 'darkred'
      }),
      'relinkingTool.toHandleArchetype': new go.Shape('Diamond', {
        segmentIndex: -1, cursor: 'pointer',
        desiredSize: new go.Size(8, 8), fill: 'darkred', stroke: 'tomato'
      }),
      'linkReshapingTool.handleArchetype': new go.Shape('Diamond', {
        desiredSize: new go.Size(7, 7), fill: 'lightblue', stroke: 'deepskyblue'
      }),
      'rotatingTool.handleAngle': 270,
      'rotatingTool.handleDistance': 30,
      'rotatingTool.snapAngleMultiple': 15,
      'rotatingTool.snapAngleEpsilon': 15,
      'undoManager.isEnabled': true
    });

    // When a node is dropped onto a Lane, make it a member of that Lane
    const finishDrop = (e: go.InputEvent, grp: go.GraphObject | null) => {
      const ok = grp instanceof go.Group
        ? grp.addMembers(grp.diagram!.selection, true)
        : false;
      if (!ok) e.diagram.currentTool.doCancel();
    };

    // ── Lane (swim lane) Group template ──────────────────────────────────
    this.myDiagram.groupTemplateMap.add('Lane',
      new go.Group('Vertical', {
        locationSpot: go.Spot.TopLeft,
        selectionObjectName: 'LANE_BODY',
        resizable: true,
        resizeObjectName: 'LANE_BODY',
        computesBoundsAfterDrag: true,
        computesBoundsIncludingLinks: false,
        handlesDragDropForMembers: true,
        mouseDrop: finishDrop,
        memberValidation: (_grp: go.Group | null, part: go.Part) => part.category !== 'Lane'
      })
        .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
        .add(
          // Header bar at top
          new go.Panel('Auto', { stretch: go.Stretch.Horizontal })
            .add(
              new go.Shape({
                fill: '#5C6BC0',
                stroke: null,
                minSize: new go.Size(200, 36)
              }).bind('fill', 'headerColor'),
              new go.TextBlock({
                font: 'bold 11pt sans-serif',
                stroke: 'white',
                margin: new go.Margin(8, 16),
                textAlign: 'center',
                editable: true,
                isMultiline: false
              }).bindTwoWay('text')
            ),
          // Lane body — Placeholder fills with member nodes
          new go.Panel('Auto')
            .add(
              new go.Shape('Rectangle', {
                name: 'LANE_BODY',
                fill: 'rgba(92,107,192,0.07)',
                stroke: '#9FA8DA',
                strokeWidth: 1.5,
                minSize: new go.Size(200, 400)
              })
                .bind('fill', 'color')
                .bind('stroke', 'headerColor')
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify),
              new go.Placeholder({ padding: new go.Margin(20, 10) })
            )
        )
    );

    // ── Port helpers ──────────────────────────────────────────────────────
    const makePort = (name: string, spot: go.Spot, output: boolean, input: boolean) =>
      new go.Shape('Circle', {
        fill: null, stroke: null,
        desiredSize: new go.Size(7, 7),
        alignment: spot, alignmentFocus: spot,
        portId: name, fromSpot: spot, toSpot: spot,
        fromLinkable: output, toLinkable: input,
        cursor: 'pointer'
      });

    const showSmallPorts = (node: go.Node, show: boolean) => {
      node.ports.each(port => {
        if (port.portId !== '')
          (port as go.Shape).fill = show ? 'rgba(0,0,0,.3)' : null;
      });
    };

    // ── Node adornment templates ──────────────────────────────────────────
    const nodeSelectionAdornmentTemplate = new go.Adornment('Auto').add(
      new go.Shape({ fill: null, stroke: 'deepskyblue', strokeWidth: 1.5, strokeDashArray: [4, 2] }),
      new go.Placeholder()
    );

    const nodeResizeAdornmentTemplate = new go.Adornment('Spot', { locationSpot: go.Spot.Right }).add(
      new go.Placeholder(),
      new go.Shape({ alignment: go.Spot.TopLeft,     cursor: 'nw-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.Top,         cursor: 'n-resize',  desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.TopRight,    cursor: 'ne-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.Left,        cursor: 'w-resize',  desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.Right,       cursor: 'e-resize',  desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.BottomLeft,  cursor: 'se-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.Bottom,      cursor: 's-resize',  desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ alignment: go.Spot.BottomRight, cursor: 'sw-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' })
    );

    const nodeRotateAdornmentTemplate = new go.Adornment({ locationSpot: go.Spot.Center, locationObjectName: 'ELLIPSE' }).add(
      new go.Shape('Ellipse', { name: 'ELLIPSE', cursor: 'pointer', desiredSize: new go.Size(7, 7), fill: 'lightblue', stroke: 'deepskyblue' }),
      new go.Shape({ geometryString: 'M3.5 7 L3.5 30', isGeometryPositioned: true, stroke: 'deepskyblue', strokeWidth: 1.5, strokeDashArray: [4, 2] })
    );

    // ── Activity Node template ─────────────────────────────────────────────
    this.myDiagram.nodeTemplate = new go.Node('Spot', {
      locationSpot: go.Spot.Center,
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
      resizable: true,
      resizeObjectName: 'SHAPE',
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
      rotatable: true,
      rotateAdornmentTemplate: nodeRotateAdornmentTemplate,
      // When dropped onto another node that belongs to a lane, join that same lane
      mouseDrop: (e: go.InputEvent, node: go.GraphObject) => {
        const grp = (node as go.Node).containingGroup;
        finishDrop(e, grp);
      },
      mouseEnter: (_e, node) => showSmallPorts(node as go.Node, true),
      mouseLeave: (_e, node) => showSmallPorts(node as go.Node, false)
    })
      .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
      .bindTwoWay('angle')
      .add(
        new go.Panel('Auto', { name: 'PANEL' })
          .add(
            // The Shape's desiredSize controls the Auto panel size.
            // Text is clipped inside the shape — it never makes the node grow.
            new go.Shape('Rectangle', {
              name: 'SHAPE',
              portId: '',
              fromLinkable: true, toLinkable: true,
              cursor: 'pointer',
              fill: 'white',
              strokeWidth: 2,
              minSize: new go.Size(60, 40)
            })
              .bind('figure')
              .bind('fill')
              .bindTwoWay('desiredSize', 'size',
                (s: string) => s ? go.Size.parse(s) : new go.Size(130, 60),
                go.Size.stringify
              ),
            new go.TextBlock({
              font: 'bold 10pt Helvetica, Arial, sans-serif',
              margin: 8,
              wrap: go.Wrap.Fit,
              overflow: go.TextOverflow.Ellipsis,
              textAlign: 'center',
              verticalAlignment: go.Spot.Center,
              editable: true
            }).bindTwoWay('text')
          ),
        makePort('T', go.Spot.Top,    false, true),
        makePort('L', go.Spot.Left,   true,  true),
        makePort('R', go.Spot.Right,  true,  true),
        makePort('B', go.Spot.Bottom, true,  false)
      );

    // ── Link template ─────────────────────────────────────────────────────
    const linkSelectionAdornmentTemplate = new go.Adornment('Link').add(
      new go.Shape({ isPanelMain: true, fill: null, stroke: 'deepskyblue', strokeWidth: 0 })
    );

    this.myDiagram.linkTemplate = new go.Link({
      selectable: true,
      selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
      relinkableFrom: true, relinkableTo: true,
      reshapable: true,
      routing: go.Routing.AvoidsNodes,
      curve: go.Curve.JumpOver,
      corner: 5,
      toShortLength: 4
    })
      .bindTwoWay('points')
      .add(
        new go.Shape({ isPanelMain: true, strokeWidth: 2 }),
        new go.Shape({ toArrow: 'Standard', stroke: null }),
        new go.Panel('Auto')
          .bindObject('visible', 'isSelected')
          .add(
            new go.Shape('RoundedRectangle', { fill: '#F8F8F8', stroke: null }),
            new go.TextBlock({
              textAlign: 'center',
              font: '10pt helvetica, arial, sans-serif',
              stroke: '#919191',
              margin: 2,
              minSize: new go.Size(10, NaN),
              editable: true
            }).bindTwoWay('text')
          )
      );

    this.load();

    // ── Palette ───────────────────────────────────────────────────────────
    this.myPalette = new go.Palette(this.paletteDiv.nativeElement, {
      maxSelectionCount: 1,
      nodeTemplateMap: this.myDiagram.nodeTemplateMap,
      linkTemplate: new go.Link({
        locationSpot: go.Spot.Center,
        routing: go.Routing.AvoidsNodes,
        curve: go.Curve.JumpOver,
        corner: 5,
        toShortLength: 4
      })
        .bind('points')
        .add(
          new go.Shape({ isPanelMain: true, strokeWidth: 2 }),
          new go.Shape({ toArrow: 'Standard', stroke: null })
        ),
      model: new go.GraphLinksModel(
        [
          { text: 'Inicio',    figure: 'Circle',          size: '55 55', fill: '#00AD5F' },
          { text: 'Acción',    fill: 'white' },
          { text: 'BD',        figure: 'Database',        fill: 'lightgray' },
          { text: 'Decisión',  figure: 'Diamond',         fill: 'lightskyblue' },
          { text: 'Fin',       figure: 'Circle',          size: '55 55', fill: '#CE0620' },
          { text: 'Nota',      figure: 'RoundedRectangle',fill: 'lightyellow' }
        ],
        [
          {
            points: new go.List<go.Point>().addAll([
              new go.Point(0, 0), new go.Point(30, 0),
              new go.Point(30, 40), new go.Point(60, 40)
            ])
          }
        ]
      )
    });
  }

  addLane(): void {
    let maxRight = 20;
    this.myDiagram.nodes.each(n => {
      if (n.data.category === 'Lane' && n.actualBounds.right > maxRight)
        maxRight = n.actualBounds.right;
    });
    const laneCount = this.myDiagram.nodes.filter(n => n.data.category === 'Lane').count;
    const palette = LANE_COLORS[laneCount % LANE_COLORS.length];

    this.myDiagram.startTransaction('add lane');
    this.myDiagram.model.addNodeData({
      key: 'Lane_' + Date.now(),
      isGroup: true,
      category: 'Lane',
      text: 'Nueva Calle',
      headerColor: palette.header,
      color: palette.body,
      loc: go.Point.stringify(new go.Point(maxRight + 10, 20)),
      size: '220 480'
    });
    this.myDiagram.commitTransaction('add lane');
  }

  save(): void {
    this.saveDiagramProperties();
    const modelJson = this.myDiagram.model.toJson();
    this.savedModelEl.nativeElement.value = modelJson;
    this.myDiagram.isModified = false;

    // Si hay una política asociada, guardar en el backend
    if (this.politicaId) {
      this.guardarEnBackend(modelJson);
    } else {
      alert('Diagrama guardado localmente. Para guardar en el servidor, crea primero una política.');
    }
  }

  private cargarPolitica(id: string): void {
    this.politicaService.getPoliticaById(id).subscribe({
      next: (politica: any) => {
        this.politicaNombre = politica.nombre;
        if (politica.diagramaJson) {
          this.savedModelEl.nativeElement.value = politica.diagramaJson;
          if (this.myDiagram) {
            this.load();
          }
        }
      },
      error: (err: any) => {
        console.error('Error al cargar política:', err);
        alert('Error al cargar la política');
      }
    });
  }

  private guardarEnBackend(modelJson: string): void {
    if (!this.politicaId) return;

    this.politicaService.actualizarDiagrama(this.politicaId, modelJson).subscribe({
      next: () => {
        alert('Diagrama guardado exitosamente');
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        alert('Error al guardar el diagrama');
      }
    });
  }

  volverAPoliticas(): void {
    this.router.navigate(['/politicas']);
  }

  load(): void {
    this.myDiagram.model = go.Model.fromJson(this.savedModelEl.nativeElement.value);
    this.loadDiagramProperties();
  }

  private saveDiagramProperties(): void {
    (this.myDiagram.model.modelData as any)['position'] = go.Point.stringify(this.myDiagram.position);
  }

  private loadDiagramProperties(): void {
    const pos = (this.myDiagram.model.modelData as any)['position'];
    if (pos) this.myDiagram.initialPosition = go.Point.parse(pos);
  }

  handleVoiceCommand(command: VoiceCommand): void {
    console.log('Voice command received:', command);

    switch (command.action) {
      case 'addNode':
        this.addNodeViaVoice(command.params);
        break;
      case 'addLane':
        this.addLaneViaVoice(command.params);
        break;
      case 'save':
        this.save();
        break;
      case 'help':
        // Help is shown by the voice assistant component
        break;
      default:
        console.warn('Unknown voice command:', command.action);
    }
  }

  private addNodeViaVoice(params: any): void {
    if (!this.myDiagram) return;

    const text = params?.text || 'Nuevo Nodo';
    const figure = params?.type || 'Rectangle';
    
    // Find a lane to add the node to (use first lane or create at center)
    const lanes = this.myDiagram.nodes.filter(n => n.data.category === 'Lane');
    let group = 'L1';
    let loc = '200 200';

    if (lanes.count > 0) {
      const firstLane = lanes.first();
      if (firstLane) {
        group = firstLane.data.key;
        const bounds = firstLane.actualBounds;
        loc = `${bounds.centerX} ${bounds.centerY}`;
      }
    }

    this.myDiagram.startTransaction('add node via voice');
    this.myDiagram.model.addNodeData({
      key: Date.now(),
      text: text,
      figure: figure,
      fill: 'white',
      group: group,
      loc: loc
    });
    this.myDiagram.commitTransaction('add node via voice');

    alert(`Nodo "${text}" agregado exitosamente`);
  }

  private addLaneViaVoice(params: any): void {
    const text = params?.text || 'Nueva Calle';
    
    // Add the lane first
    this.addLane();
    
    // Update the last added lane's text
    setTimeout(() => {
      const lanes = this.myDiagram.nodes.filter(n => n.data.category === 'Lane');
      if (lanes.count > 0) {
        // Convert iterator to array to get last element
        const lanesArray: go.Node[] = [];
        lanes.each(lane => lanesArray.push(lane));
        const lastLane = lanesArray[lanesArray.length - 1];
        
        if (lastLane) {
          this.myDiagram.startTransaction('update lane name');
          this.myDiagram.model.setDataProperty(lastLane.data, 'text', text);
          this.myDiagram.commitTransaction('update lane name');
        }
      }
      alert(`Calle "${text}" agregada exitosamente`);
    }, 100);
  }
}
