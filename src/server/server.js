require("dotenv").config();
import "@babel/polyfill";
import "isomorphic-fetch";
import createShopifyAuth from "@shopify/koa-shopify-auth";
import Shopify from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import SessionHandler from "./handlers/SessionHandler";
import config from "./config";
import db from "./database";
import appHelper from "./helpers/appHelper";
import localStorage from "store-js";

const app = next({
  dev: config.app.is_development,
});

const sessionStorage = new SessionHandler();

Shopify.Context.initialize({
  API_KEY: config.shopify.api_key,
  API_SECRET_KEY: config.shopify.api_secret,
  API_VERSION: config.shopify.api_version,
  SCOPES: config.app.scopes,
  HOST_NAME: config.app.host_name,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessionStorage.storeSession,
    sessionStorage.loadSession,
    sessionStorage.deleteSession
  ),
});

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(bodyParser());

  // for the offline session token
  // server.use(
  //   createShopifyAuth({
  //     accessMode: "offline",
  //     prefix: "/install",
  //     async afterAuth(ctx) {
  //       const { shop, accessToken, scope } = ctx.state.shopify;
  //       const host = ctx.query.host;
  //       console.log("Offline AUTH!");
  //       if (shop) {
  //         localStorage.set("shopOrigin", shop);
  //       }
  //       appHelper.install(ctx, shop, accessToken);

  //       // Redirect to app with shop parameter upon auth
  //       ctx.redirect(`/?shop=${shop}&host=${host}`);
  //     },
  //   })
  // );

  // for the online session token
  server.use(
    createShopifyAuth({
      accessMode: "online",
      async afterAuth(ctx) {
        console.log("server", ctx);
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        console.log("Online AUTH!");
        console.log("host", host);
        const offlineSession = await db.Session.findOne({
          where: {
            ShopDomain: shop,
            IsOnline: false,
          },
        });
        if (shop) {
          localStorage.set("shopOrigin", shop);
        }

        if (offlineSession) {
          ctx.redirect(`/?shop=${shop}&host=${host}`);
        } else {
          ctx.redirect(`/install/auth?shop=${shop}`);
        }
      },
    })
  );
  require("./routes")(app, server);
  server.listen(config.app.port, () => {
    console.log(`> Ready on http://localhost:${config.app.port}`);
  });
});
