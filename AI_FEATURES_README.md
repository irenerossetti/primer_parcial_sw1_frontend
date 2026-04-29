# 🤖 Funcionalidades AI Implementadas

Este documento describe las 3 funcionalidades de Inteligencia Artificial implementadas en el sistema de gestión de flujos de trabajo.

## 📋 Funcionalidades Implementadas

### 1. 💬 Chatbot AI Asistente
**Ubicación:** Widget flotante en la esquina inferior derecha (disponible en todas las páginas)

**Características:**
- Asistente conversacional inteligente usando GPT-3.5-turbo
- Responde preguntas sobre el sistema, políticas, trámites y diagramas
- Mantiene contexto de la conversación
- Botones de acceso rápido para preguntas comunes
- Interfaz moderna con animaciones

**Cómo usar:**
1. Haz clic en el widget morado con el ícono de robot
2. Escribe tu pregunta o usa los botones de acceso rápido
3. El asistente responderá usando OpenAI

**Ejemplos de preguntas:**
- "¿Cómo creo una nueva política?"
- "¿Qué son los cuellos de botella?"
- "¿Cómo funciona el editor de diagramas?"
- "Explícame el flujo de trabajo"

---

### 2. 📚 Biblioteca de Plantillas con Búsqueda AI
**Ubicación:** Menú lateral → "Plantillas AI" (solo para ADMIN)

**Características:**
- 5+ plantillas predefinidas de políticas de negocio
- Búsqueda inteligente con OpenAI que entiende lenguaje natural
- Categorías: Servicios Públicos, Financiero, RRHH, Operaciones, IT
- Vista previa de plantillas con flujo completo
- Creación instantánea de políticas desde plantillas

**Plantillas incluidas:**
1. **Instalación Eléctrica Residencial** - Proceso CRE
2. **Aprobación de Crédito Bancario** - Flujo financiero
3. **Proceso de Reclutamiento** - RRHH
4. **Proceso de Compras** - Operaciones
5. **Ticket de Soporte Técnico** - IT/Helpdesk

**Cómo usar:**
1. Ve a "Plantillas AI" en el menú
2. Busca con lenguaje natural: "necesito un flujo para instalación eléctrica"
3. Haz clic en "Buscar con AI" para búsqueda inteligente
4. Previsualiza la plantilla
5. Haz clic en "Usar Plantilla" para crear una política

---

### 3. 🎤 Asistente de Voz para Editor de Diagramas
**Ubicación:** Editor de diagramas (botón flotante morado con micrófono)

**Características:**
- Reconocimiento de voz en español (Web Speech API)
- Interpretación de comandos con OpenAI
- Creación de nodos y calles por voz
- Feedback visual en tiempo real
- Ayuda contextual

**Comandos disponibles:**
- **"Agregar nodo [nombre]"** - Crea un nuevo nodo
  - Ejemplo: "Agregar nodo validación de datos"
- **"Agregar calle [nombre]"** - Crea una nueva calle/lane
  - Ejemplo: "Agregar calle departamento técnico"
- **"Guardar diagrama"** - Guarda el diagrama actual
- **"Ayuda"** - Muestra comandos disponibles

**Cómo usar:**
1. Abre el editor de diagramas
2. Haz clic en el botón de micrófono (esquina inferior derecha)
3. Habla claramente tu comando
4. El sistema procesará el comando con AI y lo ejecutará

---

## 🔧 Configuración de OpenAI API

### Paso 1: Obtener API Key
1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la API key (empieza con `sk-...`)

### Paso 2: Configurar en el Proyecto
Abre el archivo `diagram/src/environments/environment.ts` y reemplaza:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  openaiApiKey: 'TU_API_KEY_AQUI' // ← Pega tu API key aquí
};
```

**Ejemplo:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  openaiApiKey: 'sk-proj-abc123xyz...' // Tu API key real
};
```

### Paso 3: Configurar para Producción
También actualiza `diagram/src/environments/environment.prod.ts` con la misma API key.

---

## 🚀 Cómo Probar las Funcionalidades

### Probar Chatbot AI:
1. Inicia sesión en el sistema
2. Verás el widget morado en la esquina inferior derecha
3. Haz clic y pregunta: "¿Cómo creo una política?"
4. El chatbot responderá usando OpenAI

### Probar Biblioteca de Plantillas:
1. Inicia sesión como ADMIN
2. Ve a "Plantillas AI" en el menú lateral
3. Escribe: "necesito un proceso de instalación"
4. Haz clic en "Buscar con AI"
5. Selecciona una plantilla y úsala

### Probar Asistente de Voz:
1. Ve al editor de diagramas
2. Haz clic en el botón de micrófono
3. Di: "Agregar nodo validación"
4. El sistema creará el nodo automáticamente

---

## 📊 Modelos de OpenAI Utilizados

- **Chatbot:** GPT-3.5-turbo (conversación general)
- **Búsqueda de Plantillas:** GPT-3.5-turbo (análisis semántico)
- **Asistente de Voz:** GPT-3.5-turbo (interpretación de comandos)
- **Transcripción de Audio:** Whisper-1 (speech-to-text)

---

## 💰 Costos Estimados

Con GPT-3.5-turbo:
- **Chatbot:** ~$0.002 por conversación (10 mensajes)
- **Búsqueda:** ~$0.001 por búsqueda
- **Voz:** ~$0.001 por comando + $0.006 por minuto de audio

**Costo estimado mensual (uso moderado):** $5-10 USD

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:** 
- Nunca subas tu API key a repositorios públicos
- Agrega `environment.ts` y `environment.prod.ts` al `.gitignore`
- Para producción, usa variables de entorno del servidor

---

## 🐛 Solución de Problemas

### Error: "API key inválida"
- Verifica que copiaste la API key completa
- Asegúrate de que empiece con `sk-`
- Verifica que tu cuenta de OpenAI tenga créditos

### El chatbot no responde
- Abre la consola del navegador (F12)
- Busca errores relacionados con OpenAI
- Verifica tu conexión a internet

### El asistente de voz no funciona
- Usa Chrome o Edge (mejor soporte)
- Permite el acceso al micrófono cuando lo solicite
- Habla claramente y en español

### Búsqueda AI no funciona
- Si falla, el sistema usa búsqueda por texto normal
- Verifica la API key en environment.ts

---

## 📝 Archivos Creados

```
diagram/src/
├── environments/
│   ├── environment.ts (CONFIGURAR API KEY AQUÍ)
│   └── environment.prod.ts
├── app/
│   ├── components/
│   │   ├── ai-chatbot/
│   │   │   └── ai-chatbot.ts
│   │   └── voice-assistant/
│   │       └── voice-assistant.ts
│   ├── pages/
│   │   └── template-library/
│   │       └── template-library.ts
│   └── core/
│       └── services/
│           ├── openai.service.ts
│           └── template.service.ts
```

---

## ✅ Checklist de Implementación

- [x] Servicio OpenAI con integración GPT-3.5-turbo
- [x] Chatbot AI conversacional
- [x] Biblioteca de 5+ plantillas predefinidas
- [x] Búsqueda inteligente con AI
- [x] Asistente de voz con reconocimiento de español
- [x] Interpretación de comandos con AI
- [x] Integración en el layout principal
- [x] Ruta en el menú para plantillas
- [x] Documentación completa

---

## 🎯 Cumplimiento de Requisitos Nivel 3

✅ **Asistente de voz para diseño de diagramas** - Implementado con Web Speech API + OpenAI
✅ **Biblioteca de plantillas con búsqueda** - 5 plantillas + búsqueda AI semántica
✅ **Asistente AI para usuarios** - Chatbot conversacional con GPT-3.5-turbo

**Funcionalidades adicionales implementadas:**
- Búsqueda semántica inteligente
- Interpretación de comandos de voz con AI
- Sistema de plantillas extensible
- Interfaz moderna y responsive

---

## 📞 Soporte

Si tienes problemas:
1. Verifica la configuración de la API key
2. Revisa la consola del navegador (F12)
3. Asegúrate de tener créditos en OpenAI
4. Usa Chrome o Edge para mejor compatibilidad

---

**Fecha de implementación:** Abril 27, 2026
**Versión:** 1.0.0
**Tecnologías:** Angular 21, OpenAI GPT-3.5-turbo, Web Speech API
