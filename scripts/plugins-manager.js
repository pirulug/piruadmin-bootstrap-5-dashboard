const Path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const DeleteEmptyFilesPlugin = require("pirulug-delete-empty-files-webpack-plugin");

class PluginsManager {
  static PLUGINS = [
    { name: "bootstrapicons", entry: "./bootstrapicons/bootstrapicons.js" },
    { name: "feathericons", entry: "./feathericons/feathericons.js" },
    { name: "fontawesome", entry: "./fontawesome/fontawesome.js" },
    { name: "toastifyjs", entry: "./toastifyjs/toastifyjs.js" },
    { name: "liteyoutube", entry: "./liteyoutube/liteyoutube.js" },
    { name: "tagify", entry: "./tagify/tagify.js" },
    { name: "chartjs", entry: "./chartjs/chartjs.js" },
    { name: "flatpickr", entry: "./flatpickr/flatpickr.js" },
    { name: "sweetalert2", entry: "./sweetalert2/sweetalert2.js" },
    { name: "vectormaps", entry: "./vectormaps/vectormaps.js" },
    { name: "prismjs", entry: "./prismjs/prismjs.js" },
    { name: "flagicons", entry: "./flagicons/flagicons.js" },
    { name: "simplemde", entry: "./simplemde/simplemde.js" },
    { name: "custom", entry: "./custom/custon.js" },
    { name: "wysi", entry: ["./wysi/wysi.js", "./wysi/wysi.css"] },
  ];

  /**
   * Determina si se deben compilar los plugins
   */
  static shouldBuildPlugins(env = {}, argv = {}) {
    const isProduction =
      process.env.NODE_ENV === "production" || argv.mode === "production";

    const hasPluginsFlag =
      Boolean(env && env.plugins) ||
      process.argv.includes("--plugins") ||
      process.argv.some(
        (arg) =>
          typeof arg === "string" &&
          (arg === "--plugins" ||
            arg.startsWith("--plugins=") ||
            arg === "plugins")
      ) ||
      Boolean(process.env.npm_config_plugins) ||
      process.env.PLUGINS === "true";

    return isProduction || hasPluginsFlag;
  }

  /**
   * Crea una configuracion de Webpack totalmente aislada para un plugin individual
   */
  static createSinglePluginConfig(plugin, env = {}, argv = {}) {
    const isProduction =
      process.env.NODE_ENV === "production" || argv.mode === "production";
    const devBuild = !isProduction;
    const rootDir = process.cwd();
    const pluginDist = Path.resolve(
      rootDir,
      `dist/assets/plugins/${plugin.name}`
    );

    return {
      name: `plugin-${plugin.name}`,
      context: Path.resolve(rootDir, "src/plugins"),
      entry: {
        [plugin.name]: plugin.entry,
      },
      mode: isProduction ? "production" : "development",
      devtool: devBuild ? "eval-cheap-module-source-map" : false,
      output: {
        path: pluginDist,
        filename: "[name].js",
        chunkFilename: "[name].js",
        globalObject: "this",
        clean: false,
      },
      performance: { hints: false },
      optimization: {
        minimizer: [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              ecma: 6,
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
          new CssMinimizerPlugin({
            minimizerOptions: {
              preset: [
                "default",
                {
                  discardComments: { removeAll: true },
                },
              ],
            },
          }),
        ],
        runtimeChunk: false,
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[name].css",
        }),
        !devBuild && new DeleteEmptyFilesPlugin(rootDir, `dist/assets/plugins/${plugin.name}`),
      ].filter(Boolean),
      module: {
        rules: [
          // JS Loader
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  cacheDirectory: true,
                },
              },
            ],
          },
          // CSS y SASS Loader
          {
            test: /\.(sa|sc|c)ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              "css-loader",
              "postcss-loader",
              {
                loader: "sass-loader",
                options: {
                  sassOptions: {
                    quietDeps: true,
                    loadPaths: [Path.resolve(rootDir, "node_modules")],
                  },
                },
              },
            ],
          },
          // Fuentes locales al plugin (ej. ./fonts/ o ./webfonts/)
          {
            test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
            type: "asset/resource",
            generator: {
              filename: (pathData) => {
                const resource = (
                  pathData?.module?.resource ||
                  pathData?.filename ||
                  ""
                ).replace(/\\/g, "/");

                if (
                  resource.includes("@fortawesome") ||
                  resource.includes("fontawesome")
                ) {
                  return "webfonts/[name][ext]";
                }

                return "fonts/[name][ext]";
              },
            },
          },
          // Imagenes y SVGs locales al plugin (ej. ./flags/ o ./img/)
          {
            test: /\.(png|jpg|jpeg|gif|webp|svg)(\?v=\d+\.\d+\.\d+)?$/,
            type: "asset/resource",
            generator: {
              filename: (pathData) => {
                const resource = (
                  pathData?.module?.resource ||
                  pathData?.filename ||
                  ""
                ).replace(/\\/g, "/");

                if (resource.includes("flag-icons")) {
                  const flagMatch = resource.match(
                    /flag-icons\/(flags\/(?:4x3|1x1)\/[^/]+)$/
                  );
                  if (flagMatch) {
                    return flagMatch[1];
                  }
                  return "flags/[name][ext]";
                }

                return "img/[name][ext]";
              },
            },
          },
        ],
      },
      ignoreWarnings: [
        (warning) =>
          /is deprecated/.test(warning.message) ||
          /deprecated/.test(warning.message) ||
          /Global built-in functions are deprecated/.test(warning.message) ||
          /Sass @import rules are deprecated/.test(warning.message) ||
          /deprecation warnings omitted/.test(warning.message),
      ],
      resolve: {
        extensions: [".js", ".scss"],
        modules: ["node_modules"],
        alias: {
          request$: "xhr",
        },
      },
      cache: {
        type: "filesystem",
      },
      stats: {
        assets: true,
        builtAt: true,
        colors: true,
        modules: false,
        children: false,
      },
    };
  }

  /**
   * Genera el arreglo de configuraciones independientes para todos los plugins
   */
  static createConfigs(env = {}, argv = {}) {
    return PluginsManager.PLUGINS.map((plugin) =>
      PluginsManager.createSinglePluginConfig(plugin, env, argv)
    );
  }
}

module.exports = PluginsManager;
