import Router from "koa-router";
import appHelper from "../../helpers/appHelper";
import capsuleApi from "../../helpers/capsuleApiHelper";
import {
  isSameOrderAndShippingCustomer,
  convertOrderToCapsuleAccount,
  convertOrderToCapsuleContact,
} from "../../helpers/shopifyHelper";
import db from "../../database";
import config from "../../config";
import { getShopifyNumericId } from "../../utils";
import {
  getOrder,
  createClient,
  fulfillmentOrderSubmitFulfillmentRequest,
  addNoteToOrder,
  addOrderError,
} from "../../handlers/graphql";

const router = new Router({ prefix: "/webhook" });

router.post("/app/uninstall", async (ctx, next) => {
  const shop = ctx.request.headers["x-shopify-shop-domain"];
  console.log(`App Uninstall from ${shop}`);
  await appHelper.uninstall(shop);
  return;
});

router.post("/orders/paid", async (ctx, next) => {
  const graphQlOrderId = ctx.request.body.admin_graphql_api_id;
  let shopifyOrder;

  try {
    ctx.status = 200;
    ctx.body = "OK";

    if (ctx.request.body.financial_status != "paid") {
      return;
    }

    let hasOkCapsuleLines = false;
    for (const lineItem of ctx.request.body.line_items) {
      if (
        lineItem.fulfillment_service.toLowerCase() ===
        config.app.fulfillment_service_name.toLowerCase().replaceAll(" ", "-")
      ) {
        hasOkCapsuleLines = true;
        break;
      }
    }

    if (!hasOkCapsuleLines) {
      console.log(`❌ Order ${ctx.request.body.name} is not a Capsule Order.`);
      return;
    }

    console.log("====================================");
    console.log(`🎉 Order Paid ${ctx.request.body.name}`);
    console.log("Shopify Request => ", ctx.request.body);

    const shopDomain = ctx.request.headers["x-shopify-shop-domain"];
    const orderId = getShopifyNumericId(graphQlOrderId);
    const shop = await db.Shop.findOne({
      where: { ShopDomain: `${shopDomain}` },
      include: [
        {
          model: db.Setting,
          required: true,
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

    if (!shop || !shop.Sessions.length) {
      ctx.status = 404;
      ctx.body = "Not Found";
      return;
    }

    const fulfillmentLocationId = getShopifyNumericId(
      shop.FulfillmentLocationId
    );
    ctx.client = createClient(shop.ShopDomain, shop.Sessions[0].AccessToken);
    let formularyNames = [];
    let orderLinesRequestData = [];
    let orderLinesWithMissingMetafields = [];
    let formularyMap = {};

    const auth = {
      username: shop.Setting.CapsuleUsername,
      apikey: shop.Setting.CapsuleApiKey,
    };
    shopifyOrder = await getOrder(ctx, fulfillmentLocationId, graphQlOrderId);

    if (!shopifyOrder.fulfillmentOrders.edges.length) {
      console.log(">> Duplicate Request. Stopping Order Creation Process.");
      return;
    }

    let lineItemIds = "";
    for (const fulfillmentLineItem of shopifyOrder.fulfillmentOrders.edges[0]
      .node.lineItems.edges) {
      const metafieldMap = fulfillmentLineItem.node.lineItem.product.metafields.edges.reduce(
        (obj, item) => Object.assign(obj, { [item.node.key]: item.node.value }),
        {}
      );
      if (
        metafieldMap.formulary &&
        metafieldMap.timeOfAdministration &&
        metafieldMap.servingSize
      ) {
        lineItemIds +=
          getShopifyNumericId(fulfillmentLineItem.node.lineItem.id) + ",";
        let records = metafieldMap.formulary.split(",").map((formularyName) => {
          formularyNames.push(formularyName);
          return {
            formularyName: formularyName,
            quantity: fulfillmentLineItem.node.lineItem.quantity,
            timeOfAdministration: metafieldMap.timeOfAdministration.replaceAll(
              ",",
              ";"
            ),
            servingSizeNumber: parseInt(metafieldMap.servingSize),
          };
        });
        orderLinesRequestData.push(...records);
      } else if (fulfillmentLineItem.node.lineItem) {
        orderLinesWithMissingMetafields.push(fulfillmentLineItem.node.lineItem);
      }
    }

    if (orderLinesWithMissingMetafields.length) {
      let message = "";
      message += `Order Cannot be Processed by ${config.app.name}.`;
      for (const lineItem of orderLinesWithMissingMetafields) {
        message += `\nProduct ${lineItem.product.title} has not been configured in the "${config.app.name}" App.`;
      }
      addOrderError(ctx, shopifyOrder, message);

      console.log(
        `❌ Products in Order ${shopifyOrder.name} has products without configured metafields.`
      );
      return;
    }

    if (lineItemIds.length) {
      lineItemIds = lineItemIds.substring(0, lineItemIds.length - 1);
    }

    const formularies = await capsuleApi.getFormularies(auth, {
      name: formularyNames.join(","),
    });

    formularyMap = formularies.reduce(
      (obj, item) => Object.assign(obj, { [item.name]: item }),
      {}
    );

    let capsuleAccount = await capsuleApi.upsertAccount(
      auth,
      convertOrderToCapsuleAccount(shopifyOrder)
    );

    if (!capsuleAccount) {
      console.log(">> Error Upserting Account.");
      addOrderError(
        ctx,
        shopifyOrder,
        `Error Ocurred in "${config.app.name}" App, could not find Customer in Capsule Account. Please contact ${config.app.company_name} to fix issue`
      );
      return;
    }

    let capsuleContact = await capsuleApi.upsertContact(
      auth,
      capsuleAccount,
      convertOrderToCapsuleContact(capsuleAccount, shopifyOrder)
    );
    if (!capsuleContact) {
      console.log(">> Error Upserting Contact.");
      addOrderError(
        ctx,
        shopifyOrder,
        `Error Ocurred in "${config.app.name}" App, could not find Customer in Capsule Contact. Please contact ${config.app.company_name} to fix issue`
      );
      return;
    }

    if (
      !capsuleAccount.shippingContactId ||
      (isSameOrderAndShippingCustomer(shopifyOrder) &&
        capsuleAccount.shippingContactId != capsuleContact.recordId)
    ) {
      capsuleAccount = await capsuleApi.updateAccount(
        auth,
        capsuleAccount.recordId,
        {
          shippingContactId: capsuleContact.recordId,
        }
      );
    }

    console.log(">>Account: ", capsuleAccount);
    console.log(">>Contact: ", capsuleContact);

    const order = await capsuleApi.createOrder(auth, {
      externalLineIds: lineItemIds,
      recordTypeName: "Subscription",
      shipToAccountId: capsuleContact.customerAccountId,
      shippingContactId: capsuleContact.recordId,
      orderType: "DTC",
      brandId: shop.Setting.CapsuleBrandId,
      clientOrderId: orderId,
    });

    console.log(">>Order: ", order);
    for (const orderLine of orderLinesRequestData) {
      orderLine.salesOrderId = order.recordId;
      orderLine.formularyId = formularyMap[orderLine.formularyName].recordId;
    }

    const orderLines = await capsuleApi.createOrderLines(
      auth,
      orderLinesRequestData
    );
    console.log(">>OrderLines ", orderLines);

    await fulfillmentOrderSubmitFulfillmentRequest(
      ctx,
      shopifyOrder.fulfillmentOrders.edges[0].node.id
    );
    await addNoteToOrder(
      ctx,
      graphQlOrderId,
      `Order Received by ${config.app.company_name}`
    );

    console.log("====================================");
    return;
  } catch (error) {
    ctx.status = 500;
    ctx.body = "Internal Server Error";
    console.error(error.message, error);
    if (shopifyOrder) {
      addOrderError(
        ctx,
        shopifyOrder,
        `Error Ocurred in "Supplement Drop Shipping" App, ${error.message}`
      );
    } else {
      await addNoteToOrder(
        ctx,
        graphQlOrderId,
        `Error Ocurred in "Supplement Drop Shipping" App, ${error.message}`
      );
    }
  }
});

router.post("/orders/cancelled", async (ctx, next) => {
  try {
    ctx.status = 200;
    ctx.body = "OK";
    return;
  } catch (error) {
    ctx.status = 500;
    ctx.body = "Internal Server Error";
    console.error("Error: ", error);
  }
});

export default router;
