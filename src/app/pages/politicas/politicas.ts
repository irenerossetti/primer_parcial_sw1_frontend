import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoliticaService } from '../../core/services/politica.service';
import { AuthService } from '../../core/services/auth.service';

interface Politica {
  id?: string;
  nombre: string;
  descripcion?: string;
  tipoFlujo?: string;
  activo?: boolean;
  flujo?: any[];
}

interface NodoFlujo {
  nodoId: string;
  nombre: string;
  tipo?: string;
  siguientes?: string[];
  departamentoId?: string;
}

@Component({
  selector: 'app-politicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="politicas-container">
      <div class="page-header">
        <h1>Políticas de Negocio</h1>
        <button class="btn-primary" (click)="abrirNuevaPoltica()">+ Nueva Política</button>
      </div>

      <!-- Modal Nueva Política -->
      <div class="modal" [class.active]="mostrarModalNueva">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editandoId ? 'Editar Política' : 'Nueva Política' }}</h2>
            <button class="btn-close" (click)="cerrarModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="nuevaPolitica.nombre" class="form-control" />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="nuevaPolitica.descripcion" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label>Tipo de Flujo</label>
              <select [(ngModel)]="nuevaPolitica.tipoFlujo" class="form-control">
                <option value="LINEAL">Lineal</option>
                <option value="PARALELO">Paralelo</option>
                <option value="CONDICIONAL">Condicional</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="cerrarModal()">Cancelar</button>
            <button class="btn-primary" (click)="guardarPolitica()">{{ editandoId ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </div>
      </div>

      <!-- Modal Detalle Política -->
      <div class="modal" [class.active]="mostrarModalDetalle">
        <div class="modal-content-lg">
          <div class="modal-header">
            <h2>{{ politicaSeleccionada?.nombre }}</h2>
            <button class="btn-close" (click)="cerrarModalDetalle()">&times;</button>
          </div>
          <div class="modal-body">
            <div *ngIf="politicaSeleccionada">
              <p><strong>Descripción:</strong> {{ politicaSeleccionada.descripcion }}</p>
              <p><strong>Tipo de Flujo:</strong> {{ politicaSeleccionada.tipoFlujo }}</p>
              <p><strong>Estado:</strong> <span class="badge" [class]="politicaSeleccionada.activo ? 'activa' : 'inactiva'">
                {{ politicaSeleccionada.activo ? 'Activa' : 'Inactiva' }}
              </span></p>

              <h4 style="margin-top: 20px;">Ruta del flujo</h4>
              <div *ngIf="politicaSeleccionada.flujo && politicaSeleccionada.flujo.length" class="flow-route">
                <ng-container *ngFor="let nodo of getRutaNodos(politicaSeleccionada); let last = last">
                  <span class="route-chip">{{ nodo.nombre }}</span>
                  <span *ngIf="!last" class="route-arrow">→</span>
                </ng-container>
              </div>
              <p *ngIf="!politicaSeleccionada.flujo || politicaSeleccionada.flujo.length === 0">No hay ruta definida.</p>

              <h4 style="margin-top: 20px;">Nodos del Flujo</h4>
              <div *ngIf="politicaSeleccionada.flujo && politicaSeleccionada.flujo.length" class="flujo-nodes">
                <div *ngFor="let nodo of politicaSeleccionada.flujo" class="node-item">
                  <strong>{{ nodo.nombre }}</strong> ({{ nodo.tipo }})
                  <p *ngIf="nodo.departamentoId">Departamento ID: {{ nodo.departamentoId }}</p>
                </div>
              </div>
              <p *ngIf="!politicaSeleccionada.flujo || politicaSeleccionada.flujo.length === 0">Sin nodos definidos</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="abrirEditor(politicaSeleccionada)">
              <span class="material-icons">timeline</span>
              Editar Diagrama
            </button>
            <button class="btn-secondary" (click)="editarPolitica(politicaSeleccionada || undefined)">Editar</button>
            <button class="btn-danger" (click)="eliminarPolitica(politicaSeleccionada?.id)">Eliminar</button>
            <button class="btn-cancel" (click)="cerrarModalDetalle()">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- Lista de Políticas -->
      <div class="politicas-list">
        <div *ngIf="politicas.length === 0" class="empty-state">
          <p>No hay políticas disponibles. Crea una nueva para comenzar.</p>
        </div>
        <div *ngFor="let politica of politicas" class="politica-card" (click)="abrirDetalles(politica)">
          <div class="card-header">
            <h3>{{ politica.nombre }}</h3>
            <span class="badge" [class]="politica.activo ? 'activa' : 'inactiva'">
              {{ politica.activo ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <p class="card-description">{{ politica.descripcion }}</p>
          <p class="card-type">Tipo: {{ politica.tipoFlujo }}</p>
          <p class="card-route" *ngIf="politica.flujo && politica.flujo.length">
            <strong>Ruta:</strong> {{ getRutaFlujo(politica) }}
          </p>
          <div class="card-actions">
            <button class="btn-small btn-diagram" (click)="abrirEditor(politica); $event.stopPropagation()">
              <span class="material-icons">timeline</span>
              Diagrama
            </button>
            <button class="btn-small btn-uml" (click)="abrirEditorUML(politica); $event.stopPropagation()">
              <span class="material-icons">account_tree</span>
              UML 2.5
            </button>
            <button class="btn-small btn-form" (click)="abrirFormulario(politica); $event.stopPropagation()">
              <span class="material-icons">edit_note</span>
              Formulario
            </button>
            <button class="btn-small btn-edit" (click)="editarPolitica(politica); $event.stopPropagation()">Editar</button>
            <button class="btn-small btn-danger" (click)="eliminarPolitica(politica.id); $event.stopPropagation()">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .politicas-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .page-header h1 { margin: 0; }
    
    .btn-primary { background: #2196f3; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 1rem; transition: all 0.2s; }
    .btn-primary:hover { background: #1976d2; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3); }
    .btn-cancel { background: #757575; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .btn-cancel:hover { background: #616161; }
    .btn-danger { background: #f44336; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .btn-danger:hover { background: #d32f2f; transform: translateY(-1px); }
    .btn-secondary { background: #ff9800; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .btn-secondary:hover { background: #f57c00; }
    .btn-small { padding: 10px 16px; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; font-weight: 500; transition: all 0.2s; }
    .btn-edit { background: #4caf50; color: white; border: none; cursor: pointer; }
    .btn-edit:hover { background: #388e3c; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3); }
    .btn-diagram { background: #1e3a8a; color: white; border: none; cursor: pointer; }
    .btn-diagram:hover { background: #1e40af; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3); }
    .btn-uml { background: #7c3aed; color: white; border: none; cursor: pointer; }
    .btn-uml:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3); }
    .btn-uml .material-icons, .btn-diagram .material-icons, .btn-form .material-icons { font-size: 18px; }
    .btn-form { background: #9c27b0; color: white; border: none; cursor: pointer; }
    .btn-form:hover { background: #7b1fa2; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3); }
    .btn-close { background: none; border: none; font-size: 28px; cursor: pointer; color: #999; }
    
    .politicas-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; }
    
    .politica-card { 
      background: white; 
      padding: 24px; 
      border-radius: 12px; 
      border: 1px solid #e0e0e0;
      cursor: pointer;
      transition: all 0.3s;
      min-height: 240px;
    }
    .politica-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); transform: translateY(-2px); }
    
    .card-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
    .card-header h3 { margin: 0; color: #333; font-size: 1.1rem; font-weight: 600; }
    .card-description { color: #666; font-size: 0.95rem; margin: 12px 0; line-height: 1.5; }
    .card-type { color: #999; font-size: 0.85rem; margin: 8px 0 15px 0; }
    .card-route { color: #3b4a5a; font-size: 0.85rem; margin: 0 0 16px 0; line-height: 1.5; }
    
    .card-actions { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    
    .badge { 
      display: inline-block; 
      padding: 5px 14px; 
      border-radius: 20px; 
      font-size: 0.75rem; 
      font-weight: 600;
    }
    .activa { background: #e8f5e9; color: #2e7d32; }
    .inactiva { background: #ffebee; color: #c62828; }
    
    .modal { 
      display: none; 
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: rgba(0,0,0,0.5); 
      z-index: 1000;
    }
    .modal.active { display: flex; align-items: center; justify-content: center; }
    
    .modal-content, .modal-content-lg { 
      background: white; 
      border-radius: 8px; 
      max-height: 90vh; 
      overflow-y: auto;
    }
    .modal-content { width: 500px; }
    .modal-content-lg { width: 600px; }
    
    .modal-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 20px; 
      border-bottom: 1px solid #e0e0e0;
    }
    .modal-header h2 { margin: 0; }
    
    .modal-body { padding: 20px; }
    .modal-footer { 
      display: flex; 
      justify-content: flex-end; 
      gap: 10px; 
      padding: 20px; 
      border-top: 1px solid #e0e0e0;
    }
    
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-control { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    
    .flujo-nodes { margin-top: 15px; }
    .flow-route {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
      margin-bottom: 16px;
    }
    .route-chip {
      background: #eef4ff;
      color: #1d4c8f;
      border: 1px solid #c6dbff;
      border-radius: 16px;
      padding: 4px 10px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .route-arrow {
      color: #7b8794;
      font-size: 1rem;
      font-weight: 700;
    }
    .node-item { 
      background: #f5f5f5; 
      padding: 10px; 
      border-radius: 4px; 
      margin-bottom: 10px;
      border-left: 4px solid #2196f3;
    }
    
    .empty-state { 
      grid-column: 1 / -1; 
      text-align: center; 
      padding: 40px;
      color: #999;
    }
  `]
})
export class PoliticasComponent implements OnInit {
  politicas: Politica[] = [];
  mostrarModalNueva = false;
  mostrarModalDetalle = false;
  nuevaPolitica: Politica = { nombre: '', descripcion: '', tipoFlujo: 'LINEAL', activo: true };
  editandoId: string | null = null;
  politicaSeleccionada: Politica | undefined;

  constructor(
    private politicaService: PoliticaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPoliticas();
  }

  cargarPoliticas() {
    this.politicaService.getPoliticasActivas().subscribe({
      next: (data) => {
        this.politicas = data;
      },
      error: (err) => {
        console.error('Error cargando políticas:', err);
        alert('Error al cargar políticas: ' + (err.error?.mensaje || err.message));
      }
    });
  }

  abrirNuevaPoltica() {
    this.editandoId = null;
    this.nuevaPolitica = { nombre: '', descripcion: '', tipoFlujo: 'LINEAL', activo: true };
    this.mostrarModalNueva = true;
  }

  abrirEditor(politica?: Politica) {
    // Redirigir al diagramador con el ID de la política
    if (politica?.id) {
      window.location.href = `/diagramador?politicaId=${politica.id}`;
    } else {
      window.location.href = '/diagramador';
    }
  }

  abrirEditorUML(politica: Politica) {
    // Redirigir al editor UML 2.5
    if (politica?.id) {
      this.router.navigate(['/diagramador-uml', politica.id]);
    }
  }

  abrirFormulario(politica: Politica) {
    if (politica?.id) {
      this.router.navigate(['/politicas', politica.id, 'formulario']);
    }
  }

  editarPolitica(politica: Politica | undefined) {
    if (!politica) return;
    this.editandoId = politica.id || null;
    this.nuevaPolitica = { ...politica };
    this.mostrarModalNueva = true;
  }

  guardarPolitica() {
    if (!this.nuevaPolitica.nombre || !this.nuevaPolitica.descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (this.editandoId) {
      this.politicaService.actualizarPolitica(this.editandoId, this.nuevaPolitica).subscribe({
        next: () => {
          alert('Política actualizada exitosamente');
          this.cerrarModal();
          this.cargarPoliticas();
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al actualizar política');
        }
      });
    } else {
      this.politicaService.crearPolitica(this.nuevaPolitica).subscribe({
        next: () => {
          alert('Política creada exitosamente');
          this.cerrarModal();
          this.cargarPoliticas();
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al crear política');
        }
      });
    }
  }

  eliminarPolitica(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta política?')) return;

    this.politicaService.eliminarPolitica(id).subscribe({
      next: () => {
        alert('Política eliminada');
        this.cargarPoliticas();
        this.cerrarModalDetalle();
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al eliminar política');
      }
    });
  }

  abrirDetalles(politica: Politica) {
    this.politicaSeleccionada = politica;
    this.mostrarModalDetalle = true;
  }

  cerrarModal() {
    this.mostrarModalNueva = false;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.politicaSeleccionada = undefined;
  }

  getRutaFlujo(politica: Politica): string {
    return this.getRutaNodos(politica)
      .map((nodo) => nodo.nombre)
      .join(' -> ');
  }

  getRutaNodos(politica: Politica): NodoFlujo[] {
    const nodos = (politica.flujo || []) as NodoFlujo[];
    if (nodos.length === 0) {
      return [];
    }

    const porId = new Map<string, NodoFlujo>();
    for (const nodo of nodos) {
      if (nodo.nodoId) {
        porId.set(nodo.nodoId, nodo);
      }
    }

    const nodoInicio = nodos.find((n) => n.tipo === 'INICIO') || nodos[0];
    const ruta: NodoFlujo[] = [];
    const visitados = new Set<string>();
    let actual: NodoFlujo | undefined = nodoInicio;
    let limite = 0;

    while (actual && limite < 50) {
      ruta.push(actual);
      if (!actual.nodoId || visitados.has(actual.nodoId)) {
        break;
      }
      visitados.add(actual.nodoId);

      if (!actual.siguientes || actual.siguientes.length === 0) {
        break;
      }

      const siguienteId = actual.siguientes[0];
      actual = porId.get(siguienteId);
      limite++;
    }

    return ruta;
  }
}