import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AITemplateGeneratorService } from '../../core/services/ai-template-generator.service';
import { PolicyTemplate } from '../../core/services/template.service';

@Component({
  selector: 'app-template-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="generator-container">
      <button class="generator-fab" (click)="togglePanel()" *ngIf="!showPanel">
        <span class="material-icons">auto_awesome</span>
      </button>

      <div class="generator-panel" *ngIf="showPanel">
        <div class="panel-header">
          <div class="header-content">
            <span class="material-icons">auto_awesome</span>
            <span class="header-title">Generar Plantilla con AI</span>
          </div>
          <button class="btn-close" (click)="togglePanel()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="panel-body">
          <div class="description-section">
            <label>Describe el proceso que necesitas:</label>
            <textarea 
              [(ngModel)]="description" 
              placeholder="Ej: Necesito un proceso de aprobación de gastos con 3 niveles de autorización..."
              rows="4"
              [disabled]="isGenerating"
            ></textarea>
            
            <div class="examples">
              <p class="examples-title">Ejemplos:</p>
              <button 
                *ngFor="let example of examples" 
                class="example-btn"
                (click)="description = example"
                [disabled]="isGenerating"
              >
                {{ example }}
              </button>
            </div>
          </div>

          <button 
            class="btn-generate" 
            (click)="generate()"
            [disabled]="!description.trim() || isGenerating"
          >
            <span class="material-icons" *ngIf="!isGenerating">psychology</span>
            <span class="spinner" *ngIf="isGenerating"></span>
            <span>{{ isGenerating ? 'Generando...' : 'Generar Plantilla' }}</span>
          </button>

          <div class="result-section" *ngIf="generatedTemplate">
            <h3>✨ Plantilla Generada</h3>
            <div class="template-card">
              <div class="template-header">
                <span class="material-icons">{{ generatedTemplate.icono }}</span>
                <div>
                  <h4>{{ generatedTemplate.nombre }}</h4>
                  <p>{{ generatedTemplate.descripcion }}</p>
                </div>
              </div>
              <div class="template-meta">
                <span class="badge">{{ generatedTemplate.categoria }}</span>
                <span class="badge" *ngFor="let tag of generatedTemplate.tags">{{ tag }}</span>
              </div>
              <div class="template-flow">
                <p><strong>Flujo:</strong> {{ generatedTemplate.tipoFlujo }}</p>
                <p><strong>Nodos:</strong> {{ generatedTemplate.flujo.length }}</p>
              </div>
              <button class="btn-use" (click)="useTemplate()">
                <span class="material-icons">check_circle</span>
                <span>Usar Esta Plantilla</span>
              </button>
            </div>
          </div>

          <div class="error-message" *ngIf="error">
            <span class="material-icons">error_outline</span>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .generator-container {
      position: fixed;
      bottom: 180px;
      right: 30px;
      z-index: 9997;
    }

    .generator-fab {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(240, 147, 251, 0.4);
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .generator-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(240, 147, 251, 0.6);
    }

    .generator-fab .material-icons {
      font-size: 32px;
    }

    .generator-panel {
      width: 450px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .panel-header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 18px 24px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title {
      font-weight: 700;
      font-size: 17px;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .panel-body {
      padding: 24px;
      max-height: 600px;
      overflow-y: auto;
    }

    .description-section label {
      display: block;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      transition: all 0.2s;
    }

    textarea:focus {
      outline: none;
      border-color: #f093fb;
      box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
    }

    .examples {
      margin-top: 16px;
    }

    .examples-title {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .example-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #475569;
      transition: all 0.2s;
    }

    .example-btn:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #f093fb;
    }

    .example-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-generate {
      width: 100%;
      padding: 14px;
      margin-top: 16px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-generate:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
    }

    .btn-generate:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .result-section {
      margin-top: 24px;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .result-section h3 {
      color: #334155;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .template-card {
      background: linear-gradient(to bottom, #faf5ff, #ffffff);
      border: 2px solid #f093fb;
      border-radius: 16px;
      padding: 20px;
    }

    .template-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .template-header .material-icons {
      font-size: 40px;
      color: #f093fb;
    }

    .template-header h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
    }

    .template-header p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }

    .template-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .badge {
      padding: 4px 12px;
      background: rgba(240, 147, 251, 0.1);
      color: #f5576c;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .template-flow {
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .template-flow p {
      margin: 4px 0;
      font-size: 13px;
      color: #475569;
    }

    .btn-use {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-use:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .error-message {
      margin-top: 16px;
      padding: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
  `]
})
export class TemplateGeneratorComponent {
  @Output() templateGenerated = new EventEmitter<PolicyTemplate>();

  showPanel = false;
  description = '';
  isGenerating = false;
  generatedTemplate: PolicyTemplate | null = null;
  error = '';

  examples = [
    'Proceso de aprobación de gastos con 3 niveles de autorización',
    'Flujo de atención de quejas y reclamos de clientes',
    'Proceso de solicitud y aprobación de vacaciones',
    'Gestión de incidentes de seguridad informática'
  ];

  constructor(private generatorService: AITemplateGeneratorService) {}

  togglePanel() {
    this.showPanel = !this.showPanel;
    if (!this.showPanel) {
      this.reset();
    }
  }

  generate() {
    if (!this.description.trim()) return;

    this.isGenerating = true;
    this.error = '';
    this.generatedTemplate = null;

    this.generatorService.generateTemplate(this.description).subscribe({
      next: (template) => {
        this.generatedTemplate = template;
        this.isGenerating = false;
      },
      error: (err) => {
        console.error('Error generating template:', err);
        this.error = 'Error al generar la plantilla. Por favor intenta de nuevo.';
        this.isGenerating = false;
      }
    });
  }

  useTemplate() {
    if (this.generatedTemplate) {
      this.templateGenerated.emit(this.generatedTemplate);
      this.togglePanel();
    }
  }

  private reset() {
    this.description = '';
    this.generatedTemplate = null;
    this.error = '';
  }
}
