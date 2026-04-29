# 🔗 Tipos de Flechas UML 2.5 - Activity Diagram

## 📋 Resumen

En UML 2.5, los diagramas de actividad utilizan diferentes tipos de flechas (edges) para representar distintos tipos de flujo. Cada tipo de flecha tiene una forma específica que indica su propósito.

---

## 🎯 Tipos de Flechas Implementadas

### 1. **Control Flow** (Flujo de Control)
**Símbolo:** ➤ Flecha sólida con punta triangular rellena

**Descripción:** Representa el flujo de control entre actividades. Es el tipo más común de conexión.

**Características:**
- Línea sólida de 3px
- Punta triangular rellena (escala 2.2)
- Color: Azul oscuro (#1e3a8a)
- Puede tener etiquetas de texto

**Cuándo usar:**
- Conectar actividades secuenciales
- Flujo desde decisiones (con condiciones)
- Flujo desde FORK a actividades paralelas
- Flujo desde actividades a JOIN

**Ejemplo visual:**
```
[Actividad A] ──────➤ [Actividad B]
```

---

### 2. **Object Flow** (Flujo de Objetos)
**Símbolo:** ⊳ Flecha sólida con punta triangular abierta

**Descripción:** Representa el flujo de objetos o datos entre actividades.

**Características:**
- Línea sólida de 3px
- Punta triangular abierta (sin relleno, escala 2.5)
- Color: Morado (#7c3aed)
- Puede tener etiquetas indicando el objeto

**Cuándo usar:**
- Transferir datos entre actividades
- Conectar actividades con nodos de objeto
- Indicar que se pasa información específica
- Flujo de documentos o artefactos

**Ejemplo visual:**
```
[Crear Documento] ──────⊳ [Revisar Documento]
                    «documento»
```

---

### 3. **Dependency** (Dependencia)
**Símbolo:** - - - ⊳ Flecha punteada con punta triangular abierta

**Descripción:** Representa una dependencia o relación débil entre elementos.

**Características:**
- Línea punteada (dash: 8px, gap: 4px)
- Punta triangular abierta (escala 2.2)
- Color: Naranja (#f59e0b)
- Grosor: 2.5px

**Cuándo usar:**
- Indicar dependencias opcionales
- Mostrar relaciones de uso
- Conectar notas con elementos
- Flujos condicionales débiles

**Ejemplo visual:**
```
[Actividad Principal] - - - - ⊳ [Actividad Opcional]
                         «usa»
```

---

## 📊 Comparación Visual

### Tabla de Tipos de Flechas

| Tipo | Línea | Punta | Color | Uso Principal |
|------|-------|-------|-------|---------------|
| **Control Flow** | Sólida (3px) | ➤ Triangular rellena | Azul (#1e3a8a) | Flujo de control |
| **Object Flow** | Sólida (3px) | ⊳ Triangular abierta | Morado (#7c3aed) | Flujo de datos |
| **Dependency** | Punteada (2.5px) | ⊳ Triangular abierta | Naranja (#f59e0b) | Dependencias |

---

## 🎨 Características Visuales Comunes

### Todas las flechas incluyen:

1. **Routing inteligente:**
   - Evita nodos automáticamente
   - Esquinas redondeadas (corner: 10)
   - Efecto "JumpOver" para cruces

2. **Etiquetas de texto:**
   - Caja redondeada con fondo blanco
   - Borde del color de la flecha
   - Fuente: Segoe UI, bold, 12px
   - Editable con doble clic
   - Se oculta si no hay texto

3. **Interactividad:**
   - Reenlazable desde origen y destino
   - Redimensionable
   - Resegmentable (agregar puntos)

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Flujo Secuencial Simple
```
[Inicio] ──────➤ [Validar Datos] ──────➤ [Procesar] ──────➤ [Fin]
         Control Flow        Control Flow        Control Flow
```

### Ejemplo 2: Flujo con Objetos
```
[Crear Formulario] ──────⊳ [Validar Formulario] ──────➤ [Guardar]
                  «formulario»              Control Flow
```

### Ejemplo 3: Flujo con Decisión
```
                    ──────➤ [Aprobar]
                    «Sí»
[Revisar] ──────➤ ◇
                    «No»
                    ──────➤ [Rechazar]
```

### Ejemplo 4: Flujo Paralelo
```
                    ──────➤ [Validar Datos]
                    │
[Inicio] ──────➤ ▬▬▬ FORK
                    │
                    ──────➤ [Verificar Identidad]
                    
                    
[Validar Datos] ──────➤ ▬▬▬ JOIN ──────➤ [Continuar]
                         │
[Verificar Identidad] ──➤
```

### Ejemplo 5: Flujo con Dependencia
```
[Actividad Principal] ──────➤ [Siguiente Actividad]
         │
         │ - - - - ⊳ [Nota: Información adicional]
         │    «nota»
```

---

## 🔧 Cómo Usar en el Editor

### Crear Conexiones:
1. Haz clic en el nodo de origen
2. Arrastra hacia el nodo de destino
3. La conexión se crea automáticamente como **Control Flow** (por defecto)

### Cambiar Tipo de Flecha:
1. Haz clic derecho en la flecha
2. Selecciona "Propiedades"
3. Cambia el tipo a:
   - Control Flow (flujo de control)
   - Object Flow (flujo de objetos)
   - Dependency (dependencia)

### Agregar Etiquetas:
1. Doble clic en la flecha
2. Escribe el texto (condición, nombre del objeto, etc.)
3. Presiona Enter para confirmar

### Editar Ruta:
1. Selecciona la flecha
2. Arrastra los puntos de control para ajustar la ruta
3. Haz clic en la línea para agregar nuevos puntos

---

## 📐 Especificaciones Técnicas

### Control Flow
```typescript
{
  strokeWidth: 3,
  stroke: '#1e3a8a',
  strokeDashArray: null,
  toArrow: 'Triangle',
  arrowScale: 2.2,
  arrowFill: '#1e3a8a'
}
```

### Object Flow
```typescript
{
  strokeWidth: 3,
  stroke: '#7c3aed',
  strokeDashArray: null,
  toArrow: 'OpenTriangle',
  arrowScale: 2.5,
  arrowFill: null
}
```

### Dependency
```typescript
{
  strokeWidth: 2.5,
  stroke: '#f59e0b',
  strokeDashArray: [8, 4],
  toArrow: 'OpenTriangle',
  arrowScale: 2.2,
  arrowFill: null
}
```

---

## ✅ Estándar UML 2.5

Estas implementaciones siguen el estándar **UML 2.5** para Activity Diagrams:

- ✅ Control Flow: Flecha sólida con punta rellena
- ✅ Object Flow: Flecha sólida con punta abierta
- ✅ Dependency: Flecha punteada con punta abierta
- ✅ Etiquetas de texto en cajas
- ✅ Routing inteligente
- ✅ Colores diferenciados para mejor legibilidad

---

## 🎯 Mejores Prácticas

### 1. Usa Control Flow para:
- Flujo secuencial de actividades
- Condiciones en decisiones
- Flujo desde/hacia FORK/JOIN

### 2. Usa Object Flow para:
- Transferencia de datos
- Documentos o artefactos
- Objetos del dominio

### 3. Usa Dependency para:
- Notas explicativas
- Relaciones opcionales
- Información adicional

### 4. Etiquetas:
- Usa etiquetas cortas y descriptivas
- En decisiones: "Sí", "No", condiciones
- En Object Flow: nombre del objeto entre «»
- En Dependency: tipo de relación

---

## 🚀 Resultado Visual

Con estas mejoras, tus diagramas UML 2.5 ahora tienen:

✅ **Flechas con figuras geométricas** (no solo líneas)
✅ **Tres tipos de flechas** según el estándar UML 2.5
✅ **Colores diferenciados** para mejor legibilidad
✅ **Etiquetas en cajas** con fondo blanco
✅ **Routing inteligente** que evita nodos
✅ **Efectos visuales profesionales** (sombras, grosor)

---

¡Ahora tus diagramas UML 2.5 son completamente profesionales y siguen el estándar! 🎨✨
