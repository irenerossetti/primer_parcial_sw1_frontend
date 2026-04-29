# 🔑 Configuración con OpenRouter

## ¿Qué es OpenRouter?

OpenRouter es un proxy que te da acceso a múltiples modelos de AI (incluyendo GPT-3.5-turbo de OpenAI) con una sola API key. Es más flexible y puede ser más económico que usar OpenAI directamente.

---

## 📝 Pasos para Configurar

### 1. Crear tu API Key en OpenRouter

1. **Ve a:** https://openrouter.ai/keys
2. **Inicia sesión** o crea una cuenta
3. **Haz clic en** "Create Key" o "+ New Key"
4. **Dale un nombre:** "workflow-system" (o el que prefieras)
5. **Copia la key** completa (empieza con `sk-or-...`)
   - ⚠️ IMPORTANTE: Guárdala, no la podrás ver de nuevo

### 2. Agregar Créditos (si es necesario)

1. Ve a la sección de **Billing** o **Credits**
2. Agrega créditos (recomendado: $5-10 USD para empezar)
3. OpenRouter cobra por uso, similar a OpenAI

### 3. Configurar en el Proyecto

Edita el archivo: `diagram/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  openaiApiKey: 'sk-or-v1-abc123xyz...' // ← Pega tu key de OpenRouter aquí
};
```

También actualiza: `diagram/src/environments/environment.prod.ts` con la misma key.

---

## ✅ Ventajas de OpenRouter

### 💰 Costos
- **Más económico** que OpenAI directo en algunos casos
- **Pago por uso** sin suscripciones
- **Transparencia** en precios por modelo

### 🚀 Flexibilidad
- **Múltiples modelos** disponibles (GPT-3.5, GPT-4, Claude, etc.)
- **Una sola API key** para todos los modelos
- **Fácil cambiar** de modelo sin cambiar código

### 🔒 Seguridad
- **No requiere** tarjeta de crédito para probar
- **Límites configurables** de gasto
- **Monitoreo** de uso en tiempo real

---

## 🎯 Modelos Disponibles

El proyecto está configurado para usar:
- **Modelo:** `openai/gpt-3.5-turbo`
- **Proveedor:** OpenAI a través de OpenRouter
- **Costo:** ~$0.002 por 1K tokens

### Otros modelos que puedes usar:

```typescript
// En openai.service.ts, cambia el modelo:

// GPT-4 (más potente, más caro)
model: 'openai/gpt-4'

// Claude 3 Haiku (rápido y económico)
model: 'anthropic/claude-3-haiku'

// Llama 3 (gratis!)
model: 'meta-llama/llama-3-8b-instruct'
```

---

## 🧪 Probar la Configuración

### Test Rápido:

1. **Inicia el frontend:**
   ```bash
   cd diagram
   npm start
   ```

2. **Inicia sesión** en el sistema

3. **Haz clic** en el botón flotante del chatbot

4. **Escribe:** "Hola, ¿funcionas?"

5. **Si responde:** ✅ ¡Configuración exitosa!

6. **Si no responde:**
   - Abre la consola del navegador (F12)
   - Busca errores en rojo
   - Verifica que la API key sea correcta

---

## 💡 Diferencias con OpenAI Directo

### Lo que funciona igual:
- ✅ Chatbot conversacional
- ✅ Búsqueda de plantillas con AI
- ✅ Interpretación de comandos de voz

### Lo que NO funciona:
- ❌ Transcripción de audio con Whisper
  - El asistente de voz usa Web Speech API del navegador
  - No necesita Whisper para reconocimiento de voz
  - Solo usa OpenRouter para interpretar el comando

---

## 📊 Monitoreo de Uso

### En OpenRouter Dashboard:

1. Ve a: https://openrouter.ai/activity
2. Verás:
   - Número de requests
   - Tokens usados
   - Costo total
   - Modelos utilizados

### Estimación de Costos:

Con `openai/gpt-3.5-turbo`:
- **Chatbot:** ~$0.001 por conversación
- **Búsqueda:** ~$0.0003 por búsqueda
- **Comandos de voz:** ~$0.0001 por comando

**Total estimado:** $5-10 USD/mes con uso moderado

---

## 🔧 Configuración Avanzada

### Cambiar el Modelo:

Edita: `diagram/src/app/core/services/openai.service.ts`

```typescript
const body = {
  model: 'openai/gpt-3.5-turbo', // ← Cambia aquí
  messages: messages,
  temperature: 0.7,
  max_tokens: 500
};
```

### Ajustar Parámetros:

```typescript
const body = {
  model: 'openai/gpt-3.5-turbo',
  messages: messages,
  temperature: 0.7,      // Creatividad (0-1)
  max_tokens: 500,       // Longitud de respuesta
  top_p: 1,              // Diversidad
  frequency_penalty: 0,  // Penalización por repetición
  presence_penalty: 0    // Penalización por temas
};
```

---

## 🐛 Solución de Problemas

### Error: "Invalid API Key"
```
✅ Solución:
1. Verifica que copiaste la key completa
2. Debe empezar con "sk-or-"
3. Revisa environment.ts
4. Reinicia el servidor (npm start)
```

### Error: "Insufficient credits"
```
✅ Solución:
1. Ve a OpenRouter dashboard
2. Agrega créditos en Billing
3. Espera unos segundos
4. Intenta de nuevo
```

### Error: "Model not found"
```
✅ Solución:
1. Verifica el nombre del modelo
2. Debe ser: openai/gpt-3.5-turbo
3. Revisa openai.service.ts
```

### El chatbot no responde
```
✅ Solución:
1. Abre consola del navegador (F12)
2. Busca errores en rojo
3. Verifica la API key
4. Verifica que tengas créditos
5. Revisa la conexión a internet
```

---

## 📞 Recursos

### OpenRouter:
- **Dashboard:** https://openrouter.ai
- **API Keys:** https://openrouter.ai/keys
- **Documentación:** https://openrouter.ai/docs
- **Precios:** https://openrouter.ai/models

### Soporte:
- **Discord:** https://discord.gg/openrouter
- **Email:** support@openrouter.ai

---

## ✅ Checklist de Configuración

Marca cada paso cuando lo completes:

- [ ] Cuenta de OpenRouter creada
- [ ] API key generada y copiada
- [ ] Créditos agregados (si es necesario)
- [ ] API key pegada en `environment.ts`
- [ ] API key pegada en `environment.prod.ts`
- [ ] Frontend reiniciado (`npm start`)
- [ ] Chatbot probado y funciona
- [ ] Búsqueda de plantillas probada
- [ ] Asistente de voz probado

---

## 🎉 ¡Listo!

Una vez completado el checklist, tu sistema estará 100% funcional con OpenRouter.

**Ventajas de usar OpenRouter:**
- ✅ Más económico
- ✅ Más flexible
- ✅ Acceso a múltiples modelos
- ✅ Fácil de configurar

**¡Buena suerte con tu presentación! 🚀**

---

## 📝 Notas Adicionales

### Para Producción:
```typescript
// Usa variables de entorno en lugar de hardcodear
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://tu-api.com',
  openaiApiKey: process.env['OPENROUTER_API_KEY'] || ''
};
```

### Para Desarrollo:
```typescript
// Puedes usar diferentes modelos para dev y prod
const model = environment.production 
  ? 'openai/gpt-4'           // Producción: más potente
  : 'openai/gpt-3.5-turbo';  // Desarrollo: más económico
```

---

**Fecha:** Abril 27, 2026
**Versión:** 1.0.0 con OpenRouter
**Estado:** ✅ Configurado y listo para usar
