import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoNodoUML, CONFIGURACION_NODOS_UML, ConfiguracionVisualNodo } from '../../core/models/uml-types';

interface CategoriaUML {
  nombre: string;
  icono: string;
  nodos: { tipo: TipoNodoUML; config: ConfiguracionVisualNodo }[];
  expandida: boolean;
}

@Component({
  selector: 'app-uml-palette',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="uml-palette">
      <div class="palette-header">
        <h3>Elementos UML 2.5</h3>
        <button class="btn-collapse-all" (click)="colapsarTodo()">
          <span class="material-icons">unfold_less</span>
        </button>
      </div>

      <div class="categorias">
        <div *ngFor="let categoria of categorias" class="categoria">
          <div class="categoria-header" (click)="toggleCategoria(categoria)">
            <span class="material-icons">{{ categoria.icono }}</span>
            <span class="categoria-nombre">{{ categoria.nombre }}</span>
            <span class="material-icons expand-icon">
              {{ categoria.expandida ? 'expand_less' : 'expand_more' }}
            </span>
          </div>

          <div class="nodos-lista" *ngIf="categoria.expandida">
            <div 
              *ngFor="let nodo of categoria.nodos" 
              class="nodo-item"
              [style.border-left-color]="nodo.config.colorBorde"
              (click)="seleccionarNodo(nodo.tipo)"
              [title]="nodo.config.descripcion">
              <span class="material-icons nodo-icono" [style.color]="nodo.config.colorBorde">
                {{ nodo.config.icono }}
              </span>
              <div class="nodo-info">
                <div class="nodo-nombre">{{ nodo.config.etiqueta }}</div>
                <div class="nodo-desc">{{ nodo.config.descripcion }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="palette-footer">
        <button class="btn-ayuda" (click)="mostrarAyuda()">
          <span class="material-icons">help_outline</span>
          Guía UML 2.5
        </button>
      </div>
    </div>
  `,
  styles: [`
    .uml-palette {
      width: 280px;
      height: 100%;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .palette-header {
      padding: 16px;
      border-bottom: 2px solid #1e3a8a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    }

    .palette-header h3 {
      margin: 0;
      font-size: 1rem;
      color: white;
      font-weight: 600;
    }

    .btn-collapse-all {
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
    }

    .btn-collapse-all:hover {
      background: rgba(255,255,255,0.3);
    }

    .categorias {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .categoria {
      margin-bottom: 4px;
    }

    .categoria-header {
      padding: 12px 16px;
      background: #f5f5f5;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
      user-select: none;
    }

    .categoria-header:hover {
      background: #eeeeee;
    }

    .categoria-header .material-icons {
      font-size: 20px;
      color: #1e3a8a;
    }

    .categoria-nombre {
      flex: 1;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .expand-icon {
      color: #666 !important;
    }

    .nodos-lista {
      background: white;
      padding: 4px 0;
    }

    .nodo-item {
      padding: 10px 16px 10px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      border-left: 3px solid transparent;
      transition: all 0.2s;
    }

    .nodo-item:hover {
      background: #f8f9fa;
      border-left-width: 4px;
    }

    .nodo-icono {
      font-size: 24px;
    }

    .nodo-info {
      flex: 1;
      min-width: 0;
    }

    .nodo-nombre {
      font-size: 0.85rem;
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .nodo-desc {
      font-size: 0.75rem;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .palette-footer {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .btn-ayuda {
      width: 100%;
      padding: 10px;
      background: white;
      border: 1px solid #1e3a8a;
      border-radius: 6px;
      color: #1e3a8a;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-ayuda:hover {
      background: #1e3a8a;
      color: white;
    }

    .btn-ayuda .material-icons {
      font-size: 18px;
    }
  `]
})
export class UMLPaletteComponent {
  @Output() nodoSeleccionado = new EventEmitter<TipoNodoUML>();
  @Output() ayudaSolicitada = new EventEmitter<void>();

  categorias: CategoriaUML[] = [
    {
      nombre: 'Nodos Básicos',
      icono: 'category',
      expandida: true,
      nodos: [
        { tipo: TipoNodoUML.INICIO, config: CONFIGURACION_NODOS_UML[TipoNodoUML.INICIO] },
        { tipo: TipoNodoUML.FIN, config: CONFIGURACION_NODOS_UML[TipoNodoUML.FIN] },
        { tipo: TipoNodoUML.TAREA, config: CONFIGURACION_NODOS_UML[TipoNodoUML.TAREA] }
      ]
    },
    {
      nombre: 'Control de Flujo',
      icono: 'alt_route',
      expandida: true,
      nodos: [
        { tipo: TipoNodoUML.DECISION, config: CONFIGURACION_NODOS_UML[TipoNodoUML.DECISION] },
        { tipo: TipoNodoUML.MERGE, config: CONFIGURACION_NODOS_UML[TipoNodoUML.MERGE] },
        { tipo: TipoNodoUML.FORK, config: CONFIGURACION_NODOS_UML[TipoNodoUML.FORK] },
        { tipo: TipoNodoUML.JOIN, config: CONFIGURACION_NODOS_UML[TipoNodoUML.JOIN] }
      ]
    },
    {
      nombre: 'Objetos y Señales',
      icono: 'inventory',
      expandida: false,
      nodos: [
        { tipo: TipoNodoUML.OBJETO, config: CONFIGURACION_NODOS_UML[TipoNodoUML.OBJETO] },
        { tipo: TipoNodoUML.SEÑAL_ENVIO, config: CONFIGURACION_NODOS_UML[TipoNodoUML.SEÑAL_ENVIO] },
        { tipo: TipoNodoUML.SEÑAL_RECEPCION, config: CONFIGURACION_NODOS_UML[TipoNodoUML.SEÑAL_RECEPCION] },
        { tipo: TipoNodoUML.EVENTO_TIEMPO, config: CONFIGURACION_NODOS_UML[TipoNodoUML.EVENTO_TIEMPO] }
      ]
    },
    {
      nombre: 'Actividades Estructuradas',
      icono: 'account_tree',
      expandida: false,
      nodos: [
        { tipo: TipoNodoUML.REGION_EXPANSION, config: CONFIGURACION_NODOS_UML[TipoNodoUML.REGION_EXPANSION] },
        { tipo: TipoNodoUML.ACTIVIDAD_LLAMADA, config: CONFIGURACION_NODOS_UML[TipoNodoUML.ACTIVIDAD_LLAMADA] }
      ]
    },
    {
      nombre: 'Eventos y Excepciones',
      icono: 'error_outline',
      expandida: false,
      nodos: [
        { tipo: TipoNodoUML.EVENTO_ACEPTACION, config: CONFIGURACION_NODOS_UML[TipoNodoUML.EVENTO_ACEPTACION] },
        { tipo: TipoNodoUML.INTERRUPCION, config: CONFIGURACION_NODOS_UML[TipoNodoUML.INTERRUPCION] }
      ]
    }
  ];

  toggleCategoria(categoria: CategoriaUML): void {
    categoria.expandida = !categoria.expandida;
  }

  colapsarTodo(): void {
    this.categorias.forEach(c => c.expandida = false);
  }

  seleccionarNodo(tipo: TipoNodoUML): void {
    this.nodoSeleccionado.emit(tipo);
  }

  mostrarAyuda(): void {
    this.ayudaSolicitada.emit();
  }
}
