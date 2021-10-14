const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const {
  convertOrderToCapsuleAccount,
} = require("./src/server/helpers/shopifyHelper");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
// const host = JSON.stringify(process.env.HOST);
const host = "https://a408-160-202-160-104.ngrok.io";

module.exports = {
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST_URL: host };
    console.log("nexthost: ", host);
    config.plugins.push(new webpack.DefinePlugin(env));
    config.plugins.push(
      new Dotenv({
        allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
        systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
      })
    );

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};
