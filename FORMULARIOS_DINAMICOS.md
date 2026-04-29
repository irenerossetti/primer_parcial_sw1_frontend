# Formularios Dinámicos - Documentación

## ✅ Implementación Completada

Se ha implementado un sistema completo de formularios dinámicos que permite:

### Backend (Java/Spring Boot)

1. **Modelo `CampoFormulario`** - Define campos dinámicos con:
   - Tipos: TEXT, EMAIL, PHONE, DATE, NUMBER, TEXTAREA, SELECT, CHECKBOX, RADIO, FILE
   - Validaciones personalizadas
   - Opciones para SELECT/RADIO
   - Orden de visualización
   - Texto de ayuda

2. **Modelo `PoliticaNegocio.Nodo`** - Cada nodo puede tener:
   - Lista de campos de formulario asociados
   - Configuración específica por paso del flujo

3. **Controller `FormularioController`** - Endpoints:
   - `GET /api/formularios/nodo/{politicaId}/{nodoId}` - Obtener formulario de un nodo
   - `GET /api/formularios/politica/{politicaId}` - Obtener todos los campos de una política
   - `PUT /api/formularios/politica/{politicaId}/campos` - Actualizar campos

### Frontend (Angular)

1. **Componente `DynamicFormComponent`** - Renderiza formularios desde JSON:
   - Soporte para todos los tipos de campos
   - Validaciones en tiempo real
   - Mensajes de error personalizados
   - Estilos modernos y responsivos

2. **Servicio `FormularioService`** - Maneja la comunicación con el backend

## 📋 Ejemplo de Uso

### 1. Definir campos en una política

```json
{
  "campos": [
    {
      "nombre": "nombre_completo",
      "etiqueta": "Nombre Completo",
      "tipo": "TEXT",
      "requerido": true,
      "orden": 1,
      "ayuda": "Ingrese su nombre completo"
    },
    {
      "nombre": "email",
      "etiqueta": "Correo Electrónico",
      "tipo": "EMAIL",
      "requerido": true,
      "orden": 2
    },
    {
      "nombre": "tipo_servicio",
      "etiqueta": "Tipo de Servicio",
      "tipo": "SELECT",
      "requerido": true,
      "orden": 3,
      "opciones": [
        { "valor": "residencial", "etiqueta": "Residencial" },
        { "valor": "comercial", "etiqueta": "Comercial" },
        { "valor": "industrial", "etiqueta": "Industrial" }
      ]
    },
    {
      "nombre": "observaciones",
      "etiqueta": "Observaciones",
      "tipo": "TEXTAREA",
      "requerido": false,
      "orden": 4,
      "ayuda": "Información adicional relevante"
    }
  ]
}
```

### 2. Asociar campos a un nodo

```json
{
  "nodoId": "nodo_revision",
  "nombre": "Revisión de Documentos",
  "camposFormulario": ["nombre_completo", "email", "tipo_servicio", "observaciones"]
}
```

### 3. Usar el componente en Angular

```typescript
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';

@Component({
  template: `
    <app-dynamic-form
      [campos]="campos"
      [valoresIniciales]="valoresIniciales"
      submitButtonText="Guardar"
      [showCancelButton]="true"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onFormCancel()"
    ></app-dynamic-form>
  `
})
export class MiComponente {
  campos: CampoFormulario[] = [];
  valoresIniciales = {};

  ngOnInit() {
    this.formularioService.getFormularioNodo(politicaId, nodoId)
      .subscribe(data => {
        this.campos = data.campos;
      });
  }

  onFormSubmit(valores: any) {
    console.log('Valores del formulario:', valores);
    // Guardar en el backend
  }

  onFormCancel() {
    // Cancelar acción
  }
}
```

## 🎯 Casos de Uso

### 1. Formulario de Inicio de Trámite (Cliente)
- Datos personales
- Tipo de servicio solicitado
- Documentos adjuntos
- Dirección de instalación

### 2. Formulario de Revisión (Funcionario)
- Estado de revisión (Aprobado/Rechazado)
- Observaciones
- Documentos faltantes
- Fecha de próxima revisión

### 3. Formulario de Aprobación Final (Admin)
- Decisión final
- Comentarios
- Firma digital
- Fecha de vigencia

## 🔧 Tipos de Campos Soportados

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| TEXT | Texto simple | Nombre, Dirección |
| EMAIL | Email con validación | correo@ejemplo.com |
| PHONE | Teléfono | +593 99 123 4567 |
| DATE | Selector de fecha | 2024-01-15 |
| NUMBER | Números | 123, 45.67 |
| TEXTAREA | Texto largo | Observaciones |
| SELECT | Lista desplegable | Opciones predefinidas |
| CHECKBOX | Casilla de verificación | Acepto términos |
| RADIO | Opción única | Sí/No |
| FILE | Subir archivo | PDF, Imagen |

## 🚀 Próximos Pasos

1. ✅ Backend: Modelos y endpoints
2. ✅ Frontend: Componente dinámico
3. ⏳ Integrar con vista de Funcionario
4. ⏳ Guardar respuestas en Movimiento
5. ⏳ Validaciones avanzadas (dependencias entre campos)
6. ⏳ Editor visual de formularios para Admin

## 📝 Notas Técnicas

- Los formularios se definen a nivel de política
- Cada nodo puede usar un subconjunto de campos
- Las respuestas se guardan en `Movimiento.datosFormulario`
- Validaciones tanto en frontend como backend
- Soporte para archivos (pendiente implementar upload)
