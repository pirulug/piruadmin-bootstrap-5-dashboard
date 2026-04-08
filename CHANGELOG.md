# Registro de Cambios

## [v1.0.0] - 04/08/2023

- **Init**

## [v1.0.1] - 05/11/2023

- **Add:**
  - SweetAlert

## [v1.1.0] - 10/12/2023

- **Add:**
  - Font Poppins and Fira Code

## [v1.1.1] - 17/12/23
- **Change:**
  - Change Font Nunito and Fira Code
  - Improved table styles
- **Add:**
  - Tagify

## [v1.2.0] - 16/03/24
- I update packages
- General improvements
- **Add:**
  - ToastifyJs

## [v1.3.0] - 18/08/24
- I update packages
- General improvements
- **Add:**
  - Lite Youtube

## [v1.4.0] - 24/11/25
- I update packages
- General improvements

## [v1.5.0] - 02/01/2026
- Removed the Blog page from this project and migrated it to the PiruUI project.
- Updated project dependencies.
- Improved and updated the Dashboard.

## [v1.6.0] - 01/04/2026
- **Add:**
  - Integrated Toastify JS and Lite YouTube plugins with modern interactive demo pages.
  - Added collapsible "View Code" sections to all plugin and form demo pages for a cleaner UI.
  - Integrated PrismJS and "Copy to Clipboard" functionality for all code examples.
- **Improve:**
  - Modernized the UI and structure of plugin demo pages (Charts, SweetAlert 2, Datatables, Google Maps, Tagify).
  - Updated sidebar navigation menu with new plugin entries.

## [v1.7.0] - 02/04/2026
- **Add:**
  - Added collapsible "View Code" sections with PrismJS syntax highlighting and "Copy to Clipboard" to the Buttons UI documentation page.
  - Created `src/scss/pages/_auth.scss` — dedicated SCSS module for authentication pages.
- **Improve:**
  - Authentication pages (`sign-in`, `sign-up`, `recover-password`, `reset-password`):
    - Refactored password visibility toggle to use the global `data-pr-toggle-password` attribute, removing all redundant inline scripts.
    - Improved and professionalized all UI copy (headings, subheadings, labels, buttons, footer links).
    - Reduced input size by removing oversized `form-control-lg` and `input-group-lg` classes.
    - Improved responsiveness with adaptive column widths (`col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4`).
    - Social login buttons changed from stacked layout to a two-column side-by-side grid.
    - Applied consistent card and logo styling via `.auth-card` and `.auth-logo-box` classes.
  - `_auth.scss` CSS custom property prefix made fully dynamic using `#{$prefix}` SCSS interpolation, synchronized with the global `$prefix` variable.

## [v1.8.0] - 02/04/2026
- **Add:**
  - Integrated `flag-icons` plugin for easy use of international flags.
  - Created a new demonstration page `plugins/flag-icons` with sizes and aspect ratio examples.
  - Registered `flagicons` bundling in `webpack.config.js`.
- **Improve:**
  - Updated sidebar menu with new "Flag Icons" plugin entry.

## [v1.9.0] - 03/04/2026
- **Add:**
  - Sistema de breadcrumbs dinámicos que genera automáticamente la ruta de navegación basada en la estructura de archivos.
  - Soporte para personalización manual de breadcrumbs mediante la variable `breadcrumbs` en el bloque de configuración.
- **Improve:**
  - Lógica automatizada en `layouts/dashboard.pug` para gestionar carpetas anidadas (ej. `Dashboard / Ui / Alerts`).
  - Simplificación de la configuración de páginas al eliminar definiciones manuales innecesarias donde la detección automática es suficiente.

## [v2.0.0] - 08/04/2026
- **Major Icon Library Integration:**
  - Integrated `pirulug-icons-awesome`, a custom multi-style icon library.
  - Added support for Solid, Regular, Light, Thin, and Brands icon styles.
- **New Icon Gallery:**
  - Created `icons/piruawesome` demo page featuring over 1000+ icons.
  - Implemented advanced search and style filtering.
  - Optimized performance with dynamic Lazy Loading and Intersection Observer.
  - Added "Click-to-Copy" functionality for easy class name extraction.
- **UI & Experience Improvements:**
  - Completed the rollout of collapsible "View Code" sections with PrismJS highlighting across all demo pages.
  - Finalized the dynamic breadcrumb system for all sub-pages.
  - Updated sidebar navigation with the new PiruAwesome gallery.
- **Infrastructure:**
  - Updated `package.json` with latest dependencies and version bump.
  - Optimized `webpack.config.js` for handling multi-style icon assets and JSON data injection.
