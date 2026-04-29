import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramiteService, Tramite, TramiteEjecucion } from '../../core/services/tramite.service';
import { DepartamentoService, Departamento } from '../../core/services/departamento.service';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface RutaSiguiente {
  nodoId: string;
  nombre?: string;
  departamentoId?: string;
}

interface EstadoEjecucionExtendido extends TramiteEjecucion {
  nodosSiguientes?: RutaSiguiente[];
}

interface CuelloBotellaDepartamento {
  departamento: string;
  enCola: number;
  promedioHoras: number;
  maxHoras: number;
  nivel: 'normal' | 'alerta' | 'critico';
}

type TendenciaCuellos = 'sube' | 'baja' | 'igual';

@Component({
  selector: 'app-funcionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="funcionario-container">
      <div class="header">
        <h1>
          <span class="material-icons">assignment</span>
          Panel de Funcionario
        </h1>
        <div class="user-info">
          <span class="material-icons">account_circle</span>
          <div class="user-details">
            <span class="user-name">{{ nombreUsuario }}</span>
            <div class="user-depto">
              <span class="material-icons">business</span>
              <span>{{ departamentoFuncionario }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span class="material-icons">logout</span> Salir
          </button>
        </div>
      </div>

      <div class="filtros-bar">
        <div class="filtros">
          <label>Filtrar por estado:</label>
          <select [(ngModel)]="filtroEstado" (change)="aplicarFiltro()">
            <option value="todos">Todos los estados</option>
            <option value="NUEVO">Nuevos</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_MORA">En Mora</option>
            <option value="COMPLETADO">Completados</option>
            <option value="RECHAZADO">Rechazados</option>
          </select>
        </div>
        <button class="btn-refresh" (click)="cargarTramites()" [disabled]="loading">
          <span class="material-icons">refresh</span> Actualizar
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card rojo"><div class="stat-icon"><span class="material-icons">fiber_new</span></div><div class="stat-info"><h3>Nuevos</h3><p>{{ contarPorEstado('NUEVO') }}</p></div></div>
        <div class="stat-card azul"><div class="stat-icon"><span class="material-icons">autorenew</span></div><div class="stat-info"><h3>En Proceso</h3><p>{{ contarPorEstado('EN_PROCESO') }}</p></div></div>
        <div class="stat-card naranja"><div class="stat-icon"><span class="material-icons">hourglass_empty</span></div><div class="stat-info"><h3>Pendiente</h3><p>{{ contarPorEstado('PENDIENTE') }}</p></div></div>
        <div class="stat-card morado"><div class="stat-icon"><span class="material-icons">warning</span></div><div class="stat-info"><h3>En Mora</h3><p>{{ contarPorEstado('EN_MORA') }}</p></div></div>
        <div class="stat-card verde"><div class="stat-icon"><span class="material-icons">check_circle</span></div><div class="stat-info"><h3>Completados</h3><p>{{ contarPorEstado('COMPLETADO') }}</p></div></div>
        <div class="stat-card gris"><div class="stat-icon"><span class="material-icons">cancel</span></div><div class="stat-info"><h3>Rechazados</h3><p>{{ contarPorEstado('RECHAZADO') }}</p></div></div>
      </div>

      <div class="bottleneck-widget" *ngIf="!loading">
        <div class="widget-header">
          <h3>
            <span class="material-icons">insights</span>
            Cuellos de Botella por Departamento
          </h3>
          <div class="widget-statuses">
            <span class="global-status" [class]="'status-' + getEstadoOperacion().nivel">
              Estado general: {{ getEstadoOperacion().texto }}
            </span>
            <span class="trend-badge" [class]="'trend-' + tendenciaCuellos">
              <span class="material-icons">{{ getTendenciaIcono() }}</span>
              Tendencia: {{ getTendenciaTexto() }}
            </span>
          </div>
          <div class="widget-actions">
            <button class="btn-widget" (click)="actualizarSoloMetricas()">
              <span class="material-icons">query_stats</span>
              Actualizar metricas (local)
            </button>
            <button class="btn-widget" (click)="sincronizarConServidor()" [disabled]="loading">
              <span class="material-icons">sync</span>
              Sincronizar con servidor
            </button>
            <button class="btn-widget" (click)="toggleSoloCriticos()">
              <span class="material-icons">filter_alt</span>
              {{ mostrarSoloCriticos ? 'Ver todos' : 'Solo criticos' }}
            </button>
            <button class="btn-widget" (click)="exportarCuellosBotellaCSV()" [disabled]="cuellosBotella.length === 0">
              <span class="material-icons">download</span>
              Exportar CSV
            </button>
          </div>
        </div>
        <span class="widget-subtitle">Cola actual y tiempo promedio en estado</span>
        <span class="widget-subtitle" *ngIf="ultimaActualizacionCuellos">Ultima actualizacion: {{ ultimaActualizacionCuellos | date:'dd/MM/yyyy HH:mm:ss' }}</span>

        <div *ngIf="cuellosBotellaVisibles.length === 0" class="widget-empty">
          No hay trámites en cola en este momento.
        </div>

        <div class="bottleneck-grid" *ngIf="cuellosBotellaVisibles.length > 0">
          <div class="bottleneck-card" *ngFor="let item of cuellosBotellaVisibles" [class]="'nivel-' + item.nivel">
            <div class="bottleneck-title-row">
              <span class="depto">{{ item.departamento }}</span>
              <span class="nivel-badge" [class]="'nivel-' + item.nivel">{{ getNivelTexto(item.nivel) }}</span>
            </div>
            <div class="bottleneck-metric"><strong>En cola:</strong> {{ item.enCola }}</div>
            <div class="bottleneck-metric"><strong>Promedio:</strong> {{ item.promedioHoras }} h</div>
            <div class="bottleneck-metric"><strong>Mayor espera:</strong> {{ item.maxHoras }} h</div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading"><div class="spinner"></div><p>Cargando trámites...</p></div>

      <div *ngIf="!loading" class="tramites-lista">
        <div *ngFor="let tramite of tramitesFiltrados" class="tramite-card" [class]="getColorClass(tramite)">
          <div class="card-header">
            <div class="codigo"><span class="material-icons">description</span>{{ tramite.codigo }}</div>
            <div class="estado-badge" [class]="'estado-' + (tramite.estado | lowercase)">
              <span class="material-icons">{{ getEstadoIcon(tramite.estado) }}</span>{{ getEstadoTexto(tramite.estado) }}
            </div>
          </div>
          <div class="card-body">
            <div class="info-row"><span class="material-icons">person</span><span class="label">Cliente:</span><span class="value">{{ tramite.clienteId }}</span></div>
            <div class="info-row"><span class="material-icons">business</span><span class="label">Departamento:</span><span class="value">{{ tramite.departamentoActual || 'No asignado' }}</span></div>
            <div class="info-row"><span class="material-icons">event</span><span class="label">Creado:</span><span class="value">{{ tramite.creadoEn | date:'dd/MM/yyyy HH:mm' }}</span></div>
          </div>
          <div class="card-footer">
            <button class="btn-procesar" (click)="abrirModal(tramite)" [disabled]="tramite.estado === 'COMPLETADO' || tramite.estado === 'RECHAZADO'">
              <span class="material-icons">play_arrow</span> Procesar
            </button>
            <button class="btn-pdf" (click)="descargarPDF(tramite)" *ngIf="tramite.estado === 'COMPLETADO'">
              <span class="material-icons">picture_as_pdf</span> Descargar PDF
            </button>
          </div>
        </div>
        <div *ngIf="tramitesFiltrados.length === 0" class="sin-tramites">
          <span class="material-icons">inbox</span>
          <p>No hay trámites para procesar</p>
          <p class="sin-tramites-detalle" *ngIf="!departamentoFuncionario || departamentoFuncionario === 'Sin departamento asignado'">
            ⚠️ Tu usuario no tiene departamento asignado. Contacta al administrador.
          </p>
          <p class="sin-tramites-detalle" *ngIf="departamentoFuncionario && departamentoFuncionario !== 'Sin departamento asignado'">
            📋 Los trámites aparecerán aquí cuando lleguen a tu departamento: <strong>{{ departamentoFuncionario }}</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="mostrarModal" (click)="cerrarModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3><span class="material-icons">play_circle</span>Procesar Trámite</h3><button class="btn-close" (click)="cerrarModal()"><span class="material-icons">close</span></button></div>
        <div class="modal-body">
          <div class="info-section"><p><strong>Código:</strong> {{ tramiteSeleccionado?.codigo }}</p><p><strong>Cliente:</strong> {{ tramiteSeleccionado?.clienteId }}</p><p><strong>Estado actual:</strong> <span class="estado-actual">{{ getEstadoTexto(tramiteSeleccionado?.estado || '') }}</span></p><p><strong>Departamento actual:</strong> {{ tramiteSeleccionado?.departamentoActual || 'No asignado' }}</p></div>
          <div class="form-group"><label><span class="material-icons">autorenew</span>Nuevo estado:</label><select [(ngModel)]="nuevoEstado" class="form-control"><option value="EN_PROCESO">En Proceso</option><option value="PENDIENTE">Pendiente</option><option value="EN_MORA">En Mora</option><option value="COMPLETADO">Completado</option><option value="RECHAZADO">Rechazado</option></select></div>
          <div class="form-group" *ngIf="rutasSiguientes.length > 1">
            <label><span class="material-icons">alt_route</span>Ruta siguiente:</label>
            <select [(ngModel)]="siguienteNodoId" (change)="actualizarDepartamentoDesdeRuta()" class="form-control">
              <option value="" disabled>Seleccione una ruta</option>
              <option *ngFor="let ruta of rutasSiguientes" [value]="ruta.nodoId">
                {{ ruta.nombre || ruta.nodoId }}
                {{ ruta.departamentoId ? (' (' + ruta.departamentoId + ')') : '' }}
              </option>
            </select>
          </div>
          <div class="form-group"><label><span class="material-icons">business</span>Departamento destino:</label><select [(ngModel)]="departamentoDestino" class="form-control"><option value="" disabled>Seleccione un departamento</option><option *ngFor="let depto of departamentos" [value]="depto.nombre">{{ depto.nombre }}</option></select></div>
          <div class="form-group" *ngIf="camposFormularioRequeridos.length > 0">
            <label><span class="material-icons">list_alt</span>Formulario del area</label>
            <div class="campo-dinamico" *ngFor="let campo of camposFormularioRequeridos">
              <label>{{ getLabelCampo(campo) }} *</label>
              <input
                type="text"
                class="form-control"
                [name]="'campo_' + campo"
                [(ngModel)]="datosFormularioDinamico[campo]"
                [placeholder]="'Ingrese ' + getLabelCampo(campo).toLowerCase()"
              />
            </div>
          </div>
          <div class="form-group"><label><span class="material-icons">edit_note</span>Observaciones:</label><textarea [(ngModel)]="observacion" rows="3" class="form-control" placeholder="Registre observaciones..."></textarea></div>
        </div>
        <div class="modal-footer"><button class="btn-cancelar" (click)="cerrarModal()">Cancelar</button><button class="btn-confirmar" (click)="confirmarProcesar()" [disabled]="loading">Guardar</button></div>
      </div>
    </div>
  `,
  styles: [`
    .funcionario-container { padding: 24px; max-width: 1400px; margin: 0 auto; min-height: 100vh; background: #f5f7fa; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
    .header h1 { display: flex; align-items: center; gap: 12px; color: #2c3e50; font-size: 1.8rem; margin: 0; }
    .user-info { display: flex; align-items: center; gap: 15px; background: white; padding: 8px 20px; border-radius: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .user-details { display: flex; flex-direction: column; margin-left: 8px; }
    .user-name { font-weight: 600; color: #2c3e50; font-size: 14px; }
    .user-depto { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #666; margin-top: 2px; }
    .user-depto .material-icons { font-size: 12px; }
    .btn-logout { background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .filtros-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 20px; flex-wrap: wrap; }
    .filtros { display: flex; align-items: center; gap: 15px; background: white; padding: 10px 20px; border-radius: 10px; }
    .filtros select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; }
    .btn-refresh { background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card.rojo { border-left: 4px solid #c62828; } .stat-card.azul { border-left: 4px solid #2196f3; } .stat-card.naranja { border-left: 4px solid #ff9800; }
    .stat-card.morado { border-left: 4px solid #9c27b0; } .stat-card.verde { border-left: 4px solid #2e7d32; } .stat-card.gris { border-left: 4px solid #757575; }
    .stat-icon .material-icons { font-size: 28px; }
    .stat-card.rojo .stat-icon { color: #c62828; } .stat-card.azul .stat-icon { color: #2196f3; } .stat-card.naranja .stat-icon { color: #ff9800; }
    .stat-card.morado .stat-icon { color: #9c27b0; } .stat-card.verde .stat-icon { color: #2e7d32; }
    .stat-info h3 { margin: 0; font-size: 12px; color: #666; } .stat-info p { margin: 5px 0 0; font-size: 24px; font-weight: bold; }
    .bottleneck-widget { background: white; border-radius: 12px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px; }
    .widget-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .widget-header h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1rem; color: #23313f; }
    .global-status { font-size: 0.82rem; font-weight: 700; border-radius: 14px; padding: 4px 10px; }
    .widget-statuses { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .trend-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.82rem; font-weight: 700; border-radius: 14px; padding: 4px 10px; }
    .trend-badge .material-icons { font-size: 14px; }
    .status-normal { background: #eefbf1; color: #1f6a35; border: 1px solid #b8e6c1; }
    .status-alerta { background: #fff8ea; color: #8a5b00; border: 1px solid #ffe1a8; }
    .status-critico { background: #fff0f0; color: #8d1f1f; border: 1px solid #f7b2b2; }
    .trend-sube { background: #fff0f0; color: #8d1f1f; border: 1px solid #f7b2b2; }
    .trend-baja { background: #eefbf1; color: #1f6a35; border: 1px solid #b8e6c1; }
    .trend-igual { background: #f2f5f8; color: #4b5a69; border: 1px solid #d2dbe4; }
    .widget-actions { display: flex; gap: 8px; }
    .btn-widget { border: 1px solid #c9d4df; background: #f8fafc; color: #334155; border-radius: 8px; padding: 6px 10px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .btn-widget .material-icons { font-size: 16px; }
    .btn-widget:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-widget:hover:not(:disabled) { background: #eef2f7; }
    .widget-subtitle { color: #6b7785; font-size: 0.85rem; }
    .widget-empty { color: #6b7785; font-size: 0.9rem; padding: 8px 0; }
    .bottleneck-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .bottleneck-card { border: 1px solid #dde3ea; border-radius: 10px; padding: 12px; background: #f8fafc; }
    .bottleneck-title-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
    .depto { font-weight: 600; color: #253243; }
    .nivel-badge { padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .bottleneck-metric { font-size: 0.85rem; color: #4f5e6d; margin-bottom: 4px; }
    .nivel-normal { border-color: #b8e6c1; background: #eefbf1; color: #1f6a35; }
    .nivel-alerta { border-color: #ffe1a8; background: #fff8ea; color: #8a5b00; }
    .nivel-critico { border-color: #f7b2b2; background: #fff0f0; color: #8d1f1f; }
    .loading { text-align: center; padding: 60px; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .tramites-lista { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .tramite-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; }
    .tramite-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .tramite-card.rojo { border-left: 4px solid #c62828; background: linear-gradient(135deg, #fff 0%, #ffebee 100%); }
    .tramite-card.azul { border-left: 4px solid #2196f3; background: linear-gradient(135deg, #fff 0%, #e3f2fd 100%); }
    .tramite-card.naranja { border-left: 4px solid #ff9800; background: linear-gradient(135deg, #fff 0%, #fff3e0 100%); }
    .tramite-card.morado { border-left: 4px solid #9c27b0; background: linear-gradient(135deg, #fff 0%, #f3e5f5 100%); }
    .tramite-card.verde { border-left: 4px solid #2e7d32; background: linear-gradient(135deg, #fff 0%, #e8f5e9 100%); }
    .tramite-card.gris { border-left: 4px solid #757575; background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .codigo { display: flex; align-items: center; gap: 8px; font-weight: bold; }
    .estado-badge { display: flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .estado-nuevo { background: #ffebee; color: #c62828; } .estado-en_proceso { background: #e3f2fd; color: #2196f3; }
    .estado-pendiente { background: #fff3e0; color: #ff9800; } .estado-en_mora { background: #f3e5f5; color: #9c27b0; }
    .estado-completado { background: #e8f5e9; color: #2e7d32; } .estado-rechazado { background: #f5f5f5; color: #757575; }
    .card-body { margin-bottom: 15px; } .info-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; font-size: 13px; }
    .info-row .material-icons { font-size: 16px; color: #666; } .info-row .label { min-width: 90px; color: #666; font-weight: 500; }
    .info-row .value { color: #333; flex: 1; }
    .card-footer { text-align: right; padding-top: 10px; border-top: 1px solid #eee; }
    .btn-procesar { background: #2196f3; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .btn-procesar:disabled { background: #b0bec5; cursor: not-allowed; }
    .sin-tramites { text-align: center; padding: 60px 20px; color: #757575; }
    .sin-tramites-detalle { font-size: 0.9rem; color: #d32f2f; margin-top: 10px; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 500px; max-width: 95%; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee; }
    .modal-header h3 { display: flex; align-items: center; gap: 10px; margin: 0; }
    .btn-close { background: none; border: none; cursor: pointer; color: #999; }
    .modal-body { padding: 20px; }
    .info-section { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .info-section p { margin: 8px 0; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 500; }
    .campo-dinamico { margin-bottom: 12px; }
    .campo-dinamico label { display: block; margin-bottom: 6px; font-size: 0.85rem; color: #4f5e6d; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: #2196f3; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #eee; }
    .btn-cancelar { background: #e0e0e0; color: #666; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-confirmar { background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    @media (max-width: 768px) { 
      .tramites-lista { grid-template-columns: 1fr; } 
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .header { flex-direction: column; }
      .user-info { width: 100%; justify-content: space-between; }
      .filtros-bar { flex-direction: column; }
      .filtros { width: 100%; }
      .bottleneck-grid { grid-template-columns: 1fr; }
      .modal { width: 95vw; }
      .btn-procesar { width: 100%; }
      .card-footer { display: flex; gap: 8px; flex-wrap: wrap; }
    }
    @media (max-width: 480px) {
      .funcionario-container { padding: 12px; }
      .header h1 { font-size: 1.3rem; }
      .stats-grid { grid-template-columns: 1fr; }
      .widget-header { flex-direction: column; align-items: flex-start; }
      .widget-actions { flex-wrap: wrap; }
      .btn-widget { flex: 1 1 calc(50% - 4px); }
      .modal-body { padding: 15px; }
      .form-control { font-size: 16px; }
    }
  `]
})
export class FuncionarioComponent implements OnInit, OnDestroy {
  
  tramites: Tramite[] = [];
  tramitesFiltrados: Tramite[] = [];
  filtroEstado: string = 'todos';
  filtroBusqueda: string = '';
  departamentos: Departamento[] = [];
  mostrarModal = false;
  mostrarModalDetalle = false;
  tramiteSeleccionado: Tramite | null = null;
  tramiteDetalle: Tramite | null = null;
  rutasSiguientes: RutaSiguiente[] = [];
  camposFormularioRequeridos: string[] = [];
  datosFormularioDinamico: Record<string, string> = {};
  cuellosBotella: CuelloBotellaDepartamento[] = [];
  ultimaActualizacionCuellos: Date | null = null;
  mostrarSoloCriticos: boolean = false;
  tendenciaCuellos: TendenciaCuellos = 'igual';
  siguienteNodoId: string = '';
  nuevoEstado: string = 'EN_PROCESO';
  departamentoDestino: string = '';
  observacion: string = '';
  loading: boolean = false;
  nombreUsuario: string = 'Funcionario';
  emailUsuario: string = ''; 
  departamentoFuncionario: string = 'Cargando...';
  
  // WebSocket subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private tramiteService: TramiteService,
    private departamentoService: DepartamentoService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarTramites();
    this.cargarDepartamentos();
    this.setupWebSocketListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Configura los listeners de WebSocket para actualizaciones en tiempo real
   */
  private setupWebSocketListeners(): void {
    // Escuchar cuando hay cambios en cuellos de botella
    const cuelloBottellaSub = this.webSocketService.cuellosBottellaActualizados$.subscribe(() => {
      console.log('Cuellos de botella actualizados, recargando...');
      // Recargar trámites para ver el estado actualizado
      setTimeout(() => this.cargarTramites(), 500);
    });

    // Escuchar cuando se actualiza un trámite
    const tramiteActualizadoSub = this.webSocketService.tramiteActualizado$.subscribe((notification: any) => {
      if (notification) {
        console.log('Trámite actualizado en tiempo real:', notification);
        // El trámite se actualizará en la siguiente carga
      }
    });

    this.subscriptions.push(cuelloBottellaSub, tramiteActualizadoSub);
  }
  
  cargarDatosUsuario() {
    this.nombreUsuario = this.authService.getNombre() || 'Funcionario';
    this.emailUsuario = this.authService.getEmail() || '';
    this.departamentoFuncionario = this.authService.getDepartamentoNombre() || 'Sin departamento asignado';
  }
  
  cargarTramites() {
    this.loading = true;
    console.log('Cargando trámites...');
    
    this.tramiteService.getTramites().subscribe({
      next: (data) => {
        console.log('Trámites recibidos del backend:', data);
        console.log('Cantidad de trámites:', data.length);
        this.tramites = data;
        this.tramitesFiltrados = data;
        this.calcularCuellosBotella(data);
        this.loading = false;
        
        // Mostrar estadísticas
        console.log('Estadísticas:', {
          NUEVO: this.contarPorEstado('NUEVO'),
          EN_PROCESO: this.contarPorEstado('EN_PROCESO'),
          COMPLETADO: this.contarPorEstado('COMPLETADO'),
          RECHAZADO: this.contarPorEstado('RECHAZADO')
        });
      },
      error: (err) => {
        console.error('Error al cargar trámites:', err);
        this.loading = false;
        alert('Error al cargar trámites: ' + (err.error?.message || err.message));
      }
    });
  }
  
  cargarDepartamentos() {
    this.departamentoService.getDepartamentosActivos().subscribe({
      next: (data: Departamento[]) => {
        if (data.length > 0) {
          this.departamentos = data;
          return;
        }

        this.departamentoService.getDepartamentos().subscribe({
          next: (todos: Departamento[]) => {
            this.departamentos = todos;
          },
          error: (err) => console.error('Error cargando todos los departamentos:', err)
        });
      },
      error: (err) => console.error('Error cargando departamentos:', err)
    });
  }
  
  aplicarFiltro() {
    let resultado = [...this.tramites];
    
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(t => t.estado === this.filtroEstado);
    }
    
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(t => 
        t.codigo.toLowerCase().includes(busqueda) ||
        t.clienteId.toLowerCase().includes(busqueda)
      );
    }
    
    this.tramitesFiltrados = resultado;
    console.log('Filtro aplicado:', this.filtroEstado, 'Resultados:', this.tramitesFiltrados.length);
  }
  
  contarPorEstado(estado: string): number {
    return this.tramites.filter(t => t.estado === estado).length;
  }

  calcularCuellosBotella(tramites: Tramite[]) {
    const totalEnColaAnterior = this.cuellosBotella.reduce((acc, item) => acc + item.enCola, 0);
    const promedioAnterior = this.cuellosBotella.length > 0
      ? Math.round(this.cuellosBotella.reduce((acc, item) => acc + item.promedioHoras, 0) / this.cuellosBotella.length)
      : 0;

    const activos = tramites.filter(
      (t) => t.estado !== 'COMPLETADO' && t.estado !== 'RECHAZADO'
    );

    const ahora = new Date().getTime();
    const acumulado = new Map<string, { enCola: number; horasTotal: number; maxHoras: number }>();

    for (const tramite of activos) {
      const depto = (tramite.departamentoActual && tramite.departamentoActual.trim()) || 'No asignado';
      const fecha = new Date(tramite.actualizadoEn).getTime();
      const horas = Math.max(0, Math.floor((ahora - fecha) / (1000 * 60 * 60)));

      if (!acumulado.has(depto)) {
        acumulado.set(depto, { enCola: 0, horasTotal: 0, maxHoras: 0 });
      }

      const item = acumulado.get(depto)!;
      item.enCola += 1;
      item.horasTotal += horas;
      item.maxHoras = Math.max(item.maxHoras, horas);
    }

    const nuevosCuellos = Array.from(acumulado.entries())
      .map(([departamento, item]) => {
        const promedioHoras = item.enCola > 0 ? Math.round(item.horasTotal / item.enCola) : 0;
        let nivel: CuelloBotellaDepartamento['nivel'] = 'normal';

        if (item.enCola >= 5 || promedioHoras >= 72) {
          nivel = 'critico';
        } else if (item.enCola >= 3 || promedioHoras >= 24) {
          nivel = 'alerta';
        }

        return {
          departamento,
          enCola: item.enCola,
          promedioHoras,
          maxHoras: item.maxHoras,
          nivel
        };
      })
      .sort((a, b) => {
        if (b.enCola !== a.enCola) {
          return b.enCola - a.enCola;
        }
        return b.promedioHoras - a.promedioHoras;
      });

    this.cuellosBotella = nuevosCuellos;

    const totalEnColaActual = nuevosCuellos.reduce((acc, item) => acc + item.enCola, 0);
    const promedioActual = nuevosCuellos.length > 0
      ? Math.round(nuevosCuellos.reduce((acc, item) => acc + item.promedioHoras, 0) / nuevosCuellos.length)
      : 0;

    if (totalEnColaActual > totalEnColaAnterior || (totalEnColaActual === totalEnColaAnterior && promedioActual > promedioAnterior)) {
      this.tendenciaCuellos = 'sube';
    } else if (totalEnColaActual < totalEnColaAnterior || (totalEnColaActual === totalEnColaAnterior && promedioActual < promedioAnterior)) {
      this.tendenciaCuellos = 'baja';
    } else {
      this.tendenciaCuellos = 'igual';
    }

    this.ultimaActualizacionCuellos = new Date();
  }

  actualizarSoloMetricas() {
    this.calcularCuellosBotella(this.tramites);
  }

  sincronizarConServidor() {
    this.cargarTramites();
  }

  getNivelTexto(nivel: CuelloBotellaDepartamento['nivel']): string {
    if (nivel === 'critico') return 'Critico';
    if (nivel === 'alerta') return 'Alerta';
    return 'Normal';
  }

  getEstadoOperacion(): { nivel: 'normal' | 'alerta' | 'critico'; texto: string } {
    if (this.cuellosBotella.some((item) => item.nivel === 'critico')) {
      return { nivel: 'critico', texto: 'Critico' };
    }
    if (this.cuellosBotella.some((item) => item.nivel === 'alerta')) {
      return { nivel: 'alerta', texto: 'Alerta' };
    }
    return { nivel: 'normal', texto: 'Normal' };
  }

  getTendenciaTexto(): string {
    if (this.tendenciaCuellos === 'sube') return 'Sube';
    if (this.tendenciaCuellos === 'baja') return 'Baja';
    return 'Igual';
  }

  getTendenciaIcono(): string {
    if (this.tendenciaCuellos === 'sube') return 'trending_up';
    if (this.tendenciaCuellos === 'baja') return 'trending_down';
    return 'trending_flat';
  }

  getLabelCampo(campo: string): string {
    return campo
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (l) => l.toUpperCase());
  }

  get cuellosBotellaVisibles(): CuelloBotellaDepartamento[] {
    if (!this.mostrarSoloCriticos) {
      return this.cuellosBotella;
    }
    return this.cuellosBotella.filter((item) => item.nivel === 'critico');
  }

  toggleSoloCriticos() {
    this.mostrarSoloCriticos = !this.mostrarSoloCriticos;
  }

  exportarCuellosBotellaCSV() {
    if (this.cuellosBotella.length === 0) {
      return;
    }

    const filas = [
      'Departamento,En Cola,Promedio Horas,Mayor Espera Horas,Nivel',
      ...this.cuellosBotella.map((item) =>
        `${this.escapeCsv(item.departamento)},${item.enCola},${item.promedioHoras},${item.maxHoras},${this.getNivelTexto(item.nivel)}`
      )
    ];

    const csv = filas.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuellos-botella-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    const safe = (value || '').replace(/"/g, '""');
    return `"${safe}"`;
  }
  
  getColorClass(tramite: Tramite): string {
    switch (tramite.estado) {
      case 'NUEVO': return 'rojo';
      case 'EN_PROCESO': return 'azul';
      case 'PENDIENTE': return 'naranja';
      case 'EN_MORA': return 'morado';
      case 'COMPLETADO': return 'verde';
      case 'RECHAZADO': return 'gris';
      default: return '';
    }
  }
  
  getEstadoIcon(estado: string): string {
    const icons: Record<string, string> = {
      'NUEVO': 'fiber_new', 
      'EN_PROCESO': 'autorenew', 
      'PENDIENTE': 'hourglass_empty',
      'EN_MORA': 'warning', 
      'COMPLETADO': 'check_circle', 
      'RECHAZADO': 'cancel'
    };
    return icons[estado] || 'description';
  }
  
  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'NUEVO': 'Nuevo', 
      'EN_PROCESO': 'En Proceso', 
      'PENDIENTE': 'Pendiente',
      'EN_MORA': 'En Mora', 
      'COMPLETADO': 'Completado', 
      'RECHAZADO': 'Rechazado'
    };
    return textos[estado] || estado;
  }
  
  getEstadoClase(estado: string): string {
    switch(estado) {
      case 'NUEVO': return 'nuevo';
      case 'EN_PROCESO': return 'en_proceso';
      case 'PENDIENTE': return 'pendiente';
      case 'EN_MORA': return 'en_mora';
      case 'COMPLETADO': return 'completado';
      case 'RECHAZADO': return 'rechazado';
      default: return '';
    }
  }
  
  abrirModal(tramite: Tramite) {
    this.tramiteSeleccionado = tramite;
    this.nuevoEstado = tramite.estado === 'NUEVO' ? 'EN_PROCESO' : tramite.estado;
    this.departamentoDestino = tramite.departamentoActual || this.departamentos[0]?.nombre || '';
    this.observacion = '';
    this.rutasSiguientes = [];
    this.camposFormularioRequeridos = [];
    this.datosFormularioDinamico = {};
    this.siguienteNodoId = '';
    this.mostrarModal = true;

    if (tramite.politicaId && tramite.id) {
      this.tramiteService.getEstadoEjecucion(tramite.id).subscribe({
        next: (estado: EstadoEjecucionExtendido) => {
          const rutas = estado.nodosSiguientes || [];
          this.rutasSiguientes = rutas;
          this.camposFormularioRequeridos = (estado.nodoActual?.camposFormulario || []).filter(c => !!c);

          this.datosFormularioDinamico = this.camposFormularioRequeridos.reduce((acc, campo) => {
            acc[campo] = '';
            return acc;
          }, {} as Record<string, string>);

          if (rutas.length === 1) {
            this.siguienteNodoId = rutas[0].nodoId;
            this.departamentoDestino = rutas[0].departamentoId || this.departamentoDestino;
          }

          if (rutas.length > 1) {
            this.siguienteNodoId = rutas[0].nodoId;
            this.departamentoDestino = rutas[0].departamentoId || this.departamentoDestino;
          }
        },
        error: (err) => {
          console.error('Error cargando rutas siguientes:', err);
        }
      });
    }
  }
  
  cerrarModal() {
    this.mostrarModal = false;
    this.tramiteSeleccionado = null;
    this.rutasSiguientes = [];
    this.camposFormularioRequeridos = [];
    this.datosFormularioDinamico = {};
    this.siguienteNodoId = '';
  }

  actualizarDepartamentoDesdeRuta() {
    if (!this.siguienteNodoId) {
      return;
    }

    const rutaSeleccionada = this.rutasSiguientes.find((r) => r.nodoId === this.siguienteNodoId);
    if (rutaSeleccionada?.departamentoId) {
      this.departamentoDestino = rutaSeleccionada.departamentoId;
    }
  }
  
  confirmarProcesar() {
    if (!this.tramiteSeleccionado || !this.tramiteSeleccionado.id) {
      alert('No se puede procesar el trámite');
      return;
    }

    if (!this.departamentoDestino) {
      alert('Seleccione un departamento destino');
      return;
    }
    
    const token = this.authService.getToken();
    console.log('Token existe?', !!token);
    
    this.loading = true;

    // Si se marca rechazo, usar endpoint de rechazo para dejar trazabilidad
    if (this.nuevoEstado === 'RECHAZADO') {
      this.tramiteService.rechazarTramite(this.tramiteSeleccionado.id, this.observacion || 'Rechazado por funcionario').subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          this.cerrarModal();
          this.cargarTramites();
          alert('Trámite rechazado correctamente');
          this.loading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.loading = false;
          alert('Error al rechazar el trámite: ' + (err.error?.mensaje || err.error?.message || err.message));
        }
      });
      return;
    }

    // Cuando el trámite está asociado a una política, avanzar por el motor de flujo
    if (this.tramiteSeleccionado.politicaId) {
      const faltantes = this.camposFormularioRequeridos.filter((campo) => {
        const valor = this.datosFormularioDinamico[campo];
        return !valor || !valor.trim();
      });

      if (faltantes.length > 0) {
        alert('Completa los campos requeridos del formulario del area antes de avanzar.');
        this.loading = false;
        return;
      }

      const payload = {
        comentario: this.observacion || 'Avance por flujo',
        departamentoDestino: this.departamentoDestino,
        siguienteNodoId: this.siguienteNodoId || undefined,
        datos: this.datosFormularioDinamico
      };

      this.tramiteService.avanzarTramite(this.tramiteSeleccionado.id, payload).subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          this.cerrarModal();
          this.cargarTramites();
          alert('Trámite avanzado al siguiente paso del flujo');
          this.loading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.loading = false;
          alert('Error al avanzar por flujo: ' + (err.error?.mensaje || err.error?.message || err.message));
        }
      });
      return;
    }

    // Fallback para trámites sin política asociada: actualización manual
    const updateData = {
      estado: this.nuevoEstado,
      departamento: this.departamentoDestino,
      observaciones: this.observacion
    };

    console.log('Enviando datos:', updateData);

    this.tramiteService.actualizarEstadoCompleto(this.tramiteSeleccionado.id, updateData).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        this.cerrarModal();
        this.cargarTramites();
        alert('Trámite procesado correctamente');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        
        if (err.status === 403) {
          alert('Error 403: No tiene permisos.');
        } else if (err.status === 401) {
          alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Error al procesar el trámite: ' + (err.error?.message || err.message));
        }
      }
    });
  }
  
  verDetalle(tramite: Tramite) {
    this.tramiteDetalle = tramite;
    this.mostrarModalDetalle = true;
  }
  
  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.tramiteDetalle = null;
  }
  
  calcularTiempoEnEstado(fecha: Date): string {
    const fechaActual = new Date();
    const fechaUpdate = new Date(fecha);
    const diffMs = fechaActual.getTime() - fechaUpdate.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHoras < 1) return 'menos de 1 hora';
    if (diffHoras < 24) return `${diffHoras} horas`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias} días`;
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  descargarPDF(tramite: Tramite) {
    if (!tramite.id || tramite.estado !== 'COMPLETADO') {
      alert('Solo se pueden descargar PDFs de trámites completados');
      return;
    }

    this.tramiteService.descargarPdfTramite(tramite.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tramite-${tramite.codigo}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando PDF:', err);
        alert('Error al descargar el PDF: ' + (err.error?.mensaje || err.message));
      }
    });
  }
}