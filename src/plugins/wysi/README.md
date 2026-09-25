# Wysi Editor

Wysi es un editor de texto enriquecido (WYSIWYG) ligero, modular y desarrollado en JavaScript moderno (Vanilla ES6+) sin dependencias externas de librerias de terceros como jQuery. Esta adaptado e integrado con Bootstrap 5 y el sistema de temas de PiruAdmin.

## Caracteristicas

* **Vanilla JavaScript**: Desarrollado sin dependencias externas ni jQuery.
* **Soporte de Temas**: Integracion nativa con modo claro (Light) y modo oscuro (Dark).
* **Gestion de Imagenes**:
  * Insercion mediante enlace URL o subida de archivos locales desde el equipo.
  * Soporte para texto alternativo (alt).
  * Opciones de tamano rapido (Auto, 100%, 50%, 25%).
  * Alineacion y posicionamiento (Ninguno, Izquierda, Centro, Derecha).
  * Arrastrar y soltar (Drag and Drop) y pegado directo desde el portapapeles.
  * Callback personalizable `onImageUpload` para subida asincrona a servidores o endpoints API.
* **Gestion de Enlaces**: Dialogo modal para insertar y editar enlaces con seleccion de destino (misma pestana o nueva pestana).
* **Formato Enriquecido**: Encabezados (H1-H4), parrafos, citas (blockquote), listas ordenadas y desordenadas, alineaciones de texto, sangria, subrayado, tachado y limpieza de formato.
* **Modales en Capa Superior**: Interfaz flotante superpuesta al 100% del viewport mediante `document.body` para evitar conflictos con barras fijas o contenedores con `z-index`.
* **Soporte Responsivo**: Diseno adaptable a resoluciones moviles y de escritorio.

## Instalacion e Inclusion

Para utilizar Wysi en tu proyecto, incluye los archivos CSS y JS compilados:

```html
<!-- Estilos del plugin -->
<link rel="stylesheet" href="assets/plugins/wysi/wysi.css">

<!-- Script del plugin -->
<script src="assets/plugins/wysi/wysi.js"></script>
```

## Uso Basico

Crea un elemento `textarea` en tu documento HTML:

```html
<textarea id="my-editor">
  <h2>Bienvenido a PiruAdmin</h2>
  <p>Puedes editar este contenido facilmente con Wysi.</p>
</textarea>
```

Inicializa el editor mediante JavaScript:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  Wysi({
    el: "#my-editor",
    height: 350,
    autoGrow: true
  });
});
```

## Opciones de Configuracion

| Opcion | Tipo | Valor por Defecto | Descripcion |
| :--- | :--- | :--- | :--- |
| `el` | `string` | `"[data-wysi], .wysi-field"` | Selector CSS del elemento o elementos `textarea` a inicializar. |
| `height` | `number` | `200` | Altura minima inicial del area de edicion en pixeles. |
| `autoGrow` | `boolean` | `false` | Ajusta automaticamente la altura del editor al contenido ingresado. |
| `autoHide` | `boolean` | `false` | Oculta la barra de herramientas cuando el editor pierde el foco. |
| `darkMode` | `boolean` | `false` | Aplica estilos oscuros a la barra de herramientas y elementos del editor. |
| `tools` | `Array` | `[...]` | Lista de herramientas y separadores visibles en la barra. |
| `onImageUpload` | `Function` | `null` | Funcion asincrona personalizada para procesar y subir imagenes. Debe retornar una promesa con la URL final de la imagen. |
| `allowedTags` | `object` | `{ br, p }` | Lista base de etiquetas HTML permitidas. |
| `customTags` | `Array` | `[]` | Configuracion adicional de etiquetas, atributos y estilos permitidos. |

## Herramientas Disponibles

Las siguientes herramientas pueden ser agregadas al arreglo `tools`:

* Formato y Estructura: `"format"`, `"quote"`, `"hr"`, `"removeFormat"`
* Estilos de Texto: `"bold"`, `"italic"`, `"underline"`, `"strike"`
* Listas: `"ul"`, `"ol"`, `"indent"`, `"outdent"`
* Medios y Enlaces: `"link"`, `"image"`, `"unlink"`
* Separador de Barra: `"|"`
* Grupo de Alineacion:
  ```javascript
  {
    label: "Alineacion",
    items: ["alignLeft", "alignCenter", "alignRight", "alignJustify"]
  }
  ```

## Ejemplos Avanzados

### 1. Barra de Herramientas Personalizada

```javascript
Wysi({
  el: "#custom-editor",
  height: 400,
  darkMode: document.documentElement.getAttribute("data-bs-theme") === "dark",
  tools: [
    "format", "|",
    "bold", "italic", "underline", "strike", "|",
    {
      label: "Alineacion",
      items: ["alignLeft", "alignCenter", "alignRight", "alignJustify"]
    }, "|",
    "ul", "ol", "|",
    "link", "image", "quote", "hr", "|",
    "removeFormat"
  ]
});
```

### 2. Subida de Imagenes a un Servidor (Backend API)

Por defecto, si no se especifica `onImageUpload`, las imagenes cargadas desde el equipo se convierten a formato Base64 Data URL. Para enviarlas a un backend:

```javascript
Wysi({
  el: "#uploader-editor",
  onImageUpload: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/uploads/image", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Error al subir la imagen al servidor");
    }

    const data = await response.json();
    return data.url;
  }
});
```

## Metodos de la API

### Wysi.setContent(element, html)

Establece programaticamente el contenido HTML dentro del editor:

```javascript
const textarea = document.querySelector("#my-editor");
Wysi.setContent(textarea, "<p>Nuevo contenido asignado programaticamente.</p>");
```

### Wysi.destroy(element)

Destruye la instancia del editor y restaura el elemento `textarea` original:

```javascript
const textarea = document.querySelector("#my-editor");
Wysi.destroy(textarea);
```
