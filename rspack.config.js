const { rspack } = require("@rspack/core");
const Path = require("path");
const Fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PrettifyWebpackPlugin = require("pirulug-prettify-webpack-plugin");
const DeleteEmptyFilesPlugin = require("pirulug-delete-empty-files-webpack-plugin");
const PluginsManager = require("./scripts/plugins-manager");
const JsonManager = require("./scripts/json-manager");
const pkg = require("./package.json");

const repoUrl = (
  typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url || ""
)
  .replace(/^git\+/, "")
  .replace(/\.git$/, "");

const banner = [
  `PiruAdmin — Bootstrap 5 Dashboard v${pkg.version} (${pkg.homepage})`,
  `Copyright 2024-${new Date().getFullYear()} ${pkg.author}`,
  `Licensed under ${pkg.license} (${repoUrl ? `${repoUrl}/blob/master/LICENSE` : pkg.license})`,
].join("\n");

// PUG
const PAGES_DIR = `${Path.resolve(__dirname, "src")}/view/pages`;

// Cargar datos JSON para las plantillas PUG
const jsonData = JsonManager.loadData();

function getFiles(dir, allFiles) {
  const files = Fs.readdirSync(dir);
  allFiles = allFiles || [];
  files.forEach(function (file) {
    if (Fs.statSync(dir + "/" + file).isDirectory()) {
      allFiles = getFiles(dir + "/" + file, allFiles);
    } else if (file.endsWith(".pug")) {
      allFiles.push(
        Path.relative(PAGES_DIR, Path.join(dir, file)).replace(/\\/g, "/")
      );
    }
  });
  return allFiles;
}

const PAGES = getFiles(PAGES_DIR);

module.exports = (env = {}, argv = {}) => {
  const isProduction =
    process.env.NODE_ENV === "production" || argv.mode === "production";
  const devBuild = !isProduction;

  const appConfig = {
    name: "app",
    entry: {
      piruadmin: "./src/js/piruadmin.js",
      "piruadmin-fonts": "./src/scss/piruadmin-fonts.scss",
    },
    mode: isProduction ? "production" : "development",
    devtool: devBuild ? "eval-cheap-module-source-map" : false,
    output: {
      path: Path.join(process.cwd(), "dist"),
      pathinfo: devBuild,
      filename: "assets/js/[name].js",
      chunkFilename: "assets/js/[name].js",
      clean: devBuild
        ? false
        : {
            keep: (asset) =>
              asset.includes("assets/plugins") ||
              asset.includes("assets\\plugins") ||
              asset.startsWith("assets/plugins") ||
              asset.startsWith("assets\\plugins"),
          },
    },
    performance: { hints: false },
    optimization: {
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          extractComments: false,
          minimizerOptions: {
            format: {
              comments: false,
            },
          },
        }),
        new rspack.LightningCssMinimizerRspackPlugin({
          minimizerOptions: {
            errorRecovery: true,
          },
        }),
      ],
      runtimeChunk: false,
    },
    plugins: [
      new JsonManager(),
      // Extract css files to separate bundle
      new rspack.CssExtractRspackPlugin({
        filename: "assets/css/[name].css",
        chunkFilename: "assets/css/[name].css",
      }),
      // Copy fonts and images to dist
      new rspack.CopyRspackPlugin({
        patterns: [
          { from: "src/fonts", to: "assets/fonts" },
          { from: "src/img", to: "assets/img" },
        ],
      }),
      // Cargar paginas de .pug
      ...PAGES.map((page) => {
        const parts = page.split("/");
        const baseUrl = parts.length > 1 ? "../".repeat(parts.length - 1) : "./";

        return new HtmlWebpackPlugin({
          template: `${PAGES_DIR}/${page}`,
          filename: `./${page.replace(/\.pug/, ".html")}`,
          templateParameters: {
            baseUrl: baseUrl,
            assets: baseUrl + "assets/",
            ...jsonData,
          },

          minify: {
            collapseWhitespace: false,
            keepClosingSlash: false,
            removeComments: false,
            removeRedundantAttributes: false,
            removeScriptTypeAttributes: false,
            removeStyleLinkTypeAttributes: false,
            useShortDoctype: false,
            preventAttributesEscaping: false,
          },
          inject: false,
        });
      }),

      // Beautify
      !devBuild &&
        new PrettifyWebpackPlugin({
          extensions: [".html"],
          prettierOptions: {
            printWidth: 100,
            tabWidth: 2,
            useTabs: false,
            singleQuote: true,
            htmlWhitespaceSensitivity: "ignore",
            endOfLine: "auto",
            proseWrap: "always",
          },
        }),
      // Eliminar archivos vacios
      !devBuild && new DeleteEmptyFilesPlugin(__dirname, "dist"),
      new rspack.BannerPlugin({
        banner: banner,
        raw: false,
        entryOnly: false,
        test: /\.(css|js)$/i,
        stage: rspack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
      }),
    ].filter(Boolean),
    module: {
      rules: [
        // SWC-loader (reemplaza babel-loader)
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: "builtin:swc-loader",
          options: {
            env: {
              targets: ["last 2 versions", "> 0.5%", "not dead", "not ie 11"],
            },
          },
        },
        // Css-loader & sass-loader
        {
          test: /\.(sa|sc|c)ss$/,
          type: "javascript/auto",
          use: [
            rspack.CssExtractRspackPlugin.loader,
            "css-loader",
            "postcss-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  quietDeps: true,
                  loadPaths: [Path.resolve(__dirname, "node_modules")],
                },
              },
            },
          ],
        },
        // Load fonts
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

              const fontsMatch = resource.match(/src\/fonts\/([^/]+)\//i);
              if (fontsMatch) {
                const folder = fontsMatch[1].toLowerCase();
                return `assets/fonts/${folder}/[name][ext]`;
              }

              return "assets/fonts/[name][ext]";
            },
          },
        },
        // Load images (including svg)
        {
          test: /\.(png|jpg|jpeg|gif|webp|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
          generator: {
            filename: "assets/img/[name][ext]",
          },
        },
        // Pug
        {
          test: /\.pug$/,
          use: [
            {
              loader: "pirulug-pug-loader",
              options: {
                pretty: true,
              },
            },
          ],
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
    cache: true,
    devServer: {
      static: {
        directory: Path.join(__dirname, "dist"),
      },
      devMiddleware: {
        writeToDisk: true,
      },
      watchFiles: [
        "src/data/**/*.json",
        "src/js/**/*.js",
        "src/scss/**/*.scss",
        "src/view/**/*.pug",
        "src/plugins/**/*",
      ],
      compress: true,
      port: 8989,
      open: true,
      liveReload: true,
    },
    stats: {
      assets: true,
      builtAt: true,
      colors: true,
      modules: false,
      children: false,
    },
  };

  const shouldBuildPlugins = PluginsManager.shouldBuildPlugins(env, argv);

  if (shouldBuildPlugins) {
    return [appConfig, ...PluginsManager.createConfigs(env, argv, banner)];
  }

  return appConfig;
};
