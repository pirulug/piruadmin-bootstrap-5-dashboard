/**
 * Wysi: A Vanilla JS WYSIWYG editor for Bootstrap 5
 * @version: 1.1.0
 * @license: MIT
 * @author: PiruAdmin
 */

((window, document) => {
  "use strict";

  // Default settings
  const settings = {
    // Default selector
    el: "[data-wysi], .wysi-field",
    // Default tools in the toolbar
    tools: [
      "format",
      "|",
      "bold",
      "italic",
      "|",
      {
        label: "Text alignment",
        items: ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
      },
      "|",
      "ul",
      "ol",
      "|",
      "indent",
      "outdent",
      "|",
      "link",
      "image",
    ],
    // Enable dark mode (toolbar only)
    darkMode: false,
    // Height of the editable region
    height: 200,
    // Grow the editable region's height to fit its content
    autoGrow: false,
    // Hide the toolbar when the editable region is out of focus
    autoHide: false,
    // Custom function to handle image uploads: async (file) => imageUrl
    onImageUpload: null,
    // Default list of allowed tags
    // These tags are always allowed regardless of the instance options
    allowedTags: {
      br: {
        attributes: [],
        styles: [],
        isEmpty: true,
      },
      p: {
        attributes: [],
        styles: [],
        isEmpty: false,
      },
    },
    // Custom tags to allow when filtering inserted content
    customTags: [
      /* Example:
       {
        tags: ["table", "thead", "tbody", "tr", "td", "th"], // Tags to allow
        attributes: ["id", "class"], // These attributes will be permitted for all the tags above
        styles: ["width"],
        isEmpty: false
      }
       */
    ],
  };

  // Supported tools
  const toolset = {
    format: {
      tags: ["p", "h1", "h2", "h3", "h4"],
      styles: ["text-align"],
      label: "Select block format",
      paragraph: "Paragraph",
      heading: "Heading",
    },
    quote: {
      tags: ["blockquote"],
      label: "Quote",
    },
    bold: {
      tags: ["strong"],
      alias: ["b"],
      label: "Bold",
    },
    italic: {
      tags: ["em"],
      alias: ["i"],
      label: "Italic",
    },
    underline: {
      tags: ["u"],
      label: "Underline",
    },
    strike: {
      tags: ["s"],
      alias: ["del", "strike"],
      label: "Strike-through",
      command: "strikeThrough",
    },
    alignLeft: {
      label: "Align left",
      command: "justifyLeft",
    },
    alignCenter: {
      label: "Align center",
      command: "justifyCenter",
    },
    alignRight: {
      label: "Align right",
      command: "justifyRight",
    },
    alignJustify: {
      label: "Justify",
      command: "justifyFull",
    },
    ul: {
      tags: ["ul"],
      extraTags: ["li"],
      styles: ["text-align"],
      label: "Bulleted list",
      command: "insertUnorderedList",
    },
    ol: {
      tags: ["ol"],
      extraTags: ["li"],
      styles: ["text-align"],
      label: "Numbered list",
      command: "insertOrderedList",
    },
    indent: {
      label: "Increase indent",
    },
    outdent: {
      label: "Decrease indent",
    },
    link: {
      tags: ["a"],
      attributes: ["href", "target"],
      attributeLabels: ["URL", "Open link in"],
      hasForm: true,
      formOptions: {
        target: [
          {
            label: "Current tab",
            value: "",
          },
          {
            label: "New tab",
            value: "_blank",
          },
        ],
      },
      label: "Link",
    },
    image: {
      tags: ["img"],
      attributes: ["src", "alt"],
      attributeLabels: ["URL", "Alternative text"],
      uploadLabel: "Upload image",
      extraSettings: ["size", "position"],
      extraSettingLabels: ["Image size", "Image position"],
      styles: ["width", "height", "display", "margin", "float"],
      isEmpty: true,
      hasForm: true,
      formOptions: {
        size: [
          {
            label: "None",
            value: "",
            criterion: null,
          },
          {
            label: "100%",
            value: "100%",
            criterion: {
              width: "100%",
            },
          },
          {
            label: "50%",
            value: "50%",
            criterion: {
              width: "50%",
            },
          },
          {
            label: "25%",
            value: "25%",
            criterion: {
              width: "25%",
            },
          },
        ],
        position: [
          {
            label: "None",
            value: "",
            criterion: null,
          },
          {
            label: "Left",
            value: "left",
            criterion: {
              float: "left",
            },
          },
          {
            label: "Center",
            value: "center",
            criterion: {
              margin: "auto",
            },
          },
          {
            label: "Right",
            value: "right",
            criterion: {
              float: "right",
            },
          },
        ],
      },
      label: "Image",
    },
    hr: {
      tags: ["hr"],
      isEmpty: true,
      label: "Horizontal line",
      command: "insertHorizontalRule",
    },
    removeFormat: {
      label: "Remove format",
    },
    unlink: {
      label: "Remove link",
    },
  };

  // Instances storage
  const instances = {};

  // The CSS class to use for selected elements
  const selectedClass = "wysi-selected";

  // Placeholder elements CSS class
  const placeholderClass = "wysi-fragment-placeholder";

  // Heading elements
  const headingElements = ["H1", "H2", "H3", "H4"];

  // Block type HTML elements
  const blockElements = ["BLOCKQUOTE", "HR", "P", "OL", "UL", ...headingElements];

  // Detect Firefox browser
  const isFirefox = navigator.userAgent.includes("Gecko/") && !navigator.userAgent.includes("Chrome");

  // Shortcuts
  const dispatchEvent = (element, event) =>
    element.dispatchEvent(new Event(event, { bubbles: true }));

  const execCommand = (command, value = null) =>
    document.execCommand(command, false, value);

  const hasClass = (element, className) =>
    Boolean(element?.classList?.contains(className));

  // Used to store the current DOM selection for later use
  let currentSelection;

  // For storing translated strings
  let availableTranslations = {};

  /**
   * Shortcut for addEventListener to optimize the minified JS.
   * @param {EventTarget} context The context to which the listener is attached.
   * @param {string} type Event type.
   * @param {string|Function} selector Event target if delegation is used, event handler if not.
   * @param {Function} [fn] Event handler if delegation is used.
   */
  function addListener(context, type, selector, fn) {
    // Delegate event to the target of the selector
    if (typeof selector === "string") {
      context.addEventListener(type, (event) => {
        const el = event.target instanceof Element ? event.target : event.target?.parentElement;
        if (!el) return;
        const target = el.closest(selector);
        if (target && (context === document || context.contains?.(target))) {
          if (selector.includes(":not(button)") && el.closest("button")) {
            return;
          }
          fn.call(target, event, target);
        }
      });

      // If the selector is not a string then it's a function
      // in which case we need a regular event listener
    } else {
      context.addEventListener(type, selector);
    }
  }

  /**
   * Build an html fragment from a string.
   * @param {string} html The HTML code.
   * @return {DocumentFragment} A document fragment.
   */
  function buildFragment(html) {
    const template = createElement("template");
    template.innerHTML = html.trim();
    return template.content;
  }

  /**
   * Deep clone an object.
   * @param {object} obj The object to clone.
   * @return {object} The cloned object.
   */
  function cloneObject(obj) {
    if (!obj) return obj;
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Create an element and optionally set its attributes.
   * @param {string} tag The HTML tag of the new element.
   * @param {object} [attributes] The element's attributes.
   * @return {HTMLElement} An HTML element.
   */
  function createElement(tag, attributes) {
    const element = document.createElement(tag);
    if (attributes) {
      for (const [attributeName, value] of Object.entries(attributes)) {
        // Attribute names starting with underscore are actually properties
        if (attributeName.startsWith("_")) {
          element[attributeName.slice(1)] = value;
        } else {
          element.setAttribute(attributeName, value);
        }
      }
    }
    return element;
  }

  /**
   * Call a function only when the DOM is ready.
   * @param {Function} fn The function to call.
   * @param {Array} [args=[]] Arguments to pass to the function.
   */
  function DOMReady(fn, args = []) {
    if (document.readyState !== "loading") {
      fn(...args);
    } else {
      addListener(document, "DOMContentLoaded", () => {
        fn(...args);
      });
    }
  }

  /**
   * Find the deepest child of a node.
   * @param {Node} node The target node.
   * @return {Node} The deepest child node of our target node.
   */
  function findDeepestChildNode(node) {
    let current = node;
    while (current.firstChild !== null) {
      current = current.firstChild;
    }
    return current;
  }

  /**
   * Read a file as a base64 Data URL.
   * @param {File} file The file to read.
   * @return {Promise<string>} Promise resolving to data URL.
   */
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Insert an image into the editor.
   * @param {HTMLElement} editor The editable region.
   * @param {string} imageUrl The image URL or data URL.
   * @param {string} [altText=""] Alternative text.
   */
  function insertImageIntoEditor(editor, imageUrl, altText = "") {
    editor.focus();
    const imageTag = `<img src="${imageUrl}" alt="${altText}" class="${selectedClass}">`;
    execCommand("insertHTML", imageTag);
    const textarea = editor.parentNode?.nextElementSibling;
    const instanceId = getInstanceId(editor);
    if (textarea && instanceId !== undefined) {
      updateContent(textarea, editor, instanceId, editor.innerHTML);
    }
    const newlyInserted =
      editor.querySelector(`img[src="${imageUrl}"]`) ||
      editor.querySelector(`img.${selectedClass}`);
    if (newlyInserted) {
      setTimeout(() => {
        showImageResizer(newlyInserted);
      }, 50);
    }
  }

  /**
   * Find WYSIWYG editor instances.
   * @param {string|Element|NodeList|Array} selector One or more selectors pointing to textarea fields.
   * @return {Array<object>} Array of editor instances.
   */
  function findEditorInstances(selector) {
    const editorInstances = [];
    getTargetElements(selector).forEach((textarea) => {
      const wrapper = textarea.previousElementSibling;
      if (wrapper && hasClass(wrapper, "wysi-wrapper")) {
        const [toolbar, editor] = wrapper.children;
        const instanceId = getInstanceId(editor);
        editorInstances.push({
          textarea,
          wrapper,
          toolbar,
          editor,
          instanceId,
        });
      }
    });
    return editorInstances;
  }

  /**
   * Find the current editor instance.
   * @param {Node} currentNode The possible child node of the editor instance.
   * @return {object} The instance's editable region and toolbar, and an array of nodes that lead to it.
   */
  function findInstance(currentNode) {
    const nodes = [];
    let ancestor;
    let toolbar;
    let editor;
    let node = currentNode;

    // Find all HTML tags between the current node and the editable ancestor
    while (node && node !== document.body) {
      const tag = node.tagName;
      if (tag) {
        if (hasClass(node, "wysi-wrapper")) {
          // Editable ancestor found
          ancestor = node;
          break;
        } else {
          nodes.push(node);
        }
      }
      node = node.parentNode;
    }

    if (ancestor) {
      [toolbar, editor] = ancestor.children;
    }

    return {
      toolbar,
      editor,
      nodes,
    };
  }

  /**
   * Get the current selection.
   * @return {Range} The current selection.
   */
  function getCurrentSelection() {
    return currentSelection;
  }

  /**
   * Get the html content of a document fragment.
   * @param {DocumentFragment} fragment A document fragment.
   * @return {string} The html content of the fragment.
   */
  function getFragmentContent(fragment) {
    const wrapper = createElement("div");
    wrapper.appendChild(fragment);
    return wrapper.innerHTML;
  }

  /**
   * Get an editor's instance id.
   * @param {HTMLElement} editor The editor element.
   * @return {string} The instance id.
   */
  function getInstanceId(editor) {
    return editor.dataset.wid;
  }

  /**
   * Get a list of DOM elements based on a selector value.
   * @param {string|Element|NodeList|Array} selector A CSS selector string, a DOM element or a list of DOM elements.
   * @return {Array<Element>} A list of DOM elements.
   */
  function getTargetElements(selector) {
    // If selector is a string, get the elements that it represents
    if (typeof selector === "string") {
      return Array.from(document.querySelectorAll(selector));
    }

    // If selector is a DOM element, wrap it in an array
    if (selector instanceof Node) {
      return [selector];
    }

    // If selector is a NodeList or an HTMLCollection, convert it to an array
    if (selector instanceof NodeList || selector instanceof HTMLCollection) {
      return Array.from(selector);
    }

    // If selector is an array, find any DOM elements it contains
    if (Array.isArray(selector)) {
      return selector.filter((el) => el instanceof Node);
    }

    return [];
  }

  /**
   * Try to guess the textarea element's label if any.
   * @param {HTMLTextAreaElement} textarea The textarea element.
   * @return {string} The textarea element's label or an empty string.
   */
  function getTextAreaLabel(textarea) {
    const parent = textarea.parentNode;
    const id = textarea.id;
    let labelElement;

    // If the textarea element is inside a label element
    if (parent?.nodeName === "LABEL") {
      labelElement = parent;

      // Or if the textarea element has an id, and there is a label element
      // with an attribute "for" that points to that id
    } else if (id) {
      labelElement = document.querySelector(`label[for="${id}"]`);
    }

    // If a label element is found, return the first non empty child text node
    if (labelElement) {
      const textNodes = Array.from(labelElement.childNodes).filter(
        (n) => n.nodeType === 3
      );
      const texts = textNodes.map((n) =>
        n.textContent.replace(/\s+/g, " ").trim()
      );
      const label = texts.find((l) => l !== "");
      if (label) {
        return label;
      }
    }
    return "";
  }

  /**
   * Get a translated string if applicable.
   * @param {string} category The category of the string.
   * @param {string} str The string to translate.
   * @return {string} The translated string, or the original string otherwise.
   */
  function getTranslation(category, str) {
    return availableTranslations[category]?.[str] ?? str;
  }

  /**
   * Restore a previous selection if any.
   * @param {HTMLElement} [editor] Optional editor instance to fall back to.
   */
  function restoreSelection(editor) {
    if (currentSelection) {
      setSelection(currentSelection);
      currentSelection = undefined;
      return;
    }
    const selection = document.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      editor &&
      editor.contains(selection.anchorNode)
    ) {
      return;
    }
    if (editor) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      setSelection(range);
    }
  }

  /**
   * Set the value of the current selection.
   * @param {Range} range The range to set.
   */
  function setCurrentSelection(range) {
    currentSelection = range;
  }

  /**
   * Set the selection to a range.
   * @param {Range} range The range to select.
   */
  function setSelection(range) {
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Store translated strings.
   * @param {object} translations The translated strings.
   */
  function storeTranslations(translations) {
    availableTranslations = translations;
  }

  /**
   * Set the expanded state of a button.
   * @param {HTMLElement} button The button.
   * @param {boolean} expanded The expanded state.
   */
  function toggleButton(button, expanded) {
    button.setAttribute("aria-expanded", String(expanded));
  }

  /**
   * Execute an action.
   * @param {string} action The action to execute.
   * @param {HTMLElement} editor The editor instance.
   * @param {Array} [options=[]] Optional action parameters.
   */
  function execAction(action, editor, options = []) {
    const tool = toolset[action];
    if (tool) {
      const command = tool.command || action;

      // Focus editor first
      editor.focus();

      // Restore selection if any
      restoreSelection(editor);

      // Execute the tool's action
      execEditorCommand(command, options, editor);

      // Focus the editor instance
      editor.focus();

      // Update textarea content
      const textarea = editor.parentNode?.nextElementSibling;
      const instanceId = getInstanceId(editor);
      if (textarea && instanceId !== undefined) {
        updateContent(textarea, editor, instanceId, editor.innerHTML);
      }

      // Update toolbar buttons active state
      updateToolbarState();

      if (action === "image") {
        const newlyInserted =
          editor.querySelector(`img.${selectedClass}`) ||
          editor.querySelector(`img[src="${options[0]}"]`);
        if (newlyInserted) {
          setTimeout(() => {
            showImageResizer(newlyInserted);
          }, 50);
        }
      }
    }
  }

  /**
   * Execute an editor command.
   * @param {string} command The command to execute.
   * @param {Array} [options=[]] Optional command parameters.
   * @param {HTMLElement} [editor] The editor instance.
   */
  function execEditorCommand(command, options = [], editor = null) {
    switch (command) {
      // Block level formatting
      case "quote":
        options[0] = "blockquote";
      // Fall through to format
      case "format":
        execCommand("formatBlock", `<${options[0]}>`);
        break;

      // Links
      case "link": {
        const [linkUrl, linkTarget = "", linkText] = options;
        if (linkText) {
          const targetAttr = linkTarget !== "" ? ` target="${linkTarget}"` : "";
          const linkTag = `<a href="${linkUrl}"${targetAttr}>${linkText}</a>`;
          const inserted = execCommand("insertHTML", linkTag);
          if (!inserted && editor) {
            const selection = document.getSelection();
            if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const temp = document.createElement("div");
              temp.innerHTML = linkTag;
              const frag = document.createDocumentFragment();
              while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
              }
              range.insertNode(frag);
            } else {
              const temp = document.createElement("div");
              temp.innerHTML = linkTag;
              editor.appendChild(temp.firstElementChild);
            }
          }
        }
        break;
      }

      // Images
      case "image": {
        const styles = [];
        const [imageUrl, altText = "", size = "", position = "", originalHtml] = options;
        if (!imageUrl || !imageUrl.trim()) {
          break;
        }
        if (size !== "") {
          styles.push(`width: ${size};`);
        }
        if (position !== "") {
          if (position === "center") {
            styles.push("display: block; margin: auto;");
          } else {
            styles.push(`float: ${position};`);
          }
        }
        const styleAttr = styles.length > 0 ? ` style="${styles.join(" ")}"` : "";

        // If editing an existing selected image, update directly
        const existingImg = editor?.querySelector(`img.${selectedClass}`);
        if (existingImg) {
          existingImg.src = imageUrl;
          existingImg.alt = altText;
          if (styles.length > 0) {
            existingImg.style.cssText = styles.join(" ");
          } else {
            existingImg.style.cssText = "";
          }
          break;
        }

        const image = `<img src="${imageUrl}" alt="${altText}" class="wysi-selected"${styleAttr}>`;
        const imageTag = originalHtml ? originalHtml.replace(/<img[^>]+>/i, image) : image;
        const inserted = execCommand("insertHTML", imageTag);
        if (!inserted && editor) {
          const selection = document.getSelection();
          if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const temp = document.createElement("div");
            temp.innerHTML = imageTag;
            const frag = document.createDocumentFragment();
            while (temp.firstChild) {
              frag.appendChild(temp.firstChild);
            }
            range.insertNode(frag);
          } else {
            const temp = document.createElement("div");
            temp.innerHTML = imageTag;
            editor.appendChild(temp.firstElementChild);
          }
        }
        break;
      }

      // All the other commands
      default:
        execCommand(command);
    }
  }

  /**
   * Render a list box.
   * @param {object} details The list box properties and data.
   * @return {HTMLElement} A DOM element containing the list box.
   */
  function renderListBox(details) {
    const { label, items, classes: extraClasses = [] } = details;
    const [firstItem] = items;
    const classes = ["wysi-listbox", ...extraClasses];

    // List box wrapper
    const listBox = createElement("div", {
      class: classes.join(" "),
    });

    // List box button
    const button = createElement("button", {
      type: "button",
      title: label,
      "aria-label": `${label} ${firstItem.label}`,
      "aria-haspopup": "listbox",
      "aria-expanded": false,
      _innerHTML: renderListBoxItem(firstItem),
    });

    // List box menu
    const menu = createElement("div", {
      role: "listbox",
      tabindex: -1,
      "aria-label": label,
    });

    // List box items
    items.forEach((item) => {
      const option = createElement("button", {
        type: "button",
        role: "option",
        tabindex: -1,
        "aria-label": item.label,
        "aria-selected": false,
        "data-action": item.action,
        "data-option": item.name || "",
        _innerHTML: renderListBoxItem(item),
      });
      menu.appendChild(option);
    });

    // Tie it all together
    listBox.appendChild(button);
    listBox.appendChild(menu);
    return listBox;
  }

  /**
   * Render a list box item.
   * @param {object} item The list box item.
   * @return {string} The list box item's content.
   */
  function renderListBoxItem(item) {
    return item.icon
      ? `<svg><use href="#wysi-${item.icon}"></use></svg>`
      : item.label;
  }

  /**
   * Open a list box.
   * @param {HTMLElement} button The list box's button.
   */
  function openListBox(button) {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    const listBox = button.nextElementSibling;
    const selectedItem =
      listBox.querySelector('[aria-selected="true"]') ||
      listBox.firstElementChild;
    toggleButton(button, !isOpen);
    selectedItem?.focus();
  }

  /**
   * Select a list box item.
   * @param {HTMLElement} item The list box item.
   */
  function selectListBoxItem(item) {
    const listBox = item.parentNode;
    const button = listBox.previousElementSibling;
    const selectedItem = listBox.querySelector('[aria-selected="true"]');
    if (selectedItem) {
      selectedItem.setAttribute("aria-selected", "false");
    }
    item.setAttribute("aria-selected", "true");
    button.innerHTML = item.innerHTML;
  }

  /**
   * Close the currently open list box if any.
   */
  function closeListBox() {
    const activeListBox = document.querySelector(
      '.wysi-listbox [aria-expanded="true"]'
    );
    if (activeListBox) {
      toggleButton(activeListBox, false);
    }
  }

  // List box button click
  addListener(document, "click", ".wysi-listbox > button", (event, target) => {
    const button =
      target ||
      (event.target instanceof Element ? event.target.closest("button") : null);
    if (!button) return;
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    closeListBox();
    if (!isExpanded) {
      openListBox(button);
    }
  });

  // On key press on the list box button
  addListener(document, "keydown", ".wysi-listbox > button", (event, target) => {
    const button =
      target ||
      (event.target instanceof Element ? event.target.closest("button") : null);
    if (!button) return;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "Enter":
      case " ":
        openListBox(button);
        event.preventDefault();
        break;
    }
  });

  // On click on a list box item
  addListener(
    document,
    "click",
    ".wysi-listbox > div > button",
    (event, target) => {
      const item =
        target ||
        (event.target instanceof Element ? event.target.closest("button") : null);
      if (!item) return;
      const { action, option } = item.dataset;
      const { editor } = findInstance(item);
      if (editor && action) {
        execAction(action, editor, [option]);
      }
      selectListBoxItem(item);
      closeListBox();
    }
  );

  // On key press on an item
  addListener(document, "keydown", ".wysi-listbox > div > button", (event) => {
    const item = event.target;
    const listBox = item.parentNode;
    const button = listBox.previousElementSibling;
    let preventDefault = true;

    switch (event.key) {
      case "ArrowUp": {
        const prev = item.previousElementSibling;
        if (prev) {
          prev.focus();
        }
        break;
      }
      case "ArrowDown": {
        const next = item.nextElementSibling;
        if (next) {
          next.focus();
        }
        break;
      }
      case "Home":
        listBox.firstElementChild?.focus();
        break;
      case "End":
        listBox.lastElementChild?.focus();
        break;
      case "Tab":
        item.click();
        break;
      case "Escape":
        toggleButton(button, false);
        break;
      default:
        preventDefault = false;
    }

    if (preventDefault) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  let isOpeningInProgress = false;

  // Close open popups and dropdowns on click outside
  addListener(document, "click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target?.closest(".wysi-listbox") && !isOpeningInProgress) {
      closeListBox();
    }
  });

  // This prevents closing a listbox immediately after opening it
  addListener(document, "mousedown", ".wysi-listbox > button", () => {
    isOpeningInProgress = true;
  });

  addListener(document, "mouseup", () => {
    setTimeout(() => {
      isOpeningInProgress = false;
    });
  });

  // Used to give form fields unique ids
  let uniqueFieldId = 0;

  // Active editor instance when modal is opened
  let activeModalEditor = null;

  /**
   * Ensure a global modal backdrop exists on document.body.
   * @param {string} toolName The tool name ("image" or "link").
   * @return {HTMLElement} The modal backdrop element.
   */
  function ensureGlobalModal(toolName) {
    const modalId = `wysi-modal-${toolName}`;
    let backdrop = document.getElementById(modalId);
    if (backdrop) return backdrop;

    backdrop = createElement("div", {
      id: modalId,
      class: "wysi-modal-backdrop",
    });
    backdrop.style.display = "none";

    const dialog = createElement("div", {
      class: "wysi-modal-dialog",
      role: "dialog",
      "aria-modal": "true",
      tabindex: -1,
    });

    // Header
    const header = createElement("div", {
      class: "wysi-modal-header",
    });
    const defaultTitle = toolName === "image" ? "Image" : "Link";
    const titleText = getTranslation(toolName, defaultTitle);
    const title = createElement("h5", {
      class: "wysi-modal-title",
      _textContent: titleText,
    });
    const closeBtn = createElement("button", {
      type: "button",
      class: "wysi-modal-close",
      "aria-label": "Close",
      _innerHTML: "&times;",
    });
    header.appendChild(title);
    header.appendChild(closeBtn);
    dialog.appendChild(header);

    // Body
    const body = createElement("div", {
      class: "wysi-modal-body",
    });

    if (toolName === "image") {
      // Upload Group
      const uploadGroup = createElement("div", {
        class: "wysi-modal-form-group wysi-upload-group",
      });
      const uploadLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("image", "Upload image"),
      });
      const fileInput = createElement("input", {
        type: "file",
        accept: "image/*",
        class: "wysi-file-input",
      });
      const previewContainer = createElement("div", {
        class: "wysi-modal-preview",
      });
      previewContainer.style.display = "none";
      const previewImg = createElement("img", {
        class: "wysi-preview-img",
        alt: "Image preview",
      });
      previewContainer.appendChild(previewImg);
      uploadGroup.appendChild(uploadLabel);
      uploadGroup.appendChild(fileInput);
      uploadGroup.appendChild(previewContainer);
      body.appendChild(uploadGroup);

      // URL Group
      const urlGroup = createElement("div", {
        class: "wysi-modal-form-group",
      });
      const urlLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("image", "URL"),
      });
      const urlInput = createElement("input", {
        type: "text",
        class: "wysi-modal-input",
        "data-attribute": "src",
        placeholder: "https://",
      });
      urlGroup.appendChild(urlLabel);
      urlGroup.appendChild(urlInput);
      body.appendChild(urlGroup);

      // Alt Group
      const altGroup = createElement("div", {
        class: "wysi-modal-form-group",
      });
      const altLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("image", "Alternative text"),
      });
      const altInput = createElement("input", {
        type: "text",
        class: "wysi-modal-input",
        "data-attribute": "alt",
        placeholder: getTranslation("image", "Alternative text"),
      });
      altGroup.appendChild(altLabel);
      altGroup.appendChild(altInput);
      body.appendChild(altGroup);

      // Size Group
      const sizeGroup = createElement("div", {
        class: "wysi-modal-form-group",
      });
      const sizeLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("image", "Image size"),
      });
      const sizeSegmented = createElement("div", {
        class: "wysi-segmented",
        "data-attribute": "size",
      });
      const sizeOptions = [
        { label: "Auto", value: "" },
        { label: "100%", value: "100%" },
        { label: "50%", value: "50%" },
        { label: "25%", value: "25%" },
      ];
      sizeOptions.forEach((opt, idx) => {
        const id = `wysi-size-opt-${idx}`;
        const radio = createElement("input", {
          id: id,
          type: "radio",
          name: "wysi-modal-size",
          value: opt.value,
        });
        if (idx === 0) radio.checked = true;
        const lbl = createElement("label", {
          for: id,
          _textContent: getTranslation("image", opt.label),
        });
        sizeSegmented.appendChild(radio);
        sizeSegmented.appendChild(lbl);
      });
      sizeGroup.appendChild(sizeLabel);
      sizeGroup.appendChild(sizeSegmented);
      body.appendChild(sizeGroup);

      // Position Group
      const posGroup = createElement("div", {
        class: "wysi-modal-form-group",
      });
      const posLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("image", "Image position"),
      });
      const posSegmented = createElement("div", {
        class: "wysi-segmented",
        "data-attribute": "position",
      });
      const posOptions = [
        { label: "None", value: "" },
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ];
      posOptions.forEach((opt, idx) => {
        const id = `wysi-pos-opt-${idx}`;
        const radio = createElement("input", {
          id: id,
          type: "radio",
          name: "wysi-modal-pos",
          value: opt.value,
        });
        if (idx === 0) radio.checked = true;
        const lbl = createElement("label", {
          for: id,
          _textContent: getTranslation("image", opt.label),
        });
        posSegmented.appendChild(radio);
        posSegmented.appendChild(lbl);
      });
      posGroup.appendChild(posLabel);
      posGroup.appendChild(posSegmented);
      body.appendChild(posGroup);
    }

    if (toolName === "link") {
      // URL Group
      const urlGroup = createElement("div", {
        class: "wysi-modal-form-group",
      });
      const urlLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("link", "URL"),
      });
      const urlInput = createElement("input", {
        type: "text",
        class: "wysi-modal-input",
        "data-attribute": "href",
        placeholder: "https://",
      });
      urlGroup.appendChild(urlLabel);
      urlGroup.appendChild(urlInput);
      body.appendChild(urlGroup);

      // Target Group
      const targetGroup = createElement("div", {
        class: "wysi-modal-form-group",
      });
      const targetLabel = createElement("label", {
        class: "wysi-modal-label",
        _textContent: getTranslation("link", "Open link in"),
      });
      const targetSegmented = createElement("div", {
        class: "wysi-segmented",
        "data-attribute": "target",
      });
      const targetOptions = [
        { label: "Current tab", value: "" },
        { label: "New tab", value: "_blank" },
      ];
      targetOptions.forEach((opt, idx) => {
        const id = `wysi-target-opt-${idx}`;
        const radio = createElement("input", {
          id: id,
          type: "radio",
          name: "wysi-modal-target",
          value: opt.value,
        });
        if (idx === 0) radio.checked = true;
        const lbl = createElement("label", {
          for: id,
          _textContent: getTranslation("link", opt.label),
        });
        targetSegmented.appendChild(radio);
        targetSegmented.appendChild(lbl);
      });
      targetGroup.appendChild(targetLabel);
      targetGroup.appendChild(targetSegmented);
      body.appendChild(targetGroup);
    }

    dialog.appendChild(body);

    // Footer
    const footer = createElement("div", {
      class: "wysi-modal-footer",
    });

    if (toolName === "link") {
      const unlinkBtn = createElement("button", {
        type: "button",
        class: "wysi-modal-btn-unlink",
        title: getTranslation("link", "Remove link"),
        "aria-label": getTranslation("link", "Remove link"),
        "data-action": "unlink",
        _innerHTML: '<svg><use href="#wysi-delete"></use></svg>',
      });
      footer.appendChild(unlinkBtn);
    }

    const cancelBtn = createElement("button", {
      type: "button",
      class: "wysi-modal-btn-cancel",
      _textContent: getTranslation("popover", "Cancel"),
    });

    const saveBtn = createElement("button", {
      type: "button",
      class: "wysi-modal-btn-save",
      "data-action": toolName,
      _textContent: getTranslation("popover", "Save"),
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);
    dialog.appendChild(footer);

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    return backdrop;
  }

  /**
   * Render a toolbar button with modal support.
   * @param {string} toolName The tool name.
   * @param {HTMLElement} button The tool's toolbar button.
   * @return {HTMLElement} A DOM element containing the button.
   */
  function renderPopover(toolName, button) {
    const wrapper = createElement("div", {
      class: "wysi-popover",
    });

    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    wrapper.appendChild(button);

    // Pre-create modal in body
    DOMReady(() => {
      ensureGlobalModal(toolName);
    });

    return wrapper;
  }

  /**
   * Open a modal dialog.
   * @param {HTMLElement} btn The modal's trigger button.
   */
  function openPopover(btn) {
    const button = btn instanceof Element ? btn.closest("button") : null;
    if (!button) return;
    const action = button.dataset.action;
    const { editor, nodes } = findInstance(button);
    if (!editor) return;

    activeModalEditor = editor;

    // Capture or default selection
    const selection = document.getSelection();
    const anchorNode = selection?.anchorNode;
    if (selection && editor.contains(anchorNode) && selection.rangeCount > 0) {
      setCurrentSelection(selection.getRangeAt(0));
    } else {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      setCurrentSelection(range);
      setSelection(range);
    }

    const modal = ensureGlobalModal(action);
    const dialog = modal.querySelector(".wysi-modal-dialog");

    if (action === "image") {
      const srcInput = dialog.querySelector('input[data-attribute="src"]');
      const altInput = dialog.querySelector('input[data-attribute="alt"]');
      const fileInput = dialog.querySelector(".wysi-file-input");
      const previewContainer = dialog.querySelector(".wysi-modal-preview");
      const previewImg = dialog.querySelector(".wysi-preview-img");

      if (fileInput) fileInput.value = "";

      let targetImg = editor.querySelector(`img.${selectedClass}`);
      if (!targetImg && nodes) {
        targetImg = nodes.find((n) => n.tagName === "IMG");
      }

      if (targetImg) {
        srcInput.value = targetImg.getAttribute("src") || "";
        altInput.value = targetImg.getAttribute("alt") || "";

        const widthStyle = targetImg.style.width;
        const sizeRadios = dialog.querySelectorAll('input[name="wysi-modal-size"]');
        let sizeMatched = false;
        sizeRadios.forEach((r) => {
          if (r.value === widthStyle) {
            r.checked = true;
            sizeMatched = true;
          }
        });
        if (!sizeMatched && sizeRadios[0]) sizeRadios[0].checked = true;

        const floatStyle = targetImg.style.float;
        const displayStyle = targetImg.style.display;
        const posRadios = dialog.querySelectorAll('input[name="wysi-modal-pos"]');
        let posMatched = false;
        posRadios.forEach((r) => {
          if (floatStyle && r.value === floatStyle) {
            r.checked = true;
            posMatched = true;
          } else if (displayStyle === "block" && r.value === "center") {
            r.checked = true;
            posMatched = true;
          }
        });
        if (!posMatched && posRadios[0]) posRadios[0].checked = true;

        if (srcInput.value) {
          previewImg.src = srcInput.value;
          previewImg.style.display = "block";
          previewContainer.style.display = "flex";
        } else {
          previewImg.src = "";
          previewImg.style.display = "none";
          previewContainer.style.display = "none";
        }
      } else {
        srcInput.value = "";
        altInput.value = "";
        const firstSize = dialog.querySelector('input[name="wysi-modal-size"]');
        if (firstSize) firstSize.checked = true;
        const firstPos = dialog.querySelector('input[name="wysi-modal-pos"]');
        if (firstPos) firstPos.checked = true;
        previewImg.src = "";
        previewImg.style.display = "none";
        previewContainer.style.display = "none";
      }

      modal.style.display = "flex";
      document.body.classList.add("wysi-modal-open");
      toggleButton(button, true);

      setTimeout(() => {
        srcInput.focus();
      }, 50);
    }

    if (action === "link") {
      const hrefInput = dialog.querySelector('input[data-attribute="href"]');
      const unlinkBtn = dialog.querySelector(".wysi-modal-btn-unlink");

      let targetLink = editor.querySelector(`a.${selectedClass}`);
      if (!targetLink && nodes) {
        targetLink = nodes.find((n) => n.tagName === "A");
      }

      if (targetLink) {
        hrefInput.value = targetLink.getAttribute("href") || "";
        const targetVal = targetLink.getAttribute("target") || "";
        const targetRadios = dialog.querySelectorAll('input[name="wysi-modal-target"]');
        targetRadios.forEach((r) => {
          if (r.value === targetVal) r.checked = true;
        });
        if (unlinkBtn) unlinkBtn.style.display = "inline-flex";
      } else {
        hrefInput.value = "";
        const firstTarget = dialog.querySelector('input[name="wysi-modal-target"]');
        if (firstTarget) firstTarget.checked = true;
        if (unlinkBtn) unlinkBtn.style.display = "none";
      }

      modal.style.display = "flex";
      document.body.classList.add("wysi-modal-open");
      toggleButton(button, true);

      setTimeout(() => {
        hrefInput.focus();
      }, 50);
    }
  }

  /**
   * Execute a modal's action.
   * @param {HTMLElement} button The modal's action button.
   */
  function execPopoverAction(button) {
    const action = button.dataset.action;
    const editor = activeModalEditor;
    if (!editor) return;

    const modal = document.getElementById(`wysi-modal-${action}`);
    if (!modal) return;

    if (action === "image") {
      const srcInput = modal.querySelector('input[data-attribute="src"]');
      const altInput = modal.querySelector('input[data-attribute="alt"]');
      const sizeRadio = modal.querySelector('input[name="wysi-modal-size"]:checked');
      const posRadio = modal.querySelector('input[name="wysi-modal-pos"]:checked');

      const imageUrl = (srcInput?.value || "").trim();
      const altText = (altInput?.value || "").trim();
      const size = sizeRadio?.value || "";
      const position = posRadio?.value || "";

      if (!imageUrl) {
        closePopover(true);
        return;
      }

      const options = [imageUrl, altText, size, position];

      const selectedImg = editor.querySelector(`img.${selectedClass}`);
      const parent = selectedImg ? selectedImg.parentNode : {};
      if (selectedImg && parent.tagName === "A") {
        options.push(parent.outerHTML);
      }

      execAction("image", editor, options);
      closePopover(true);
    }

    if (action === "link") {
      const hrefInput = modal.querySelector('input[data-attribute="href"]');
      const targetRadio = modal.querySelector('input[name="wysi-modal-target"]:checked');

      const href = (hrefInput?.value || "").trim();
      const target = targetRadio?.value || "";

      if (!href) {
        closePopover(true);
        return;
      }

      const selection = getCurrentSelection();
      const linkText = selection ? getFragmentContent(selection.cloneContents()) : href;
      const options = [href, target, linkText || href];

      execAction("link", editor, options);
      closePopover(true);
    }
  }

  /**
   * Close the open modal/popover if any.
   * @param {boolean} [ignoreSelection=false] If true, do not restore the previous selection.
   */
  function closePopover(ignoreSelection = false) {
    const activeButtons = document.querySelectorAll(
      '.wysi-popover > button[aria-expanded="true"], .wysi-toolbar button[aria-expanded="true"]'
    );
    activeButtons.forEach((btn) => toggleButton(btn, false));

    const backdrops = document.querySelectorAll(".wysi-modal-backdrop");
    backdrops.forEach((backdrop) => {
      backdrop.style.display = "none";
    });

    document.body.classList.remove("wysi-modal-open");

    if (!ignoreSelection && activeModalEditor) {
      restoreSelection(activeModalEditor);
    }
    activeModalEditor = null;
  }

  // Open a popover modal
  addListener(document, "click", ".wysi-popover > button", (event, target) => {
    event.stopPropagation();
    const button =
      target ||
      (event.target instanceof Element ? event.target.closest("button") : null);
    if (!button) return;
    const isOpen = button.getAttribute("aria-expanded") === "true";
    closePopover();
    if (!isOpen) {
      openPopover(button);
    }
  });

  // On key press on the popover trigger button
  addListener(document, "keydown", ".wysi-popover > button", (event, target) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "Enter":
      case " ": {
        const button =
          target ||
          (event.target instanceof Element ? event.target.closest("button") : null);
        if (button) {
          openPopover(button);
        }
        event.preventDefault();
        break;
      }
    }
  });

  // Execute the modal save / action
  addListener(
    document,
    "click",
    ".wysi-modal-btn-save",
    (event, target) => {
      event.preventDefault();
      event.stopPropagation();
      const btn =
        target ||
        (event.target instanceof Element ? event.target.closest("button") : null);
      if (btn) {
        execPopoverAction(btn);
      }
    }
  );

  // Unlink button inside link modal
  addListener(
    document,
    "click",
    ".wysi-modal-btn-unlink",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (activeModalEditor) {
        execAction("unlink", activeModalEditor);
      }
      closePopover(true);
    }
  );

  // Cancel / Close the modal
  addListener(
    document,
    "click",
    ".wysi-modal-close, .wysi-modal-btn-cancel",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      closePopover();
    }
  );

  // Close when clicking directly on the backdrop (outside modal dialog)
  addListener(document, "click", ".wysi-modal-backdrop", (event) => {
    if (event.target.classList.contains("wysi-modal-backdrop")) {
      event.preventDefault();
      event.stopPropagation();
      closePopover();
    }
  });

  // Prevent clicks inside the dialog from bubbling up
  addListener(document, "click", ".wysi-modal-dialog", (event) => {
    event.stopPropagation();
  });

  // Keyboard navigation inside modal dialog
  addListener(document, "keydown", ".wysi-modal-dialog", (event) => {
    const dialog = event.target.closest(".wysi-modal-dialog");
    if (!dialog) return;

    switch (event.key) {
      case "Tab": {
        const focusable = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            last?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first?.focus();
            event.preventDefault();
          }
        }
        break;
      }
      case "Enter":
        if (event.target.tagName === "INPUT" && event.target.type === "text") {
          const saveBtn = dialog.querySelector(".wysi-modal-btn-save");
          if (saveBtn) {
            event.preventDefault();
            execPopoverAction(saveBtn);
          }
        }
        break;
      case "Escape":
        closePopover();
        event.stopImmediatePropagation();
        break;
    }
  });

  // Handle image file input change in modal via delegation
  addListener(
    document,
    "change",
    "#wysi-modal-image .wysi-file-input",
    async (event, target) => {
      const fileInput =
        target || (event.target instanceof Element ? event.target : null);
      const file = fileInput?.files?.[0];
      if (!file) return;

      const modal = document.getElementById("wysi-modal-image");
      if (!modal) return;

      const editor = activeModalEditor;
      const instanceId = editor ? getInstanceId(editor) : null;
      const instance = instanceId !== null ? instances[instanceId] || {} : {};

      const srcInput = modal.querySelector('input[data-attribute="src"]');
      const altInput = modal.querySelector('input[data-attribute="alt"]');
      const saveButton = modal.querySelector(".wysi-modal-btn-save");
      const previewImg = modal.querySelector(".wysi-preview-img");
      const previewContainer = modal.querySelector(".wysi-modal-preview");

      if (altInput && !altInput.value) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        altInput.value = fileName;
      }

      try {
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.style.opacity = "0.6";
        }
        if (srcInput) {
          srcInput.placeholder = getTranslation("image", "Uploading...");
        }

        let imageUrl = "";
        if (typeof instance.onImageUpload === "function") {
          imageUrl = await instance.onImageUpload(file);
        } else {
          imageUrl = await readFileAsDataURL(file);
        }

        if (srcInput && imageUrl) {
          srcInput.value = imageUrl;
        }
        if (previewImg && imageUrl) {
          previewImg.src = imageUrl;
          previewImg.style.display = "block";
          if (previewContainer) {
            previewContainer.style.display = "flex";
          }
        }
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.style.opacity = "";
        }
        if (srcInput) {
          srcInput.placeholder = "https://";
        }
      }
    }
  );

  // Live preview when typing image URL directly
  addListener(
    document,
    "input",
    "#wysi-modal-image input[data-attribute='src']",
    (event, target) => {
      const srcInput =
        target || (event.target instanceof Element ? event.target : null);
      if (!srcInput) return;
      const modal = document.getElementById("wysi-modal-image");
      const previewImg = modal?.querySelector(".wysi-preview-img");
      const previewContainer = modal?.querySelector(".wysi-modal-preview");
      if (previewImg) {
        const val = srcInput.value.trim();
        if (val) {
          previewImg.src = val;
          previewImg.style.display = "block";
          if (previewContainer) previewContainer.style.display = "flex";
        } else {
          previewImg.style.display = "none";
          previewImg.src = "";
          if (previewContainer) previewContainer.style.display = "none";
        }
      }
    }
  );

  /**
   * Render the toolbar.
   * @param {Array} tools The list of tools in the toolbar.
   * @return {HTMLElement} The toolbars HTML element.
   */
  function renderToolbar(tools) {
    const toolbar = createElement("div", {
      class: "wysi-toolbar",
    });

    // Generate toolbar buttons
    tools.forEach((toolName) => {
      switch (toolName) {
        // Toolbar separator
        case "|":
          toolbar.appendChild(
            createElement("div", {
              class: "wysi-separator",
            })
          );
          break;

        // Toolbar new line
        case "-":
          toolbar.appendChild(
            createElement("div", {
              class: "wysi-newline",
            })
          );
          break;

        // The format tool renders as a list box
        case "format":
          toolbar.appendChild(renderFormatTool());
          break;

        // All the other tools render as buttons
        default:
          if (typeof toolName === "object") {
            if (toolName.items) {
              toolbar.appendChild(renderToolGroup(toolName));
            }
          } else {
            renderTool(toolName, toolbar);
          }
      }
    });
    return toolbar;
  }

  /**
   * Render a tool.
   * @param {string} name The tool's name.
   * @param {HTMLElement} toolbar The toolbar to which the tool will be appended.
   */
  function renderTool(name, toolbar) {
    const tool = toolset[name];
    const label = getTranslation(name, tool.label);
    const button = createElement("button", {
      type: "button",
      title: label,
      "aria-label": label,
      "aria-pressed": false,
      "data-action": name,
      _innerHTML: `<svg><use href="#wysi-${name}"></use></svg>`,
    });

    // Tools that require parameters (e.g: image, link) need a popover
    if (tool.hasForm) {
      const popover = renderPopover(name, button);
      toolbar.appendChild(popover);

      // The other tools only display a button
    } else {
      toolbar.appendChild(button);
    }
  }

  /**
   * Render a tool group.
   * @param {object} details The group's properties.
   * @return {HTMLElement} A DOM element containing the tool group.
   */
  function renderToolGroup(details) {
    const label = details.label || getTranslation("toolbar", "Select an item");
    const options = details.items;
    const items = options.map((option) => {
      const tool = toolset[option];
      const toolLabel = getTranslation(option, tool.label);
      return {
        label: toolLabel,
        icon: option,
        action: option,
      };
    });
    return renderListBox({
      label,
      items,
    });
  }

  /**
   * Render format tool.
   * @return {HTMLElement} A DOM element containing the format tool.
   */
  function renderFormatTool() {
    const toolName = "format";
    const label = getTranslation(toolName, toolset.format.label);
    const paragraphLabel = getTranslation(toolName, toolset.format.paragraph);
    const headingLabel = getTranslation(toolName, toolset.format.heading);
    const classes = ["wysi-format"];
    const items = toolset.format.tags.map((tag) => ({
      name: tag,
      label: tag === "p" ? paragraphLabel : `${headingLabel} ${tag.slice(1)}`,
      action: "format",
    }));

    return renderListBox({
      label,
      items,
      classes,
    });
  }

  /**
   * Update toolbar buttons state.
   */
  function updateToolbarState() {
    const selection = document.getSelection();
    const anchorNode = selection?.anchorNode;
    if (!anchorNode) {
      return;
    }
    const range = selection.getRangeAt(0);

    // This is to fix double click selection on Firefox not highlighting the relevant tool in some cases
    // We want to find the deepest child node to properly handle nested styles
    const candidateNode = findDeepestChildNode(
      range.startContainer.nextElementSibling || range.startContainer
    );

    // Fallback to the original selection.anchorNode if a more suitable node is not found
    const selectedNode = range.intersectsNode(candidateNode)
      ? candidateNode
      : anchorNode;

    // Get editor instance
    const { toolbar, editor, nodes } = findInstance(selectedNode);

    // Abort if the selection is not within an editor instance
    if (!editor || !toolbar) {
      return;
    }

    const tags = nodes.map((node) => node.tagName.toLowerCase());

    // Check for an element with the selection class (likely an image)
    const selectedObject = editor.querySelector(`.${selectedClass}`);

    // If such element exists, add its tag to the list of active tags
    if (selectedObject) {
      tags.push(selectedObject.tagName.toLowerCase());
    }

    // Get the list of allowed tags in the current editor instance
    const instanceId = getInstanceId(editor);
    const allowedTags = instances[instanceId]?.allowedTags || {};

    // Reset the state of all buttons
    toolbar
      .querySelectorAll('[aria-pressed="true"]')
      .forEach((button) => button.setAttribute("aria-pressed", "false"));

    // Reset the state of all list boxes
    toolbar
      .querySelectorAll(".wysi-listbox > div > button:first-of-type")
      .forEach((button) => selectListBoxItem(button));

    // Update the buttons states
    tags.forEach((tag, i) => {
      switch (tag) {
        case "p":
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "li": {
          const format = toolbar.querySelector(
            `[data-action="format"][data-option="${tag}"]`
          );
          const textAlign =
            nodes[i]?.style?.textAlign || nodes[i]?.getAttribute("align");
          if (format) {
            selectListBoxItem(format);
          }

          // Check for text align
          if (textAlign) {
            const alignAction = `align${textAlign.charAt(0).toUpperCase()}${textAlign.slice(1)}`;
            const button = toolbar.querySelector(
              `[data-action="${alignAction}"]`
            );
            if (button) {
              if (button.parentNode?.getAttribute("role") === "listbox") {
                selectListBoxItem(button);
              } else {
                button.setAttribute("aria-pressed", "true");
              }
            }
          }
          break;
        }
        default: {
          const allowedTag = allowedTags[tag];
          const action = allowedTag?.toolName;
          if (action) {
            const button = toolbar.querySelector(`[data-action="${action}"]`);
            button?.setAttribute("aria-pressed", "true");
          }
        }
      }
    });
  }

  /**
   * Embed SVG icons in the HTML document.
   */
  function embedSVGIcons() {
    if (document.getElementById("wysi-svg-icons")) return;
    const icons =
      '<svg id="wysi-svg-icons" xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<symbol id="wysi-bold" viewBox="0 0 24 24"><path d="M16.5,9.5A3.5,3.5,0,0,0,13,6H8.5a1,1,0,0,0-1,1V17a1,1,0,0,0,1,1H13a3.49,3.49,0,0,0,2.44-6A3.5,3.5,0,0,0,16.5,9.5ZM13,16H9.5V13H13a1.5,1.5,0,0,1,0,3Zm0-5H9.5V8H13a1.5,1.5,0,0,1,0,3Z"></path></symbol>' +
      '<symbol id="wysi-italic" viewBox="0 0 24 24"><path d="M17,6H11a1,1,0,0,0,0,2h1.52l-3.2,8H7a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2H11.48l3.2-8H17a1,1,0,0,0,0-2Z"></path></symbol>' +
      '<symbol id="wysi-underline" viewBox="0 0 24 24"><path d="M12,15.5a5,5,0,0,0,5-5v-5a1,1,0,0,0-2,0v5a3,3,0,0,1-6,0v-5a1,1,0,0,0-2,0v5A5,5,0,0,0,12,15.5Zm5,2H7a1,1,0,0,0,0,2H17a1,1,0,0,0,0-2Z"></path></symbol>' +
      '<symbol id="wysi-strike" viewBox="0 0 24 24"><path d="M12 6C9.33 6 7.5 7.34 7.5 9.5c0 .58.12 1.07.35 1.5H13c-1.49-.34-3.49-.48-3.5-1.5 0-1.03 1.08-1.75 2.5-1.75s2.5.83 2.5 1.75h2C16.5 7.4 14.67 6 12 6zm-5.5 6c-.67 0-.67 1 0 1h4.35c.5.17 1.04.34 1.65.5.58.15 1.75.23 1.75 1s-.66 1.75-2.25 1.75-2.5-1.01-2.5-1.75h-2c0 1.64 1.33 3.5 4.5 3.5s4.5-2.08 4.5-3.5c0-.58-.05-1.07-.2-1.5h1.2c.67 0 .67-1 0-1z"></path></symbol>' +
      '<symbol id="wysi-alignLeft" viewBox="0 0 24 24"><path d="m4 8h16c1.33 0 1.33-2 0-2h-16c-1.33 0-1.33 2 0 2zm0 5h12c1.33 0 1.33-2 0-2h-12c-1.33 0-1.33 2 0 2zm16 3h-16c-1.33 0-1.33 2 0 2h16c1.34 0 1.29-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-alignCenter" viewBox="0 0 24 24"><path d="m20 8h-16c-1.33 0-1.33-2 0-2h16c1.33 0 1.33 2 0 2zm-4 5h-8c-1.33 0-1.33-2 0-2h8c1.33 0 1.33 2 0 2zm-12 3h16c1.33 0 1.33 2 0 2h-16c-1.34 0-1.29-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-alignRight" viewBox="0 0 24 24"><path d="m20 8h-16c-1.33 0-1.33-2 0-2h16c1.33 0 1.33 2 0 2zm0 5h-12c-1.33 0-1.33-2 0-2h12c1.33 0 1.33 2 0 2zm-16 3h16c1.33 0 1.33 2 0 2h-16c-1.34 0-1.29-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-alignJustify" viewBox="0 0 24 24"><path d="m20 8h-16c-1.33 0-1.33-2 0-2h16c1.33 0 1.33 2 0 2zm0 5h-16c-1.33 0-1.33-2 0-2h16c1.33 0 1.33 2 0 2zm-16 3h16c1.33 0 1.33 2 0 2h-16c-1.34 0-1.29-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-ul" viewBox="0 0 24 24"><path d="M3 6a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1zm4 0a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H7zm-4 5a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1zm4 0a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H7zm-4 5a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1zm4 0a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2H7z"></path></symbol>' +
      '<symbol id="wysi-ol" viewBox="0 0 24 24"><path d="M4 5c-.25 0-.5.17-.5.5v3c0 .67 1 .67 1 0v-3c0-.33-.25-.5-.5-.5zm4.5 1c-1.33 0-1.33 2 0 2h12c1.33 0 1.33-2 0-2zm-6 5.5h.75c0-.43.34-.75.75-.75.4 0 .75.28.75.75L2.5 13.25V14h3v-.75H3.75L5.5 12v-.5c0-.9-.73-1.49-1.5-1.5-.77 0-1.5.59-1.5 1.5zm6-.5c-1.33 0-1.33 2 0 2h12c1.33 0 1.33-2 0-2zM4 15c-.83 0-1.5.63-1.5 1.25h.75c0-.28.34-.5.75-.5s.75.22.75.5-.34.5-.75.5v.5c.41 0 .75.22.75.5s-.34.5-.75.5-.75-.22-.75-.5H2.5c0 .62.67 1.25 1.5 1.25s1.5-.5 1.5-1.12c0-.34-.2-.66-.56-.88.35-.2.56-.53.56-.87 0-.62-.67-1.12-1.5-1.12zm4.5 1c-1.33 0-1.33 2 0 2h12c1.33 0 1.33-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-indent" viewBox="0 0 24 24"><path d="m20 8h-15.9c-1.33 0-1.33-2 0-2h15.9c1.33 0 1.33 2 0 2zm2.86e-4 5h-9.08c-1.33 0-1.33-2 0-2h9.08c1.33 0 1.33 2 0 2zm-16.7-3.31c0.356-0.423 0.988-0.477 1.41-0.12l2 1.66c0.483 0.4 0.483 1.14 0 1.54l-2 1.66c-0.179 0.153-0.405 0.238-0.64 0.24-0.297 4.83e-4 -0.58-0.131-0.77-0.36-0.354-0.425-0.296-1.06 0.13-1.41l1.08-0.9-1.08-0.9c-0.426-0.353-0.484-0.985-0.13-1.41zm0.77 6.31h15.9c1.33 0 1.33 2 0 2h-15.9c-1.33 0-1.33-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-outdent" viewBox="0 0 24 24"><path d="m4.1 6c-1.33 0-1.33 2 0 2h15.9c1.33 0 1.33-2 0-2h-15.9zm1.96 3.33c-0.224 0.00238-0.448 0.0803-0.633 0.236l-2 1.66c-0.483 0.4-0.483 1.14 0 1.54l2 1.66c0.179 0.153 0.404 0.238 0.639 0.24 0.297 4.83e-4 0.581-0.131 0.771-0.359 0.354-0.425 0.295-1.06-0.131-1.41l-1.08-0.9 1.08-0.9c0.426-0.353 0.485-0.985 0.131-1.41-0.2-0.238-0.489-0.359-0.777-0.355zm4.88 1.67c-1.33 0-1.33 2 0 2h9.08c1.33 0 1.33-2 0-2h-9.08zm-6.87 5c-1.33 0-1.33 2 0 2h15.9c1.33 0 1.33-2 0-2h-15.9z"></path></symbol>' +
      '<symbol id="wysi-link" viewBox="0 0 24 24"><path d="M8,12a1,1,0,0,0,1,1h6a1,1,0,0,0,0-2H9A1,1,0,0,0,8,12Zm2,3H7A3,3,0,0,1,7,9h3a1,1,0,0,0,0-2H7A5,5,0,0,0,7,17h3a1,1,0,0,0,0-2Zm7-8H14a1,1,0,0,0,0,2h3a3,3,0,0,1,0,6H14a1,1,0,0,0,0,2h3A5,5,0,0,0,17,7Z"></path></symbol>' +
      '<symbol id="wysi-image" viewBox="0 0 24 24"><path d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6zm0 2h12a1 1 0 0 1 1 1v5.73l-.88-.88a3.06 3.06 0 0 0-4.24 0l-.88.88-2.88-2.88A3.06 3.06 0 0 0 8 10a3.06 3.06 0 0 0-2.12.85l-.88.88V8a1 1 0 0 1 1-1zm1.85 4.98a1 1 0 0 1 .85.27L13.45 17H6a1 1 0 0 1-.98-.92H5v-1.53l2.3-2.3a1 1 0 0 1 .55-.26zm8 2a1 1 0 0 1 .85.27l2.17 2.16c-.19.33-.55.59-.86.59h-1.72l-1.86-1.87.88-.88a1 1 0 0 1 .54-.28z"></path></symbol>' +
      '<symbol id="wysi-quote" viewBox="0 0 24 24"><path d="m9 6c-2.2 0-4 1.96-4 4.36v6c0 0.903 0.672 1.64 1.5 1.64h3c0.828 0 1.5-0.733 1.5-1.64v-3.27c0-0.903-0.672-1.64-1.5-1.64h-1.75c-0.414 0-0.75-0.367-0.75-0.818v-0.273c0-1.2 0.899-2.18 2-2.18h0.5c0.274 0 0.5-0.246 0.5-0.545v-1.09c0-0.298-0.226-0.545-0.5-0.545zm8 0c-2.2 0-4 1.96-4 4.36v6c0 0.903 0.672 1.64 1.5 1.64h3c0.828 0 1.5-0.733 1.5-1.64v-3.27c0-0.903-0.672-1.64-1.5-1.64h-1.75c-0.414 0-0.75-0.367-0.75-0.818v-0.273c0-1.2 0.899-2.18 2-2.18h0.5c0.274 0 0.5-0.246 0.5-0.545v-1.09c0-0.298-0.226-0.545-0.5-0.545z"></path></symbol>' +
      '<symbol id="wysi-hr" viewBox="0 0 24 24"><path d="m20 11h-16c-1.33 0-1.33 2 0 2 0 0 16-0.018 16 0 1.33 0 1.33-2 0-2z"></path></symbol>' +
      '<symbol id="wysi-removeFormat" viewBox="0 0 24 24"><path d="M7 6C5.67 6 5.67 8 7 8h3l-2 7c0 .02 2 0 2 0l2-7h3c1.33 0 1.33-2 0-2H7zm7.06 7c-.79-.04-1.49.98-.75 1.72l.78.78-.78.79c-.94.93.47 2.35 1.4 1.4l.79-.78.78.79c.94.93 2.35-.47 1.41-1.41l-.78-.79.78-.78c.94-.94-.47-2.35-1.4-1.41l-.8.79-.77-.79a.99.99 0 0 0-.66-.3zM7 16c-1.33 0-1.33 2 0 2 .02-.02 4 0 4 0 1.33 0 1.33-2 0-2H7z"></path></symbol>' +
      '<symbol id="wysi-delete" viewBox="0 0 24 24"><path d="M10,18a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,10,18ZM20,6H16V5a3,3,0,0,0-3-3H11A3,3,0,0,0,8,5V6H4A1,1,0,0,0,4,8H5V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V8h1a1,1,0,0,0,0-2ZM10,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H10Zm7,14a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V8H17Zm-3-1a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,14,18Z"></path></symbol>' +
      '<symbol id="wysi-image-reset-size" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"></path></symbol>' +
      '<symbol id="wysi-image-float-left" viewBox="0 0 24 24"><path d="M3 4h7v7H3V4zm0 9h18v2H3v-2zm0 4h18v2H3v-2zm9-13h9v2h-9V4zm0 4h9v2h-9V8z"></path></symbol>' +
      '<symbol id="wysi-image-align-center" viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm4 4h10v8H7V8zm-4 10h18v2H3v-2z"></path></symbol>' +
      '<symbol id="wysi-image-float-right" viewBox="0 0 24 24"><path d="M14 4h7v7h-7V4zM3 4h9v2H3V4zm0 4h9v2H3V8zm0 5h18v2H3v-2zm0 4h18v2H3v-2z"></path></symbol>' +
      '<symbol id="wysi-image-remove-float" viewBox="0 0 24 24"><path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 .76-.14 1.48-.4 2.15l1.49 1.49A7.95 7.95 0 0 0 20 13c0-4.42-3.58-8-8-8zm-1.8 4.2L4 3.02 2.73 4.29l3.05 3.05A7.95 7.95 0 0 0 4 13c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.12.31-2.17.84-3.07L10.2 9.2z"></path></symbol>' +
      '</defs></svg>';
    const svgElement = buildFragment(icons);
    document.body.appendChild(svgElement);
  }

  let activeImage = null;
  let resizerElement = null;
  let isResizing = false;
  let resizeData = null;

  /**
   * Create or get the global image resizer overlay and toolbar.
   * @return {HTMLElement} The resizer DOM element.
   */
  function createResizerElement() {
    if (resizerElement && document.body.contains(resizerElement)) {
      return resizerElement;
    }
    if (resizerElement) {
      resizerElement.remove();
    }

    const wrapper = createElement("div", {
      class: "wysi-image-resizer",
    });

    wrapper.innerHTML =
      '<div class="wysi-resizer-box">' +
      '<div class="wysi-resizer-handle wysi-handle-nw" data-handle="nw"></div>' +
      '<div class="wysi-resizer-handle wysi-handle-ne" data-handle="ne"></div>' +
      '<div class="wysi-resizer-handle wysi-handle-se" data-handle="se"></div>' +
      '<div class="wysi-resizer-handle wysi-handle-sw" data-handle="sw"></div>' +
      '<div class="wysi-resizer-info">' +
      '<div class="wysi-info-current"></div>' +
      '<div class="wysi-info-original"></div>' +
      '</div>' +
      '</div>' +
      '<div class="wysi-image-toolbar">' +
      '<div class="wysi-toolbar-arrow"></div>' +
      '<div class="wysi-img-btn-group">' +
      '<button type="button" class="wysi-img-btn" data-action="size-100" title="100%">100%</button>' +
      '<button type="button" class="wysi-img-btn" data-action="size-50" title="50%">50%</button>' +
      '<button type="button" class="wysi-img-btn" data-action="size-25" title="25%">25%</button>' +
      '<button type="button" class="wysi-img-btn" data-action="size-reset" title="Original size">' +
      '<svg><use href="#wysi-image-reset-size"></use></svg>' +
      '</button>' +
      '</div>' +
      '<div class="wysi-img-btn-group">' +
      '<button type="button" class="wysi-img-btn" data-action="align-left" title="Float left">' +
      '<svg><use href="#wysi-image-float-left"></use></svg>' +
      '</button>' +
      '<button type="button" class="wysi-img-btn" data-action="align-center" title="Align center">' +
      '<svg><use href="#wysi-image-align-center"></use></svg>' +
      '</button>' +
      '<button type="button" class="wysi-img-btn" data-action="align-right" title="Float right">' +
      '<svg><use href="#wysi-image-float-right"></use></svg>' +
      '</button>' +
      '<button type="button" class="wysi-img-btn" data-action="align-reset" title="Remove float">' +
      '<svg><use href="#wysi-image-remove-float"></use></svg>' +
      '</button>' +
      '</div>' +
      '<div class="wysi-img-btn-group">' +
      '<button type="button" class="wysi-img-btn wysi-img-btn-danger" data-action="delete" title="Delete image">' +
      '<svg><use href="#wysi-delete"></use></svg>' +
      '</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(wrapper);
    resizerElement = wrapper;

    // Handle toolbar button clicks
    wrapper.addEventListener("click", (event) => {
      const btn = event.target.closest(".wysi-img-btn");
      if (!btn || !activeImage) return;
      event.preventDefault();
      event.stopPropagation();

      const action = btn.dataset.action;
      const editor = activeImage.closest(".wysi-editor");

      switch (action) {
        case "size-100":
          activeImage.style.width = "100%";
          activeImage.style.height = "auto";
          break;
        case "size-50":
          activeImage.style.width = "50%";
          activeImage.style.height = "auto";
          break;
        case "size-25":
          activeImage.style.width = "25%";
          activeImage.style.height = "auto";
          break;
        case "size-reset":
          activeImage.style.width = "";
          activeImage.style.height = "";
          break;
        case "align-left":
          activeImage.style.float = "left";
          activeImage.style.display = "";
          activeImage.style.margin = "0 1rem 1rem 0";
          break;
        case "align-center":
          activeImage.style.float = "none";
          activeImage.style.display = "block";
          activeImage.style.margin = "auto";
          break;
        case "align-right":
          activeImage.style.float = "right";
          activeImage.style.display = "";
          activeImage.style.margin = "0 0 1rem 1rem";
          break;
        case "align-reset":
          activeImage.style.float = "";
          activeImage.style.display = "";
          activeImage.style.margin = "";
          break;
        case "delete": {
          const imgToDelete = activeImage;
          hideImageResizer();
          imgToDelete.remove();
          if (editor) {
            const textarea = editor.parentNode?.nextElementSibling;
            const instanceId = getInstanceId(editor);
            if (textarea && instanceId !== undefined) {
              updateContent(textarea, editor, instanceId, editor.innerHTML);
            }
          }
          return;
        }
      }

      if (editor) {
        const textarea = editor.parentNode?.nextElementSibling;
        const instanceId = getInstanceId(editor);
        if (textarea && instanceId !== undefined) {
          updateContent(textarea, editor, instanceId, editor.innerHTML);
        }
      }

      updateResizerPosition();
      updateResizerActiveStates();
    });

    // Handle corner handles mousedown for drag resizing
    wrapper.addEventListener("mousedown", (event) => {
      const handle = event.target.closest(".wysi-resizer-handle");
      if (!handle || !activeImage) return;

      event.preventDefault();
      event.stopPropagation();

      const rect = activeImage.getBoundingClientRect();
      const handleType = handle.dataset.handle;
      const naturalRatio =
        activeImage.naturalWidth && activeImage.naturalHeight
          ? activeImage.naturalWidth / activeImage.naturalHeight
          : rect.width / rect.height;

      isResizing = true;
      resizeData = {
        handle: handleType,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        naturalRatio: naturalRatio > 0 ? naturalRatio : 1,
      };

      document.body.classList.add("wysi-resizing");
    });

    return wrapper;
  }

  /**
   * Update the resizer overlay position and dimension badge.
   */
  function updateResizerPosition() {
    if (!activeImage || !activeImage.isConnected) {
      hideImageResizer();
      return;
    }

    const resizer = createResizerElement();
    const rect = activeImage.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    resizer.style.display = "block";
    resizer.style.top = `${rect.top + scrollY}px`;
    resizer.style.left = `${rect.left + scrollX}px`;
    resizer.style.width = `${rect.width}px`;
    resizer.style.height = `${rect.height}px`;

    // Update dimension info badge
    const currentInfo = resizer.querySelector(".wysi-info-current");
    const originalInfo = resizer.querySelector(".wysi-info-original");
    if (currentInfo) {
      currentInfo.textContent = `${Math.round(rect.width * 10) / 10}x${Math.round(rect.height * 10) / 10}`;
    }
    if (originalInfo) {
      const nw = activeImage.naturalWidth || Math.round(rect.width);
      const nh = activeImage.naturalHeight || Math.round(rect.height);
      originalInfo.textContent = `(Original: ${nw}x${nh})`;
    }

    // Position floating toolbar
    const toolbar = resizer.querySelector(".wysi-image-toolbar");
    if (toolbar) {
      const toolbarHeight = toolbar.offsetHeight || 36;
      const toolbarWidth = toolbar.offsetWidth || 340;

      // Calculate top/bottom position
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove =
        spaceBelow < toolbarHeight + 20 && rect.top > toolbarHeight + 20;

      if (placeAbove) {
        toolbar.classList.add("wysi-toolbar-above");
        toolbar.classList.remove("wysi-toolbar-below");
      } else {
        toolbar.classList.add("wysi-toolbar-below");
        toolbar.classList.remove("wysi-toolbar-above");
      }

      // Center toolbar horizontally relative to image, bounded by viewport
      const imageCenterX = rect.left + rect.width / 2;
      let toolbarLeft = (rect.width - toolbarWidth) / 2;
      const absLeft = rect.left + toolbarLeft;

      if (absLeft < 10) {
        toolbarLeft += 10 - absLeft;
      } else if (absLeft + toolbarWidth > window.innerWidth - 10) {
        toolbarLeft -= absLeft + toolbarWidth - (window.innerWidth - 10);
      }

      toolbar.style.left = `${toolbarLeft}px`;

      // Position arrow towards image center
      const arrow = toolbar.querySelector(".wysi-toolbar-arrow");
      if (arrow) {
        const arrowX = imageCenterX - (rect.left + toolbarLeft);
        arrow.style.left = `${Math.max(12, Math.min(toolbarWidth - 12, arrowX))}px`;
      }
    }
  }

  /**
   * Update the active states of the size and alignment toolbar buttons.
   */
  function updateResizerActiveStates() {
    if (!activeImage || !resizerElement) return;

    const widthStyle = activeImage.style.width;
    const floatStyle = activeImage.style.float;
    const marginStyle = activeImage.style.margin;
    const displayStyle = activeImage.style.display;

    // Reset button states
    resizerElement.querySelectorAll(".wysi-img-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Size active state
    if (widthStyle === "100%") {
      resizerElement
        .querySelector('[data-action="size-100"]')
        ?.classList.add("active");
    } else if (widthStyle === "50%") {
      resizerElement
        .querySelector('[data-action="size-50"]')
        ?.classList.add("active");
    } else if (widthStyle === "25%") {
      resizerElement
        .querySelector('[data-action="size-25"]')
        ?.classList.add("active");
    } else if (!widthStyle || widthStyle === "auto") {
      resizerElement
        .querySelector('[data-action="size-reset"]')
        ?.classList.add("active");
    }

    // Align active state
    if (floatStyle === "left") {
      resizerElement
        .querySelector('[data-action="align-left"]')
        ?.classList.add("active");
    } else if (floatStyle === "right") {
      resizerElement
        .querySelector('[data-action="align-right"]')
        ?.classList.add("active");
    } else if (
      displayStyle === "block" ||
      marginStyle === "auto" ||
      marginStyle?.includes("auto")
    ) {
      resizerElement
        .querySelector('[data-action="align-center"]')
        ?.classList.add("active");
    } else if (!floatStyle && !displayStyle && !marginStyle) {
      resizerElement
        .querySelector('[data-action="align-reset"]')
        ?.classList.add("active");
    }
  }

  /**
   * Select an image and show the resizer overlay and toolbar.
   * @param {HTMLImageElement} img The image element.
   */
  function showImageResizer(img) {
    if (activeImage && activeImage !== img) {
      activeImage.classList.remove(selectedClass);
    }
    activeImage = img;
    img.classList.add(selectedClass);
    updateResizerPosition();
    updateResizerActiveStates();
  }

  /**
   * Hide the image resizer overlay and toolbar.
   */
  function hideImageResizer() {
    if (activeImage) {
      activeImage.classList.remove(selectedClass);
      activeImage = null;
    }
    if (resizerElement) {
      resizerElement.style.display = "none";
    }
  }

  // Handle global mousemove for interactive image resizing
  window.addEventListener("mousemove", (event) => {
    if (!isResizing || !activeImage || !resizeData) return;

    const deltaX = event.clientX - resizeData.startX;
    let newWidth = resizeData.startWidth;

    if (resizeData.handle === "se" || resizeData.handle === "ne") {
      newWidth = resizeData.startWidth + deltaX;
    } else if (resizeData.handle === "sw" || resizeData.handle === "nw") {
      newWidth = resizeData.startWidth - deltaX;
    }

    if (newWidth < 40) newWidth = 40;

    const editor = activeImage.closest(".wysi-editor");
    if (editor) {
      const editorWidth = editor.clientWidth;
      if (newWidth > editorWidth) newWidth = editorWidth;
    }

    const newHeight = Math.round(newWidth / resizeData.naturalRatio);

    activeImage.style.width = `${Math.round(newWidth)}px`;
    activeImage.style.height = `${newHeight}px`;

    updateResizerPosition();
  });

  // Handle global mouseup to finish resizing
  window.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      resizeData = null;
      document.body.classList.remove("wysi-resizing");

      if (activeImage) {
        const editor = activeImage.closest(".wysi-editor");
        if (editor) {
          const textarea = editor.parentNode?.nextElementSibling;
          const instanceId = getInstanceId(editor);
          if (textarea && instanceId !== undefined) {
            updateContent(textarea, editor, instanceId, editor.innerHTML);
          }
        }
        updateResizerActiveStates();
      }
    }
  });

  // Reposition resizer overlay on window resize and scroll
  window.addEventListener("resize", () => {
    if (activeImage) updateResizerPosition();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (activeImage) updateResizerPosition();
    },
    true
  );

  // Keyboard shortcuts when image is selected (Delete / Backspace / Escape)
  document.addEventListener("keydown", (event) => {
    if (!activeImage) return;

    if (event.key === "Delete" || event.key === "Backspace") {
      const imgToDelete = activeImage;
      const editor = imgToDelete.closest(".wysi-editor");
      hideImageResizer();
      imgToDelete.remove();
      event.preventDefault();

      if (editor) {
        const textarea = editor.parentNode?.nextElementSibling;
        const instanceId = getInstanceId(editor);
        if (textarea && instanceId !== undefined) {
          updateContent(textarea, editor, instanceId, editor.innerHTML);
        }
      }
    } else if (event.key === "Escape") {
      hideImageResizer();
    }
  });

  // Deselect selected element when clicking outside
  addListener(document, "mousedown", (event) => {
    const target =
      event.target instanceof Element
        ? event.target
        : event.target?.parentElement;
    if (
      !target?.closest(".wysi-image-resizer") &&
      !target?.closest(".wysi-editor img")
    ) {
      hideImageResizer();
    }
    const selected = document.querySelector(`.${selectedClass}`);
    if (selected && selected !== event.target && !selected.contains?.(event.target)) {
      selected.classList.remove(selectedClass);
    }
  });

  // Select an image when it's clicked
  addListener(document, "mousedown", ".wysi-editor img", (event) => {
    const image = event.target;
    const range = document.createRange();
    range.selectNode(image);
    setSelection(range);
    showImageResizer(image);
  });

  // Prevent toolbar and listbox buttons from clearing text selection in editor on mousedown
  addListener(
    document,
    "mousedown",
    ".wysi-toolbar button, .wysi-listbox button",
    (event) => {
      if (!event.target.closest(".wysi-modal-backdrop")) {
        event.preventDefault();
      }
    }
  );

  // Toolbar button click
  addListener(document, "click", ".wysi-toolbar > button", (event, target) => {
    const button =
      target ||
      (event.target instanceof Element ? event.target.closest("button") : null);
    if (!button) return;
    const action = button.dataset.action;
    if (!action) return;
    const { editor } = findInstance(button);
    if (editor) {
      execAction(action, editor);
    }
  });

  // Update the toolbar buttons state
  addListener(document, "selectionchange", updateToolbarState);
  addListener(document, "input", ".wysi-editor", updateToolbarState);

  // Include SVG icons
  DOMReady(embedSVGIcons);

  const STYLE_ATTRIBUTE = "style";
  const ALIGN_ATTRIBUTE = "align";

  /**
   * Enable HTML tags belonging to a set of tools.
   * @param {Array} tools An array of tool names or group objects.
   * @return {object} The list of allowed tags.
   */
  function enableTags(tools) {
    const allowedTags = cloneObject(settings.allowedTags);
    tools.forEach((toolName) => {
      const tool = cloneObject(toolset[toolName]);
      if (!tool || !tool.tags) {
        return;
      }
      const isEmpty = Boolean(tool.isEmpty);
      const extraTags = tool.extraTags || [];
      const aliasList = tool.alias || [];
      const alias = aliasList.length ? tool.tags[0] : undefined;
      const tags = [...tool.tags, ...extraTags, ...aliasList];
      const attributes = tool.attributes || [];
      const styles = tool.styles || [];

      tags.forEach((tag) => {
        allowedTags[tag] = {
          attributes,
          styles,
          alias,
          isEmpty,
        };
        if (!extraTags.includes(tag)) {
          allowedTags[tag].toolName = toolName;
        }
      });
    });
    return allowedTags;
  }

  /**
   * Prepare raw content for editing.
   * @param {string} content The raw content.
   * @param {object} allowedTags The list of allowed tags.
   * @param {boolean} [filterOnly=false] If true, only filter the content, without further cleaning.
   * @return {string} The filtered HTML content.
   */
  function prepareContent(content, allowedTags, filterOnly = false) {
    const container = createElement("div");
    const fragment = buildFragment(content);
    filterContent(fragment, allowedTags);
    if (!filterOnly) {
      wrapTextNodes(fragment);
      cleanContent(fragment, allowedTags);
    }
    container.appendChild(fragment);
    return container.innerHTML;
  }

  /**
   * Replace a DOM element with another while preserving its content.
   * @param {Element} node The element to replace.
   * @param {string} tag The HTML tag of the new element.
   * @param {boolean} [copyAttributes=false] If true, also copy the original element's attributes.
   */
  function replaceNode(node, tag, copyAttributes = false) {
    const newElement = createElement(tag);
    const parentNode = node.parentNode;
    const attributes = node.attributes;

    // Copy the original element's content
    newElement.innerHTML = node.innerHTML || node.textContent || node.outerHTML;

    // Copy the original element's attributes
    if (copyAttributes && attributes) {
      for (const attr of attributes) {
        newElement.setAttribute(attr.name, attr.value);
      }
    }

    // Replace the element
    parentNode?.replaceChild(newElement, node);
  }

  /**
   * Remove unsupported CSS styles from a node.
   * @param {HTMLElement} node The element to filter.
   * @param {Array<string>} allowedStyles An array of supported styles.
   */
  function filterStyles(node, allowedStyles) {
    const styleAttribute = node.getAttribute(STYLE_ATTRIBUTE);
    if (styleAttribute) {
      // Parse the styles
      const styles = styleAttribute
        .split(";")
        .map((style) => {
          const [propName, ...propVal] = style.split(":");
          return {
            name: propName.trim(),
            value: propVal.join(":"),
          };
        })
        // Filter the styles
        .filter((style) => allowedStyles.includes(style.name))
        // Remove text-align: left
        .filter((style) => style.name !== "text-align" || style.value.trim() !== "left")
        // Convert back to a style string
        .map(({ name, value }) => `${name}: ${value.trim()};`)
        .join("");

      if (styles !== "") {
        node.setAttribute(STYLE_ATTRIBUTE, styles);
      } else {
        node.removeAttribute(STYLE_ATTRIBUTE);
      }
    }
  }

  /**
   * Remove unsupported HTML tags and attributes.
   * @param {Node} node The parent element to filter recursively.
   * @param {object} allowedTags The list of allowed tags.
   */
  function filterContent(node, allowedTags) {
    const children = Array.from(node.childNodes);
    if (!children.length) {
      return;
    }
    children.forEach((childNode) => {
      // Element nodes
      if (childNode.nodeType === 1) {
        // Filter recursively (deeper nodes first)
        filterContent(childNode, allowedTags);

        // Check if the current element is allowed
        const tag = childNode.tagName.toLowerCase();
        const allowedTag = allowedTags[tag];
        const attributes = Array.from(childNode.attributes);

        // Check for the deprecated align attribute (mainly in Firefox)
        const deprecatedAlignAttribute = childNode.getAttribute(ALIGN_ATTRIBUTE);
        if (allowedTag) {
          const allowedAttributes = allowedTag.attributes || [];
          const allowedStyles = allowedTag.styles || [];

          // Remove attributes that are not allowed
          for (const attr of attributes) {
            const attributeName = attr.name;
            if (!allowedAttributes.includes(attributeName)) {
              // Replace deprecated align attribute with text-align style
              if (attributeName === ALIGN_ATTRIBUTE) {
                if (deprecatedAlignAttribute !== "left") {
                  childNode.style.textAlign = deprecatedAlignAttribute;
                }
              }
              if (attributeName === STYLE_ATTRIBUTE && allowedStyles.length) {
                filterStyles(childNode, allowedStyles);
              } else {
                childNode.removeAttribute(attributeName);
              }
            }
          }

          // If the tag is an alias, replace it with the standard tag
          // e.g: <b> tags will be replaced with <strong> tags
          if (allowedTag.alias) {
            replaceNode(childNode, allowedTag.alias, true);
          }
        } else {
          // Remove style nodes
          if (tag === "style") {
            node.removeChild(childNode);

            // And unwrap the other nodes
          } else {
            // Fix bad alignment handling on Firefox
            if (deprecatedAlignAttribute !== null) {
              if (childNode.parentNode?.tagName === "LI") {
                childNode.parentNode.style.textAlign = deprecatedAlignAttribute;
              } else {
                for (const divChild of childNode.childNodes) {
                  if (divChild.style) {
                    divChild.style.textAlign = deprecatedAlignAttribute;
                  }
                }
              }
            }
            childNode.replaceWith(...childNode.childNodes);
          }
        }

        // Remove comment nodes
      } else if (childNode.nodeType === 8) {
        node.removeChild(childNode);
      }
    });
  }

  /**
   * Remove empty nodes.
   * @param {Node} node The parent element to filter recursively.
   * @param {object} allowedTags The list of allowed tags.
   */
  function cleanContent(node, allowedTags) {
    const children = Array.from(node.childNodes);
    if (!children.length) {
      return;
    }
    children.forEach((childNode) => {
      // Remove empty element nodes
      if (childNode.nodeType === 1) {
        // Filter recursively (deeper nodes first)
        cleanContent(childNode, allowedTags);

        // Check if the element can be empty
        const tag = childNode.tagName.toLowerCase();
        const allowedTag = allowedTags[tag];
        if (allowedTag && !allowedTag.isEmpty && trimText(childNode.innerHTML) === "") {
          node.removeChild(childNode);
        }
      }
    });
  }

  /**
   * Wrap the child text nodes in a paragraph (non-recursively).
   * @param {Node} node The parent element of the text nodes.
   */
  function wrapTextNodes(node) {
    const children = Array.from(node.childNodes);
    if (!children.length) {
      return;
    }
    let appendToPrev = false;
    children.forEach((childNode) => {
      if (childNode.nodeType !== 3 && blockElements.includes(childNode.tagName)) {
        appendToPrev = false;
        return;
      }

      if (appendToPrev) {
        const prev = childNode.previousElementSibling;
        if (prev) {
          prev.appendChild(childNode);
        }
      } else {
        replaceNode(childNode, "p");
        appendToPrev = true;
      }
    });
  }

  /**
   * Trim whitespace from the start and end of a text.
   * @param {string} text The text to trim.
   * @return {string} The trimmed text.
   */
  function trimText(text) {
    return text ? text.trim() : "";
  }

  // Next available instance id
  let nextId = 0;

  /**
   * Init WYSIWYG editor instances.
   * @param {object} [options={}] Configuration options.
   */
  function init(options = {}) {
    const globalTranslations = window.wysiGlobalTranslations || {};
    const translations = { ...globalTranslations, ...(options.translations || {}) };

    // Store translated strings
    storeTranslations(translations);
    const tools = options.tools || settings.tools;
    const selector = options.el || settings.el;
    const targetEls = getTargetElements(selector);
    const toolbar = renderToolbar(tools);
    const allowedTags = enableTags(tools);
    const customTags = options.customTags || [];

    // Add custom tags if any to the allowed tags list
    customTags.forEach((custom) => {
      if (custom.tags) {
        const attributes = custom.attributes || [];
        const styles = custom.styles || [];
        const isEmpty = Boolean(custom.isEmpty);
        custom.tags.forEach((tag) => {
          allowedTags[tag] = {
            attributes,
            styles,
            isEmpty,
          };
        });
      }
    });

    // Append an editor instance to target elements
    targetEls.forEach((field) => {
      const sibling = field.previousElementSibling;
      if (!sibling || !hasClass(sibling, "wysi-wrapper")) {
        const instanceId = nextId++;

        // Store the instance's options 
        instances[instanceId] = options;

        // Cache the list of allowed tags in the instance
        instances[instanceId].allowedTags = cloneObject(allowedTags);

        // Wrapper
        const wrapper = createElement("div", {
          class: "wysi-wrapper",
        });

        // Editable region
        const editor = createElement("div", {
          class: "wysi-editor",
          contenteditable: true,
          role: "textbox",
          "aria-multiline": true,
          "aria-label": getTextAreaLabel(field),
          "data-wid": instanceId,
          _innerHTML: prepareContent(field.value, allowedTags),
        });

        // Insert the editor instance in the document
        wrapper.appendChild(toolbar.cloneNode(true));
        wrapper.appendChild(editor);
        field.before(wrapper);

        // Apply configuration
        configure(wrapper, options);

        // Reconfigure instance
      } else {
        configure(sibling, options);
      }
    });
  }

  /**
   * Configure a WYSIWYG editor instance.
   * @param {HTMLElement} instance The editor instance to configure.
   * @param {object} options The configuration options.
   */
  function configure(instance, options) {
    if (!options || typeof options !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(options)) {
      switch (key) {
        case "darkMode":
        case "autoGrow":
        case "autoHide":
          instance.classList.toggle(`wysi-${key.toLowerCase()}`, Boolean(value));
          break;
        case "height": {
          const height = options.height;
          if (!isNaN(height)) {
            const editor = instance.lastChild;
            if (editor) {
              editor.style.minHeight = `${height}px`;
              editor.style.maxHeight = `${height}px`;
            }
          }
          break;
        }
      }
    }
  }

  /**
   * Update the content of a WYSIWYG editor instance.
   * @param {HTMLTextAreaElement} textarea The textarea element.
   * @param {HTMLElement} editor The editable region.
   * @param {string|number} instanceId The id of the instance.
   * @param {string} rawContent The new unfiltered content of the instance.
   * @param {boolean} [setEditorContent=false] Whether to update the content of the editable region.
   */
  function updateContent(textarea, editor, instanceId, rawContent, setEditorContent = false) {
    const instance = instances[instanceId];
    if (!instance) return;
    const content = prepareContent(rawContent, instance.allowedTags);
    const onChange = instance.onChange;
    if (setEditorContent === true) {
      editor.innerHTML = content;
    }
    textarea.value = content;
    dispatchEvent(textarea, "change");
    if (typeof onChange === "function") {
      onChange(content);
    }
  }

  /**
   * Destroy a WYSIWYG editor instance.
   * @param {string|Element|NodeList|Array} selector One or more selectors pointing to textarea fields.
   */
  function destroy(selector) {
    hideImageResizer();
    const editorInstances = findEditorInstances(selector);
    for (const { instanceId, wrapper } of editorInstances) {
      delete instances[instanceId];
      wrapper.remove();
    }
  }

  /**
   * Set the content of a WYSIWYG editor instance programmatically.
   * @param {string|Element|NodeList|Array} selector One or more selectors pointing to textarea fields.
   * @param {string} content The new content to set.
   */
  function setContent(selector, content) {
    const editorInstances = findEditorInstances(selector);
    for (const { textarea, editor, instanceId } of editorInstances) {
      updateContent(textarea, editor, instanceId, content, true);
    }
  }

  /**
   * Clean up content before pasting it in an editor.
   * @param {ClipboardEvent} event The browser's paste event.
   */
  function cleanPastedContent(event) {
    const { editor, nodes } = findInstance(event.target);
    if (!editor) return;

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Check if clipboard contains image files (e.g. screenshot or copied file)
    const imageFiles = Array.from(clipboardData.files || []).filter((f) =>
      f.type.startsWith("image/")
    );

    if (imageFiles.length > 0) {
      event.preventDefault();
      const instanceId = getInstanceId(editor);
      const instance = instances[instanceId] || {};

      (async () => {
        for (const file of imageFiles) {
          try {
            let imageUrl = "";
            if (typeof instance.onImageUpload === "function") {
              imageUrl = await instance.onImageUpload(file);
            } else {
              imageUrl = await readFileAsDataURL(file);
            }
            if (imageUrl) {
              const fileName = file.name.replace(/\.[^/.]+$/, "");
              insertImageIntoEditor(editor, imageUrl, fileName);
            }
          } catch (error) {
            console.error("Pasted image upload failed:", error);
          }
        }
      })();
      return;
    }

    if (clipboardData.types.includes("text/html")) {
      const pasted = clipboardData.getData("text/html");
      const instanceId = getInstanceId(editor);
      const allowedTags = instances[instanceId]?.allowedTags || {};
      let content = prepareContent(pasted, allowedTags);

      // Detect a heading tag in the current selection
      const splitHeadingTag = nodes.some((n) =>
        headingElements.includes(n.tagName)
      );

      // Force split the heading tag if any.
      // This fixes a bug in Webkit/Blink browsers where the whole content is converted to a heading
      if (splitHeadingTag && !isFirefox) {
        const splitter = `<h1 class="${placeholderClass}"><br></h1><p class="${placeholderClass}"><br></p>`;
        content = `${splitter}${content}${splitter}`;
      }

      // Manually paste the cleaned content
      execCommand("insertHTML", content);
      if (splitHeadingTag && !isFirefox) {
        // Remove placeholder elements if any
        editor.querySelectorAll(`.${placeholderClass}`).forEach((fragment) => {
          fragment.remove();
        });

        // Unwrap nested heading elements to fix a bug in Webkit/Blink browsers
        editor.querySelectorAll(headingElements.join()).forEach((heading) => {
          const firstChild = heading.firstElementChild;
          if (firstChild && blockElements.includes(firstChild.tagName)) {
            heading.replaceWith(...heading.childNodes);
          }
        });
      }

      // Prevent the default paste action
      event.preventDefault();
    }
  }

  /**
   * Bootstrap the WYSIWYG editor.
   */
  function bootstrap() {
    // Configure editable regions
    execCommand("styleWithCSS", false);
    execCommand("enableObjectResizing", false);
    execCommand("enableInlineTableEditing", false);
    execCommand("defaultParagraphSeparator", "p");

    // Update the textarea value when the editor's content changes
    addListener(document, "input", ".wysi-editor", (event) => {
      const editor = event.target;
      const textarea = editor.parentNode?.nextElementSibling;
      const instanceId = getInstanceId(editor);
      const content = editor.innerHTML;
      if (textarea) {
        updateContent(textarea, editor, instanceId, content);
      }
    });

    // Clean up pasted content
    addListener(document, "paste", cleanPastedContent);

    // Handle image drag and drop directly onto the editor
    addListener(document, "dragover", (event) => {
      const editor =
        event.target instanceof Element
          ? event.target.closest(".wysi-editor")
          : null;
      if (editor && event.dataTransfer?.types?.includes("Files")) {
        event.preventDefault();
        editor.classList.add("wysi-dragover");
      }
    });

    addListener(document, "dragleave", (event) => {
      const editor =
        event.target instanceof Element
          ? event.target.closest(".wysi-editor")
          : null;
      if (
        editor &&
        (!event.relatedTarget || !editor.contains(event.relatedTarget))
      ) {
        editor.classList.remove("wysi-dragover");
      }
    });

    addListener(document, "drop", async (event) => {
      const editor =
        event.target instanceof Element
          ? event.target.closest(".wysi-editor")
          : null;
      if (!editor) return;

      const files = Array.from(event.dataTransfer?.files || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (!files.length) {
        editor.classList.remove("wysi-dragover");
        return;
      }

      event.preventDefault();
      editor.classList.remove("wysi-dragover");

      // Position caret at drop coordinates
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(
          event.clientX,
          event.clientY
        );
        if (range) {
          setSelection(range);
        }
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(
          event.clientX,
          event.clientY
        );
        if (pos) {
          const range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
          setSelection(range);
        }
      }

      const instanceId = getInstanceId(editor);
      const instance = instances[instanceId] || {};

      for (const file of files) {
        try {
          let imageUrl = "";
          if (typeof instance.onImageUpload === "function") {
            imageUrl = await instance.onImageUpload(file);
          } else {
            imageUrl = await readFileAsDataURL(file);
          }
          if (imageUrl) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            insertImageIntoEditor(editor, imageUrl, fileName);
          }
        } catch (error) {
          console.error("Image upload failed:", error);
        }
      }
    });

    // Break out of blockquote on double enter
    addListener(document, "keydown", ".wysi-editor", (event) => {
      if (event.key === "Enter") {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const node = range.startContainer;

          // Find the block element (P, H1, etc.) or blockquote
          let block = node;
          while (
            block &&
            block.parentNode &&
            !hasClass(block.parentNode, "wysi-editor")
          ) {
            block = block.parentNode;
          }

          if (block && block.tagName === "BLOCKQUOTE") {
            // Check if the current line is empty
            const content = block.textContent.trim();
            if (content === "") {
              // If it's empty, convert to paragraph
              execCommand("formatBlock", "<p>");
              event.preventDefault();
            }
          } else if (
            block &&
            block.parentNode &&
            block.parentNode.tagName === "BLOCKQUOTE"
          ) {
            // If we are in a P inside a BLOCKQUOTE
            const content = block.textContent.trim();
            if (content === "") {
              // Break out
              execCommand("outdent"); // This usually breaks out of blockquote in most browsers
              execCommand("formatBlock", "<p>");
              event.preventDefault();
            }
          }
        }
      }
    });
  }

  // Expose Wysi to the global scope
  const methods = {
    destroy,
    setContent,
  };

  function Wysi(options = {}) {
    DOMReady(() => {
      init(options);
    });
  }

  for (const [key, method] of Object.entries(methods)) {
    Wysi[key] = (...args) => {
      DOMReady(method, args);
    };
  }

  window.Wysi = Wysi;
  if (typeof globalThis !== "undefined") {
    globalThis.Wysi = Wysi;
  }

  // Bootstrap Wysi when the DOM is ready
  DOMReady(bootstrap);
})(
  typeof window !== "undefined" ? window : globalThis,
  typeof document !== "undefined" ? document : null
);