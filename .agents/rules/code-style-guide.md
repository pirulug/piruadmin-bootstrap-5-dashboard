---
trigger: always_on
---

# PiruAdmin Code Style Guide

### Standard Usage
Always use the `bi` base class followed by the specific icon name:
`<i class="bi bi-{icon-name}"></i>`

Example:
`<i class="bi bi-0-square-fill"></i>`

### Rules
- **Global Availability**: The library is loaded globally in `dashboard.pug`.

## Design Constraints
- **No Shadows**: Do not use `box-shadow` or any type of shadows in the UI. Use borders or background contrasts to separate elements instead.
- **Card Styles**: Do not use utility classes like `.shadow`, `.rounded`, or `.border` on `.card` elements. Cards should rely on their base styles for borders and radius.
- **Theme Support**: Every component must support both Light and Dark modes using Bootstrap 5 theme variables and CSS variables (e.g., `var(--#{$prefix}card-bg)`, `var(--#{$prefix}tertiary-bg)`). Do not use static utility classes like `.bg-light` or `.bg-dark`; use theme-aware alternatives like `.bg-body-secondary` or `.bg-body-tertiary`.

## Estructura de Vistas de Listado (Filtros, Tablas y Botones de Acción)
Para las vistas de listado de módulos (ej. Usuarios, Clientes, Productos):
1. **Separación Estricta de Contenedores**: No usar `.card`. Usar contenedores `bg-body p-3 rounded mb-3` independientes para:
   - **Filtros / Acciones Superiores**: `<div class="bg-body p-3 rounded mb-3">` con los botones de acción principal, separador `<hr class="my-2">` y formulario de filtros.
   - **Tabla de Datos**: `<div class="bg-body p-3 rounded mb-3">` con tabla responsiva `table table-hover align-middle table-sm m-0`.
   - **Paginación**: `<div class="bg-body p-3 rounded d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 sticky-bottom">` al final fuera de la tabla.
2. **Botones de Acción en Tablas**:
   - **Icono + Texto en Mayúsculas**: Deben incluir obligatoriamente su **Bootstrap Icon** (`bi bi-...`), texto explicativo y las clases `text-uppercase fw-bold text-nowrap` con tamaño `btn btn-sm` (ej: `<a class="btn btn-sm btn-outline-primary text-uppercase fw-bold text-nowrap"><i class="bi bi-pencil me-1"></i> Editar</a>`).
   - **Sin Saltos de Línea**: La celda de acciones debe ser estrictamente `<td class="text-end pe-3 text-nowrap">` y los botones deben estar envueltos en `<div class="d-flex justify-content-end gap-1">` para evitar colapsos o saltos de línea visuales.