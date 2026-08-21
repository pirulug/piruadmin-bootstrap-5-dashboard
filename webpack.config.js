const Webpack = require("webpack");
const Path = require("path");
const Fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PrettifyWebpackPlugin = require("pirulug-prettify-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DeleteEmptyFilesPlugin = require("pirulug-delete-empty-files-webpack-plugin");
const PluginsManager = require("./scripts/plugins-manager");
const JsonManager = require("./scripts/json-manager");

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
      new JsonManager(),
      // Extract css files to seperate bundle
      new MiniCssExtractPlugin({
        filename: "assets/css/[name].css",
        chunkFilename: "assets/css/[name].css",
      }),
      // Copy fonts and images to dist
      new CopyWebpackPlugin({
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
    ].filter(Boolean),
    module: {
      rules: [
        // Babel-loader
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
        // Css-loader & sass-loader
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
            filename: "assets/fonts/[name][ext]",
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
    cache: {
      type: "filesystem",
    },
    devServer: {
      static: {
        directory: Path.join(__dirname, "dist"),
      },
      watchFiles: [
        "src/data/**/*.json",
        "src/js/**/*.js",
        "src/scss/**/*.scss",
        "src/view/**/*.pug",
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
    return [appConfig, ...PluginsManager.createConfigs(env, argv)];
  }

  return appConfig;
};
