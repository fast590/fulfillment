import Router from "koa-router";
import Shopify from "@shopify/shopify-api";
import { verifyRequest } from "@shopify/koa-shopify-auth";
import ApiRouter from "./api";
import WebhookRouter from "./webhook";
import GdprRouter from "./gdpr";
import CallbackRouter from "./callback";
import db from "../database";
import localStorage from "store-js";

module.exports = (app, server) => {
  const router = new Router();
  const handle = app.getRequestHandler();
  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.use(ApiRouter.routes());
  router.use(ApiRouter.allowedMethods());

  router.use(WebhookRouter.routes());
  router.use(WebhookRouter.allowedMethods());

  router.use(GdprRouter.routes());
  router.use(GdprRouter.allowedMethods());

  router.use(CallbackRouter.routes());
  router.use(CallbackRouter.allowedMethods());

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );
  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;
    let sessionRetrieved = null;

    if (shop) {
      sessionRetrieved = await db.Session.findOne({
        where: {
          ShopDomain: shop,
          IsOnline: false,
        },
      });
    }

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (!sessionRetrieved) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());

  return router;
};
