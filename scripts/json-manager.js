const Path = require("path");
const Fs = require("fs");

class JsonManager {
  constructor(options = {}) {
    this.dataDir =
      options.dataDir || Path.resolve(process.cwd(), "src/data");
    this.keyAliases = {
      boostrapicons: "bootstrap",
      feather_icons: "feather",
      fontawesome_icons: "fontawesome",
      flag_icons: "flags",
      ...options.aliases,
    };
  }

  /**
   * Lee todos los archivos JSON del directorio y retorna un objeto estructurado
   */
  static loadData(dataDir = Path.resolve(process.cwd(), "src/data")) {
    const manager = new JsonManager({ dataDir });
    return manager.readAll();
  }

  /**
   * Lee un archivo JSON de forma segura
   */
  readJsonFile(filePath) {
    try {
      const content = Fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`[JsonManager] No se pudo leer el archivo: ${filePath}`);
      return {};
    }
  }

  /**
   * Lee todos los archivos JSON del directorio configurado
   */
  readAll() {
    const data = {};

    if (!Fs.existsSync(this.dataDir)) {
      return data;
    }

    const files = Fs.readdirSync(this.dataDir);

    files.forEach((file) => {
      if (file.endsWith(".json")) {
        const filePath = Path.join(this.dataDir, file);
        const baseName = Path.basename(file, ".json");
        const parsedData = this.readJsonFile(filePath);

        const primaryKey = this.keyAliases[baseName] || baseName;
        data[primaryKey] = parsedData;

        // Mantener tambien la clave con el nombre original si difiere
        if (primaryKey !== baseName) {
          data[baseName] = parsedData;
        }
      }
    });

    return data;
  }

  /**
   * Integracion con Webpack como plugin para agregar dependencias de observacion (watch mode)
   */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("JsonManager", (compilation) => {
      if (Fs.existsSync(this.dataDir)) {
        const files = Fs.readdirSync(this.dataDir);
        files.forEach((file) => {
          if (file.endsWith(".json")) {
            const filePath = Path.join(this.dataDir, file);
            compilation.fileDependencies.add(filePath);
          }
        });
      }
    });
  }
}

module.exports = JsonManager;
