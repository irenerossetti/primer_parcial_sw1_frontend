import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../core/services/usuario.service';
import { DepartamentoService } from '../../core/services/departamento.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="usuarios-container">
      <div class="page-header">
        <div class="header-title">
          <span class="material-icons">people</span>
          <h1>Usuarios del Sistema</h1>
        </div>
        <button class="btn-primary" (click)="abrirModalNuevo()">
          <span class="material-icons">add</span>
          Nuevo Usuario
        </button>
      </div>

      <div class="filtros-bar">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input type="text" [(ngModel)]="filtroBusqueda" (input)="aplicarFiltros()" placeholder="Buscar por nombre o email..." class="search-input">
        </div>
        <div class="filter-group">
          <label>Rol:</label>
          <select [(ngModel)]="filtroRol" (change)="aplicarFiltros()" class="filter-select">
            <option value="todos">Todos</option>
            <option value="ADMIN">Administrador</option>
            <option value="FUNCIONARIO">Funcionario</option>
            <option value="CLIENTE">Cliente</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="loading"><div class="spinner"></div><p>Cargando usuarios...</p></div>

      <div *ngIf="!loading" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of usuariosFiltrados">
              <td>{{ user.nombre }}</td>
              <td>{{ user.email }}</td>
              <td><span class="badge badge-{{ user.rol }}">{{ getRolLabel(user.rol) }}</span></td>
              <td>{{ user.departamentoNombre || 'Sin asignar' }}</td>
              <td><span class="badge" [class.activo]="user.activo">{{ user.activo ? 'Activo' : 'Inactivo' }}</span></td>
              <td>
                <button class="btn-icon" (click)="abrirModalEditar(user)" title="Editar">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-icon btn-danger" (click)="confirmarEliminar(user)" title="Eliminar">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="usuariosFiltrados.length === 0" class="sin-resultados">
          <span class="material-icons">inbox</span>
          <p>No hay usuarios registrados</p>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal-overlay" *ngIf="mostrarModal" (click)="cerrarModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><span class="material-icons">{{ esEdicion ? 'edit' : 'person_add' }}</span>{{ modalTitulo }}</h3>
          <button class="btn-close" (click)="cerrarModal()"><span class="material-icons">close</span></button>
        </div>
        
        <div class="modal-body">
          <form (ngSubmit)="guardarUsuario()">
            <div class="form-group">
              <label><span class="material-icons">person</span>Nombre Completo *</label>
              <input type="text" [(ngModel)]="usuarioSeleccionado.nombre" name="nombre" class="form-control" placeholder="Juan Pérez" required>
            </div>
            
            <div class="form-group">
              <label><span class="material-icons">email</span>Email *</label>
              <input type="email" [(ngModel)]="usuarioSeleccionado.email" name="email" class="form-control" placeholder="usuario@ejemplo.com" required>
            </div>
            
            <div class="form-group" *ngIf="!esEdicion">
              <label><span class="material-icons">lock</span>Contraseña *</label>
              <input type="password" [(ngModel)]="usuarioSeleccionado.password" name="password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <div class="form-group">
              <label><span class="material-icons">badge</span>Rol *</label>
              <select [(ngModel)]="usuarioSeleccionado.rol" name="rol" class="form-control" required>
                <option value="ADMIN">Administrador</option>
                <option value="FUNCIONARIO">Funcionario</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </div>
            
            <div class="form-group" *ngIf="usuarioSeleccionado.rol === 'FUNCIONARIO'">
              <label><span class="material-icons">business</span>Departamento</label>
              <select [(ngModel)]="usuarioSeleccionado.departamentoId" name="departamentoId" class="form-control">
                <option value="">Sin asignar</option>
                <option *ngFor="let depto of departamentos" [value]="depto.id">{{ depto.nombre }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="usuarioSeleccionado.activo" name="activo">
                <span>Usuario activo</span>
              </label>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancelar" (click)="cerrarModal()">
            <span class="material-icons">cancel</span>Cancelar
          </button>
          <button class="btn-guardar" (click)="guardarUsuario()" [disabled]="loading">
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
          <p>¿Está seguro que desea eliminar el usuario?</p>
          <p class="warning-text"><strong>{{ usuarioAEliminar?.nombre }}</strong></p>
          <p class="warning-message">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" (click)="cerrarModalEliminar()">Cancelar</button>
          <button class="btn-eliminar-confirm" (click)="eliminarUsuario()">
            <span class="material-icons">delete</span>Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .usuarios-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #f5f7fa; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .header-title { display: flex; align-items: center; gap: 12px; }
    .header-title h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .header-title .material-icons { font-size: 32px; color: #2196f3; }
    .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; background: #2196f3; color: white; transition: all 0.3s; }
    .btn-primary:hover { background: #1976d2; transform: translateY(-2px); }
    
    .filtros-bar { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 25px; flex-wrap: wrap; }
    .search-box { flex: 1; display: flex; align-items: center; background: white; border-radius: 8px; padding: 0 12px; border: 1px solid #ddd; }
    .search-box .material-icons { color: #999; }
    .search-input { flex: 1; border: none; padding: 12px; font-size: 14px; outline: none; }
    .filter-group { display: flex; align-items: center; gap: 10px; background: white; padding: 6px 15px; border-radius: 8px; border: 1px solid #ddd; }
    .filter-select { border: none; padding: 8px; font-size: 14px; outline: none; }
    
    .loading { text-align: center; padding: 60px; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f9f9f9; }
    th { padding: 16px; text-align: left; font-weight: 600; color: #333; font-size: 14px; border-bottom: 2px solid #e0e0e0; }
    td { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #666; }
    tr:hover { background: #f9f9f9; }
    
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
    .badge.activo { background: #e8f5e9; color: #2e7d32; }
    .badge-ADMIN { background: #9c27b0; color: white; }
    .badge-FUNCIONARIO { background: #2196f3; color: white; }
    .badge-CLIENTE { background: #ff9800; color: white; }
    
    .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.3s; }
    .btn-icon:hover { background: #e3f2fd; }
    .btn-icon.btn-danger:hover { background: #ffebee; }
    .btn-icon .material-icons { font-size: 20px; color: #666; }
    .btn-icon.btn-danger .material-icons { color: #f44336; }
    
    .sin-resultados { text-align: center; padding: 60px; color: #999; }
    .sin-resultados .material-icons { font-size: 60px; margin-bottom: 15px; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 500px; max-width: 95%; max-height: 90vh; overflow-y: auto; }
    .modal-small { width: 450px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee; }
    .modal-header h3 { display: flex; align-items: center; gap: 10px; margin: 0; color: #2c3e50; }
    .btn-close { background: none; border: none; cursor: pointer; color: #999; padding: 4px; }
    .modal-body { padding: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 500; color: #555; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #eee; }
    .btn-cancelar, .btn-guardar, .btn-eliminar-confirm { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-cancelar { background: #e0e0e0; color: #666; }
    .btn-guardar { background: #4caf50; color: white; }
    .btn-eliminar-confirm { background: #f44336; color: white; }
    .warning-icon { text-align: center; font-size: 48px; margin-bottom: 15px; }
    .warning-text { text-align: center; font-size: 16px; margin: 15px 0; color: #f44336; }
    .warning-message { text-align: center; font-size: 12px; color: #999; }
    .spinner-small { border: 2px solid #f3f3f3; border-top: 2px solid #fff; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  departamentos: any[] = [];
  loading = false;
  filtroRol = 'todos';
  filtroBusqueda = '';
  
  mostrarModal = false;
  modalTitulo = '';
  esEdicion = false;
  usuarioSeleccionado: Usuario = this.crearUsuarioVacio();
  
  mostrarModalEliminar = false;
  usuarioAEliminar: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private departamentoService: DepartamentoService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarDepartamentos();
  }

  crearUsuarioVacio(): Usuario {
    return {
      nombre: '',
      email: '',
      password: '',
      rol: 'CLIENTE',
      activo: true
    };
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.getAllUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        alert('Error al cargar usuarios');
      }
    });
  }

  cargarDepartamentos() {
    this.departamentoService.getDepartamentos().subscribe({
      next: (data: any[]) => {
        this.departamentos = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  aplicarFiltros() {
    let resultado = [...this.usuarios];
    if (this.filtroRol !== 'todos') {
      resultado = resultado.filter(u => u.rol === this.filtroRol);
    }
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(u => 
        u.nombre.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda)
      );
    }
    this.usuariosFiltrados = resultado;
  }

  abrirModalNuevo() {
    this.esEdicion = false;
    this.modalTitulo = 'Nuevo Usuario';
    this.usuarioSeleccionado = this.crearUsuarioVacio();
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario) {
    this.esEdicion = true;
    this.modalTitulo = 'Editar Usuario';
    this.usuarioSeleccionado = { ...usuario };
    this.mostrarModal = true;
  }

  guardarUsuario() {
    if (!this.usuarioSeleccionado.nombre?.trim() || !this.usuarioSeleccionado.email?.trim()) {
      alert('Nombre y email son requeridos');
      return;
    }

    this.loading = true;

    if (this.esEdicion && this.usuarioSeleccionado.id) {
      this.usuarioService.updateUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe({
        next: () => { this.cerrarModal(); this.cargarUsuarios(); this.loading = false; },
        error: (err: any) => { this.loading = false; alert('Error al actualizar'); }
      });
    } else {
      this.usuarioService.createUsuario(this.usuarioSeleccionado).subscribe({
        next: () => { this.cerrarModal(); this.cargarUsuarios(); this.loading = false; },
        error: (err: any) => { this.loading = false; alert('Error al crear'); }
      });
    }
  }

  confirmarEliminar(usuario: Usuario) {
    this.usuarioAEliminar = usuario;
    this.mostrarModalEliminar = true;
  }

  eliminarUsuario() {
    if (this.usuarioAEliminar?.id) {
      this.loading = true;
      this.usuarioService.deleteUsuario(this.usuarioAEliminar.id).subscribe({
        next: () => {
          this.mostrarModalEliminar = false;
          this.cargarUsuarios();
          this.loading = false;
        },
        error: (err: any) => { this.loading = false; alert('Error al eliminar'); }
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = this.crearUsuarioVacio();
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.usuarioAEliminar = null;
  }

  getRolLabel(rol: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'FUNCIONARIO': 'Funcionario',
      'CLIENTE': 'Cliente'
    };
    return labels[rol] || rol;
  }
}