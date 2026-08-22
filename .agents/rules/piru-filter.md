---
trigger: always_on
---

# Componente Filtros y Acciones Superiores (PiruAdmin)

## Reglas de Estructura de Filtros

### 1. Contenedor Principal Independiente
Los filtros y acciones superiores deben estar contenidos directamente en:
`<div class="bg-body p-3 rounded mb-3 text-end">`

### 2. Botón de Acción Principal y Separador
- **Botón Superior**: Botón de acción principal alineado a la derecha con clase `btn btn-primary text-uppercase fw-bold` e icono Bootstrap a la izquierda (`<i class="bi bi-plus me-1"></i>`).
- **Separador**: `<hr class="my-2">` debajo del botón de acción.

### 3. Formulario de Filtros
- **Alineación y Flexibilidad**: Formulario envuelto en `<div class="d-flex flex-wrap justify-content-end align-items-center gap-2">`.
- **Selects**: Utilizan la clase `class="form-select w-auto"`.
- **Grupo de Búsqueda**: `<div class="input-group w-auto flex-grow-1" style="max-width: 450px;">` con el campo de texto y los botones de acción.
- **Botón Limpiar (Cuando hay búsqueda/filtros activos)**: Cuando existan parámetros de búsqueda o filtros aplicados, se debe incluir un botón de limpiar antes del botón filtrar:
  `<a href="/panel/products/index.php" class="btn btn-outline-secondary px-3 text-uppercase small fw-bold text-nowrap"><i class="bi bi-x-lg me-1"></i> Limpiar</a>`.
- **Botón Filtrar**: `<button type="submit" class="btn btn-primary px-3 text-uppercase small fw-bold text-nowrap"><i class="bi bi-search me-1"></i> Filtrar</button>`.

---

## Código HTML Estándar

### 1. Estado Inicial (Sin Búsqueda Activa)
```html
<div class="bg-body p-3 rounded mb-3 text-end">
  <a href="/panel/products/new.php" class="btn btn-primary text-uppercase fw-bold">
    <i class="bi bi-plus me-1"></i>
    <span>Nuevo Producto</span>
  </a>
  <hr class="my-2">

  <form method="GET" autocomplete="off">
    <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
      <select name="category" class="form-select w-auto" aria-label="Todas las categorías">
        <option value="">Todas las categorías</option>
        <option value="Abarrotes">Abarrotes</option>
        <option value="Bebidas">Bebidas</option>
        <option value="Cuidado Personal">Cuidado Personal</option>
        <option value="Frutas">Frutas</option>
        <option value="Golosinas">Golosinas</option>
        <option value="Libreria">Libreria</option>
        <option value="Limpieza">Limpieza</option>
        <option value="Material Educativo">Material Educativo</option>
        <option value="Verduras">Verduras</option>
      </select>

      <select name="status" class="form-select w-auto" aria-label="Todos los estados">
        <option value="">Todos los estados</option>
        <option value="1">Activos</option>
        <option value="0">Inactivos</option>
      </select>

      <div class="input-group w-auto flex-grow-1" style="max-width: 450px;">
        <input type="text" name="search" class="form-control" placeholder="Buscar por código SKU, nombre o categoría..." value="">
        <button type="submit" class="btn btn-primary px-3 text-uppercase small fw-bold text-nowrap">
          <i class="bi bi-search me-1"></i>
          Filtrar
        </button>
      </div>
    </div>
  </form>
</div>
```

---

### 2. Con Búsqueda o Filtros Aplicados (Botón Limpiar Activo)
```html
<div class="bg-body p-3 rounded mb-3 text-end">
  <a href="/panel/products/new.php" class="btn btn-primary text-uppercase fw-bold">
    <i class="bi bi-plus me-1"></i>
    <span>Nuevo Producto</span>
  </a>
  <hr class="my-2">

  <form method="GET" autocomplete="off">
    <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
      <select name="category" class="form-select w-auto" aria-label="Todas las categorías">
        <option value="">Todas las categorías</option>
        <option value="Abarrotes">Abarrotes</option>
        <option value="Bebidas" selected>Bebidas</option>
      </select>

      <select name="status" class="form-select w-auto" aria-label="Todos los estados">
        <option value="">Todos los estados</option>
        <option value="1" selected>Activos</option>
        <option value="0">Inactivos</option>
      </select>

      <div class="input-group w-auto flex-grow-1" style="max-width: 450px;">
        <input type="text" name="search" class="form-control" placeholder="Buscar por código SKU, nombre o categoría..." value="Coca Cola">
        <!-- Botón Limpiar para resetear filtros -->
        <a href="/panel/products/index.php" class="btn btn-outline-secondary px-3 text-uppercase small fw-bold text-nowrap">
          <i class="bi bi-x-lg me-1"></i>
          Limpiar
        </a>
        <button type="submit" class="btn btn-primary px-3 text-uppercase small fw-bold text-nowrap">
          <i class="bi bi-search me-1"></i>
          Filtrar
        </button>
      </div>
    </div>
  </form>
</div>
```
