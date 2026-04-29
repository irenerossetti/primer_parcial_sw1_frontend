import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface CampoFormulario {
  nombre: string;
  etiqueta: string;
  tipo: 'TEXT' | 'EMAIL' | 'PHONE' | 'DATE' | 'NUMBER' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'FILE';
  requerido: boolean;
  validacion?: string;
  opciones?: { valor: string; etiqueta: string }[];
  ayuda?: string;
  orden: number;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="dynamic-form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div *ngFor="let campo of camposOrdenados" class="form-field">
          
          <!-- TEXT, EMAIL, PHONE, NUMBER -->
          <div *ngIf="['TEXT', 'EMAIL', 'PHONE', 'NUMBER'].includes(campo.tipo)" class="field-group">
            <label [for]="campo.nombre">
              {{ campo.etiqueta }}
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <input
              [id]="campo.nombre"
              [formControlName]="campo.nombre"
              [type]="getInputType(campo.tipo)"
              [placeholder]="campo.etiqueta"
              class="form-control"
              [class.error]="isFieldInvalid(campo.nombre)"
            />
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
            <div class="error-message" *ngIf="isFieldInvalid(campo.nombre)">
              <span *ngIf="form.get(campo.nombre)?.errors?.['required']">Este campo es requerido</span>
              <span *ngIf="form.get(campo.nombre)?.errors?.['email']">Email inválido</span>
              <span *ngIf="form.get(campo.nombre)?.errors?.['pattern']">Formato inválido</span>
            </div>
          </div>

          <!-- DATE -->
          <div *ngIf="campo.tipo === 'DATE'" class="field-group">
            <label [for]="campo.nombre">
              {{ campo.etiqueta }}
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <input
              [id]="campo.nombre"
              [formControlName]="campo.nombre"
              type="date"
              class="form-control"
              [class.error]="isFieldInvalid(campo.nombre)"
            />
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
            <div class="error-message" *ngIf="isFieldInvalid(campo.nombre)">
              Este campo es requerido
            </div>
          </div>

          <!-- TEXTAREA -->
          <div *ngIf="campo.tipo === 'TEXTAREA'" class="field-group">
            <label [for]="campo.nombre">
              {{ campo.etiqueta }}
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <textarea
              [id]="campo.nombre"
              [formControlName]="campo.nombre"
              [placeholder]="campo.etiqueta"
              rows="4"
              class="form-control"
              [class.error]="isFieldInvalid(campo.nombre)"
            ></textarea>
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
            <div class="error-message" *ngIf="isFieldInvalid(campo.nombre)">
              Este campo es requerido
            </div>
          </div>

          <!-- SELECT -->
          <div *ngIf="campo.tipo === 'SELECT'" class="field-group">
            <label [for]="campo.nombre">
              {{ campo.etiqueta }}
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <select
              [id]="campo.nombre"
              [formControlName]="campo.nombre"
              class="form-control"
              [class.error]="isFieldInvalid(campo.nombre)"
            >
              <option value="">Selecciona una opción</option>
              <option *ngFor="let opcion of campo.opciones" [value]="opcion.valor">
                {{ opcion.etiqueta }}
              </option>
            </select>
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
            <div class="error-message" *ngIf="isFieldInvalid(campo.nombre)">
              Este campo es requerido
            </div>
          </div>

          <!-- CHECKBOX -->
          <div *ngIf="campo.tipo === 'CHECKBOX'" class="field-group checkbox-group">
            <label class="checkbox-label">
              <input
                [id]="campo.nombre"
                [formControlName]="campo.nombre"
                type="checkbox"
                class="checkbox-input"
              />
              <span>{{ campo.etiqueta }}</span>
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
          </div>

          <!-- RADIO -->
          <div *ngIf="campo.tipo === 'RADIO'" class="field-group">
            <label>
              {{ campo.etiqueta }}
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <div class="radio-group">
              <label *ngFor="let opcion of campo.opciones" class="radio-label">
                <input
                  [formControlName]="campo.nombre"
                  type="radio"
                  [value]="opcion.valor"
                  class="radio-input"
                />
                <span>{{ opcion.etiqueta }}</span>
              </label>
            </div>
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
            <div class="error-message" *ngIf="isFieldInvalid(campo.nombre)">
              Este campo es requerido
            </div>
          </div>

          <!-- FILE -->
          <div *ngIf="campo.tipo === 'FILE'" class="field-group">
            <label [for]="campo.nombre">
              {{ campo.etiqueta }}
              <span class="required" *ngIf="campo.requerido">*</span>
            </label>
            <input
              [id]="campo.nombre"
              type="file"
              (change)="onFileChange($event, campo.nombre)"
              class="form-control file-input"
              [class.error]="isFieldInvalid(campo.nombre)"
            />
            <small class="help-text" *ngIf="campo.ayuda">{{ campo.ayuda }}</small>
            <div class="error-message" *ngIf="isFieldInvalid(campo.nombre)">
              Este campo es requerido
            </div>
          </div>

        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()" *ngIf="showCancelButton">
            <span class="material-icons">cancel</span>
            Cancelar
          </button>
          <button type="submit" class="btn-submit" [disabled]="!form.valid || isSubmitting">
            <span class="material-icons" *ngIf="!isSubmitting">check_circle</span>
            <span class="spinner" *ngIf="isSubmitting"></span>
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dynamic-form-container {
      padding: 20px;
      background: white;
      border-radius: 12px;
    }

    .form-field {
      margin-bottom: 24px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-weight: 600;
      color: #334155;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #ef4444;
      font-weight: bold;
    }

    .form-control {
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s;
      width: 100%;
    }

    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .help-text {
      font-size: 12px;
      color: #64748b;
      font-style: italic;
    }

    .error-message {
      font-size: 12px;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 400;
    }

    .radio-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .file-input {
      padding: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
    }

    .btn-cancel, .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
    }

    .btn-submit {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .material-icons {
      font-size: 20px;
    }
  `]
})
export class DynamicFormComponent implements OnInit {
  @Input() campos: CampoFormulario[] = [];
  @Input() valoresIniciales: any = {};
  @Input() submitButtonText = 'Enviar';
  @Input() showCancelButton = true;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;
  camposOrdenados: CampoFormulario[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.camposOrdenados = [...this.campos].sort((a, b) => a.orden - b.orden);
    this.buildForm();
  }

  private buildForm() {
    const group: any = {};

    this.campos.forEach(campo => {
      const validators = [];
      
      if (campo.requerido) {
        validators.push(Validators.required);
      }

      if (campo.tipo === 'EMAIL') {
        validators.push(Validators.email);
      }

      if (campo.validacion) {
        validators.push(Validators.pattern(campo.validacion));
      }

      const valorInicial = this.valoresIniciales[campo.nombre] || 
                          (campo.tipo === 'CHECKBOX' ? false : '');
      
      group[campo.nombre] = [valorInicial, validators];
    });

    this.form = this.fb.group(group);
  }

  getInputType(tipo: string): string {
    const typeMap: any = {
      'TEXT': 'text',
      'EMAIL': 'email',
      'PHONE': 'tel',
      'NUMBER': 'number'
    };
    return typeMap[tipo] || 'text';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onFileChange(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({
        [fieldName]: file
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.formSubmit.emit(this.form.value);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  resetForm() {
    this.form.reset();
    this.isSubmitting = false;
  }

  setSubmitting(value: boolean) {
    this.isSubmitting = value;
  }
}
