import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportGeneratorService, SystemReport } from '../../core/services/report-generator.service';

@Component({
  selector: 'app-system-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-container">
      <div class="report-header">
        <div class="header-content">
          <span class="material-icons">assessment</span>
          <div>
            <h2>Reporte del Sistema</h2>
            <p *ngIf="report">{{ report.fecha | date:'full' }}</p>
          </div>
        </div>
        <button class="btn-generate" (click)="generateReport()" [disabled]="isLoading">
          <span class="material-icons" *ngIf="!isLoading">auto_awesome</span>
          <span class="spinner" *ngIf="isLoading"></span>
          <span>{{ isLoading ? 'Generando...' : 'Generar con AI' }}</span>
        </button>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner-large"></div>
        <p>Generando reporte con AI...</p>
      </div>

      <div class="report-content" *ngIf="!isLoading && report">
        <!-- Resumen Ejecutivo -->
        <div class="executive-summary">
          <h3>
            <span class="material-icons">description</span>
            Resumen Ejecutivo
          </h3>
          <p class="summary-text">{{ report.resumenEjecutivo }}</p>
        </div>

        <!-- Estadísticas Principales -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="material-icons">policy</span>
            <div class="stat-content">
              <span class="stat-value">{{ report.estadisticas.totalPoliticas }}</span>
              <span class="stat-label">Políticas Activas</span>
            </div>
          </div>

          <div class="stat-card">
            <span class="material-icons">assignment</span>
            <div class="stat-content">
              <span class="stat-value">{{ report.estadisticas.totalTramites }}</span>
              <span class="stat-label">Total Trámites</span>
            </div>
          </div>

          <div class="stat-card">
            <span class="material-icons">people</span>
            <div class="stat-content">
              <span class="stat-value">{{ report.estadisticas.totalUsuarios }}</span>
              <span class="stat-label">Usuarios</span>
            </div>
          </div>

          <div class="stat-card efficiency">
            <span class="material-icons">speed</span>
            <div class="stat-content">
              <span class="stat-value">{{ report.estadisticas.eficienciaPromedio }}%</span>
              <span class="stat-label">Eficiencia</span>
            </div>
          </div>
        </div>

        <!-- Estado de Trámites -->
        <div class="tramites-status">
          <h3>
            <span class="material-icons">donut_small</span>
            Estado de Trámites
          </h3>
          <div class="status-grid">
            <div class="status-card completados">
              <div class="status-icon">
                <span class="material-icons">check_circle</span>
              </div>
              <div class="status-content">
                <span class="status-value">{{ report.estadisticas.tramitesCompletados }}</span>
                <span class="status-label">Completados</span>
                <span class="status-percentage">
                  {{ getPercentage(report.estadisticas.tramitesCompletados, report.estadisticas.totalTramites) }}%
                </span>
              </div>
            </div>

            <div class="status-card en-proceso">
              <div class="status-icon">
                <span class="material-icons">pending</span>
              </div>
              <div class="status-content">
                <span class="status-value">{{ report.estadisticas.tramitesEnProceso }}</span>
                <span class="status-label">En Proceso</span>
                <span class="status-percentage">
                  {{ getPercentage(report.estadisticas.tramitesEnProceso, report.estadisticas.totalTramites) }}%
                </span>
              </div>
            </div>

            <div class="status-card rechazados">
              <div class="status-icon">
                <span class="material-icons">cancel</span>
              </div>
              <div class="status-content">
                <span class="status-value">{{ report.estadisticas.tramitesRechazados }}</span>
                <span class="status-label">Rechazados</span>
                <span class="status-percentage">
                  {{ getPercentage(report.estadisticas.tramitesRechazados, report.estadisticas.totalTramites) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Análisis por Política -->
        <div class="policies-analysis" *ngIf="report.analisisPorPolitica.length > 0">
          <h3>
            <span class="material-icons">analytics</span>
            Análisis por Política
          </h3>
          <div class="policy-table">
            <div class="policy-row header">
              <span>Política</span>
              <span>Trámites</span>
              <span>Eficiencia</span>
              <span>Estado</span>
            </div>
            <div class="policy-row" *ngFor="let policy of report.analisisPorPolitica">
              <span class="policy-name">{{ policy.nombre }}</span>
              <span class="policy-tramites">{{ policy.tramites }}</span>
              <span class="policy-efficiency">
                <div class="efficiency-bar-small">
                  <div class="efficiency-fill-small" [style.width.%]="policy.eficiencia"
                       [class.high]="policy.eficiencia >= 80"
                       [class.medium]="policy.eficiencia >= 60 && policy.eficiencia < 80"
                       [class.low]="policy.eficiencia < 60">
                  </div>
                </div>
                {{ policy.eficiencia }}%
              </span>
              <span class="policy-status" [class]="getStatusClass(policy.estado)">
                {{ policy.estado }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tendencias -->
        <div class="trends-section" *ngIf="report.tendencias.length > 0">
          <h3>
            <span class="material-icons">trending_up</span>
            Tendencias Identificadas
          </h3>
          <div class="trend-card" *ngFor="let trend of report.tendencias">
            <span class="trend-icon">{{ getTrendIcon(trend) }}</span>
            <p>{{ trend }}</p>
          </div>
        </div>

        <!-- Problemas -->
        <div class="problems-section" *ngIf="report.problemas.length > 0">
          <h3>
            <span class="material-icons">report_problem</span>
            Problemas Detectados
          </h3>
          <div class="problem-card" *ngFor="let problem of report.problemas">
            <span class="material-icons">error_outline</span>
            <p>{{ problem }}</p>
          </div>
        </div>

        <!-- Recomendaciones -->
        <div class="recommendations-section" *ngIf="report.recomendaciones.length > 0">
          <h3>
            <span class="material-icons">psychology</span>
            Recomendaciones AI
          </h3>
          <div class="recommendation-card" *ngFor="let rec of report.recomendaciones; let i = index">
            <span class="recommendation-number">{{ i + 1 }}</span>
            <p>{{ rec }}</p>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!isLoading && !report">
        <span class="material-icons">info</span>
        <p>Genera un reporte para ver el análisis del sistema</p>
      </div>

      <div class="error-state" *ngIf="error">
        <span class="material-icons">error_outline</span>
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .report-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .report-header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-content .material-icons {
      font-size: 40px;
    }

    .header-content h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .header-content p {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 13px;
    }

    .btn-generate {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-generate:hover:not(:disabled) {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }

    .btn-generate:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner, .spinner-large {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-large {
      width: 50px;
      height: 50px;
      border-width: 4px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state {
      padding: 60px;
      text-align: center;
    }

    .loading-state .spinner-large {
      margin: 0 auto 20px;
    }

    .report-content {
      padding: 24px;
    }

    .executive-summary {
      background: linear-gradient(to bottom, #eff6ff, #ffffff);
      border: 2px solid #bfdbfe;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .executive-summary h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e40af;
      margin: 0 0 16px 0;
    }

    .summary-text {
      color: #1e3a8a;
      line-height: 1.8;
      font-size: 15px;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .stat-card .material-icons {
      font-size: 40px;
      color: #64748b;
    }

    .stat-card.efficiency .material-icons {
      color: #10b981;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .tramites-status h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .status-card {
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-card.completados {
      background: linear-gradient(135deg, #d1fae5 0%, #ffffff 100%);
      border: 2px solid #a7f3d0;
    }

    .status-card.en-proceso {
      background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
      border: 2px solid #fde68a;
    }

    .status-card.rechazados {
      background: linear-gradient(135deg, #fee2e2 0%, #ffffff 100%);
      border: 2px solid #fecaca;
    }

    .status-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .completados .status-icon {
      background: #10b981;
    }

    .en-proceso .status-icon {
      background: #f59e0b;
    }

    .rechazados .status-icon {
      background: #ef4444;
    }

    .status-icon .material-icons {
      color: white;
      font-size: 28px;
    }

    .status-content {
      display: flex;
      flex-direction: column;
    }

    .status-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
    }

    .completados .status-value { color: #065f46; }
    .en-proceso .status-value { color: #92400e; }
    .rechazados .status-value { color: #991b1b; }

    .status-label {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0;
    }

    .status-percentage {
      font-size: 12px;
      font-weight: 600;
      opacity: 0.7;
    }

    .policies-analysis h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .policy-table {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .policy-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 1fr;
      gap: 16px;
      padding: 16px 20px;
      align-items: center;
    }

    .policy-row.header {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .policy-row:not(.header) {
      border-top: 1px solid #f1f5f9;
    }

    .policy-row:not(.header):hover {
      background: #f8fafc;
    }

    .policy-name {
      color: #1e293b;
      font-weight: 500;
    }

    .policy-tramites {
      color: #64748b;
      font-weight: 600;
    }

    .policy-efficiency {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1e293b;
    }

    .efficiency-bar-small {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .efficiency-fill-small {
      height: 100%;
      transition: width 0.5s ease;
    }

    .efficiency-fill-small.high { background: #10b981; }
    .efficiency-fill-small.medium { background: #f59e0b; }
    .efficiency-fill-small.low { background: #ef4444; }

    .policy-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }

    .policy-status.optimo {
      background: #d1fae5;
      color: #065f46;
    }

    .policy-status.bueno {
      background: #dbeafe;
      color: #1e40af;
    }

    .policy-status.requiere-atencion {
      background: #fef3c7;
      color: #92400e;
    }

    .policy-status.critico {
      background: #fee2e2;
      color: #991b1b;
    }

    .trends-section h3, .problems-section h3, .recommendations-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .trend-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(to right, #dbeafe, #ffffff);
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .trend-icon {
      font-size: 24px;
    }

    .trend-card p {
      margin: 0;
      color: #1e3a8a;
      font-size: 14px;
    }

    .problem-card {
      display: flex;
      align-items: start;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(to right, #fee2e2, #ffffff);
      border: 1px solid #fecaca;
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .problem-card .material-icons {
      color: #dc2626;
      font-size: 20px;
    }

    .problem-card p {
      margin: 0;
      color: #991b1b;
      font-size: 14px;
      line-height: 1.6;
    }

    .recommendation-card {
      display: flex;
      align-items: start;
      gap: 16px;
      padding: 16px;
      background: linear-gradient(to right, #ede9fe, #ffffff);
      border: 1px solid #ddd6fe;
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .recommendation-number {
      width: 32px;
      height: 32px;
      background: #7c3aed;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .recommendation-card p {
      margin: 0;
      color: #4c1d95;
      font-size: 14px;
      line-height: 1.6;
      padding-top: 4px;
    }

    .empty-state, .error-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .empty-state .material-icons, .error-state .material-icons {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .error-state {
      color: #ef4444;
    }
  `]
})
export class SystemReportComponent implements OnInit {
  report: SystemReport | null = null;
  isLoading = false;
  error = '';

  constructor(private reportService: ReportGeneratorService) {}

  ngOnInit() {
    // Auto-generar reporte al cargar
    this.generateReport();
  }

  generateReport() {
    this.isLoading = true;
    this.error = '';

    this.reportService.generateAIReport().subscribe({
      next: (report) => {
        this.report = report;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.error = 'Error al generar el reporte. Por favor intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getStatusClass(estado: string): string {
    return estado.toLowerCase().replace(/\s+/g, '-');
  }

  getTrendIcon(trend: string): string {
    if (trend.includes('📈') || trend.includes('Incremento')) return '📈';
    if (trend.includes('📉') || trend.includes('Disminución')) return '📉';
    if (trend.includes('✅') || trend.includes('Alta')) return '✅';
    if (trend.includes('⚠️') || trend.includes('Baja')) return '⚠️';
    return '➡️';
  }
}
