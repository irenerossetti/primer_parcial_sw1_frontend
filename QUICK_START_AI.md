# 🚀 Inicio Rápido - Funcionalidades AI

## ⚡ Configuración en 3 Pasos

### 1️⃣ Obtener API Key de OpenAI
```
1. Ve a: https://platform.openai.com/api-keys
2. Crea una cuenta o inicia sesión
3. Clic en "Create new secret key"
4. Copia la key (empieza con sk-)
```

### 2️⃣ Configurar en el Proyecto
Abre: `diagram/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  openaiApiKey: 'sk-TU-API-KEY-AQUI' // ← Pega aquí
};
```

### 3️⃣ Iniciar el Proyecto
```bash
cd diagram
npm install
npm start
```

---

## 🎯 Probar las 3 Funcionalidades

### 💬 1. Chatbot AI
- **Dónde:** Widget morado (esquina inferior derecha)
- **Qué hacer:** Haz clic y pregunta "¿Cómo creo una política?"
- **Resultado:** El chatbot responde con AI

### 📚 2. Plantillas AI
- **Dónde:** Menú → "Plantillas AI"
- **Qué hacer:** Busca "instalación eléctrica" y clic en "Buscar con AI"
- **Resultado:** Encuentra plantillas relevantes con búsqueda inteligente

### 🎤 3. Asistente de Voz
- **Dónde:** Editor de diagramas → Botón micrófono
- **Qué hacer:** Di "Agregar nodo validación"
- **Resultado:** Crea el nodo automáticamente

---

## ⚠️ Importante

- ✅ Usa Chrome o Edge (mejor compatibilidad)
- ✅ Permite acceso al micrófono cuando lo pida
- ✅ Asegúrate de tener créditos en OpenAI
- ❌ NO subas tu API key a GitHub

---

## 🆘 Problemas Comunes

**"API key inválida"**
→ Verifica que copiaste la key completa en environment.ts

**"Chatbot no responde"**
→ Abre consola (F12) y busca errores de red

**"Voz no funciona"**
→ Usa Chrome/Edge y permite el micrófono

---

## 📖 Documentación Completa
Ver: `AI_FEATURES_README.md`
