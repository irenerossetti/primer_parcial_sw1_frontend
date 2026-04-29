import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramiteService, Tramite, TramiteEjecucion } from '../../core/services/tramite.service';
import { AuthService } from '../../core/services/auth.service';
import { Politica, PoliticaService } from '../../core/services/politica.service';
import { FormularioService, CampoFormulario } from '../../core/services/formulario.service';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { TramiteRecorridoComponent } from '../../shared/components/tramite-recorrido/tramite-recorrido';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, TramiteRecorridoComponent],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css']
})
export class ClienteComponent implements OnInit, OnDestroy {
  tramites: Tramite[] = [];
  estadosEjecucion: Record<string, TramiteEjecucion> = {};
  politicas: Politica[] = [];
  mostrarModalCrear = false;
  mostrarModalDetalle = false;
  tramiteSeleccionado: Tramite | null = null;
  nuevoTramite = { tipo: 'LUZ', descripcion: '', politicaId: '' };
  
  // Campos dinámicos
  camposDinamicos: CampoFormulario[] = [];
  datosFormulario: Record<string, any> = {};
  erroresValidacion: Record<string, string> = {};
  cargandoCampos = false;

  // WebSocket subscriptions
  private subscriptions: Subscription[] = [];

  get tramitesCompletados(): number {
    return this.tramites.filter(t => t.estado === 'COMPLETADO').length;
  }

  constructor(
    private tramiteService: TramiteService,
    private authService: AuthService,
    private politicaService: PoliticaService,
    private formularioService: FormularioService,
    private pdfExportService: PdfExportService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.cargarPoliticas();
    this.cargarTramites();
    this.setupWebSocketListeners();
  }

  ngOnDestroy() {
    // Desuscribirse de todos los observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Configura los listeners de WebSocket para actualizaciones en tiempo real
   */
  private setupWebSocketListeners(): void {
    // Escuchar cuando se actualiza un trámite
    const tramiteActualizadoSub = this.webSocketService.tramiteActualizado$.subscribe((notification: any) => {
      if (notification && notification.clienteEmail === this.authService.getEmail()) {
        console.log('Trámite actualizado en tiempo real:', notification);
        this.actualizarTramiteLocal(notification);
      }
    });

    // Escuchar cuando se completa un trámite
    const tramiteCompletadoSub = this.webSocketService.tramiteCompletado$.subscribe((notification: any) => {
      if (notification && notification.clienteEmail === this.authService.getEmail()) {
        console.log('Trámite completado:', notification);
        this.actualizarTramiteLocal(notification);
        this.mostrarNotificacion('✅ Tu trámite ha sido completado!');
      }
    });

    // Escuchar cuando se crea un nuevo trámite (opcional, para admin ver nuevos trámites)
    const nuevoTramiteSub = this.webSocketService.nuevoTramite$.subscribe((notification: any) => {
      console.log('Nuevo trámite creado:', notification);
      // Recargar lista si es necesario
    });

    this.subscriptions.push(tramiteActualizadoSub, tramiteCompletadoSub, nuevoTramiteSub);
  }

  /**
   * Actualiza un trámite en la lista local sin hacer petición al servidor
   */
  private actualizarTramiteLocal(notification: any): void {
    const index = this.tramites.findIndex(t => t.id === notification.tramiteId);
    if (index !== -1) {
      // Actualizar el trámite
      this.tramites[index].estado = notification.estadoActual;
      this.tramites[index].departamentoActual = notification.departamentoActual;
      
      // Si fue seleccionado, actualizar también la vista detalle
      if (this.tramiteSeleccionado && this.tramiteSeleccionado.id === notification.tramiteId) {
        this.tramiteSeleccionado.estado = notification.estadoActual;
        this.tramiteSeleccionado.departamentoActual = notification.departamentoActual;
      }
    }
  }

  /**
   * Muestra una notificación al usuario
   */
  private mostrarNotificacion(mensaje: string): void {
    // Aquí puedes usar una librería de notificaciones o implementar una propia
    console.log('Notificación:', mensaje);
    alert(mensaje);
  }

  cargarPoliticas() {
    this.politicaService.getPoliticasActivas().subscribe({
      next: (data) => {
        this.politicas = data || [];
        if (!this.nuevoTramite.politicaId && this.politicas.length > 0) {
          this.nuevoTramite.politicaId = this.politicas[0].id;
        }
      },
      error: (err) => {
        console.error('Error cargando políticas:', err);
        this.politicas = [];
      }
    });
  }

  cargarTramites() {
    this.tramiteService.getTramites().subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargarEstadosEjecucion(data);
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private cargarEstadosEjecucion(tramites: Tramite[]) {
    const consultas = tramites
      .filter((tramite) => !!tramite.id)
      .map((tramite) =>
        this.tramiteService.getEstadoEjecucion(tramite.id as string).pipe(
          catchError(() => of(null))
        )
      );

    if (consultas.length === 0) {
      this.estadosEjecucion = {};
      return;
    }

    forkJoin(consultas).subscribe((estados) => {
      const mapa: Record<string, TramiteEjecucion> = {};
      for (const estado of estados) {
        if (estado && estado.id) {
          mapa[estado.id] = estado;
        }
      }
      this.estadosEjecucion = mapa;
    });
  }

  abrirModalCrear() {
    this.mostrarModalCrear = true;
    this.nuevoTramite = {
      tipo: 'LUZ',
      descripcion: '',
      politicaId: this.politicas[0]?.id || ''
    };
    this.datosFormulario = {};
    this.erroresValidacion = {};
    this.cargarCamposDinamicos(this.nuevoTramite.politicaId);
  }

  cargarCamposDinamicos(politicaId: string) {
    if (!politicaId) {
      this.camposDinamicos = [];
      this.datosFormulario = {};
      return;
    }

    this.cargandoCampos = true;
    this.formularioService.getFormularioPolitica(politicaId).subscribe({
      next: (campos: any) => {
        this.camposDinamicos = campos.sort((a: any, b: any) => a.orden - b.orden);
        this.datosFormulario = {};
        this.erroresValidacion = {};
        this.cargandoCampos = false;
      },
      error: (err: any) => {
        console.error('Error cargando campos dinámicos:', err);
        this.camposDinamicos = [];
        this.cargandoCampos = false;
      }
    });
  }

  onPoliticaChange(politicaId: string) {
    this.nuevoTramite.politicaId = politicaId;
    this.cargarCamposDinamicos(politicaId);
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.nuevoTramite = {
      tipo: 'LUZ',
      descripcion: '',
      politicaId: this.politicas[0]?.id || ''
    };
  }

  crearTramite() {
    if (!this.nuevoTramite.politicaId) {
      alert('Selecciona una política para crear el trámite.');
      return;
    }

    // Validar campos requeridos
    this.erroresValidacion = {};
    let valido = true;

    for (const campo of this.camposDinamicos) {
      const valor = this.datosFormulario[campo.nombre];
      
      if (campo.requerido && (!valor || (typeof valor === 'string' && valor.trim() === ''))) {
        this.erroresValidacion[campo.nombre] = `${campo.etiqueta} es requerido`;
        valido = false;
      }

      // Validar con regex si existe
      if (campo.validacion && valor && campo.tipo !== 'PHONE') {
        // NOTA: Excluimos PHONE de validación regex para aceptar cualquier formato
        const regex = new RegExp(campo.validacion);
        if (!regex.test(valor)) {
          this.erroresValidacion[campo.nombre] = `${campo.etiqueta} tiene un formato inválido`;
          valido = false;
        }
      }
      
      // Validación especial para teléfonos (más flexible)
      if (campo.tipo === 'PHONE' && valor) {
        // Aceptar cualquier número con al menos 7 dígitos
        const soloNumeros = valor.replace(/\D/g, '');
        if (soloNumeros.length < 7) {
          this.erroresValidacion[campo.nombre] = `${campo.etiqueta} debe tener al menos 7 dígitos`;
          valido = false;
        }
      }
    }

    if (!valido) {
      alert('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const userId = this.authService.getUserId();
    
    const nuevo: Partial<Tramite> = {
      codigo: `TRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      clienteId: userId,
      politicaId: this.nuevoTramite.politicaId,
      estado: 'EN_PROCESO',
      creadoEn: new Date(),
      actualizadoEn: new Date(),
      historial: [],
      descripcion: this.nuevoTramite.descripcion,
      tipo: this.nuevoTramite.tipo
    };

    this.tramiteService.crearTramite(nuevo).subscribe({
      next: (response) => {
        console.log('Trámite creado:', response);
        this.cerrarModalCrear();
        this.cargarTramites();
        alert('Trámite creado exitosamente');
      },
      error: (err) => {
        console.error('Error al crear:', err);
        alert('Error al crear el trámite: ' + (err.error?.message || err.message));
      }
    });
  }

  getColorClass(tramite: Tramite): string {
    switch (tramite.estado) {
      case 'NUEVO': return 'rojo';
      case 'EN_PROCESO': return 'amarillo';
      case 'COMPLETADO': return 'verde';
      default: return '';
    }
  }

  verDetalle(tramite: Tramite) {
    this.tramiteSeleccionado = tramite;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.tramiteSeleccionado = null;
  }

  tieneError(nombreCampo: string): boolean {
    return !!this.erroresValidacion[nombreCampo];
  }

  obtenerError(nombreCampo: string): string {
    return this.erroresValidacion[nombreCampo] || '';
  }
  calcularTiempo(fecha: Date): string {
  const ahora = new Date();
  const entonces = new Date(fecha);
  const diffHoras = Math.floor((ahora.getTime() - entonces.getTime()) / (1000 * 60 * 60));
  
  if (diffHoras < 1) return 'menos de 1 hora';
  if (diffHoras < 24) return `${diffHoras} horas`;
  return `${Math.floor(diffHoras / 24)} días`;
}

calcularFechaEstimada(tramite: Tramite): string {
  // Si está completado, mostrar fecha de finalización
  if (tramite.estado === 'COMPLETADO') {
    return `Finalizado el ${new Date(tramite.finalizadoEn || tramite.actualizadoEn).toLocaleDateString()}`;
  }
  
  // Si está en proceso, estimar 3-5 días hábiles
  const fechaCreacion = new Date(tramite.creadoEn);
  const diasEstimados = tramite.estado === 'EN_PROCESO' ? 3 : 5;
  fechaCreacion.setDate(fechaCreacion.getDate() + diasEstimados);
  return `Estimado: ${fechaCreacion.toLocaleDateString()}`;
}

  getDepartamentoActual(tramite: Tramite): string {
    if (!tramite.id) {
      return tramite.departamentoActual || 'No asignado';
    }

    const estado = this.estadosEjecucion[tramite.id];
    return estado?.departamentoActual || tramite.departamentoActual || 'No asignado';
  }

  getPorcentajeAvance(tramite: Tramite): number {
    if (tramite.estado === 'COMPLETADO') {
      return 100;
    }

    if (!tramite.id) {
      return 0;
    }

    const estado = this.estadosEjecucion[tramite.id];
    if (typeof estado?.porcentajeAvance === 'number') {
      return estado.porcentajeAvance;
    }

    if (tramite.estado === 'EN_PROCESO') {
      return 50;
    }

    return 0;
  }

  getPorcentajeRestante(tramite: Tramite): number {
    return Math.max(0, 100 - this.getPorcentajeAvance(tramite));
  }

  // Descargar PDF completo del trámite
  async descargarPDF(tramite: Tramite) {
    if (!tramite.id) {
      alert('No hay trámite seleccionado');
      return;
    }

    try {
      await this.pdfExportService.exportarTramiteAPdf(tramite);
    } catch (error) {
      alert('Error al descargar PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Descargar PDF solo del recorrido visual
  async descargarRecorridoPDF(tramite: Tramite) {
    if (!tramite.id) {
      alert('No hay trámite seleccionado');
      return;
    }

    try {
      await this.pdfExportService.exportarRecorridoAPdf(tramite);
    } catch (error) {
      alert('Error al descargar recorrido: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Cerrar sesión
  logout() {
    this.authService.logout();
  }
}