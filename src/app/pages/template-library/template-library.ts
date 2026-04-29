import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TemplateService, PolicyTemplate } from '../../core/services/template.service';
import { OpenAIService } from '../../core/services/openai.service';
import { PoliticaService } from '../../core/services/politica.service';

@Component({
  selector: 'app-template-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="template-library-container">
      <div class="page-header">
        <div>
          <h1><span class="material-icons">auto_awesome</span> Flujo de Actividades</h1>
          <p class="subtitle">Encuentra y usa plantillas de políticas con búsqueda inteligente</p>
        </div>
      </div>

      <!-- AI Search Bar -->
      <div class="search-section">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="onSearchChange()"
            placeholder="Busca plantillas con AI: 'proceso de instalación eléctrica', 'flujo de aprobación'..."
            class="search-input"
          />
          <button class="btn-ai-search" (click)="searchWithAI()" [disabled]="isSearching || !searchQuery.trim()">
            <span class="material-icons">{{ isSearching ? 'hourglass_empty' : 'psychology' }}</span>
            {{ isSearching ? 'Buscando...' : 'Buscar con AI' }}
          </button>
        </div>
        <div class="search-info" *ngIf="isSearching">
          <span class="material-icons spinning">sync</span>
          Analizando tu consulta con inteligencia artificial...
        </div>
      </div>

      <!-- Category Filter -->
      <div class="filter-section">
        <button 
          class="filter-btn" 
          [class.active]="selectedCategory === null"
          (click)="filterByCategory(null)"
        >
          Todas
        </button>
        <button 
          *ngFor="let cat of categories" 
          class="filter-btn"
          [class.active]="selectedCategory === cat"
          (click)="filterByCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Templates Grid -->
      <div class="templates-grid">
        <div *ngIf="filteredTemplates.length === 0" class="empty-state">
          <span class="material-icons">search_off</span>
          <p>No se encontraron plantillas</p>
          <button class="btn-secondary" (click)="resetSearch()">Limpiar búsqueda</button>
        </div>

        <div *ngFor="let template of filteredTemplates" class="template-card">
          <div class="card-icon">
            <span class="material-icons">{{ template.icono }}</span>
          </div>
          <div class="card-content">
            <h3>{{ template.nombre }}</h3>
            <p class="card-description">{{ template.descripcion }}</p>
            <div class="card-meta">
              <span class="category-badge">{{ template.categoria }}</span>
              <span class="type-badge">{{ template.tipoFlujo }}</span>
            </div>
            <div class="card-tags">
              <span *ngFor="let tag of template.tags" class="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-preview" (click)="previewTemplate(template)">
              <span class="material-icons">visibility</span>
              Vista Previa
            </button>
            <button class="btn-use" (click)="useTemplate(template)">
              <span class="material-icons">download</span>
              Usar Plantilla
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div class="modal" [class.active]="showPreview" (click)="closePreview()">
        <div class="modal-content-preview" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <span class="material-icons">{{ selectedTemplate?.icono }}</span>
              {{ selectedTemplate?.nombre }}
            </h2>
            <button class="btn-close" (click)="closePreview()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="selectedTemplate">
            <div class="preview-info">
              <p><strong>Descripción:</strong> {{ selectedTemplate.descripcion }}</p>
              <p><strong>Categoría:</strong> {{ selectedTemplate.categoria }}</p>
              <p><strong>Tipo de Flujo:</strong> {{ selectedTemplate.tipoFlujo }}</p>
              <div class="preview-tags">
                <strong>Tags:</strong>
                <span *ngFor="let tag of selectedTemplate.tags" class="tag">{{ tag }}</span>
              </div>
            </div>
            
            <h4>Flujo del Proceso:</h4>
            <div class="flow-preview">
              <div *ngFor="let nodo of selectedTemplate.flujo; let last = last" class="flow-node">
                <div class="node-badge" [class]="getNodoClass(nodo.tipo)">
                  <span class="material-icons">{{ getNodoIcon(nodo.tipo) }}</span>
                  {{ nodo.nombre }}
                </div>
                <div *ngIf="!last" class="flow-arrow">↓</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closePreview()">Cerrar</button>
            <button class="btn-primary" (click)="useTemplate(selectedTemplate!)">
              <span class="material-icons">download</span>
              Usar esta Plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .template-library-container {
      padding: 30px;
      max-width: 1400px;
      margin: 0 auto;
      background: #f5f7fa;
      min-height: 100vh;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .page-header h1 .material-icons {
      font-size: 36px;
      color: #667eea;
    }

    .subtitle {
      color: #7f8c8d;
      margin: 0;
      font-size: 16px;
    }

    .search-section {
      margin: 30px 0;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 50px;
      padding: 8px 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      gap: 12px;
    }

    .search-bar .material-icons {
      color: #95a5a6;
      font-size: 24px;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 15px;
      padding: 10px;
    }

    .btn-ai-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-ai-search:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-ai-search:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .search-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      color: #667eea;
      font-size: 14px;
      padding-left: 20px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .filter-section {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 20px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      color: #555;
    }

    .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
      margin-top: 30px;
    }

    .template-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .card-icon .material-icons {
      font-size: 32px;
    }

    .card-content h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 20px;
    }

    .card-description {
      color: #7f8c8d;
      font-size: 14px;
      line-height: 1.6;
      margin: 8px 0;
    }

    .card-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .category-badge, .type-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .category-badge {
      background: #e3f2fd;
      color: #1976d2;
    }

    .type-badge {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .card-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .tag {
      padding: 4px 10px;
      background: #f5f5f5;
      border-radius: 10px;
      font-size: 11px;
      color: #666;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }

    .btn-preview, .btn-use {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-preview {
      background: #f0f0f0;
      color: #555;
    }

    .btn-preview:hover {
      background: #e0e0e0;
    }

    .btn-use {
      background: #667eea;
      color: white;
    }

    .btn-use:hover {
      background: #5568d3;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state .material-icons {
      font-size: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 16px;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      z-index: 10000;
      align-items: center;
      justify-content: center;
    }

    .modal.active {
      display: flex;
    }

    .modal-content-preview {
      background: white;
      border-radius: 16px;
      width: 700px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2c3e50;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: #999;
      line-height: 1;
    }

    .modal-body {
      padding: 24px;
    }

    .preview-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .preview-info p {
      margin: 8px 0;
      color: #555;
    }

    .preview-tags {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .modal-body h4 {
      color: #2c3e50;
      margin: 24px 0 16px 0;
    }

    .flow-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .flow-node {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .node-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
    }

    .node-badge.inicio {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .node-badge.tarea {
      background: #e3f2fd;
      color: #1976d2;
    }

    .node-badge.decision {
      background: #fff3e0;
      color: #f57c00;
    }

    .node-badge.fin {
      background: #ffebee;
      color: #c62828;
    }

    .flow-arrow {
      font-size: 24px;
      color: #bbb;
      margin: 4px 0;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e0e0e0;
    }

    .btn-cancel {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
    }

    .btn-cancel:hover {
      background: #7f8c8d;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-primary:hover {
      background: #5568d3;
    }
  `]
})
export class TemplateLibraryComponent implements OnInit {
  templates: PolicyTemplate[] = [];
  filteredTemplates: PolicyTemplate[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  searchQuery = '';
  isSearching = false;
  showPreview = false;
  selectedTemplate: PolicyTemplate | null = null;

  constructor(
    private templateService: TemplateService,
    private openaiService: OpenAIService,
    private politicaService: PoliticaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.templateService.getAllTemplates().subscribe(templates => {
      this.templates = templates;
      this.filteredTemplates = templates;
      this.categories = this.templateService.getCategories();
    });
  }

  onSearchChange() {
    if (!this.searchQuery.trim()) {
      this.applyFilters();
    }
  }

  searchWithAI() {
    if (!this.searchQuery.trim()) return;

    this.isSearching = true;
    this.openaiService.searchTemplates(this.searchQuery, this.templates).subscribe({
      next: (results) => {
        this.filteredTemplates = results;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error en búsqueda AI:', err);
        // Fallback a búsqueda normal
        this.templateService.searchTemplates(this.searchQuery).subscribe(results => {
          this.filteredTemplates = results;
          this.isSearching = false;
        });
      }
    });
  }

  filterByCategory(category: string | null) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters() {
    let results = this.templates;

    if (this.selectedCategory) {
      results = results.filter(t => t.categoria === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      results = results.filter(t =>
        t.nombre.toLowerCase().includes(query) ||
        t.descripcion.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    this.filteredTemplates = results;
  }

  resetSearch() {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.filteredTemplates = this.templates;
  }

  previewTemplate(template: PolicyTemplate) {
    this.selectedTemplate = template;
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
    this.selectedTemplate = null;
  }

  useTemplate(template: PolicyTemplate) {
    const nuevaPolitica = {
      nombre: template.nombre,
      descripcion: template.descripcion,
      tipoFlujo: template.tipoFlujo,
      activo: true,
      flujo: template.flujo,
      diagramaJson: template.diagramaJson
    };

    this.politicaService.crearPolitica(nuevaPolitica).subscribe({
      next: (politica) => {
        alert(`Plantilla "${template.nombre}" creada exitosamente como nueva política`);
        this.closePreview();
        this.router.navigate(['/diagramador'], { queryParams: { politicaId: politica.id } });
      },
      error: (err) => {
        console.error('Error creando política:', err);
        alert('Error al crear la política desde la plantilla');
      }
    });
  }

  getNodoClass(tipo: string): string {
    return tipo.toLowerCase();
  }

  getNodoIcon(tipo: string): string {
    const icons: any = {
      'INICIO': 'play_circle',
      'TAREA': 'task',
      'DECISION': 'alt_route',
      'FIN': 'check_circle'
    };
    return icons[tipo] || 'circle';
  }
}
