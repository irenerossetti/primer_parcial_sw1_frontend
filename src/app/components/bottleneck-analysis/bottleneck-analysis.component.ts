import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottleneckAnalyzerService, FlowAnalysis, BottleneckAnalysis } from '../../core/services/bottleneck-analyzer.service';

@Component({
  selector: 'app-bottleneck-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analysis-container">
      <div class="analysis-header">
        <div class="header-content">
          <span class="material-icons">analytics</span>
          <div>
            <h2>Análisis de Cuellos de Botella</h2>
            <p *ngIf="analysis">{{ analysis.politicaNombre }}</p>
          </div>
        </div>
        <button class="btn-refresh" (click)="loadAnalysis()" [disabled]="isLoading">
          <span class="material-icons" [class.spinning]="isLoading">refresh</span>
        </button>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Analizando flujo con AI...</p>
      </div>

      <div class="analysis-content" *ngIf="!isLoading && analysis">
        <!-- Eficiencia General -->
        <div class="efficiency-card">
          <div class="efficiency-header">
            <span class="material-icons">speed</span>
            <span>Eficiencia General</span>
          </div>
          <div class="efficiency-value" [class.high]="analysis.eficienciaGeneral >= 80" 
               [class.medium]="analysis.eficienciaGeneral >= 60 && analysis.eficienciaGeneral < 80"
               [class.low]="analysis.eficienciaGeneral < 60">
            {{ analysis.eficienciaGeneral }}%
          </div>
          <div class="efficiency-bar">
            <div class="efficiency-fill" [style.width.%]="analysis.eficienciaGeneral"
                 [class.high]="analysis.eficienciaGeneral >= 80" 
                 [class.medium]="analysis.eficienciaGeneral >= 60 && analysis.eficienciaGeneral < 80"
                 [class.low]="analysis.eficienciaGeneral < 60">
            </div>
          </div>
        </div>

        <!-- Cuellos de Botella Detectados -->
        <div class="bottlenecks-section" *ngIf="analysis.cuellosDetectados.length > 0">
          <h3>
            <span class="material-icons">warning</span>
            Cuellos de Botella Detectados ({{ analysis.cuellosDetectados.length }})
          </h3>
          
          <div class="bottleneck-card" *ngFor="let cuello of analysis.cuellosDetectados"
               [class.severity-alta]="cuello.severidad === 'alta'"
               [class.severity-media]="cuello.severidad === 'media'"
               [class.severity-baja]="cuello.severidad === 'baja'">
            
            <div class="bottleneck-header">
              <div class="bottleneck-title">
                <span class="material-icons">account_tree</span>
                <h4>{{ cuello.nodo }}</h4>
              </div>
              <span class="severity-badge" [class]="'severity-' + cuello.severidad">
                {{ cuello.severidad.toUpperCase() }}
              </span>
            </div>

            <div class="bottleneck-stats">
              <div class="stat">
                <span class="material-icons">schedule</span>
                <div>
                  <span class="stat-label">Tiempo Promedio</span>
                  <span class="stat-value">{{ cuello.tiempoPromedio }} días</span>
                </div>
              </div>
              <div class="stat">
                <span class="material-icons">inventory_2</span>
                <div>
                  <span class="stat-label">Trámites Acumulados</span>
                  <span class="stat-value">{{ cuello.tramitesAcumulados }}</span>
                </div>
              </div>
            </div>

            <div class="bottleneck-prediction">
              <span class="material-icons">trending_up</span>
              <p>{{ cuello.prediccion }}</p>
            </div>

            <div class="bottleneck-suggestions">
              <p class="suggestions-title">
                <span class="material-icons">lightbulb</span>
                Sugerencias:
              </p>
              <ul>
                <li *ngFor="let sugerencia of cuello.sugerencias">{{ sugerencia }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Sin Cuellos de Botella -->
        <div class="no-bottlenecks" *ngIf="analysis.cuellosDetectados.length === 0">
          <span class="material-icons">check_circle</span>
          <h3>¡Excelente!</h3>
          <p>No se detectaron cuellos de botella en este flujo</p>
        </div>

        <!-- Recomendaciones -->
        <div class="recommendations-section" *ngIf="analysis.recomendaciones.length > 0">
          <h3>
            <span class="material-icons">psychology</span>
            Recomendaciones AI
          </h3>
          <div class="recommendation-card" *ngFor="let rec of analysis.recomendaciones">
            <span class="material-icons">arrow_forward</span>
            <p>{{ rec }}</p>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!isLoading && !analysis">
        <span class="material-icons">info</span>
        <p>Selecciona una política para ver el análisis</p>
      </div>

      <div class="error-state" *ngIf="error">
        <span class="material-icons">error_outline</span>
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .analysis-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .analysis-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      font-size: 14px;
    }

    .btn-refresh {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 12px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-refresh:hover:not(:disabled) {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state {
      padding: 60px;
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    .analysis-content {
      padding: 24px;
    }

    .efficiency-card {
      background: linear-gradient(to bottom, #f8fafc, #ffffff);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .efficiency-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .efficiency-value {
      font-size: 48px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 16px;
    }

    .efficiency-value.high { color: #10b981; }
    .efficiency-value.medium { color: #f59e0b; }
    .efficiency-value.low { color: #ef4444; }

    .efficiency-bar {
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .efficiency-fill {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 6px;
    }

    .efficiency-fill.high { background: linear-gradient(90deg, #10b981, #059669); }
    .efficiency-fill.medium { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .efficiency-fill.low { background: linear-gradient(90deg, #ef4444, #dc2626); }

    .bottlenecks-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .bottleneck-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.2s;
    }

    .bottleneck-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .bottleneck-card.severity-alta {
      border-left: 4px solid #ef4444;
      background: linear-gradient(to right, #fef2f2, #ffffff);
    }

    .bottleneck-card.severity-media {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(to right, #fffbeb, #ffffff);
    }

    .bottleneck-card.severity-baja {
      border-left: 4px solid #3b82f6;
      background: linear-gradient(to right, #eff6ff, #ffffff);
    }

    .bottleneck-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .bottleneck-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bottleneck-title h4 {
      margin: 0;
      color: #1e293b;
      font-size: 18px;
    }

    .severity-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .severity-badge.severity-alta {
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fecaca;
    }

    .severity-badge.severity-media {
      background: #fffbeb;
      color: #f59e0b;
      border: 1px solid #fde68a;
    }

    .severity-badge.severity-baja {
      background: #eff6ff;
      color: #3b82f6;
      border: 1px solid #bfdbfe;
    }

    .bottleneck-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat .material-icons {
      color: #667eea;
      font-size: 28px;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 2px;
    }

    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }

    .bottleneck-prediction {
      display: flex;
      align-items: start;
      gap: 8px;
      padding: 12px;
      background: #fef3c7;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .bottleneck-prediction .material-icons {
      color: #f59e0b;
      font-size: 20px;
    }

    .bottleneck-prediction p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
      line-height: 1.5;
    }

    .bottleneck-suggestions {
      padding: 12px;
      background: #f0fdf4;
      border-radius: 8px;
    }

    .suggestions-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #166534;
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .suggestions-title .material-icons {
      font-size: 18px;
    }

    .bottleneck-suggestions ul {
      margin: 0;
      padding-left: 20px;
    }

    .bottleneck-suggestions li {
      color: #166534;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .no-bottlenecks {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(to bottom, #f0fdf4, #ffffff);
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .no-bottlenecks .material-icons {
      font-size: 80px;
      color: #10b981;
      margin-bottom: 16px;
    }

    .no-bottlenecks h3 {
      color: #166534;
      margin: 0 0 8px 0;
    }

    .no-bottlenecks p {
      color: #16a34a;
      margin: 0;
    }

    .recommendations-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .recommendation-card {
      display: flex;
      align-items: start;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(to right, #ede9fe, #ffffff);
      border: 1px solid #ddd6fe;
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .recommendation-card .material-icons {
      color: #7c3aed;
      font-size: 20px;
      margin-top: 2px;
    }

    .recommendation-card p {
      margin: 0;
      color: #4c1d95;
      font-size: 14px;
      line-height: 1.6;
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
export class BottleneckAnalysisComponent implements OnInit {
  @Input() politicaId?: number;

  analysis: FlowAnalysis | null = null;
  isLoading = false;
  error = '';

  constructor(private analyzerService: BottleneckAnalyzerService) {}

  ngOnInit() {
    if (this.politicaId) {
      this.loadAnalysis();
    }
  }

  loadAnalysis() {
    if (!this.politicaId) return;

    this.isLoading = true;
    this.error = '';

    this.analyzerService.analyzeWithAI(this.politicaId).subscribe({
      next: (analysis) => {
        this.analysis = analysis;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading analysis:', err);
        this.error = 'Error al cargar el análisis. Por favor intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }
}
