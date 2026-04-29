import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramiteClassifierService, ClassificationResult } from '../../core/services/tramite-classifier.service';

@Component({
  selector: 'app-tramite-form-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-ai-container">
      <!-- Campo de Descripción con AI -->
      <div class="form-group">
        <label>
          Descripción del Trámite
          <span class="required">*</span>
        </label>
        <textarea
          [(ngModel)]="descripcion"
          (ngModelChange)="onDescripcionChange()"
          placeholder="Describe tu trámite aquí..."
          rows="4"
          class="form-control"
        ></textarea>
        <div class="ai-hint" *ngIf="!isClassifying && !classification">
          <span class="material-icons">tips_and_updates</span>
          <span>La AI te ayudará a clasificar tu trámite automáticamente</span>
        </div>
      </div>

      <!-- Botón Clasificar con AI -->
      <button 
        class="btn-classify-ai" 
        (click)="classifyWithAI()"
        [disabled]="!descripcion.trim() || isClassifying"
        *ngIf="!classification"
      >
        <span class="material-icons" *ngIf="!isClassifying">psychology</span>
        <span class="spinner" *ngIf="isClassifying"></span>
        <span>{{ isClassifying ? 'Clasificando con AI...' : 'Clasificar con AI' }}</span>
      </button>

      <!-- Resultado de Clasificación -->
      <div class="classification-result" *ngIf="classification && !isClassifying">
        <div class="result-header">
          <span class="material-icons">auto_awesome</span>
          <h4>Clasificación AI</h4>
          <button class="btn-reclassify" (click)="reclassify()">
            <span class="material-icons">refresh</span>
          </button>
        </div>

        <div class="result-content">
          <!-- Política Sugerida -->
          <div class="result-item">
            <label>Política Sugerida:</label>
            <div class="suggested-policy">
              <span class="policy-name">{{ classification.politicaSugerida.nombre }}</span>
              <span class="confidence-badge" [class.high]="classification.politicaSugerida.confianza >= 80">
                {{ classification.politicaSugerida.confianza }}% confianza
              </span>
            </div>
          </div>

          <!-- Prioridad -->
          <div class="result-item">
            <label>Prioridad Sugerida:</label>
            <span class="priority-badge" [class]="'priority-' + classification.prioridad.toLowerCase()">
              {{ classification.prioridad }}
            </span>
          </div>

          <!-- Razonamiento -->
          <div class="result-item">
            <label>Razonamiento:</label>
            <p class="reasoning">{{ classification.razonamiento }}</p>
          </div>

          <!-- Tags -->
          <div class="result-item" *ngIf="classification.tags.length > 0">
            <label>Tags Sugeridos:</label>
            <div class="tags-container">
              <span class="tag" *ngFor="let tag of classification.tags">{{ tag }}</span>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="action-buttons">
            <button class="btn-accept" (click)="acceptClassification()">
              <span class="material-icons">check_circle</span>
              <span>Aceptar Sugerencias</span>
            </button>
            <button class="btn-manual" (click)="useManual()">
              <span class="material-icons">edit</span>
              <span>Seleccionar Manualmente</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Selección Manual (después de aceptar o rechazar AI) -->
      <div class="manual-selection" *ngIf="showManualSelection">
        <div class="form-group">
          <label>
            Política
            <span class="required">*</span>
          </label>
          <select [(ngModel)]="selectedPoliticaId" class="form-control">
            <option value="">Selecciona una política</option>
            <option *ngFor="let politica of politicas" [value]="politica.id">
              {{ politica.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Prioridad</label>
          <div class="priority-options">
            <label class="priority-option" [class.selected]="selectedPrioridad === 'ALTA'">
              <input type="radio" [(ngModel)]="selectedPrioridad" value="ALTA" />
              <span class="priority-badge priority-alta">ALTA</span>
            </label>
            <label class="priority-option" [class.selected]="selectedPrioridad === 'MEDIA'">
              <input type="radio" [(ngModel)]="selectedPrioridad" value="MEDIA" />
              <span class="priority-badge priority-media">MEDIA</span>
            </label>
            <label class="priority-option" [class.selected]="selectedPrioridad === 'BAJA'">
              <input type="radio" [(ngModel)]="selectedPrioridad" value="BAJA" />
              <span class="priority-badge priority-baja">BAJA</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div class="error-message" *ngIf="error">
        <span class="material-icons">error_outline</span>
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .form-ai-container {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .required {
      color: #ef4444;
      margin-left: 4px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .ai-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px 12px;
      background: #eff6ff;
      border-radius: 6px;
      font-size: 13px;
      color: #1e40af;
    }

    .ai-hint .material-icons {
      font-size: 18px;
    }

    .btn-classify-ai {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .btn-classify-ai:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    }

    .btn-classify-ai:disabled {
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

    .classification-result {
      background: linear-gradient(to bottom, #faf5ff, #ffffff);
      border: 2px solid #e9d5ff;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e9d5ff;
    }

    .result-header .material-icons {
      color: #7c3aed;
      font-size: 24px;
    }

    .result-header h4 {
      flex: 1;
      margin: 0;
      color: #6d28d9;
      font-size: 16px;
    }

    .btn-reclassify {
      background: rgba(124, 58, 237, 0.1);
      border: none;
      color: #7c3aed;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .btn-reclassify:hover {
      background: rgba(124, 58, 237, 0.2);
    }

    .result-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .result-item label {
      display: block;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .suggested-policy {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: white;
      border: 2px solid #e9d5ff;
      border-radius: 8px;
    }

    .policy-name {
      font-weight: 600;
      color: #1e293b;
    }

    .confidence-badge {
      padding: 4px 12px;
      background: #fef3c7;
      color: #92400e;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .confidence-badge.high {
      background: #d1fae5;
      color: #065f46;
    }

    .priority-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .priority-badge.priority-alta {
      background: #fee2e2;
      color: #991b1b;
    }

    .priority-badge.priority-media {
      background: #fef3c7;
      color: #92400e;
    }

    .priority-badge.priority-baja {
      background: #dbeafe;
      color: #1e40af;
    }

    .reasoning {
      margin: 0;
      padding: 12px;
      background: white;
      border: 2px solid #e9d5ff;
      border-radius: 8px;
      color: #4c1d95;
      font-size: 14px;
      line-height: 1.6;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      padding: 4px 12px;
      background: #ede9fe;
      color: #6d28d9;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-accept, .btn-manual {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-accept {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-accept:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-manual {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }

    .btn-manual:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .manual-selection {
      animation: slideIn 0.3s ease;
    }

    .priority-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .priority-option {
      cursor: pointer;
      transition: all 0.2s;
    }

    .priority-option input[type="radio"] {
      display: none;
    }

    .priority-option .priority-badge {
      display: block;
      text-align: center;
      padding: 12px;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .priority-option:hover .priority-badge {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .priority-option.selected .priority-badge {
      border-color: currentColor;
      box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 13px;
      margin-top: 12px;
    }
  `]
})
export class TramiteFormAIComponent implements OnInit {
  @Input() politicas: any[] = [];
  @Output() formDataChange = new EventEmitter<{
    descripcion: string;
    politicaId: string;
    prioridad: string;
    classification?: ClassificationResult;
  }>();

  descripcion = '';
  classification: ClassificationResult | null = null;
  isClassifying = false;
  error = '';
  showManualSelection = false;
  selectedPoliticaId = '';
  selectedPrioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA';

  private typingTimer: any;

  constructor(private classifierService: TramiteClassifierService) {}

  ngOnInit() {
    // Auto-seleccionar primera política si existe
    if (this.politicas.length > 0) {
      this.selectedPoliticaId = this.politicas[0].id;
    }
  }

  onDescripcionChange() {
    // Reset classification cuando cambia la descripción
    if (this.classification) {
      this.classification = null;
      this.showManualSelection = false;
    }

    // Auto-clasificar después de 2 segundos de inactividad
    clearTimeout(this.typingTimer);
    if (this.descripcion.trim().length > 20) {
      this.typingTimer = setTimeout(() => {
        this.classifyWithAI();
      }, 2000);
    }
  }

  classifyWithAI() {
    if (!this.descripcion.trim()) return;

    this.isClassifying = true;
    this.error = '';

    this.classifierService.classifyTramite(this.descripcion).subscribe({
      next: (result) => {
        this.classification = result;
        this.isClassifying = false;
      },
      error: (err) => {
        console.error('Error classifying:', err);
        this.error = 'Error al clasificar. Intenta de nuevo o selecciona manualmente.';
        this.isClassifying = false;
        this.showManualSelection = true;
      }
    });
  }

  reclassify() {
    this.classification = null;
    this.classifyWithAI();
  }

  acceptClassification() {
    if (!this.classification) return;

    this.selectedPoliticaId = this.classification.politicaSugerida.id.toString();
    this.selectedPrioridad = this.classification.prioridad;
    this.showManualSelection = true;

    this.emitFormData();
  }

  useManual() {
    this.showManualSelection = true;
    this.emitFormData();
  }

  private emitFormData() {
    this.formDataChange.emit({
      descripcion: this.descripcion,
      politicaId: this.selectedPoliticaId,
      prioridad: this.selectedPrioridad,
      classification: this.classification || undefined
    });
  }
}
