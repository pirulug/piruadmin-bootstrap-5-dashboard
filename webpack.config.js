const Webpack = require("webpack");
const Path = require("path");
const Fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BeautifyHtmlWebpackPlugin = require("@sumotto/beautify-html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const opts = {
  rootDir: process.cwd(),
  devBuild: process.env.NODE_ENV !== "production",
};

// PUG
const PAGES_DIR = `${Path.resolve(__dirname, "src")}/view/pages`;
const PAGES = Fs.readdirSync(PAGES_DIR).filter((fileName) =>
  fileName.endsWith(".pug")
);

module.exports = {
  entry: {
    app: "./src/js/app.js",
    feathericons: "./src/plugins/feathericons/feathericons.js",
    chartjs: "./src/plugins/chartjs/chartjs.js",
    flatpickr: "./src/plugins/flatpickr/flatpickr.js",
    vectormaps: "./src/plugins/vectormaps/vectormaps.js",
    fontawesome: "./src/plugins/fontawesome/fontawesome.js",
    sweetalert2: "./src/plugins/sweetalert2/sweetalert2.js",
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  // devtool: process.env.NODE_ENV === "production" ? "source-map" : "inline-source-map",
  devtool: false,
  output: {
    path: Path.join(opts.rootDir, "dist"),
    pathinfo: opts.devBuild,
    filename: "js/[name].js",
    chunkFilename: "js/[name].js",
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
    new CleanWebpackPlugin(),
    // Extract css files to seperate bundle
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[name].css",
    }),
    // Copy fonts and images to dist
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/fonts", to: "fonts" },
        { from: "src/img", to: "img" },
      ],
    }),
    // Cargar paginas de .pug
    ...PAGES.map(
      (page) =>
        new HtmlWebpackPlugin({
          template: `${PAGES_DIR}/${page}`,
          filename: `./${page.replace(/\.pug/, ".html")}`,
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
        })
    ),
    // Beautify
    new BeautifyHtmlWebpackPlugin({
      end_with_newline: true,
      indent_size: 2,
      indent_with_tabs: true,
      indent_inner_html: true,
      preserve_newlines: true,
      extra_liners: ["!--"],
      unformatted: [],
      inline: [],
    }),
  ],
  module: {
    rules: [
      // Babel-loader
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
      // Css-loader & sass-loader
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          "postcss-loader",
          "sass-loader",
        ],
      },
      // Load fonts
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      // Load images
      {
        test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset/resource",
        generator: {
          filename: "img/[name][ext]",
        },
      },
      // Pug
      {
        test: /\.pug$/,
        use: ["pug-loader?{pretty:true}"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".scss"],
    modules: ["node_modules"],
    alias: {
      request$: "xhr",
    },
  },
  devServer: {
    static: {
      directory: Path.join(__dirname, "dist"),
    },
    watchFiles: ["src/js/**/*.js", "src/scss/**/*.scss", "src/view/**/*.pug"],
    compress: true,
    port: 8989,
    // open: {
    //   app: {
    //     name: "firefox",
    //   },
    // },
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
