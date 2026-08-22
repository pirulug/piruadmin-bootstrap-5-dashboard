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
- **Unified Icon Gallery System:**
  - Overhauled all icon pages (PiruAwesome, Font Awesome, Bootstrap Icons, Feather Icons) with a high-performance gallery system.
  - **Dynamic Search:** Real-time filtering by icon name or label across all libraries.
  - **Performance Optimization:** Integrated `IntersectionObserver` for chunk-based lazy loading, significantly reducing initial DOM load and memory usage.
  - **Icon Details Modal:** Added a professional modal for every icon that provides:
    - Large-scale preview.
    - Copyable **HTML** code snippets.
    - Copyable **PUG** code snippets.
- **UI & Experience Improvements:**
  - Refactored all icon documentation to use **100% native Bootstrap 5 classes**, ensuring perfect consistency with the global theme.
  - Completed the rollout of collapsible "View Code" sections with PrismJS highlighting across all demo pages.
  - Finalized the dynamic breadcrumb system for all sub-pages.
  - Updated sidebar navigation with the new PiruAwesome gallery.
- **Infrastructure:**
  - Updated `package.json` with latest dependencies and version bump.
  - Optimized `webpack.config.js` for handling multi-style icon assets and JSON data injection.
  - Improved Feather Icons initialization logic for dynamic rendering.

## [v2.1.0] - 08/04/2026
- **Architecture Modularization - Code Preview System:**
  - Designed and implemented a centralized "Code Preview" modular architecture.
  - Created `src/js/modules/code-preview.js` to handle all copy-to-clipboard operations globally via modern Clipboard API with fallback support.
  - Created `src/scss/components/_code-preview.scss` to standardize the appearance and layout of code blocks across all documentation.
  - Registered the new modules in `piruadmin.js` and `piruadmin.scss` infrastructure entry points.
  - **Global Cleanup:** Removed over 600 lines of redundant, legacy inline JavaScript from 14 documentation pages:
    - `timeline.pug`, `alerts.pug`, `buttons.pug`, `avatar.pug`, `charts.pug`, `tagify.pug`, `badges.pug`, `datatable.pug`, `lite-youtube.pug`, `flag-icons.pug`, `images.pug`, `maps-google.pug`, `sweetalert.pug`, and `toastify.pug`.
- **Timeline UI & Experience Modernization:**
  - **Refined Styles:** Completely overhauled the Timeline UI using professional, modular SCSS (`src/scss/pages/_timeline.scss`), removing all inline CSS.
  - **New `.agent` Variant:** Added a specialized style for automated/system events using Bootstrap 5 semantic color variables, strictly avoiding `.shadow` and `.border-0` as requested.
  - **Enhanced Marker System:**
    - Increased marker size to **26px** for improved readability and icon centering.
    - Added support for circular-clipped `<img>` markers for user avatars.
    - Migrated all timeline iconography to the **PiruAwesome** (`pr-`) library.
  - **Interactive Demos:** Added support for PrismJS code blocks and copy-to-clipboard functionality to timeline events.

## [v2.2.0] - 18/05/2026

### Added
- Typography and color pages
- Full authentication system pages
- Two-step verification (2FA) page
- Error pages (e.g., 404)
- User authentication flows and account settings view
- WYSIWYG editor demo page
- Flatpickr form component integration
- SweetAlert2 custom theme styles
- New dashboard layout
- Responsive sidebar with toggle support
- Dark mode support for SimpleMDE editor

### Improved
- Navigation menu structure and configuration
- Menu entries for new modules (forms, auth, components)
- Form inputs with password visibility toggle
- Sidebar UX and responsiveness

### Fixed
- Back-to-top button dynamic centering and half-moon visual effect

### Refactored
- Removed aggressive list resets to preserve editor formatting

### Removed
- Deprecated authentication utility module
- Unused font files (licenses and redundant CSS)

### Maintenance
- Suppressed Sass deprecation warnings in Webpack

### Misc
- General project update

## [v2.3.0] - 21/08/2026

### Added
- **Multi-Level Sidebar Navigation**:
  - Recursive arbitrary-depth navigation support in `sidebar.pug` with dynamic active state and accordion auto-expansion.
  - Configured Level 1 icon display while keeping Level 2 and Level 3 submenus clean and properly indented.
- **User Management Module**:
  - `user-add.pug`: Add User form with permissions toggles and sticky action buttons.
  - `user-list.pug`: Standardized user directory table with independent filter and pagination containers.
  - `user-view.pug`: User profile overview with account details and activity timeline.
- **Project Management Module**:
  - `project-list.pug`: Project directory table with progress indicators, team avatars, and action buttons.
  - `project-details.pug`: Project details view with budget tracking, milestone roadmap, team members, and attachments.
  - `project-create.pug`: Project creation form with milestone setup and team assignment.
- **Mail Application Module**:
  - `mail-inbox.pug`: Interactive email inbox with folder and label filters, starred items, and sticky pagination.
  - `mail-compose.pug`: Email composer with rich formatting toolbar simulation and drag-and-drop attachments.
  - `mail-read.pug`: Full message reading view with attachment previews and quick reply box.
- **File Manager Module**:
  - `file-manager.pug`: File directory with categorized storage overview cards and file management table.
  - `file-media.pug`: Responsive multimedia grid gallery with type filters and quick actions.
- **Charts Demos Expansion**:
  - Added 6 new interactive Chart.js demos to `plugins/charts.pug`: Grouped Bar Chart, Stacked Bar Chart, Multi-Axis Line Chart, Stepped Line Chart, Bubble Chart, and Scatter Chart.
  - Integrated collapsible PrismJS code preview and copy-to-clipboard functionality across all chart demos.
- **Bootstrap Tables Demos Expansion**:
  - Added comprehensive table variants to `tables/bootstrap.pug`: Striped Columns, Borderless, Table Group Dividers, Contextual Classes, Active Rows, Vertical Alignment with avatars & progress bars, and Accessible Captions.
- **Standardized UI Guidelines & Architecture Rules**:
  - Created `.agents/rules` for spacing (`piru-general.md`), action buttons (`piru-btn-action.md`), table listing views (`piru-table-list.md`), sticky pagination (`piru-pagination.md`), and top filter bars (`piru-filter.md`).

### Improved
- Standardized vertical margins across all pages to strictly enforce `mb-3` and `g-3`.
- Standardized table action buttons with `btn-sm`, uppercase bold text, and Bootstrap icons on the left.
- Standardized form action bars with `sticky-bottom` and `sticky-top` containers.
- Enhanced sidebar SCSS specificity to fix active state cascading and dark mode background color glitches.