import Router from "koa-router";
import FulfillmentRouter from "./fulfillment";
import SettingRouter from "./setting";
import ShopRouter from "./shop";
import { verifyRequest } from "@shopify/koa-shopify-auth";
import config from "../../config"

const router = new Router({ prefix: "/api" });

//Access Token Verification
// FulfillmentRouter.use(async (ctx, next) => {
//     if(ctx.headers["x-shopify-access-token"] !== config.shopify.api_secret) {
//         ctx.status = 401;
//         return;
//     }

//     await next();
// });
router.use(FulfillmentRouter.routes());
router.use(FulfillmentRouter.allowedMethods());

//Session Based Verification
// ShopRouter.use(verifyRequest({ accessMode: "offline" }));
router.use(ShopRouter.routes());
router.use(ShopRouter.allowedMethods());

// SettingRouter.use(verifyRequest({ accessMode: "offline" }));
router.use(SettingRouter.routes());
router.use(SettingRouter.allowedMethods());

export default router;
