import Router from "koa-router";
import {
  createClient,
  fulfillmentCreate,
  getOrders,
} from "../../../handlers/graphql";
import { getShopifyNumericId } from "../../../utils";
import db from "../../../database";
import config from "../../../config";

const router = new Router({ prefix: "/fulfillment" });

router.post("/", async (ctx, next) => {
  try {
    console.log(
      "Authorized Request? ",
      ctx.request.headers["x-shopify-access-token"] == config.shopify.api_secret
    );
    if (
      ctx.request.headers["x-shopify-access-token"] != config.shopify.api_secret
    ) {
      ctx.status = 401;
      ctx.body = "Unauthorized";
      return;
    }
    console.log("====================================");
    console.log(`Fulfillment Create Request`);

    let fulfillmentRequests = ctx.request.body;
    let ordersByStore = {};
    let apolloClientMap = {};
    let fulfillmentOrderByNumericOrderId = {};
    let storeUrls = [
      ...new Set(
        fulfillmentRequests.map(
          (fulfillmentRequest) => fulfillmentRequest.store_url
        )
      ),
    ];

    const stores = await db.Shop.findAll({
      where: { ShopDomain: storeUrls },
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
          where: { IsOnline: false },
        },
      ],
    });

    if (stores && !stores.length) {
      console.log("BAD REQUEST!");
      ctx.status = 400;
      return;
    }

    const storeMap = stores.reduce(
      (obj, item) => Object.assign(obj, { [item.ShopDomain]: item }),
      {}
    );

    for (const fulfillmentRequest of fulfillmentRequests) {
      if (!apolloClientMap.hasOwnProperty(fulfillmentRequest.store_url)) {
        apolloClientMap[fulfillmentRequest.store_url] = createClient(
          storeMap[fulfillmentRequest.store_url].ShopDomain,
          storeMap[fulfillmentRequest.store_url].Sessions[0].AccessToken
        );
        ordersByStore[fulfillmentRequest.store_url] = [];
      }
      ordersByStore[fulfillmentRequest.store_url].push(
        `gid://shopify/Order/${fulfillmentRequest.shopify_order_id}`
      );
    }

    for (const store of Object.keys(ordersByStore)) {
      ctx.client = apolloClientMap[store];
      let orders = await getOrders(
        ctx,
        getShopifyNumericId(store.FulfillmentLocationId),
        ordersByStore[store]
      );
      for (const order of orders) {
        if (!order || !order.fulfillmentOrders.edges.length) {
          console.log(
            `>> Couldn't find one of these orders ${ordersByStore[store].join(
              ","
            )} in ${store}`
          );
          continue;
        }

        fulfillmentOrderByNumericOrderId[getShopifyNumericId(order.id)] =
          order.fulfillmentOrders.edges[0].node;
      }
    }

    let fulfillmentLineIdByLineId = {};
    for (const [orderId, fulfillmentOrder] of Object.entries(
      fulfillmentOrderByNumericOrderId
    )) {
      for (const fulfillmentLineItem of fulfillmentOrder.lineItems.edges) {
        fulfillmentLineIdByLineId[fulfillmentLineItem.node.lineItem.id] =
          fulfillmentLineItem.node.id;
      }
    }

    let fulfillmentResponses = [];
    let fulfillmentResponse = {};
    for (const fulfillmentRequest of fulfillmentRequests) {
      if (
        !fulfillmentOrderByNumericOrderId[
          getShopifyNumericId(fulfillmentRequest.shopify_order_id)
        ]
      ) {
        fulfillmentResponse = {
          salesforce_order_ids: fulfillmentRequest.salesforce_order_ids,
          success: false,
          message: "Not Found",
        };
        fulfillmentResponses.push(fulfillmentResponse);
        continue;
      }

      if (
        fulfillmentOrderByNumericOrderId[
          getShopifyNumericId(fulfillmentRequest.shopify_order_id)
        ].status === "CLOSED"
      ) {
        fulfillmentResponse = {
          salesforce_order_ids: fulfillmentRequest.salesforce_order_ids,
          success: true,
          message: "Order Fulfilled",
        };
        fulfillmentResponses.push(fulfillmentResponse);
        console.log(
          ">> Already Fulfilled Order ",
          JSON.stringify(fulfillmentResponse, null, 2)
        );
        continue;
      }

      ctx.client = apolloClientMap[fulfillmentRequest.store_url];
      let fulfillmentLineItems = [];
      for (const lineItem of fulfillmentRequest.line_items) {
        if (fulfillmentLineIdByLineId[lineItem.id]) {
          fulfillmentLineItems.push({
            id: fulfillmentLineIdByLineId[lineItem.id],
          });
        }
      }

      let requestData = {
        trackingInfo: {
          company: fulfillmentRequest.tracking_company,
          number: fulfillmentRequest.tracking_number,
        },
        notifyCustomer: fulfillmentRequest.notify_customer,
        lineItemsByFulfillmentOrder: {
          fulfillmentOrderId:
            fulfillmentOrderByNumericOrderId[
              fulfillmentRequest.shopify_order_id
            ].id,
          fulfillmentOrderLineItems: fulfillmentLineItems,
        },
      };

      console.log(
        ">> Order Fulfillment Request ",
        JSON.stringify(requestData, null, 2)
      );
      let result = await fulfillmentCreate(ctx, requestData);
      fulfillmentResponse = {
        salesforce_order_ids: fulfillmentRequest.salesforce_order_ids,
        success: result.fulfillment?.status === "SUCCESS",
        message:
          result.fulfillment?.status === "SUCCESS"
            ? "Order Fulfilled"
            : result.userErrors.length
            ? result.userErrors[0].message
            : "",
      };
      fulfillmentResponses.push(fulfillmentResponse);
      console.log(
        ">> Order Fulfillment Response ",
        JSON.stringify(fulfillmentResponse, null, 2)
      );
    }

    ctx.body = fulfillmentResponses;
    ctx.status = 200;
    console.log("====================================");
  } catch (error) {
    ctx.status = 500;
    console.error(error);
  }
});
export default router;
