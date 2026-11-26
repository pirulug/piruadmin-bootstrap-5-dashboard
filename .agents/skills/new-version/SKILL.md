---
name: new-version
description: Publicar una nueva versión SemVer (vX.Y.Z) para PiruAdmin Bootstrap 5 Dashboard sincronizando package.json, CHANGELOG.md, build de Rspack, Git y GitHub Releases.
---

# Workflow de Publicación de Nueva Versión (`vX.Y.Z`) — PiruAdmin

Ejecuta este workflow en orden estricto para publicar una nueva versión en **PiruAdmin Bootstrap 5 Dashboard** (Node.js + Rspack + Bootstrap 5 + Pug), manteniendo sincronizados `package.json`, `CHANGELOG.md`, los banners compilados en `dist/`, Git y GitHub Releases.

## Paso 1: Verificación previa y análisis de cambios

1. Comprobar el estado del repositorio, la rama actual y la sincronización con el remoto:
   ```powershell
   git status --short; git branch --show-current; git fetch --quiet; git status -sb
   ```
2. **Condiciones de parada inmediata**:
   - Si no hay cambios funcionales, visuales ni de infraestructura en el proyecto (ni commits nuevos desde el último tag), **detener el workflow** (no generar versiones vacías).
   - Si la rama local está detrás del remoto (`behind`), **detener el workflow** y avisar al usuario antes de modificar archivos.
   - Si no hay repositorio remoto configurado, continuar solo hasta el commit/tag o avisar antes del push.
3. Revisar las diferencias reales desde el último tag (`git log <ultimo-tag>..HEAD --oneline`, `git diff` y `git diff --cached`) para clasificar con precisión:
   - Nuevas páginas, demos, plugins o funcionalidades (`Added`)
   - Mejoras de diseño, arquitectura, bundler o rendimiento (`Changed` / `Improved`)
   - Correcciones de errores o responsive (`Fixed`)
   - Elementos o dependencias eliminadas (`Removed`)
   - Actualizaciones de dependencias (`Dependencies`)
4. Identificar archivos que **nunca** deben incluirse en el commit:
   - `dist/`, `node_modules/`, `package-lock.json`, `pnpm-lock.yaml`, `.cache/`, `.tmp/`, `scratch/`
   - `.env`, `.env.local`, `.env.*.local`, credenciales, tokens, logs (`*.log`)
   - `.release-notes.tmp` y archivos de `.agents/` (salvo indicación explícita del usuario)

## Paso 2: Calcular la nueva versión SemVer (`X.Y.Z`)

1. Consultar la versión actual revisando en orden:
   - `package.json` (campo `"version"`, fuente única de verdad).
   - Última entrada al final de `CHANGELOG.md`.
   - Último tag de Git:
     ```powershell
     git tag --sort=-v:refname | Select-Object -First 5
     ```
2. Determinar el incremento **SemVer (`MAJOR.MINOR.PATCH`)** (o usar la versión explícita indicada por el usuario):
   - **`PATCH` (`X.Y.Z+1`)**: correcciones de bugs, ajustes responsive, limpieza de estilos o actualizaciones menores de dependencias.
   - **`MINOR` (`X.Y+1.0`)**: nuevas páginas/demos, nuevos componentes/plugins o migraciones internas compatibles (ej. bundler).
   - **`MAJOR` (`X+1.0.0`)**: cambios incompatibles (breaking changes) en estructura SCSS/JS/HTML o salto mayor de framework.
3. Verificar que el tag `vX.Y.Z` no exista ya en `CHANGELOG.md` ni en `git tag` para evitar duplicados.

## Paso 3: Sincronizar la versión en el proyecto

1. **`package.json`**: actualizar el campo `"version"` a `"X.Y.Z"`.
   - Los banners de copyright en `rspack.config.js` y `scripts/plugins-manager.js` leen `pkg.version` dinámicamente desde `package.json`, por lo que se sincronizan automáticamente al compilar.
2. **`README.md` / `README.es.md`** (opcional): actualizar únicamente si muestran una versión fija desactualizada.

## Paso 4: Actualizar `CHANGELOG.md`

1. Respetar la convención cronológica actual de `CHANGELOG.md` en este repositorio (**orden ascendente: la nueva versión se agrega al final del archivo**, debajo de la última versión publicada).
2. Obtener la fecha actual en formato `DD/MM/AAAA` y agregar el nuevo bloque con esta estructura:

```markdown
## [vX.Y.Z] - DD/MM/AAAA

### Added
- Descripción real del cambio.

### Improved
- Descripción real del cambio.

### Fixed
- Descripción real del cambio.

### Dependencies
- Descripción de cambios relevantes de dependencias (si aplica).
```

*(Incluir solo las subsecciones que tengan cambios reales: `Added`, `Changed` / `Improved`, `Fixed`, `Removed`, `Dependencies`. No inventar ni exagerar cambios).*

## Paso 5: Validación técnica obligatoria (Rspack Build)

Ejecutar las validaciones antes de hacer staging o commit:

1. **Compilación de producción completa (`app` + los 15 plugins)**:
   ```powershell
   npm run build
   ```
2. **Consistencia de versión y banners compilados**:
   - Confirmar que `package.json` (`"version"`) y el nuevo encabezado `## [vX.Y.Z]` en `CHANGELOG.md` coinciden exactamente.
   - Verificar que el banner generado en `dist/assets/css/piruadmin.css`, `dist/assets/js/piruadmin.js` y en los plugins compilados (ej. `dist/assets/plugins/chartjs/chartjs.js`) contiene `vX.Y.Z`:
     ```powershell
     Get-Content dist\assets\css\piruadmin.css -TotalCount 5; Get-Content dist\assets\plugins\chartjs\chartjs.js -TotalCount 5
     ```
3. **Si `npm run build` o alguna verificación falla**, detener el proceso de inmediato, reportar el error y **no** ejecutar commit ni push.

## Paso 6: Staging, Commit, Tag y Push

1. **Git Add selectivo**: agregar únicamente los archivos fuente verificados (`src/`, `scripts/`, `rspack.config.js`, `package.json`, `CHANGELOG.md`, `README*.md`, etc.).
   - **Prohibido** usar `git add .` o `git add -A` sin inspección previa.
   - Revisar `git status --short` tras el staging para confirmar que no haya archivos ignorados, sensibles ni temporales.
2. **Git Commit**: usar Conventional Commits con el formato:
   ```text
   release: vX.Y.Z - resumen breve de los cambios
   ```
3. **Git Tag anotado**: extraer el bloque completo de la nueva versión desde `CHANGELOG.md` a un archivo temporal `.release-notes.tmp` (fuera del staging de Git) y crear el tag:
   ```powershell
   git tag -a vX.Y.Z -F .release-notes.tmp
   ```
4. **Git Push**:
   - Confirmar la rama actual (`master` dispara automáticamente el deploy a GitHub Pages vía `.github/workflows/deploy.yml`) y subir la rama junto con el tag:
     ```powershell
     git push origin <rama-actual> --follow-tags
     ```
   - **Nunca** cambiar de rama automáticamente, **nunca** usar `--force`, **nunca** ejecutar `git reset --hard` ni reescribir historial.
   - Si el push falla por conflictos o rechazo del remoto, eliminar `.release-notes.tmp`, detenerse y reportarlo sin forzar.

## Paso 7: Crear Release en GitHub (GitHub CLI)

Ejecutar únicamente si el push de la rama y del tag en el Paso 6 finalizó correctamente:

1. **Verificar disponibilidad y autenticación de `gh`**:
   ```powershell
   gh auth status
   ```
   - Si `gh` no está instalado o no está autenticado, eliminar `.release-notes.tmp`, **no revertir el commit/tag** y registrar el release como `Pendiente` en el resumen final.
2. **Evitar duplicados**: comprobar si ya existe un release para `vX.Y.Z`:
   ```powershell
   gh release view vX.Y.Z
   ```
   - Si ya existe, no sobrescribirlo y reportarlo en el resumen.
3. **Publicar el Release** usando exactamente las notas extraídas de `CHANGELOG.md` (`.release-notes.tmp`):
   ```powershell
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file .release-notes.tmp
   ```
4. **Limpieza**: eliminar `.release-notes.tmp` inmediatamente después de publicar el release.
5. Registrar la URL del release devuelta por `gh` para incluirla en el resumen final.

## Paso 8: Resumen final

Presentar al usuario un resumen compacto con:

| Campo | Valor |
| --- | --- |
| **Versión anterior** | `vX.Y.Z` |
| **Nueva versión** | `vX.Y.Z` |
| **Fecha** | `DD/MM/AAAA` |
| **Build (`npm run build` + banners)** | OK / Error |
| **Rama** | `<rama>` |
| **Commit** | `<hash corto>` |
| **Tag** | `vX.Y.Z` |
| **Estado del push** | Subido / Pendiente |
| **Release GitHub** | `<URL del release>` / Pendiente |

Seguido de una lista breve (2–5 puntos) con los cambios incluidos en la release.
