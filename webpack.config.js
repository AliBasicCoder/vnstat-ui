const webpack = require("webpack");
const path = require("path");
const nodemonPlugin = require("nodemon-webpack-plugin");

const base = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};

const arr = [];

arr[0] = Object.assign({}, base, {
  entry: {
    bundle: "./src/client/index",
  },
  output: {
    path: path.join(__dirname, "assets/js"),
    filename: "[name].js",
  },
});

arr[1] = Object.assign({}, base, {
  entry: {
    cli: "./src/cli/cli",
  },
  output: {
    path: path.join(__dirname, "assets"),
    filename: "[name].js",
  },
  node: {
    __dirname: false,
  },
  target: "node",
  plugins: [
    // new nodemonPlugin({
    //  args: ["start", "-d"],
    // }),
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
  ],
});

arr[2] = Object.assign({}, base, {
  entry: {
    "configure-bundle": "./src/client/configure",
  },
  output: {
    path: path.join(__dirname, "assets/js"),
    filename: "[name].js",
  },
});

module.exports = arr;
