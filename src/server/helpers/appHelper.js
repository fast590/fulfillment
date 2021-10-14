import store from "store-js";
import Shopify from "@shopify/shopify-api";
import { createClient, registerFulfillmentService } from "../handlers/graphql"
import db from "../database"
import config from "../config";

async function registerWebhooks(shopDomain, accessToken) {
  let webhooks = [
    {
      topic: "APP_UNINSTALLED",
      url: "/webhook/app/uninstall",
    },
    {
      topic: "ORDERS_PAID",
      url: "/webhook/orders/paid",
    },
  ];
  let response;

  for (const webhook of webhooks) {
    response = await Shopify.Webhooks.Registry.register({
      topic: webhook.topic,
      path: webhook.url,
      shop: shopDomain,
      accessToken: accessToken
    });

    if (response.success) {
      console.log(`Registered ${webhook.topic}, ${config.app.host}${webhook.url} webhook`);
    } else {
      console.log(
        `Failed to register ${webhook.topic}, ${config.app.host}${webhook.url} webhook: ${JSON.stringify(response.result, null, 2)}`
      );
    }
  }

}

async function install(ctx, shopDomain, accessToken) {
  try {
    let shopRecord = await db.Shop.findOne({
      where: { ShopDomain: `${shopDomain}` },
      include: [
        {
          model: db.Setting,
          required: false,
          as: "Setting"
        },
        {
          model: db.Session,
          required: false,
          as: "Sessions"
        }
      ]
    });
    console.log("INSTALL!");
    console.log(shopRecord);
    if(!shopRecord.FulfillmentServiceId) {
      ctx.client = await createClient(shopDomain, accessToken);
      await registerWebhooks(shopDomain, accessToken);
      let response = await registerFulfillmentService(ctx, shopDomain);
      db.Shop.upsert({
        ShopDomain: shopDomain,
        FulfillmentServiceId: response?.fulfillmentServiceId,
        FulfillmentLocationId: response?.fulfillmentLocationId
      });
    }

    return true;
  } catch (e) {
    console.error(e);
  }

  return false;
}

async function uninstall(shopDomain) {
  try {
    const deletedShopResult = await db.Shop.destroy({
      where: {
        ShopDomain: shopDomain,
      },
    });
    return deletedShopResult > 0;
  } catch (e) {
    console.error(e);
  }

  return false;
}

export default {
  install,
  uninstall,
};
