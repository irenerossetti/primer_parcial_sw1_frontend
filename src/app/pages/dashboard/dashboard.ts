import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPIService } from '../../core/services/kpi.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard de KPIs</h1>
        <p>Métricas y análisis del sistema</p>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">receipt</span>
          </div>
          <div class="stat-info">
            <h3>{{ resumen?.total || 0 }}</h3>
            <p>Total Trámites</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">schedule</span>
          </div>
          <div class="stat-info">
            <h3>{{ resumen?.enProceso || 0 }}</h3>
            <p>En Proceso</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="stat-info">
            <h3>{{ resumen?.completados || 0 }}</h3>
            <p>Completados</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">trending_up</span>
          </div>
          <div class="stat-info">
            <h3>{{ resumen?.tasaExito || 0 }}%</h3>
            <p>Tasa de Éxito</p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Trámites por Estado</h3>
          <canvas #estadoChart></canvas>
        </div>
        <div class="chart-card">
          <h3>Trámites por Departamento</h3>
          <canvas #departamentoChart></canvas>
        </div>
      </div>

      <div class="chart-card-full">
        <h3>Tendencia de Trámites (Últimos 7 días)</h3>
        <canvas #tendenciaChart></canvas>
      </div>

      <!-- Rendimiento por Departamento -->
      <div class="rendimiento-section">
        <h2>Rendimiento por Departamento</h2>
        <div class="rendimiento-grid">
          <div class="rendimiento-card" *ngFor="let dept of rendimientoDepartamentos">
            <h4>{{ dept.departamento }}</h4>
            <div class="rendimiento-stats">
              <div class="stat-item">
                <span class="label">Total:</span>
                <span class="value">{{ dept.totalTramites }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Completados:</span>
                <span class="value">{{ dept.completados }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Tiempo Promedio:</span>
                <span class="value">{{ dept.tiempoPromedio }}h</span>
              </div>
              <div class="stat-item">
                <span class="label">Tasa Éxito:</span>
                <span class="value success">{{ dept.tasaExito }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { 
      padding: 20px; 
      height: calc(100vh - 64px);
      overflow-y: auto;
    }
    
    .page-header { margin-bottom: 20px; }
    .page-header h1 { font-size: 1.8rem; color: #2c3e50; margin-bottom: 5px; }
    .page-header p { color: #666; font-size: 0.9rem; }
    
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 15px; 
      margin-bottom: 20px; 
    }
    
    .stat-card { 
      background: white; 
      padding: 15px; 
      border-radius: 8px; 
      display: flex; 
      align-items: center;
      gap: 12px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.08); 
    }
    
    .stat-icon { 
      width: 45px; 
      height: 45px; 
      background: #e3f2fd; 
      border-radius: 8px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    
    .stat-icon .material-icons { 
      font-size: 24px; 
      color: #1e3a8a; 
    }
    
    .stat-info h3 { 
      font-size: 1.5rem; 
      margin: 0; 
      color: #2c3e50; 
    }
    
    .stat-info p { 
      color: #666; 
      margin: 3px 0 0; 
      font-size: 0.85rem;
    }
    
    .charts-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 15px; 
      margin-bottom: 15px; 
    }
    
    .chart-card, .chart-card-full { 
      background: white; 
      padding: 15px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.08); 
    }
    
    .chart-card-full { margin-bottom: 15px; }
    
    .chart-card h3, .chart-card-full h3 { 
      font-size: 1rem; 
      margin: 0 0 15px 0; 
      color: #2c3e50; 
    }
    
    canvas { 
      max-height: 250px; 
    }
    
    .rendimiento-section { 
      background: white; 
      padding: 15px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.08); 
    }
    
    .rendimiento-section h2 { 
      font-size: 1.1rem; 
      margin: 0 0 15px 0; 
      color: #2c3e50; 
    }
    
    .rendimiento-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 15px; 
    }
    
    .rendimiento-card { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 8px; 
      border-left: 4px solid #1e3a8a;
    }
    
    .rendimiento-card h4 { 
      margin: 0 0 12px 0; 
      color: #1e3a8a; 
      font-size: 0.95rem;
    }
    
    .rendimiento-stats { 
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
    }
    
    .stat-item { 
      display: flex; 
      justify-content: space-between; 
      font-size: 0.85rem;
    }
    
    .stat-item .label { color: #666; }
    .stat-item .value { font-weight: 600; color: #2c3e50; }
    .stat-item .value.success { color: #2e7d32; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('estadoChart') estadoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('departamentoChart') departamentoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tendenciaChart') tendenciaChartRef!: ElementRef<HTMLCanvasElement>;

  resumen: any = null;
  rendimientoDepartamentos: any[] = [];

  private estadoChart?: Chart;
  private departamentoChart?: Chart;
  private tendenciaChart?: Chart;

  constructor(private kpiService: KPIService) {}

  ngOnInit() {
    this.cargarResumen();
    this.cargarRendimientoDepartamentos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cargarGraficoEstados();
      this.cargarGraficoDepartamentos();
      this.cargarGraficoTendencia();
    }, 100);
  }

  cargarResumen() {
    console.log('Cargando resumen KPI...');
    this.kpiService.getResumen().subscribe({
      next: (data) => {
        console.log('Resumen recibido:', data);
        this.resumen = data;
      },
      error: (err) => console.error('Error al cargar resumen:', err)
    });
  }

  cargarRendimientoDepartamentos() {
    console.log('Cargando rendimiento departamentos...');
    this.kpiService.getRendimientoDepartamentos().subscribe({
      next: (data) => {
        console.log('Rendimiento recibido:', data);
        this.rendimientoDepartamentos = data;
      },
      error: (err) => console.error('Error al cargar rendimiento:', err)
    });
  }

  cargarGraficoEstados() {
    console.log('Cargando gráfico de estados...');
    this.kpiService.getPorEstado().subscribe({
      next: (data: any[]) => {
        console.log('Datos de estados recibidos:', data);
        const ctx = this.estadoChartRef.nativeElement.getContext('2d');
        if (ctx) {
          this.estadoChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: data.map((d: any) => d.estado),
              datasets: [{
                data: data.map((d: any) => d.cantidad),
                backgroundColor: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }
          });
          console.log('Gráfico de estados creado');
        }
      },
      error: (err: any) => console.error('Error al cargar gráfico de estados:', err)
    });
  }

  cargarGraficoDepartamentos() {
    console.log('Cargando gráfico de departamentos...');
    this.kpiService.getPorDepartamento().subscribe({
      next: (data: any[]) => {
        console.log('Datos de departamentos recibidos:', data);
        const ctx = this.departamentoChartRef.nativeElement.getContext('2d');
        if (ctx) {
          this.departamentoChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: data.map((d: any) => d.departamento),
              datasets: [{
                label: 'Trámites',
                data: data.map((d: any) => d.cantidad),
                backgroundColor: '#1e3a8a'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }
          });
          console.log('Gráfico de departamentos creado');
        }
      },
      error: (err: any) => console.error('Error al cargar gráfico de departamentos:', err)
    });
  }

  cargarGraficoTendencia() {
    console.log('Cargando gráfico de tendencia...');
    this.kpiService.getTendencia(7).subscribe({
      next: (data: any[]) => {
        console.log('Datos de tendencia recibidos:', data);
        const ctx = this.tendenciaChartRef.nativeElement.getContext('2d');
        if (ctx) {
          this.tendenciaChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.map((d: any) => d.fecha),
              datasets: [{
                label: 'Trámites Creados',
                data: data.map((d: any) => d.cantidad),
                borderColor: '#1e3a8a',
                backgroundColor: 'rgba(30, 58, 138, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }
          });
          console.log('Gráfico de tendencia creado');
        }
      },
      error: (err: any) => console.error('Error al cargar gráfico de tendencia:', err)
    });
  }
}