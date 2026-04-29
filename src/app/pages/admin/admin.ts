import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TramiteService, Tramite } from '../../core/services/tramite.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { PoliticaService, Politica } from '../../core/services/politica.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  
  usuarios: any[] = [];
  politicas: Politica[] = [];
  tramites: Tramite[] = [];
  tramitesRecientes: Tramite[] = [];
  
  constructor(
    private authService: AuthService,
    private tramiteService: TramiteService,
    private usuarioService: UsuarioService,
    private politicaService: PoliticaService
  ) {}
  
  ngOnInit() {
    this.cargarDatos();
  }
  
  cargarDatos() {
    // Cargar usuarios
    this.usuarioService.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });
    
    // Cargar políticas
    this.politicaService.getPoliticas().subscribe({
      next: (data) => {
        this.politicas = data;
      },
      error: (err) => console.error('Error cargando políticas:', err)
    });
    
    // Cargar trámites
    this.tramiteService.getTramites().subscribe({
      next: (data) => {
        this.tramites = data;
        // Obtener los 5 más recientes
        this.tramitesRecientes = data
          .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
          .slice(0, 5);
      },
      error: (err) => console.error('Error cargando trámites:', err)
    });
  }
  
  get tramitesEnProceso(): number {
    return this.tramites.filter(t => t.estado === 'EN_PROCESO').length;
  }
  
  getNombreUsuario(): string {
    return this.authService.getNombre() || 'Administrador';
  }
  
  calcularTiempoTranscurrido(fecha: Date): string {
    if (!fecha) return '';
    
    const ahora = new Date();
    const entonces = new Date(fecha);
    const diffMs = ahora.getTime() - entonces.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHoras < 1) return 'Hace menos de 1 hora';
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    
    const diffDias = Math.floor(diffHoras / 24);
    return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
  }
  
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'completado';
      case 'EN_PROCESO': return 'en-proceso';
      case 'RECHAZADO': return 'rechazado';
      default: return 'pendiente';
    }
  }
  
  logout() {
    this.authService.logout();
  }
}
