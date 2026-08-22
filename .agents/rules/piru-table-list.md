---
trigger: always_on
---

# Tablas de Listados (PiruAdmin)

## Reglas de Estilos y Estructura de Tablas

### 1. Contenedor Principal Independiente
Toda tabla de listado debe estar envuelta directamente en un contenedor independiente con las clases:
`<div class="bg-body p-3 rounded mb-3">`

### 2. Responsividad y Clases de Tabla
- **Contenedor Responsivo**: La tabla debe estar envuelta dentro de `<div class="table-responsive">`.
- **Clases Obligatorias de Tabla**: `table table-hover align-middle table-sm m-0`.
- **Alineación Vertical**: La clase `align-middle` garantiza que todo el contenido de las filas y celdas esté perfectamente centrado verticalmente.

### 3. Encabezados de Tabla (`thead` / `th`)
- **Mayúsculas y Negrita**: Los títulos en `<th>` deben utilizar las clases `text-uppercase fw-bold text-nowrap`.
- **Sin Colores en el `thead`**: Está terminantemente prohibido aplicar clases de color de fondo a `<thead>` o `<th>` (NO usar `table-light`, `table-dark`, `bg-light`, etc.). Deben heredar el fondo limpio del contenedor según el tema.

### 4. Celda de Acciones
- **Alineación y Sin Saltos**: `<td class="text-end pe-3 text-nowrap">` con botones dentro de `<div class="d-flex justify-content-end gap-1">`.

---

## Código HTML Estándar

```html
<div class="bg-body p-3 rounded mb-3">
  <div class="table-responsive">
    <table class="table table-hover align-middle table-sm m-0">
      <thead>
        <tr>
          <th class="ps-2 text-uppercase fw-bold text-nowrap">Usuario</th>
          <th class="text-uppercase fw-bold text-nowrap">Rol</th>
          <th class="text-uppercase fw-bold text-nowrap">Departamento</th>
          <th class="text-uppercase fw-bold text-nowrap">Estado</th>
          <th class="text-uppercase fw-bold text-nowrap">Fecha de Registro</th>
          <th class="text-end pe-3 text-uppercase fw-bold text-nowrap">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ps-2">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style="width: 34px; height: 34px; font-weight: 600; font-size: 0.8rem">
                JD
              </div>
              <div>
                <div class="fw-bold text-body">Jane Doe</div>
                <div class="small text-body-secondary">jane.doe@example.com</div>
              </div>
            </div>
          </td>
          <td><span class="badge bg-primary-subtle text-primary">Administrador</span></td>
          <td>Ingeniería</td>
          <td><span class="badge bg-success">Activo</span></td>
          <td>12 Ene 2026</td>
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
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
