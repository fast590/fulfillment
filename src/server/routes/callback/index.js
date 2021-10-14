import Router from "koa-router";
import db from "../../database";
import capsuleApi from "../../helpers/capsuleApiHelper";
import {
  createClient,
  getAssignedFulfillmentOrders,
  fulfillmentOrderAcceptFulfillmentRequest,
  fulfillmentOrderAcceptCancellationRequest,
  fulfillmentOrderRejectCancellationRequest,
} from "../../handlers/graphql";
import { getShopifyNumericId } from "../../utils";

const router = new Router({ prefix: "/callback" });

router.post("/fulfillment_order_notification", async (ctx, next) => {
  try {
    console.log("====================================");
    console.log(`fulfillment_order_notification => ${ctx.request.body.kind}`);
    const { kind } = ctx.request.body;
    const shopDomain = ctx.request.headers["x-shopify-shop-domain"];
    const shop = await db.Shop.findOne({
        where: { ShopDomain: `${shopDomain}` },
        include: [
          {
            model: db.Setting,
            required: false,
            as: "Setting",
          },
          {
            model: db.Session,
            required: false,
            as: "Sessions",
            where: { IsOnline: false }
          }
        ]
      });
    const auth = {
      username: shop.Setting.CapsuleUsername,
      apikey: shop.Setting.CapsuleApiKey,
    };
    ctx.client = createClient(shop.ShopDomain, shop.Sessions[0].AccessToken);

    const asignedFulfillmentOrders = await getAssignedFulfillmentOrders(
      ctx,
      kind
    );
    for (const fulfillmentOrderEdge of asignedFulfillmentOrders.edges) {
      if (kind === "FULFILLMENT_REQUEST") {
        await fulfillmentOrderAcceptFulfillmentRequest(
          ctx,
          fulfillmentOrderEdge.node.id
        );
      } else if (kind === "CANCELLATION_REQUESTED") {
        await fulfillmentOrderRejectCancellationRequest(
          ctx,
          fulfillmentOrderEdge.node.id
        );
      }
    }
    ctx.status = 200;
    ctx.body = "OK";
    console.log("====================================");
  } catch (error) {
    ctx.status = 500;
    ctx.body = "Internal Server Error";
    console.log(error);
  }
});
export default router;
