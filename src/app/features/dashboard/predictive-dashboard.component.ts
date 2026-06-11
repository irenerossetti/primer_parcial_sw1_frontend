import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Dashboard Predictivo Avanzado
 * Muestra métricas, predicciones y análisis visuales del workflow
 */
@Component({
  selector: 'app-predictive-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './predictive-dashboard.component.html',
  styleUrls: ['./predictive-dashboard.component.css']
})
export class PredictiveDashboardComponent implements OnInit, OnDestroy {
  // URL del ML Service (ajustar según configuración)
  private readonly API_URL = `${environment.mlServiceUrl}/dashboard`;

  // Datos del dashboard
  overview: any = null;
  timeSeries: any = null;
  predictions: any = null;
  distribution: any = null;
  processingTime: any = null;
  satisfaction: any = null;
  alerts: any[] = [];
  topPerformers: any[] = [];

  // Estado
  loading = true;
  error: string | null = null;
  lastUpdate: Date | null = null;

  // Auto-refresh
  private refreshSubscription?: Subscription;
  autoRefresh = true;
  refreshInterval = 60000; // 60 segundos

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();

    // Auto-refresh cada 60 segundos
    if (this.autoRefresh) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.loadDashboard(true);
      });
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * Carga todos los datos del dashboard
   */
  async loadDashboard(silent = false): Promise<void> {
    if (!silent) {
      this.loading = true;
      this.error = null;
    }

    try {
      // Cargar dashboard completo en una sola llamada
      const response: any = await this.http
        .get(`${this.API_URL}/complete?days=30`)
        .toPromise();

      if (response.success) {
        this.overview = response.overview;
        this.timeSeries = response.time_series;
        this.predictions = response.predictions;
        this.distribution = response.distribution;
        this.processingTime = response.processing_time;
        this.satisfaction = response.satisfaction;
        this.alerts = response.alerts;
        this.topPerformers = response.top_performers?.top_performers || [];

        this.lastUpdate = new Date();
        
        // Renderizar gráficas
        setTimeout(() => this.renderCharts(), 100);
      }
    } catch (err: any) {
      this.error = err.message || 'Error cargando dashboard';
      console.error('Error loading dashboard:', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Renderiza las gráficas (usando Chart.js o similar)
   * Por ahora usa visualizaciones CSS simples
   */
  private renderCharts(): void {
    // En producción: usar Chart.js, D3.js, o ngx-charts
    // Por ahora: visualizaciones simples con CSS
    console.log('Rendering charts with data:', {
      timeSeries: this.timeSeries,
      predictions: this.predictions,
      distribution: this.distribution
    });
  }

  /**
   * Obtiene clase CSS según el cambio porcentual
   */
  getChangeClass(changePercentage: number): string {
    if (changePercentage > 0) return 'positive';
    if (changePercentage < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Obtiene icono según el cambio
   */
  getChangeIcon(changePercentage: number): string {
    if (changePercentage > 0) return '↑';
    if (changePercentage < 0) return '↓';
    return '→';
  }

  /**
   * Obtiene clase CSS según nivel de alerta
   */
  getAlertClass(level: string): string {
    switch (level) {
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'danger':
        return 'alert-danger';
      default:
        return 'alert-info';
    }
  }

  /**
   * Obtiene icono según nivel de alerta
   */
  getAlertIcon(level: string): string {
    switch (level) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '✗';
      default:
        return 'ℹ';
    }
  }

  /**
   * Formatea número con separador de miles
   */
  formatNumber(num: number): string {
    return num.toLocaleString('es-ES');
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;

    if (this.autoRefresh) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.loadDashboard(true);
      });
    } else {
      this.refreshSubscription?.unsubscribe();
    }
  }

  /**
   * Refresh manual
   */
  refresh(): void {
    this.loadDashboard();
  }

  /**
   * Obtiene estrellas para rating de satisfacción
   */
  getSatisfactionStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const stars: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    
    return stars;
  }
}
