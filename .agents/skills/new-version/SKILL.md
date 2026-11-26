---
name: new-version
description: Publicar una nueva versión (AAAA-MM-NN) para proyectos PHP sincronizando archivos de versión, CHANGELOG.md, Git y GitHub Releases.
---

# Workflow de Publicación de Nueva Versión (`AAAA-MM-NN`)

Ejecuta este workflow en orden estricto para publicar una nueva versión en un proyecto **PHP**, manteniendo sincronizados `VERSION`, los archivos de configuración o constantes de versión del proyecto, `CHANGELOG.md` y el repositorio Git.

## Paso 1: Verificación previa y análisis de cambios

1. Comprobar el estado del repositorio, la rama actual y la sincronización con el remoto:
   ```powershell
   git status --short; git branch --show-current; git fetch --quiet; git status -sb
   ```
2. **Condiciones de parada inmediata**:
   - Si no hay cambios funcionales ni de código en el proyecto, **detener el workflow** (no generar versiones vacías ni por simples consultas).
   - Si la rama local está detrás del remoto (`behind`), **detener el workflow** y avisar al usuario antes de modificar archivos.
   - Si no hay repositorio remoto configurado, continuar solo hasta el commit o avisar antes del push.
3. Revisar las diferencias reales con `git diff` (y `git diff --cached` si hay cambios en staging) para clasificar con precisión:
   - Nuevas funcionalidades (`Added`)
   - Mejoras o modificaciones (`Changed`)
   - Correcciones de errores (`Fixed`)
   - Elementos eliminados (`Removed`)
   - Mejoras de seguridad (`Security`)
4. Identificar archivos que **nunca** deben incluirse: `.env`, credenciales locales (por ejemplo `config.php` si está ignorado), tokens, `vendor/`, `node_modules/`, archivos temporales, cachés, logs o carpetas locales no deseadas (por ejemplo `.agents/` salvo indicación explícita).

## Paso 2: Calcular la nueva versión (`AAAA-MM-NN`)

1. Obtener la fecha y hora actuales del sistema (`AAAA-MM-DD HH:MM`) y el año-mes actual (`AAAA-MM`).
2. Consultar la última versión existente revisando (en orden):
   - Archivo `VERSION` (si existe en la raíz del proyecto).
   - Última entrada en `CHANGELOG.md` (si existe).
   - Último tag de Git (`git tag --sort=-creatordate`).
   - Archivo de configuración o `composer.json` (si declaran versión explícita).
3. Aplicar la regla de cálculo:
   - Si la última versión pertenece al **mismo `AAAA-MM`**, incrementar `NN` en `+1` con dos dígitos (`01` → `02`, `09` → `10`).
   - Si es un **mes o año nuevo** (o no existe versión previa con formato `AAAA-MM-NN`), iniciar en `AAAA-MM-01`.
4. Verificar que la nueva versión no exista ya en `VERSION`, `CHANGELOG.md` ni en `git tag` para evitar duplicados.

## Paso 3: Sincronizar la versión en el proyecto

Actualizar la versión en **todos** los puntos centralizados que existan en el proyecto sin alterar funcionalidades:

1. **`VERSION`** (raíz del proyecto): crear o actualizar con la nueva versión (ej. `2026-11-01`).
2. **Constantes o configuración PHP** (si existen en el proyecto): localizar y actualizar la constante o variable de versión (ej. `APP_VERSION`, `VERSION`, en archivos como `config.php`, `config.example.php`, `includes/core.php` o el archivo principal del proyecto).
3. **`composer.json`** (opcional): actualizar el campo `"version"` únicamente si ya existe y es gestionado manualmente en el proyecto.
4. **Plantillas o vistas con versión fija** (si aplica): actualizar solo si la versión no se lee dinámicamente desde `VERSION` o desde una constante/opción.

## Paso 4: Actualizar `CHANGELOG.md`

1. Si `CHANGELOG.md` no existe, crearlo con encabezado `# Changelog` y descripción breve del formato `AAAA-MM-NN`.
2. Insertar la nueva versión **al inicio** del historial (sin sobrescribir ni borrar versiones anteriores) con esta estructura:

```markdown
## [AAAA-MM-NN] - AAAA-MM-DD HH:MM

- **Responsable:** <nombre obtenido de `git config user.name`>
- **Archivos modificados:** `ruta/archivo1.php`, `ruta/archivo2.css`

### Added
- Descripción real del cambio.

### Changed
- Descripción real del cambio.

### Fixed
- Descripción real del cambio.
```

*(Incluir solo las subsecciones que tengan cambios reales: `Added`, `Changed`, `Fixed`, `Removed`, `Security`. No inventar ni exagerar cambios).*

## Paso 5: Validación técnica obligatoria

Ejecutar las validaciones antes de hacer staging o commit:

1. **Sintaxis PHP** en todos los archivos del proyecto (excluyendo dependencias y metadatos):
   ```powershell
   Get-ChildItem -Recurse -Filter *.php | Where-Object { $_.FullName -notmatch '\\(vendor|node_modules|\.git)\\' } | ForEach-Object { php -l $_.FullName }
   ```
2. **Consistencia de versión**: confirmar que `VERSION`, las constantes o archivos de configuración de versión actualizados y el encabezado más reciente de `CHANGELOG.md` contienen exactamente la misma versión `AAAA-MM-NN`.
3. **Pruebas del proyecto** (si existen, por ejemplo PHPUnit o scripts de verificación): ejecutarlas antes de continuar.
4. **Si alguna validación falla**, detener el proceso de inmediato, reportar el error y **no** ejecutar commit ni push.

## Paso 6: Staging, Commit, Tag y Push

1. **Git Add selectivo**: agregar únicamente los archivos verificados del proyecto junto con `VERSION`, `CHANGELOG.md` y los archivos de configuración donde se actualizó la versión.
   - **Prohibido** usar `git add .` o `git add -A` sin inspección previa.
   - Revisar `git status --short` tras el staging para confirmar que no haya archivos sensibles o indeseados.
2. **Git Commit**: usar un mensaje claro con el formato:
   ```text
   release: AAAA-MM-NN - resumen breve de los cambios
   ```
3. **Git Tag**: extraer el bloque completo de la nueva versión desde `CHANGELOG.md` a un archivo temporal (por ejemplo `.release-notes.tmp`, fuera del staging de Git) y crear el tag anotado usando esa descripción:
   ```powershell
   git tag -a vAAAA-MM-NN -F .release-notes.tmp
   ```
4. **Git Push**:
   - Confirmar la rama actual y subir la rama junto con el tag:
     ```powershell
     git push origin <rama-actual> --follow-tags
     ```
   - **Nunca** cambiar de rama automáticamente, **nunca** usar `--force`, **nunca** ejecutar `git reset --hard` ni reescribir historial.
   - Si el push falla por conflictos o rechazo del remoto, eliminar el archivo temporal `.release-notes.tmp`, detenerse y reportarlo sin forzar.

## Paso 7: Crear Release en GitHub (GitHub CLI)

Ejecutar únicamente si el push de la rama y del tag en el Paso 6 finalizó correctamente:

1. **Verificar disponibilidad y autenticación de `gh`**:
   ```powershell
   gh auth status
   ```
   - Si `gh` no está instalado, no está autenticado o el remoto no pertenece a GitHub, eliminar `.release-notes.tmp` si existe, **no detener ni revertir el commit/tag** y registrar el release como `Pendiente` en el resumen final.
2. **Evitar duplicados**: comprobar si ya existe un release para `vAAAA-MM-NN`:
   ```powershell
   gh release view vAAAA-MM-NN
   ```
   - Si ya existe, no sobrescribirlo y reportarlo en el resumen.
3. **Publicar el Release** usando exactamente la misma descripción extraída de `CHANGELOG.md` (`.release-notes.tmp`):
   ```powershell
   gh release create vAAAA-MM-NN --title "Release AAAA-MM-NN" --notes-file .release-notes.tmp
   ```
4. **Limpieza**: eliminar el archivo temporal `.release-notes.tmp` inmediatamente después de publicar el release.
5. Registrar la URL del release devuelta por `gh` para incluirla en el resumen final.

## Paso 8: Resumen final

Presentar al usuario un resumen compacto con:

| Campo | Valor |
| --- | --- |
| **Versión anterior** | `...` |
| **Nueva versión** | `AAAA-MM-NN` |
| **Fecha y hora** | `AAAA-MM-DD HH:MM` |
| **Validaciones (`php -l`)** | OK / Error |
| **Rama** | `<rama>` |
| **Commit** | `<hash corto>` |
| **Tag** | `vAAAA-MM-NN` |
| **Estado del push** | Subido / Pendiente |
| **Release GitHub** | `<URL del release>` / Pendiente |

Seguido de una lista breve (2–5 puntos) con los cambios incluidos en la release.
