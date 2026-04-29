# 🚀 Guía Rápida - Funcionalidades AI

## 📋 Índice Rápido
1. [Chatbot AI](#1-chatbot-ai)
2. [Búsqueda de Plantillas](#2-búsqueda-de-plantillas)
3. [Asistente de Voz](#3-asistente-de-voz)
4. [Generador de Plantillas](#4-generador-de-plantillas)
5. [Análisis de Cuellos de Botella](#5-análisis-de-cuellos-de-botella)
6. [Reportes Automáticos](#6-reportes-automáticos)
7. [Clasificación de Trámites](#7-clasificación-de-trámites)

---

## 1. Chatbot AI

### ¿Dónde está?
Botón azul flotante en la esquina inferior derecha (todas las páginas)

### ¿Cómo usarlo?
1. Click en el botón azul con icono de robot
2. Escribe tu pregunta en el campo de texto
3. Presiona Enter o click en el botón de enviar
4. El chatbot responderá con información del sistema

### Preguntas de ejemplo:
- "¿Cómo creo una nueva política?"
- "¿Cuántos trámites tengo en proceso?"
- "¿Cómo uso el editor de diagramas?"
- "¿Qué usuarios están registrados?"

### Características especiales:
- ✅ Historial persistente (se guarda automáticamente)
- ✅ 4 sugerencias de preguntas frecuentes
- ✅ Contexto del sistema en tiempo real
- ✅ Botón para limpiar historial (icono de papelera)

---

## 2. Búsqueda de Plantillas

### ¿Dónde está?
Menú "Plantillas" → Campo de búsqueda en la parte superior

### ¿Cómo usarlo?
1. Navega a "Plantillas" en el menú
2. Escribe lo que buscas en el campo de búsqueda
3. La AI buscará plantillas relevantes semánticamente
4. Click en "Ver Detalles" para ver el diagrama
5. Click en "Usar Plantilla" para aplicarla

### Búsquedas de ejemplo:
- "proceso de aprobación"
- "recursos humanos"
- "crédito"
- "soporte técnico"

### Plantillas disponibles (10):
1. Instalación Eléctrica Residencial
2. Aprobación de Crédito Bancario
3. Proceso de Reclutamiento
4. Proceso de Compras
5. Ticket de Soporte Técnico
6. Solicitud de Vacaciones
7. Proceso de Facturación
8. Mantenimiento Preventivo
9. Onboarding de Empleados
10. Devolución de Productos

---

## 3. Asistente de Voz

### ¿Dónde está?
Botón morado flotante en el editor de diagramas (debajo del chatbot)

### ¿Cómo usarlo?
1. Abre el editor de diagramas
2. Click en el botón morado con icono de micrófono
3. Habla claramente en español
4. El asistente interpretará tu comando
5. Escucharás una confirmación de voz

### Comandos disponibles:
```
"Agregar nodo [nombre]"
Ejemplo: "Agregar nodo validación"

"Agregar calle [nombre]"
Ejemplo: "Agregar calle cliente"

"Conectar [nodo1] con [nodo2]"
Ejemplo: "Conectar inicio con validación"

"Eliminar nodo [nombre]"
Ejemplo: "Eliminar nodo prueba"

"Editar nodo [nombre] a [nuevo nombre]"
Ejemplo: "Editar nodo inicio a comienzo"

"Guardar diagrama"

"Ayuda"
```

### Tips:
- Habla claro y pausado
- Usa Chrome o Edge (mejor compatibilidad)
- Si no funciona, verifica permisos de micrófono

---

## 4. Generador de Plantillas

### ¿Dónde está?
Botón rosa flotante en la página de Plantillas (debajo del asistente de voz)

### ¿Cómo usarlo?
1. Navega a "Plantillas"
2. Click en el botón rosa con icono de estrella
3. Describe el proceso que necesitas
4. Click en "Generar Plantilla"
5. Espera 5-10 segundos
6. Revisa la plantilla generada
7. Click en "Usar Esta Plantilla" para aplicarla

### Descripciones de ejemplo:
```
"Proceso de aprobación de gastos con 3 niveles de autorización"

"Flujo de atención de quejas y reclamos de clientes"

"Proceso de solicitud y aprobación de vacaciones"

"Gestión de incidentes de seguridad informática"
```

### Lo que genera:
- ✅ Nombre del proceso
- ✅ Descripción detallada
- ✅ Categoría automática
- ✅ Tags relevantes
- ✅ Diagrama completo con nodos
- ✅ Flujo de trabajo estructurado

---

## 5. Análisis de Cuellos de Botella

### ¿Cómo usarlo desde código?

```typescript
import { BottleneckAnalyzerService } from './core/services/bottleneck-analyzer.service';

constructor(private analyzer: BottleneckAnalyzerService) {}

// Análisis básico
this.analyzer.analyzeFlow(politicaId).subscribe(analysis => {
  console.log('Cuellos detectados:', analysis.cuellosDetectados);
  console.log('Eficiencia:', analysis.eficienciaGeneral);
  console.log('Recomendaciones:', analysis.recomendaciones);
});

// Análisis con AI (más insights)
this.analyzer.analyzeWithAI(politicaId).subscribe(analysis => {
  console.log('Análisis enriquecido con AI:', analysis);
});
```

### Lo que analiza:
- ✅ Tiempo promedio por nodo
- ✅ Trámites acumulados por nodo
- ✅ Severidad (alta, media, baja)
- ✅ Predicción de acumulación futura
- ✅ Sugerencias específicas
- ✅ Eficiencia general del flujo

### Ejemplo de resultado:
```json
{
  "nodo": "Análisis Crediticio",
  "severidad": "alta",
  "tiempoPromedio": 7.5,
  "tramitesAcumulados": 15,
  "prediccion": "Se acumularán 22 trámites en los próximos 7 días",
  "sugerencias": [
    "Asignar más recursos a este nodo",
    "Revisar el proceso para simplificarlo",
    "Considerar automatización"
  ]
}
```

---

## 6. Reportes Automáticos

### ¿Cómo usarlo desde código?

```typescript
import { ReportGeneratorService } from './core/services/report-generator.service';

constructor(private reportGen: ReportGeneratorService) {}

// Reporte básico
this.reportGen.generateReport().subscribe(report => {
  console.log('Resumen:', report.resumenEjecutivo);
  console.log('Estadísticas:', report.estadisticas);
  console.log('Tendencias:', report.tendencias);
});

// Reporte con AI (resumen mejorado)
this.reportGen.generateAIReport().subscribe(report => {
  console.log('Reporte enriquecido:', report);
});
```

### Lo que incluye:
- ✅ Resumen ejecutivo (generado con AI)
- ✅ Estadísticas completas del sistema
- ✅ Análisis por política
- ✅ Identificación de tendencias
- ✅ Detección de problemas
- ✅ Recomendaciones accionables

### Ejemplo de estadísticas:
```json
{
  "totalPoliticas": 5,
  "totalTramites": 42,
  "totalUsuarios": 15,
  "tramitesCompletados": 28,
  "tramitesEnProceso": 12,
  "tramitesRechazados": 2,
  "eficienciaPromedio": 66.7
}
```

---

## 7. Clasificación de Trámites

### ¿Cómo usarlo desde código?

```typescript
import { TramiteClassifierService } from './core/services/tramite-classifier.service';

constructor(private classifier: TramiteClassifierService) {}

// Clasificar trámite completo
const descripcion = "Necesito solicitar un préstamo personal urgente";
const titulo = "Solicitud de Préstamo";

this.classifier.classifyTramite(descripcion, titulo).subscribe(result => {
  console.log('Política sugerida:', result.politicaSugerida);
  console.log('Prioridad:', result.prioridad);
  console.log('Razonamiento:', result.razonamiento);
  console.log('Tags:', result.tags);
});

// Solo sugerir prioridad
this.classifier.suggestPriority(descripcion).subscribe(prioridad => {
  console.log('Prioridad sugerida:', prioridad); // ALTA, MEDIA, BAJA
});

// Solo extraer tags
this.classifier.extractTags(descripcion).subscribe(tags => {
  console.log('Tags extraídos:', tags);
});
```

### Lo que hace:
- ✅ Analiza descripción y título
- ✅ Sugiere política más adecuada
- ✅ Calcula nivel de confianza
- ✅ Determina prioridad (ALTA/MEDIA/BAJA)
- ✅ Extrae tags relevantes
- ✅ Proporciona razonamiento

### Ejemplo de resultado:
```json
{
  "politicaSugerida": {
    "id": 2,
    "nombre": "Aprobación de Crédito Bancario",
    "confianza": 92
  },
  "prioridad": "ALTA",
  "razonamiento": "Solicitud de préstamo con urgencia requiere atención prioritaria",
  "tags": ["préstamo", "urgente", "personal", "financiero"]
}
```

---

## 🔧 Configuración

### API Key de OpenRouter
Ubicación: `diagram/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  openaiApiKey: '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'
};
```

### Modelo Usado
- **Proveedor:** OpenRouter
- **Modelo:** `openai/gpt-3.5-turbo`
- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

---

## 🎯 Tips para la Demo

### 1. Preparación (5 min antes):
- Abre el sistema en Chrome
- Verifica que el backend esté corriendo
- Prueba el micrófono (asistente de voz)
- Ten algunas descripciones preparadas

### 2. Orden sugerido:
1. Chatbot (2 min)
2. Plantillas + Generador (3 min)
3. Asistente de Voz (3 min)
4. Análisis/Reportes (2 min)

### 3. Frases clave:
- "Esto usa GPT-3.5-turbo vía OpenRouter"
- "El chatbot tiene contexto del sistema en tiempo real"
- "La búsqueda es semántica, no solo por palabras clave"
- "El asistente de voz responde hablando"
- "La AI genera plantillas completas desde una descripción"

---

## ❓ Troubleshooting

### El chatbot no responde:
- Verifica la API key en `environment.ts`
- Revisa la consola del navegador (F12)
- Verifica conexión a internet

### El asistente de voz no funciona:
- Usa Chrome o Edge
- Verifica permisos de micrófono
- Habla más claro y pausado

### La búsqueda de plantillas no funciona:
- Verifica que haya plantillas cargadas
- Intenta con términos más generales
- Revisa la consola por errores

### El generador de plantillas tarda mucho:
- Es normal, puede tardar 5-10 segundos
- OpenAI está procesando la descripción
- No cierres el panel mientras genera

---

## 📞 Soporte

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Verifica que el backend esté corriendo
3. Verifica la API key de OpenRouter
4. Revisa los logs del servidor

---

**Última actualización:** 28 Abril 2026  
**Versión:** 1.0
