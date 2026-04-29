import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramiteService, Tramite } from '../../core/services/tramite.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tramites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tramites.html',  // ← CAMBIAR a templateUrl (usa archivo externo)
  styleUrls: ['./tramites.css']     // ← Agregar stylesheet
})
export class TramitesComponent implements OnInit {
  tramites: Tramite[] = [];
  tramitesFiltrados: Tramite[] = [];
  filtroEstado = 'todos';

  constructor(
    private tramiteService: TramiteService,
    public authService: AuthService  // ← public para usar en el HTML
  ) {}

  ngOnInit() {
    this.cargarTramites();
  }

  cargarTramites() {
    this.tramiteService.getTramites().subscribe({
      next: (data) => {
        const rol = this.authService.getRol();
        const userId = this.authService.getUserId();
        
        if (rol === 'FUNCIONARIO') {
          this.tramites = data;
        } else if (rol === 'CLIENTE') {
          this.tramites = data.filter(t => t.clienteId === userId);
        } else {
          this.tramites = data;
        }
        this.aplicarFiltro();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  aplicarFiltro() {
    if (this.filtroEstado === 'todos') {
      this.tramitesFiltrados = this.tramites;
    } else {
      this.tramitesFiltrados = this.tramites.filter(t => t.estado === this.filtroEstado);
    }
  }

  contarPorEstado(estado: string): number {
    return this.tramites.filter(t => t.estado === estado).length;
  }

  calcularTiempo(fecha: Date): string {
    const ahora = new Date();
    const entonces = new Date(fecha);
    const diffHoras = Math.floor((ahora.getTime() - entonces.getTime()) / (1000 * 60 * 60));
    
    if (diffHoras < 1) return 'menos de 1 hora';
    if (diffHoras < 24) return `${diffHoras} horas`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias} días`;
  }

  getColorClass(tramite: Tramite): string {
    switch (tramite.estado) {
      case 'NUEVO': return 'rojo';
      case 'EN_PROCESO': return 'amarillo';
      case 'COMPLETADO': return 'verde';
      default: return '';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'NUEVO': return 'estado-rojo';
      case 'EN_PROCESO': return 'estado-amarillo';
      case 'COMPLETADO': return 'estado-verde';
      default: return '';
    }
  }

   mostrarModal = false;
tramiteSeleccionado: Tramite | null = null;

   verDetalle(tramite: Tramite) {
  this.tramiteSeleccionado = tramite;
  this.mostrarModal = true;
}

  cerrarModal() {
  this.mostrarModal = false;
  this.tramiteSeleccionado = null;
}

  eliminarTramite(tramite: Tramite) {
    if (tramite.id && confirm(`¿Eliminar trámite ${tramite.codigo}?`)) {
      this.tramiteService.eliminarTramite(tramite.id).subscribe({
        next: () => {
          this.cargarTramites();
          alert('Trámite eliminado');
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al eliminar');
        }
      });
    }
  }
}