---
trigger: always_on
---

# Paginación (PiruAdmin)

## Estructura Estándar de Paginación
La paginación debe ubicarse en un contenedor independiente fuera de la tabla con las clases `bg-body p-3 rounded d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 sticky-bottom` y una distribución flexible entre la leyenda informativa y los controles numéricos.

### Elementos de Navegación Obligatorios:
1. **Primera Página (`<<`)**: `<i class="bi bi-chevron-double-left small"></i>`
2. **Página Anterior (`<`)**: `<i class="bi bi-chevron-left small"></i>`
3. **Páginas Numéricas / Elipsis**: `1 ... 4 5 6 ... 100`
4. **Página Siguiente (`>`)**: `<i class="bi bi-chevron-right small"></i>`
5. **Última Página (`>>`)**: `<i class="bi bi-chevron-double-right small"></i>`

---

## Código HTML Estándar

```html
<div class="bg-body p-3 rounded d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 sticky-bottom">
  <div class="legend">
    <span class="fw-bold">
      Mostrando 1 - 10 de 20 productos
    </span>
  </div>
  <div class="paginator">
    <nav aria-label="Paginación">
      <ul class="pagination justify-content-end mb-0">
        <!-- Primera Página -->
        <li class="page-item disabled">
          <a class="page-link text-uppercase small fw-bold" href="?page=1" aria-label="Primera">
            <i class="bi bi-chevron-double-left small"></i>
          </a>
        </li>
        <!-- Anterior -->
        <li class="page-item disabled">
          <a class="page-link" href="?page=1" aria-label="Anterior">
            <i class="bi bi-chevron-left small"></i>
          </a>
        </li>

        <!-- Páginas Numéricas -->
        <li class="page-item active">
          <a class="page-link" href="?page=1">1</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="?page=2">2</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="?page=3">3</a>
        </li>
        <li class="page-item disabled">
          <span class="page-link">...</span>
        </li>
        <li class="page-item">
          <a class="page-link" href="?page=100">100</a>
        </li>

        <!-- Siguiente -->
        <li class="page-item">
          <a class="page-link" href="?page=2" aria-label="Siguiente">
            <i class="bi bi-chevron-right small"></i>
          </a>
        </li>
        <!-- Última Página -->
        <li class="page-item">
          <a class="page-link text-uppercase small fw-bold" href="?page=100" aria-label="Última">
            <i class="bi bi-chevron-double-right small"></i>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</div>
```
