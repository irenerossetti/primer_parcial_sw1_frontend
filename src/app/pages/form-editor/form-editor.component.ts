import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioService, CampoFormulario } from '../../core/services/formulario.service';
import { PoliticaService } from '../../core/services/politica.service';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFormComponent],
  template: `
    <div class="form-editor-container">
      <div class="header">
        <button class="btn-back" (click)="volver()">
          <span class="material-icons">arrow_back</span>
          Volver a Políticas
        </button>
        <h1>
          <span class="material-icons">edit_note</span>
          Editor de Formularios
        </h1>
      </div>

      <div class="politica-info" *ngIf="politicaNombre">
        <h2>{{ politicaNombre }}</h2>
        <p>Define los campos del formulario que se usarán en esta política</p>
      </div>

      <div class="editor-layout">
        <!-- Panel Izquierdo: Lista de Campos -->
        <div class="campos-panel">
          <div class="panel-header">
            <h3>Campos del Formulario</h3>
            <button class="btn-add" (click)="agregarCampo()">
              <span class="material-icons">add</span>
              Nuevo Campo
            </button>
          </div>

          <div class="campos-lista" *ngIf="campos.length > 0">
            <div 
              *ngFor="let campo of campos; let i = index" 
              class="campo-item"
              [class.selected]="campoSeleccionado === campo"
              (click)="seleccionarCampo(campo)"
            >
              <div class="campo-info">
                <span class="campo-orden">{{ campo.orden }}</span>
                <div class="campo-detalles">
                  <strong>{{ campo.etiqueta }}</strong>
                  <small>{{ campo.nombre }} - {{ campo.tipo }}</small>
                </div>
              </div>
              <div class="campo-acciones">
                <button class="btn-icon" (click)="moverArriba(i); $event.stopPropagation()" [disabled]="i === 0">
                  <span class="material-icons">arrow_upward</span>
                </button>
                <button class="btn-icon" (click)="moverAbajo(i); $event.stopPropagation()" [disabled]="i === campos.length - 1">
                  <span class="material-icons">arrow_downward</span>
                </button>
                <button class="btn-icon btn-delete" (click)="eliminarCampo(i); $event.stopPropagation()">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="campos.length === 0">
            <span class="material-icons">inbox</span>
            <p>No hay campos definidos</p>
            <p class="hint">Haz clic en "Nuevo Campo" para comenzar</p>
          </div>
        </div>

        <!-- Panel Central: Editor de Campo -->
        <div class="editor-panel" *ngIf="campoSeleccionado">
          <div class="panel-header">
            <h3>Editar Campo</h3>
          </div>

          <div class="form-editor">
            <div class="form-group">
              <label>Nombre del Campo (ID) *</label>
              <input 
                type="text" 
                [(ngModel)]="campoSeleccionado.nombre" 
                class="form-control"
                placeholder="ej: nombre_completo"
              />
              <small>Identificador único sin espacios ni caracteres especiales</small>
            </div>

            <div class="form-group">
              <label>Etiqueta (Texto Mostrado) *</label>
              <input 
                type="text" 
                [(ngModel)]="campoSeleccionado.etiqueta" 
                class="form-control"
                placeholder="ej: Nombre Completo"
              />
            </div>

            <div class="form-group">
              <label>Tipo de Campo *</label>
              <select [(ngModel)]="campoSeleccionado.tipo" class="form-control" (change)="onTipoCambio()">
                <option value="TEXT">Texto</option>
                <option value="EMAIL">Email</option>
                <option value="PHONE">Teléfono</option>
                <option value="DATE">Fecha</option>
                <option value="NUMBER">Número</option>
                <option value="TEXTAREA">Área de Texto</option>
                <option value="SELECT">Lista Desplegable</option>
                <option value="CHECKBOX">Casilla de Verificación</option>
                <option value="RADIO">Opción Única</option>
                <option value="FILE">Archivo</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="campoSeleccionado.requerido" />
                <span>Campo Requerido</span>
              </label>
            </div>

            <div class="form-group" *ngIf="campoSeleccionado.tipo === 'TEXT' || campoSeleccionado.tipo === 'PHONE'">
              <label>Patrón de Validación (Regex)</label>
              <input 
                type="text" 
                [(ngModel)]="campoSeleccionado.validacion" 
                class="form-control"
                placeholder="ej: ^[0-9]{10}$ para 10 dígitos"
              />
              <small>Expresión regular para validar el formato</small>
            </div>

            <div class="form-group">
              <label>Texto de Ayuda</label>
              <input 
                type="text" 
                [(ngModel)]="campoSeleccionado.ayuda" 
                class="form-control"
                placeholder="ej: Ingrese su nombre completo"
              />
            </div>

            <!-- Opciones para SELECT y RADIO -->
            <div class="form-group" *ngIf="campoSeleccionado.tipo === 'SELECT' || campoSeleccionado.tipo === 'RADIO'">
              <label>Opciones</label>
              <div class="opciones-lista">
                <div *ngFor="let opcion of campoSeleccionado.opciones; let i = index" class="opcion-item">
                  <input 
                    type="text" 
                    [(ngModel)]="opcion.valor" 
                    placeholder="Valor"
                    class="form-control-small"
                  />
                  <input 
                    type="text" 
                    [(ngModel)]="opcion.etiqueta" 
                    placeholder="Etiqueta"
                    class="form-control-small"
                  />
                  <button class="btn-icon btn-delete" (click)="eliminarOpcion(i)">
                    <span class="material-icons">close</span>
                  </button>
                </div>
              </div>
              <button class="btn-add-option" (click)="agregarOpcion()">
                <span class="material-icons">add</span>
                Agregar Opción
              </button>
            </div>
          </div>
        </div>

        <div class="empty-editor" *ngIf="!campoSeleccionado && campos.length > 0">
          <span class="material-icons">touch_app</span>
          <p>Selecciona un campo para editarlo</p>
        </div>

        <!-- Panel Derecho: Vista Previa -->
        <div class="preview-panel">
          <div class="panel-header">
            <h3>Vista Previa</h3>
          </div>

          <div class="preview-content" *ngIf="campos.length > 0">
            <app-dynamic-form
              [campos]="campos"
              [valoresIniciales]="{}"
              submitButtonText="Vista Previa"
              [showCancelButton]="false"
              (formSubmit)="onPreviewSubmit($event)"
            ></app-dynamic-form>
          </div>

          <div class="empty-preview" *ngIf="campos.length === 0">
            <span class="material-icons">visibility_off</span>
            <p>Agrega campos para ver la vista previa</p>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="actions-bar">
        <button class="btn-cancel" (click)="volver()">
          Cancelar
        </button>
        <button class="btn-save" (click)="guardar()" [disabled]="guardando">
          <span class="material-icons" *ngIf="!guardando">save</span>
          <span class="spinner" *ngIf="guardando"></span>
          {{ guardando ? 'Guardando...' : 'Guardar Formulario' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .form-editor-container {
      padding: 24px;
      max-width: 1800px;
      margin: 0 auto;
      background: #f5f7fa;
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2c3e50;
      margin: 0;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      color: #64748b;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .politica-info {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .politica-info h2 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .politica-info p {
      margin: 0;
      color: #64748b;
    }

    .editor-layout {
      display: grid;
      grid-template-columns: 350px 1fr 400px;
      gap: 24px;
      margin-bottom: 24px;
    }

    .campos-panel, .editor-panel, .preview-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 300px);
    }

    .panel-header {
      padding: 20px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.1rem;
    }

    .btn-add {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-add:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .campos-lista {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .campo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .campo-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .campo-item.selected {
      background: #eff6ff;
      border-color: #2563eb;
    }

    .campo-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .campo-orden {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #2563eb;
      color: white;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
    }

    .campo-detalles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .campo-detalles strong {
      color: #1e293b;
      font-size: 14px;
    }

    .campo-detalles small {
      color: #64748b;
      font-size: 12px;
    }

    .campo-acciones {
      display: flex;
      gap: 4px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: #64748b;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-icon:hover:not(:disabled) {
      background: #e2e8f0;
      color: #1e293b;
    }

    .btn-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-icon.btn-delete:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-icon .material-icons {
      font-size: 18px;
    }

    .empty-state, .empty-editor, .empty-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #94a3b8;
      text-align: center;
    }

    .empty-state .material-icons,
    .empty-editor .material-icons,
    .empty-preview .material-icons {
      font-size: 64px;
      margin-bottom: 16px;
      color: #cbd5e1;
    }

    .hint {
      font-size: 12px;
      color: #94a3b8;
    }

    .form-editor {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control, .form-control-small {
      width: 100%;
      padding: 10px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-control:focus, .form-control-small:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-group small {
      display: block;
      margin-top: 6px;
      font-size: 12px;
      color: #64748b;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .opciones-lista {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .opcion-item {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .form-control-small {
      flex: 1;
    }

    .btn-add-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #f1f5f9;
      color: #475569;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      width: 100%;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-add-option:hover {
      background: #e2e8f0;
      border-color: #94a3b8;
    }

    .preview-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .btn-cancel, .btn-save {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
    }

    .btn-save {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1400px) {
      .editor-layout {
        grid-template-columns: 1fr;
      }

      .preview-panel {
        display: none;
      }
    }
  `]
})
export class FormEditorComponent implements OnInit {
  politicaId: string = '';
  politicaNombre: string = '';
  campos: CampoFormulario[] = [];
  campoSeleccionado: CampoFormulario | null = null;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formularioService: FormularioService,
    private politicaService: PoliticaService
  ) {}

  ngOnInit() {
    this.politicaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.politicaId) {
      this.cargarFormulario();
      this.cargarPolitica();
    }
  }

  cargarPolitica() {
    this.politicaService.getPoliticaById(this.politicaId).subscribe({
      next: (politica: any) => {
        this.politicaNombre = politica.nombre;
      },
      error: (err) => console.error('Error cargando política:', err)
    });
  }

  cargarFormulario() {
    this.formularioService.getFormularioPolitica(this.politicaId).subscribe({
      next: (data) => {
        this.campos = data.campos || [];
        this.reordenarCampos();
      },
      error: (err) => console.error('Error cargando formulario:', err)
    });
  }

  agregarCampo() {
    const nuevoCampo: CampoFormulario = {
      nombre: `campo_${Date.now()}`,
      etiqueta: 'Nuevo Campo',
      tipo: 'TEXT',
      requerido: false,
      orden: this.campos.length + 1
    };
    this.campos.push(nuevoCampo);
    this.campoSeleccionado = nuevoCampo;
  }

  seleccionarCampo(campo: CampoFormulario) {
    this.campoSeleccionado = campo;
  }

  eliminarCampo(index: number) {
    if (confirm('¿Estás seguro de eliminar este campo?')) {
      this.campos.splice(index, 1);
      this.reordenarCampos();
      if (this.campoSeleccionado === this.campos[index]) {
        this.campoSeleccionado = null;
      }
    }
  }

  moverArriba(index: number) {
    if (index > 0) {
      [this.campos[index], this.campos[index - 1]] = [this.campos[index - 1], this.campos[index]];
      this.reordenarCampos();
    }
  }

  moverAbajo(index: number) {
    if (index < this.campos.length - 1) {
      [this.campos[index], this.campos[index + 1]] = [this.campos[index + 1], this.campos[index]];
      this.reordenarCampos();
    }
  }

  reordenarCampos() {
    this.campos.forEach((campo, index) => {
      campo.orden = index + 1;
    });
  }

  onTipoCambio() {
    if (this.campoSeleccionado) {
      const tipo = this.campoSeleccionado.tipo;
      
      // Inicializar opciones para SELECT y RADIO
      if ((tipo === 'SELECT' || tipo === 'RADIO') && !this.campoSeleccionado.opciones) {
        this.campoSeleccionado.opciones = [
          { valor: 'opcion1', etiqueta: 'Opción 1' },
          { valor: 'opcion2', etiqueta: 'Opción 2' }
        ];
      }
      
      // Limpiar validación si no es TEXT o PHONE
      if (tipo !== 'TEXT' && tipo !== 'PHONE') {
        this.campoSeleccionado.validacion = undefined;
      }
    }
  }

  agregarOpcion() {
    if (this.campoSeleccionado && this.campoSeleccionado.opciones) {
      this.campoSeleccionado.opciones.push({
        valor: `opcion${this.campoSeleccionado.opciones.length + 1}`,
        etiqueta: `Opción ${this.campoSeleccionado.opciones.length + 1}`
      });
    }
  }

  eliminarOpcion(index: number) {
    if (this.campoSeleccionado && this.campoSeleccionado.opciones) {
      this.campoSeleccionado.opciones.splice(index, 1);
    }
  }

  onPreviewSubmit(valores: any) {
    console.log('Vista previa - Valores:', valores);
    alert('Vista previa - Ver consola para los valores');
  }

  guardar() {
    if (!this.validarCampos()) {
      return;
    }

    this.guardando = true;
    this.formularioService.actualizarCamposPolitica(this.politicaId, this.campos).subscribe({
      next: () => {
        alert('Formulario guardado exitosamente');
        this.guardando = false;
        this.volver();
      },
      error: (err) => {
        console.error('Error guardando:', err);
        alert('Error al guardar el formulario');
        this.guardando = false;
      }
    });
  }

  validarCampos(): boolean {
    for (const campo of this.campos) {
      if (!campo.nombre || !campo.etiqueta) {
        alert('Todos los campos deben tener nombre y etiqueta');
        return false;
      }
      
      // Validar que los nombres sean únicos
      const nombres = this.campos.map(c => c.nombre);
      if (nombres.length !== new Set(nombres).size) {
        alert('Los nombres de los campos deben ser únicos');
        return false;
      }
    }
    return true;
  }

  volver() {
    this.router.navigate(['/politicas']);
  }
}
