# ✅ Editor de Formularios para Admin - IMPLEMENTADO

## 🎯 ¿Qué se implementó?

Se creó una interfaz visual completa para que el **Administrador** pueda diseñar formularios dinámicos sin escribir código.

## 📍 Ubicación

**Ruta:** `/politicas/:id/formulario`

**Acceso:** Desde la página de Políticas → Botón "Formulario" en cada tarjeta de política

## 🎨 Características del Editor

### Panel Izquierdo: Lista de Campos
- ✅ Ver todos los campos del formulario
- ✅ Orden visual con números
- ✅ Seleccionar campo para editar
- ✅ Mover campos arriba/abajo
- ✅ Eliminar campos
- ✅ Agregar nuevos campos

### Panel Central: Editor de Campo
Permite configurar cada campo con:
- **Nombre (ID):** Identificador único sin espacios
- **Etiqueta:** Texto que ve el usuario
- **Tipo:** TEXT, EMAIL, SELECT, CHECKBOX, etc.
- **Requerido:** Si es obligatorio o no
- **Validación:** Regex para validar formato
- **Texto de Ayuda:** Hint para el usuario
- **Opciones:** Para SELECT y RADIO (agregar/eliminar opciones)

### Panel Derecho: Vista Previa
- ✅ Ver cómo se verá el formulario en tiempo real
- ✅ Probar el formulario completo
- ✅ Validar que todo funcione correctamente

## 🔧 Tipos de Campo Soportados

| Tipo | Descripción | Configuración Extra |
|------|-------------|---------------------|
| TEXT | Texto simple | Validación regex |
| EMAIL | Email con validación | - |
| PHONE | Teléfono | Validación regex |
| DATE | Selector de fecha | - |
| NUMBER | Números | - |
| TEXTAREA | Texto largo | - |
| SELECT | Lista desplegable | Opciones (valor/etiqueta) |
| CHECKBOX | Casilla de verificación | - |
| RADIO | Opción única | Opciones (valor/etiqueta) |
| FILE | Subir archivo | - |

## 📋 Flujo de Uso

### 1. Acceder al Editor
```
Admin → Políticas → [Seleccionar Política] → Botón "Formulario"
```

### 2. Crear Campos
1. Click en "Nuevo Campo"
2. Configurar propiedades en el panel central
3. Ver vista previa en tiempo real
4. Repetir para cada campo necesario

### 3. Organizar Campos
- Usar flechas ↑↓ para cambiar el orden
- El orden determina cómo se muestran al usuario

### 4. Guardar
- Click en "Guardar Formulario"
- Los campos se asocian a la política
- Listos para usar en los nodos del flujo

## 🎯 Ejemplo Práctico

### Caso: Solicitud de Instalación Eléctrica

**Campos a crear:**

1. **Nombre Completo**
   - Tipo: TEXT
   - Requerido: Sí
   - Ayuda: "Ingrese nombre y apellidos completos"

2. **Cédula**
   - Tipo: TEXT
   - Requerido: Sí
   - Validación: `^[0-9]{10}$`
   - Ayuda: "10 dígitos sin guiones"

3. **Email**
   - Tipo: EMAIL
   - Requerido: Sí

4. **Tipo de Instalación**
   - Tipo: SELECT
   - Requerido: Sí
   - Opciones:
     * nueva → Nueva Instalación
     * ampliacion → Ampliación
     * reparacion → Reparación

5. **Dirección**
   - Tipo: TEXTAREA
   - Requerido: Sí
   - Ayuda: "Incluya referencias y número de casa"

6. **Acepto Términos**
   - Tipo: CHECKBOX
   - Requerido: Sí

## 🔗 Integración con el Flujo

Una vez creados los campos:

1. Ir al **Diagramador** de la política
2. Seleccionar un nodo
3. Asignar qué campos se mostrarán en ese nodo
4. El funcionario verá esos campos al procesar el trámite

## 📁 Archivos Creados

### Frontend
- `diagram/src/app/pages/form-editor/form-editor.component.ts` - Editor visual completo

### Rutas Modificadas
- `diagram/src/app/app.routes.ts` - Agregada ruta `/politicas/:id/formulario`

### Componentes Modificados
- `diagram/src/app/pages/politicas/politicas.ts` - Agregado botón "Formulario"

## 🎨 Diseño Visual

### Colores
- **Azul (#2563eb):** Botones principales y elementos activos
- **Morado (#9c27b0):** Botón de formulario
- **Verde (#10b981):** Botón guardar
- **Rojo (#dc2626):** Botón eliminar

### Layout Responsivo
- Desktop: 3 paneles (Lista | Editor | Vista Previa)
- Tablet/Mobile: 1 panel (oculta vista previa)

## ✅ Validaciones Implementadas

1. **Nombres únicos:** No puede haber dos campos con el mismo nombre
2. **Campos requeridos:** Nombre y etiqueta son obligatorios
3. **Opciones para SELECT/RADIO:** Valida que tengan opciones configuradas
4. **Vista previa funcional:** Prueba validaciones en tiempo real

## 🚀 Próximas Mejoras

### Fase 2: Asignación a Nodos
- [ ] Interfaz para asignar campos a cada nodo del flujo
- [ ] Drag & drop de campos a nodos
- [ ] Vista de qué campos usa cada nodo

### Fase 3: Campos Avanzados
- [ ] Campos condicionales (mostrar/ocultar según otros)
- [ ] Validaciones cruzadas entre campos
- [ ] Campos calculados (fórmulas)

### Fase 4: Plantillas
- [ ] Guardar formularios como plantillas
- [ ] Biblioteca de formularios predefinidos
- [ ] Importar/exportar formularios

## 📝 Notas Técnicas

### Almacenamiento
Los campos se guardan en `PoliticaNegocio.campos` como array de objetos JSON.

### Estructura de Datos
```json
{
  "nombre": "cedula",
  "etiqueta": "Cédula de Identidad",
  "tipo": "TEXT",
  "requerido": true,
  "validacion": "^[0-9]{10}$",
  "ayuda": "10 dígitos sin guiones",
  "orden": 2
}
```

### Componentes Reutilizados
- `DynamicFormComponent` - Para la vista previa
- `FormularioService` - Para comunicación con backend

## 🎓 Guía Rápida de Uso

1. **Crear Política** (si no existe)
2. **Click en "Formulario"** en la tarjeta de la política
3. **Agregar campos** uno por uno
4. **Configurar** cada campo según necesidad
5. **Ordenar** con las flechas
6. **Ver vista previa** en panel derecho
7. **Guardar** cuando esté listo
8. **Ir al Diagramador** para asignar campos a nodos

## ✨ Beneficios

- ✅ **Sin código:** Admin no necesita programar
- ✅ **Visual:** Ve exactamente cómo se verá
- ✅ **Flexible:** Cualquier tipo de formulario
- ✅ **Rápido:** Crear formularios en minutos
- ✅ **Reutilizable:** Mismos campos en múltiples nodos
- ✅ **Validado:** Previene errores de configuración

¡El editor de formularios está listo para usar! 🎉
