---
trigger: always_on
---

# Botones de Acción (PiruAdmin)

## Reglas de Botones de Acción

### 1. Botones de Acción en Tablas / Listados (`btn-sm`)
Cuando los botones de acción están **dentro de una tabla** (listados de datos):
- **Tamaño Obligatorio**: Deben utilizar estrictamente la clase `btn-sm` (ej: `btn btn-sm btn-outline-primary`).
- **Texto en Mayúsculas**: Clases `text-uppercase fw-bold text-nowrap`.
- **Icono a la Izquierda**: Icono de Bootstrap obligatorio (`bi bi-...`) a la izquierda con separación (`me-1`).
- **Alineación**: La celda debe ser `<td class="text-end pe-3 text-nowrap">` y los botones deben estar dentro de `<div class="d-flex justify-content-end gap-1">`.

```html
<td class="text-end pe-3 text-nowrap">
  <div class="d-flex justify-content-end gap-1">
    <a class="btn btn-sm btn-outline-info text-uppercase fw-bold text-nowrap" href="/panel/users/view.php">
      <i class="bi bi-eye me-1"></i>
      Ver
    </a>
    <a class="btn btn-sm btn-outline-primary text-uppercase fw-bold text-nowrap" href="/panel/users/edit.php">
      <i class="bi bi-pencil me-1"></i>
      Editar
    </a>
    <button class="btn btn-sm btn-outline-danger text-uppercase fw-bold text-nowrap" type="button">
      <i class="bi bi-trash me-1"></i>
      Eliminar
    </button>
  </div>
</td>
```

---

### 2. Botones de Acción Principales y Encabezados (`btn`)
Para botones de acción fuera de tablas (filtros superiores, encabezados de módulo):
- **Tamaño Estándar (`btn`)**: Utilizan `btn` (sin `btn-sm`) o `btn-sm` según el contexto de la barra de filtros.
- **Icono a la Izquierda**: `<i class="bi bi-plus-lg me-1"></i>`
- **Texto en Mayúsculas**: `text-uppercase fw-bold text-nowrap`.

```html
<a class="btn btn-primary text-uppercase fw-bold text-nowrap" href="/panel/products/create.php">
  <i class="bi bi-plus-lg me-1"></i>
  Nuevo Producto
</a>
```

---

### 3. Contenedores de Botones en Formularios (Sticky)
Cuando los botones de acción se envuelven en formularios para guardar o cancelar cambios:

#### Al Final del Formulario (`sticky-bottom`)
```html
<div class="bg-body p-3 rounded d-flex justify-content-end gap-2 sticky-bottom mt-3">
  <a href="/panel/products/index.php" class="btn btn-outline-secondary px-4 text-uppercase small fw-bold">
    <i class="bi bi-x-lg me-2"></i>
    <span>Cancelar</span>
  </a>
  <button type="submit" class="btn btn-primary px-5 text-uppercase small fw-bold">
    <i class="bi bi-floppy me-2"></i>
    <span>Guardar Producto</span>
  </button>
</div>
```

#### En la Parte Superior (`sticky-top`)
```html
<div class="bg-body p-3 rounded d-flex justify-content-end gap-2 sticky-top mb-3">
  <a href="/panel/products/index.php" class="btn btn-outline-secondary px-4 text-uppercase small fw-bold">
    <i class="bi bi-x-lg me-2"></i>
    <span>Cancelar</span>
  </a>
  <button type="submit" class="btn btn-primary px-5 text-uppercase small fw-bold">
    <i class="bi bi-floppy me-2"></i>
    <span>Guardar Producto</span>
  </button>
</div>
```
