import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, CuelloBottellaData, DepartamentoAnalytics } from '../../core/services/analytics.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuellos-botella',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuellos-botella.component.html',
  styleUrls: ['./cuellos-botella.component.css']
})
export class CuellosBotuellaComponent implements OnInit, OnDestroy {
  cuellosData: CuelloBottellaData | null = null;
  loading = false;
  error: string | null = null;
  
  // WebSocket subscription
  private webSocketSubscription: Subscription | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.setupWebSocketListener();
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }

  /**
   * Configura el listener de WebSocket para actualizaciones de cuellos de botella
   */
  private setupWebSocketListener(): void {
    this.webSocketSubscription = this.webSocketService.cuellosBottellaActualizados$.subscribe(() => {
      console.log('Cuellos de botella actualizados por WebSocket, recargando...');
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.analyticsService.getCuellosBottella().subscribe({
      next: (data) => {
        this.cuellosData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos de cuellos de botella';
        console.error(err);
        this.loading = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'CRITICO':
        return 'estado-critico';
      case 'ADVERTENCIA':
        return 'estado-advertencia';
      case 'NORMAL':
        return 'estado-normal';
      default:
        return '';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'CRITICO':
        return '🚨';
      case 'ADVERTENCIA':
        return '⚠️';
      case 'NORMAL':
        return '✅';
      default:
        return '•';
    }
  }
}
