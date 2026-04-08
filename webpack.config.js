const Webpack = require("webpack");
const Path = require("path");
const Fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PrettifyWebpackPlugin = require("pirulug-prettify-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DeleteEmptyFilesPlugin = require("pirulug-delete-empty-files-webpack-plugin");

const opts = {
  rootDir: process.cwd(),
  devBuild: process.env.NODE_ENV !== "production",
};

// PUG
const PAGES_DIR = `${Path.resolve(__dirname, "src")}/view/pages`;

// Read JSON data to pass to PUG templates (avoids relative path issues with require)
const jsonData = {
  menu: JSON.parse(
    Fs.readFileSync(Path.resolve(__dirname, "src/data/menu.json"), "utf8")
  ),
  feather: JSON.parse(
    Fs.readFileSync(
      Path.resolve(__dirname, "src/data/feather_icons.json"),
      "utf8"
    )
  ),
  bootstrap: JSON.parse(
    Fs.readFileSync(Path.resolve(__dirname, "src/data/boostrapicons.json"), "utf8")
  ),
  fontawesome: JSON.parse(
    Fs.readFileSync(
      Path.resolve(__dirname, "src/data/fontawesome_icons.json"),
      "utf8"
    )
  ),
  flags: JSON.parse(
    Fs.readFileSync(Path.resolve(__dirname, "src/data/flag_icons.json"), "utf8")
  ),
  piruiconsawesome: JSON.parse(
    Fs.readFileSync(
      Path.resolve(__dirname, "src/data/piruiconsawesome.json"),
      "utf8"
    )
  ),
};

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



module.exports = {
  entry: {
    piruadmin: "./src/js/piruadmin.js",
    bootstrapicons: "./src/plugins/bootstrapicons/bootstrapicons.js",
    feathericons: "./src/plugins/feathericons/feathericons.js",
    fontawesome: "./src/plugins/fontawesome/fontawesome.js",
    toastifyjs: "./src/plugins/toastifyjs/toastifyjs.js",
    liteyoutube: "./src/plugins/liteyoutube/liteyoutube.js",
    tagify: "./src/plugins/tagify/tagify.js",
    chartjs: "./src/plugins/chartjs/chartjs.js",
    flatpickr: "./src/plugins/flatpickr/flatpickr.js",
    sweetalert2: "./src/plugins/sweetalert2/sweetalert2.js",
    vectormaps: "./src/plugins/vectormaps/vectormaps.js",
    prismjs: "./src/plugins/prismjs/prismjs.js",
    datatables: "./src/plugins/datatables/datatables.js",
    flagicons: "./src/plugins/flagicons/flagicons.js",
    piruawesome: "./src/plugins/piruawesome/piruawesome.js",
    custom: "./src/plugins/custom/custon.js",
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool: opts.devBuild ? "eval-cheap-module-source-map" : false,
  output: {
    path: Path.join(opts.rootDir, "dist"),
    pathinfo: opts.devBuild,
    filename: (pathData) => {
      return pathData.chunk.name === 'piruadmin'
        ? 'assets/js/[name].js'
        : 'assets/plugins/[name].js';
    },
    chunkFilename: (pathData) => {
      return pathData.chunk.name === 'piruadmin'
        ? 'assets/js/[name].js'
        : 'assets/plugins/[name].js';
    },
  },
  performance: { hints: false },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ["default", { discardComments: { removeAll: true } }],
        },
      }),
    ],
    runtimeChunk: false,
  },
  plugins: [
    // DELETE
    !opts.devBuild && new CleanWebpackPlugin(),
    // Extract css files to seperate bundle
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        return pathData.chunk.name === "piruadmin"
          ? "assets/css/[name].css"
          : "assets/plugins/[name].css";
      },
      chunkFilename: (pathData) => {
        return pathData.chunk.name === "piruadmin"
          ? "assets/css/[name].css"
          : "assets/plugins/[name].css";
      },
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
    !opts.devBuild &&
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
    !opts.devBuild && new DeleteEmptyFilesPlugin(__dirname, "dist"),
  ].filter(Boolean),
  module: {
    rules: [
      // Babel-loader
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          "thread-loader",
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
          "thread-loader",
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
      {
        test: /\.json$/,
        type: "javascript/auto",
        use: [
          {
            loader: "json-loader",
          },
        ],
      },
    ],
  },
  ignoreWarnings: [
    (warning) =>
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
