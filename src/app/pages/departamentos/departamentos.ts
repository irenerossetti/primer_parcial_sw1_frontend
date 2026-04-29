import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartamentoService, Departamento } from '../../core/services/departamento.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="departamentos-container">
      <div class="header">
        <div class="header-title">
          <span class="material-icons">business</span>
          <h1>Departamentos</h1>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" (click)="cargarDepartamentos()" [disabled]="loading">
            <span class="material-icons">refresh</span>
          </button>
          <button class="btn-primary" (click)="abrirModalNuevo()">
            <span class="material-icons">add</span>
            Nuevo Departamento
          </button>
        </div>
      </div>

      <div class="filtros-bar">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input type="text" [(ngModel)]="filtroBusqueda" (input)="aplicarFiltros()" placeholder="Buscar por nombre, responsable o código..." class="search-input">
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" class="filter-select">
            <option value="todos">Todos</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total"><span class="material-icons">business</span></div>
          <div class="stat-info"><h3>Total</h3><p>{{ departamentos.length }}</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon activos"><span class="material-icons">check_circle</span></div>
          <div class="stat-info"><h3>Activos</h3><p>{{ departamentos.filter(d => d.estado === 'ACTIVO').length }}</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon inactivos"><span class="material-icons">cancel</span></div>
          <div class="stat-info"><h3>Inactivos</h3><p>{{ departamentos.filter(d => d.estado === 'INACTIVO').length }}</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon mantenimiento"><span class="material-icons">construction</span></div>
          <div class="stat-info"><h3>Mantenimiento</h3><p>{{ departamentos.filter(d => d.estado === 'MANTENIMIENTO').length }}</p></div>
        </div>
      </div>

      <div *ngIf="loading" class="loading"><div class="spinner"></div><p>Cargando departamentos...</p></div>

      <div *ngIf="!loading" class="departamentos-grid">
        <div *ngFor="let depto of departamentosFiltrados" class="depto-card">
          <div class="card-header">
            <div class="depto-icon"><span class="material-icons">{{ getTipoIcon(depto.tipo) }}</span></div>
            <div class="depto-info">
              <h3>{{ depto.nombre }}</h3>
              <span class="depto-codigo">{{ depto.codigo }}</span>
            </div>
            <div class="estado-badge" [class]="getEstadoClass(depto.estado)">
              <span class="material-icons">{{ getEstadoIcon(depto.estado) }}</span>
              {{ getEstadoLabel(depto.estado) }}
            </div>
          </div>
          <div class="card-body">
            <div class="info-row"><span class="material-icons">person</span><span class="label">Responsable:</span><span class="value">{{ depto.responsableNombre }}</span></div>
            <div class="info-row"><span class="material-icons">email</span><span class="label">Email:</span><span class="value">{{ depto.responsableEmail }}</span></div>
            <div class="info-row" *ngIf="depto.descripcion"><span class="material-icons">description</span><span class="label">Descripción:</span><span class="value">{{ depto.descripcion | slice:0:60 }}...</span></div>
          </div>
          <div class="card-footer">
            <button class="btn-editar" (click)="abrirModalEditar(depto)"><span class="material-icons">edit</span>Editar</button>
            <button class="btn-eliminar" (click)="confirmarEliminar(depto)"><span class="material-icons">delete</span>Eliminar</button>
          </div>
        </div>
        <div *ngIf="departamentosFiltrados.length === 0" class="sin-resultados">
          <span class="material-icons">inbox</span>
          <p>No hay departamentos registrados</p>
          <button class="btn-primary-small" (click)="abrirModalNuevo()">Crear primer departamento</button>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar - VERSIÓN MEJORADA -->
    <div class="modal-overlay" *ngIf="mostrarModal" (click)="cerrarModal()">
      <div class="modal modal-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><span class="material-icons">{{ esEdicion ? 'edit' : 'add' }}</span>{{ modalTitulo }}</h3>
          <button class="btn-close" (click)="cerrarModal()"><span class="material-icons">close</span></button>
        </div>
        
        <div class="modal-body">
          <form (ngSubmit)="guardarDepartamento()">
            <!-- Información Básica -->
            <div class="form-section">
              <div class="section-title">
                <span class="material-icons">info</span>
                <h4>Información Básica</h4>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label><span class="material-icons">business</span>Nombre del Departamento *</label>
                  <input type="text" [(ngModel)]="departamentoSeleccionado.nombre" name="nombre" class="form-control" placeholder="Ej: Atención al Cliente" required>
                </div>
                
                <div class="form-group">
                  <label><span class="material-icons">category</span>Tipo de Departamento *</label>
                  <select [(ngModel)]="departamentoSeleccionado.tipo" name="tipo" class="form-control">
                    <option *ngFor="let tipo of tiposDepartamento" [value]="tipo.value">{{ tipo.label }}</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label><span class="material-icons">description</span>Descripción</label>
                <textarea [(ngModel)]="departamentoSeleccionado.descripcion" name="descripcion" rows="3" class="form-control" placeholder="Describa las funciones y responsabilidades del departamento..."></textarea>
              </div>
            </div>

            <!-- Responsable -->
            <div class="form-section">
              <div class="section-title">
                <span class="material-icons">people</span>
                <h4>Información del Responsable</h4>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label><span class="material-icons">person</span>Nombre del Responsable *</label>
                  <input type="text" [(ngModel)]="departamentoSeleccionado.responsableNombre" name="responsableNombre" class="form-control" placeholder="Nombre completo" required>
                </div>
                
                <div class="form-group">
                  <label><span class="material-icons">email</span>Email del Responsable *</label>
                  <input type="email" [(ngModel)]="departamentoSeleccionado.responsableEmail" name="responsableEmail" class="form-control" placeholder="email@ejemplo.com" required>
                </div>
              </div>
            </div>

            <!-- Configuración -->
            <div class="form-section">
              <div class="section-title">
                <span class="material-icons">settings</span>
                <h4>Configuración del Flujo</h4>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label><span class="material-icons">toggle_on</span>Estado</label>
                  <select [(ngModel)]="departamentoSeleccionado.estado" name="estado" class="form-control">
                    <option *ngFor="let estado of estadosDisponibles" [value]="estado.value">{{ estado.label }}</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label><span class="material-icons">schedule</span>Tiempo máximo (horas)</label>
                  <input type="number" [(ngModel)]="departamentoSeleccionado.configuracionFlujo.tiempoMaximoHoras" name="tiempoMaximo" class="form-control" placeholder="48">
                </div>
              </div>
              
              <div class="form-group">
                <label><span class="material-icons">swap_horiz</span>Departamento destino (flujo)</label>
                <select [(ngModel)]="departamentoSeleccionado.configuracionFlujo.departamentosSiguientes[0]" name="departamentoDestino" class="form-control">
                  <option value="">Ninguno (es el último departamento)</option>
                  <option *ngFor="let depto of departamentos" [value]="depto.nombre">{{ depto.nombre }}</option>
                </select>
                <small class="help-text">Departamento al que se derivará el trámite después de procesarlo aquí</small>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancelar" (click)="cerrarModal()">
            <span class="material-icons">cancel</span>Cancelar
          </button>
          <button class="btn-guardar" (click)="guardarDepartamento()" [disabled]="loading">
            <span class="material-icons" *ngIf="!loading">save</span>
            <span class="spinner-small" *ngIf="loading"></span>
            {{ esEdicion ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div class="modal-overlay" *ngIf="mostrarModalEliminar" (click)="cerrarModalEliminar()">
      <div class="modal modal-small" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><span class="material-icons">warning</span>Confirmar Eliminación</h3>
          <button class="btn-close" (click)="cerrarModalEliminar()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">⚠️</div>
          <p>¿Está seguro que desea eliminar el departamento?</p>
          <p class="warning-text"><strong>{{ departamentoAEliminar?.nombre }}</strong></p>
          <p class="warning-message">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" (click)="cerrarModalEliminar()">Cancelar</button>
          <button class="btn-eliminar-confirm" (click)="eliminarDepartamento()">
            <span class="material-icons">delete</span>Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .departamentos-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #f5f7fa; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
    .header-title { display: flex; align-items: center; gap: 12px; }
    .header-title h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .header-title .material-icons { font-size: 32px; color: #2196f3; }
    .header-actions { display: flex; gap: 10px; }
    .btn-primary, .btn-refresh { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s; }
    .btn-primary { background: #2196f3; color: white; }
    .btn-primary:hover { background: #1976d2; transform: translateY(-2px); }
    .btn-refresh { background: white; color: #666; border: 1px solid #ddd; }
    .btn-refresh:hover { background: #f5f5f5; transform: translateY(-2px); }
    
    .filtros-bar { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 25px; flex-wrap: wrap; }
    .search-box { flex: 1; display: flex; align-items: center; background: white; border-radius: 8px; padding: 0 12px; border: 1px solid #ddd; transition: all 0.3s; }
    .search-box:focus-within { border-color: #2196f3; box-shadow: 0 0 0 2px rgba(33,150,243,0.1); }
    .search-box .material-icons { color: #999; }
    .search-input { flex: 1; border: none; padding: 12px; font-size: 14px; outline: none; }
    .filter-group { display: flex; align-items: center; gap: 10px; background: white; padding: 6px 15px; border-radius: 8px; border: 1px solid #ddd; }
    .filter-group label { font-weight: 500; color: #666; }
    .filter-select { border: none; padding: 8px; font-size: 14px; outline: none; background: transparent; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.3s; }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #e3f2fd; color: #2196f3; }
    .stat-icon.activos { background: #e8f5e9; color: #4caf50; }
    .stat-icon.inactivos { background: #ffebee; color: #f44336; }
    .stat-icon.mantenimiento { background: #fff3e0; color: #ff9800; }
    .stat-icon .material-icons { font-size: 28px; }
    .stat-info h3 { margin: 0; font-size: 14px; color: #666; }
    .stat-info p { margin: 5px 0 0; font-size: 28px; font-weight: bold; color: #2c3e50; }
    
    .loading { text-align: center; padding: 60px; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .departamentos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .depto-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; }
    .depto-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .card-header { padding: 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #eee; }
    .depto-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .depto-icon .material-icons { color: white; font-size: 28px; }
    .depto-info { flex: 1; }
    .depto-info h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; }
    .depto-codigo { font-size: 11px; color: #999; font-family: monospace; }
    .estado-badge { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .estado-activo { background: #e8f5e9; color: #4caf50; }
    .estado-inactivo { background: #ffebee; color: #f44336; }
    .estado-mantenimiento { background: #fff3e0; color: #ff9800; }
    .card-body { padding: 20px; }
    .info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 13px; }
    .info-row .material-icons { font-size: 16px; color: #999; }
    .info-row .label { min-width: 80px; color: #666; font-weight: 500; }
    .info-row .value { color: #333; flex: 1; }
    .card-footer { padding: 15px 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-editar, .btn-eliminar { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.3s; }
    .btn-editar { background: #e3f2fd; color: #1976d2; }
    .btn-editar:hover { background: #bbdef5; }
    .btn-eliminar { background: #ffebee; color: #f44336; }
    .btn-eliminar:hover { background: #ffcdd2; }
    
    .sin-resultados { text-align: center; padding: 60px; color: #999; }
    .sin-resultados .material-icons { font-size: 60px; margin-bottom: 15px; }
    .btn-primary-small { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 15px; }
    
    /* Modal mejorado */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal { background: white; border-radius: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s; }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-large { width: 700px; max-width: 95%; }
    .modal-small { width: 450px; max-width: 95%; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 24px 20px; border-bottom: 1px solid #eee; }
    .modal-header h3 { display: flex; align-items: center; gap: 10px; margin: 0; color: #2c3e50; font-size: 1.3rem; }
    .btn-close { background: none; border: none; cursor: pointer; color: #999; padding: 4px; display: flex; }
    .btn-close:hover { color: #e74c3c; }
    .modal-body { padding: 24px; }
    .form-section { margin-bottom: 28px; }
    .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
    .section-title .material-icons { color: #2196f3; font-size: 24px; }
    .section-title h4 { margin: 0; color: #2c3e50; font-size: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { margin-bottom: 0; }
    .form-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 500; color: #555; font-size: 13px; }
    .form-group label .material-icons { font-size: 16px; color: #2196f3; }
    .form-control { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; transition: all 0.3s; }
    .form-control:focus { outline: none; border-color: #2196f3; box-shadow: 0 0 0 2px rgba(33,150,243,0.1); }
    textarea.form-control { resize: vertical; }
    .help-text { display: block; margin-top: 5px; font-size: 11px; color: #999; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px 24px; border-top: 1px solid #eee; }
    .btn-cancelar, .btn-guardar, .btn-eliminar-confirm { display: flex; align-items: center; gap: 8px; padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s; }
    .btn-cancelar { background: #e0e0e0; color: #666; }
    .btn-cancelar:hover { background: #d0d0d0; }
    .btn-guardar { background: #4caf50; color: white; }
    .btn-guardar:hover:not(:disabled) { background: #45a049; transform: translateY(-2px); }
    .btn-eliminar-confirm { background: #f44336; color: white; }
    .btn-eliminar-confirm:hover { background: #d32f2f; transform: translateY(-2px); }
    .warning-icon { text-align: center; font-size: 48px; margin-bottom: 15px; }
    .warning-text { text-align: center; font-size: 16px; margin: 15px 0; color: #f44336; }
    .warning-message { text-align: center; font-size: 12px; color: #999; }
    .spinner-small { border: 2px solid #f3f3f3; border-top: 2px solid #fff; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block; }
    
    @media (max-width: 768px) { .departamentos-container { padding: 15px; } .departamentos-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } .filtros-bar { flex-direction: column; } .search-box { width: 100%; } .filter-group { width: 100%; } .form-row { grid-template-columns: 1fr; gap: 15px; } .modal-large { width: 95%; } }
  `]
})
export class DepartamentosComponent implements OnInit {
  
  departamentos: Departamento[] = [];
  departamentosFiltrados: Departamento[] = [];
  loading: boolean = false;
  filtroEstado: string = 'todos';
  filtroBusqueda: string = '';
  
  mostrarModal = false;
  modalTitulo = '';
  esEdicion = false;
  departamentoSeleccionado: Departamento = this.crearDepartamentoVacio();
  
  mostrarModalEliminar = false;
  departamentoAEliminar: Departamento | null = null;
  
  tiposDepartamento = [
    { value: 'ATENCION_CLIENTE', label: 'Atención al Cliente', icon: 'support_agent' },
    { value: 'EVALUACION', label: 'Evaluación', icon: 'assessment' },
    { value: 'LEGAL', label: 'Legal', icon: 'gavel' },
    { value: 'TECNICO', label: 'Técnico', icon: 'build' },
    { value: 'ALMACEN', label: 'Almacén', icon: 'inventory' },
    { value: 'FINANZAS', label: 'Finanzas', icon: 'attach_money' },
    { value: 'CALIDAD', label: 'Calidad', icon: 'verified' },
    { value: 'SOPORTE', label: 'Soporte', icon: 'headset_mic' },
    { value: 'OTROS', label: 'Otros', icon: 'more_horiz' }
  ];
  
  estadosDisponibles = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' }
  ];

  constructor(
    private departamentoService: DepartamentoService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.cargarDepartamentos();
  }
  
  crearDepartamentoVacio(): Departamento {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      responsableEmail: '',
      responsableNombre: '',
      tipo: 'ATENCION_CLIENTE',
      estado: 'ACTIVO',
      rolesPermitidos: ['FUNCIONARIO'],
      configuracionFlujo: {
        tiempoMaximoHoras: 48,
        requiereAprobacion: false,
        departamentosSiguientes: [],
        accionesPermitidas: ['PROCESAR', 'DERIVAR', 'CONSULTAR'],
        formulario: { titulo: '', campos: [], instrucciones: '' }
      },
      metricas: {
        tramitesAtendidos: 0,
        tramitesPendientes: 0,
        tramitesEnMora: 0,
        tiempoPromedioProcesamiento: 0,
        eficiencia: 0,
        ultimaActualizacion: new Date()
      },
      creadoEn: new Date(),
      actualizadoEn: new Date()
    };
  }
  
  cargarDepartamentos() {
    this.loading = true;
    this.departamentoService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Error al cargar departamentos');
      }
    });
  }
  
  aplicarFiltros() {
    let resultado = [...this.departamentos];
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(d => d.estado === this.filtroEstado);
    }
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(d => 
        d.nombre.toLowerCase().includes(busqueda) ||
        d.responsableNombre?.toLowerCase().includes(busqueda)
      );
    }
    this.departamentosFiltrados = resultado;
  }
  
  abrirModalNuevo() {
    this.esEdicion = false;
    this.modalTitulo = 'Nuevo Departamento';
    this.departamentoSeleccionado = this.crearDepartamentoVacio();
    this.mostrarModal = true;
  }
  
  abrirModalEditar(departamento: Departamento) {
    this.esEdicion = true;
    this.modalTitulo = `Editar Departamento`;
    this.departamentoSeleccionado = { ...departamento };
    this.mostrarModal = true;
  }
  
  guardarDepartamento() {
    if (!this.departamentoSeleccionado.nombre?.trim()) {
      alert('El nombre del departamento es requerido');
      return;
    }
    if (!this.departamentoSeleccionado.responsableNombre?.trim()) {
      alert('El nombre del responsable es requerido');
      return;
    }
    if (!this.departamentoSeleccionado.responsableEmail?.includes('@')) {
      alert('Ingrese un email válido');
      return;
    }
    
    this.loading = true;
    
    if (this.esEdicion && this.departamentoSeleccionado.id) {
      this.departamentoService.updateDepartamento(this.departamentoSeleccionado.id, this.departamentoSeleccionado).subscribe({
        next: () => { this.cerrarModal(); this.cargarDepartamentos(); this.loading = false; },
        error: (err) => { this.loading = false; alert('Error al actualizar'); }
      });
    } else {
      this.departamentoService.createDepartamento(this.departamentoSeleccionado).subscribe({
        next: () => { this.cerrarModal(); this.cargarDepartamentos(); this.loading = false; },
        error: (err) => { this.loading = false; alert('Error al crear'); }
      });
    }
  }
  
  confirmarEliminar(departamento: Departamento) {
    this.departamentoAEliminar = departamento;
    this.mostrarModalEliminar = true;
  }
  
  eliminarDepartamento() {
    if (this.departamentoAEliminar?.id) {
      this.loading = true;
      this.departamentoService.deleteDepartamento(this.departamentoAEliminar.id).subscribe({
        next: () => {
          this.mostrarModalEliminar = false;
          this.cargarDepartamentos();
          this.loading = false;
        },
        error: (err) => { this.loading = false; alert('Error al eliminar'); }
      });
    }
  }
  
  cerrarModal() {
    this.mostrarModal = false;
    this.departamentoSeleccionado = this.crearDepartamentoVacio();
  }
  
  cerrarModalEliminar() { this.mostrarModalEliminar = false; this.departamentoAEliminar = null; }
  
  getTipoIcon(tipo: string): string { return this.tiposDepartamento.find(t => t.value === tipo)?.icon || 'business'; }
  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'ACTIVO': return 'estado-activo';
      case 'INACTIVO': return 'estado-inactivo';
      case 'MANTENIMIENTO': return 'estado-mantenimiento';
      default: return '';
    }
  }
  getEstadoIcon(estado: string): string {
    switch(estado) {
      case 'ACTIVO': return 'check_circle';
      case 'INACTIVO': return 'cancel';
      case 'MANTENIMIENTO': return 'construction';
      default: return 'help';
    }
  }
  getEstadoLabel(estado: string): string { return this.estadosDisponibles.find(e => e.value === estado)?.label || estado; }
}