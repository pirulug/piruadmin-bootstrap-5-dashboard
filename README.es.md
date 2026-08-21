<div align="center">
  <img src="./src/img/logo.png" alt="Logo de PiruAdmin">
</div>

<h1 align="center">PiruAdmin — Dashboard en Bootstrap 5</h1>

<div align="center">

[![GitHub package.json version](https://img.shields.io/github/package-json/v/pirulug/piruadmin-bootstrap-5-dashboard?color=ff0055&style=for-the-badge)](https://github.com/pirulug/piruadmin-bootstrap-5-dashboard)
[![GitHub issues](https://img.shields.io/github/issues/pirulug/piruadmin-bootstrap-5-dashboard?color=%23ff0055&style=for-the-badge)](https://github.com/pirulug/piruadmin-bootstrap-5-dashboard/issues)
[![GitHub forks](https://img.shields.io/github/forks/pirulug/piruadmin-bootstrap-5-dashboard?color=ff0055&style=for-the-badge)](https://github.com/pirulug/piruadmin-bootstrap-5-dashboard/network)
[![GitHub stars](https://img.shields.io/github/stars/pirulug/piruadmin-bootstrap-5-dashboard?color=ff0055&style=for-the-badge)](https://github.com/pirulug/piruadmin-bootstrap-5-dashboard/stargazers)
[![GitHub license](https://img.shields.io/github/license/pirulug/piruadmin-bootstrap-5-dashboard?color=ff0055&style=for-the-badge)](https://github.com/pirulug/piruadmin-bootstrap-5-dashboard/blob/master/LICENSE)

</div>

<p align="center">
  <a href="./README.md">English</a> | <strong>Español</strong>
</p>

<p align="center">
  <img src="./src/img/background.png" alt="Vista previa de PiruAdmin">
</p>

<p align="center">Una plantilla de panel de administración moderna, limpia y modular construida con Bootstrap 5 y JavaScript Vanilla. Sin dependencias de jQuery, totalmente adaptable a dispositivos móviles y con una amplia variedad de componentes y páginas prediseñadas.</p>

<p align="center">
  <a href="https://pirulug.github.io/piruadmin-bootstrap-5-dashboard">Demostración en Vivo</a> |
  <a href="https://github.com/pirulug/piruadmin-bootstrap-5-dashboard/blob/master/CHANGELOG.md">Historial de Cambios</a>
</p>

---

## Características Principales

- **Arquitectura Bootstrap 5**: Desarrollado con Bootstrap 5 y JavaScript Vanilla (sin dependencia de jQuery).
- **Soporte de Temas**: Cambio nativo entre Modo Claro y Modo Oscuro con persistencia de estado.
- **SCSS Modular**: Estructura SCSS limpia que utiliza variables CSS dinámicas y tokens de diseño personalizables.
- **Motor de Plantillas Pug**: Vistas HTML modulares, limpias y fáciles de mantener compiladas mediante Webpack.
- **Componentes UI Completos**: Colección personalizada de componentes Bootstrap con vista previa interactiva del código fuente y botón para copiar al portapapeles.
- **Bibliotecas de Iconos**: Integración lista para usar con Bootstrap Icons, Font Awesome, Feather Icons y Flag Icons.
- **Integración de Plugins**: Soporte preconfigurado para Chart.js, SweetAlert2, Toastify, Flatpickr, Tagify, Lite YouTube y más.
- **Autenticación y Seguridad**: Inicio de sesión, registro, recuperación de contraseña, verificación en 2 pasos, pantalla de bloqueo y códigos de respaldo.
- **Diseño Adaptable (Responsive)**: Barra lateral fluida con superposición en dispositivos móviles y submenús colapsables.

---

## Bibliotecas de Iconos

La plantilla incluye soporte integrado para diversas librerías de iconos:

### Bootstrap Icons (Predeterminado)
```html
<i class="bi bi-bootstrap-fill"></i>
```

### Font Awesome
```html
<i class="fa-solid fa-house"></i>
```

### Feather Icons
```html
<i data-feather="activity"></i>
```

### Flag Icons
```html
<span class="fi fi-us"></span>
```

---

## Páginas y Vistas

| Categoría | Páginas Disponibles |
| :--- | :--- |
| **Panel (Dashboard)** | Panel Principal de Estadísticas |
| **Componentes UI** | Acordeones, Alertas, Avatares, Insignias (Badges), Botones, Tarjetas (Cards), Elementos Generales, Imágenes, Scrollspy, Pestañas (Tabs) |
| **Formularios** | Entradas Básicas, Editor de Texto Enriquecido, Selector de Fechas (Flatpickr), Etiquetas (Tagify) |
| **Tablas** | Tablas Estilizadas con Bootstrap |
| **Plugins** | Gráficos (Chart.js), DataTables, SweetAlert2, Toastify JS, Lite YouTube, Mapas de Google |
| **Iconos** | Bootstrap Icons, Font Awesome, Feather Icons, Flag Icons |
| **Páginas Generales** | Página en Blanco, Paleta de Colores, Resultados de Búsqueda, Línea de Tiempo (Timeline), Tipografía |
| **Autenticación** | Iniciar Sesión, Registrarse, Recuperar Contraseña, Restablecer Contraseña, Verificación en 2 Pasos, Código de Verificación, Códigos de Respaldo, Bloqueo de Pantalla |
| **Cuenta de Usuario** | Perfil de Usuario, Configuración de Cuenta |
| **Páginas de Error y Sistema** | Error 404 No Encontrado, Error 500 de Servidor, Modo de Mantenimiento |

---

## Guía de Inicio

### Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en tu equipo.

### Instalación

Clona el repositorio e instala las dependencias utilizando `pnpm` (o `npm`):

```bash
# Clonar el repositorio
git clone https://github.com/pirulug/piruadmin-bootstrap-5-dashboard.git

# Ingresar al directorio
cd piruadmin-bootstrap-5-dashboard

# Instalar dependencias
pnpm install
```

### Servidor de Desarrollo

Inicia el servidor local de desarrollo con recarga en vivo en `http://localhost:8989`:

```bash
pnpm start
```

### Compilación para Producción

Compila, optimiza y minimiza todos los archivos estáticos en la carpeta `dist/`:

```bash
pnpm run build
```

### Despliegue en GitHub Pages

Despliega directamente el contenido generado en `dist/` a GitHub Pages:

```bash
pnpm run deploy
```

---

## Estructura del Proyecto

```
piruadmin-bootstrap-5-dashboard/
├── src/
│   ├── data/             # Archivos JSON (menús, listados de iconos)
│   ├── fonts/            # Fuentes tipográficas locales (Inter, Roboto, Google Sans Code)
│   ├── img/              # Imágenes y recursos gráficos
│   ├── js/
│   │   ├── modules/      # Módulos JS (barra lateral, tema, alternar contraseña, etc.)
│   │   └── piruadmin.js  # Punto de entrada principal de JavaScript
│   ├── plugins/          # Integraciones y estilos de plugins de terceros
│   ├── scss/
│   │   ├── base/         # Variables, modos de color, reinicios CSS
│   │   ├── components/   # Estilos de componentes personalizados
│   │   ├── layout/       # Barra lateral, barra de navegación, pie de página, diseño
│   │   ├── mixins/       # Mixins reutilizables de SCSS
│   │   ├── pages/        # Estilos específicos por página (auth, perfil, etc.)
│   │   ├── utilities/    # Clases y funciones de ayuda
│   │   └── piruadmin.scss# Punto de entrada principal de SCSS
│   └── view/
│       ├── layouts/      # Plantillas base maestras (dashboard, auth, home)
│       ├── mixins/       # Mixins reutilizables de Pug
│       └── pages/        # Plantillas de vistas de la aplicación (Pug)
├── webpack.config.js     # Configuración de compilación de Webpack
└── package.json          # Metadatos del proyecto y dependencias
```

---

## Licencia

Distribuido bajo la [Licencia MIT](./LICENSE).

---

## Autor

Creado y mantenido por [Pirulug](https://github.com/pirulug).
