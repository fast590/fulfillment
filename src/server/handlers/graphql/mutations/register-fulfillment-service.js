import "isomorphic-fetch";
import { gql } from "apollo-boost";
import config from "../../../config";
import db from "../../../database";

import { formatShopifyId } from "../../../utils";

const ALREADY_REGISTERED_ERROR_MESSAGE = "Name has already been taken";

export function FULFILLMENT_SERVICE_CREATE(serviceName, callbackUrl) {
  return gql`
  mutation {
    fulfillmentServiceCreate(name: "${serviceName}", trackingSupport: false, callbackUrl: "${config.app.host}${callbackUrl}") {
      userErrors {
        message
      }
      fulfillmentService {
        id
        fulfillmentOrdersOptIn
        location {
          id
        }
      }
    }
  }
  `;
}

export function FULFILLMENT_SERVICE_UPDATE(fulfillmentServiceId) {
  return gql`
  mutation {
    fulfillmentServiceUpdate(fulfillmentOrdersOptIn: true, id: "${fulfillmentServiceId}") {
      userErrors {
        message
      }
      fulfillmentService {
        fulfillmentOrdersOptIn
      }
    }
  }
  `;
}

export const registerFulfillmentService = async (ctx, shopDomain) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: FULFILLMENT_SERVICE_CREATE(config.app.company_name, "/callback"),
  });
  console.log(">>> " + JSON.stringify(result));
  const response = result.data.fulfillmentServiceCreate;
  const isSuccess = !response.userErrors.length;
  let fulfillmentServiceId = "";
  let fulfillmentLocationId = "";

  if (isSuccess) {
    fulfillmentServiceId = formatShopifyId(response.fulfillmentService.id);
    fulfillmentLocationId = formatShopifyId(
      response.fulfillmentService.location.id
    );
    await client.mutate({
      mutation: FULFILLMENT_SERVICE_UPDATE(response.fulfillmentService.id),
    });
  } else if (
    !isSuccess &&
    response.userErrors[0].message === ALREADY_REGISTERED_ERROR_MESSAGE
  ) {
    const shop = await db.Shop.findOne({
      where: { ShopDomain: `${shopDomain}` },
    });
    fulfillmentServiceId = formatShopifyId(shop.FulfillmentServiceId);
    fulfillmentLocationId = formatShopifyId(shop.FulfillmentLocationId);
  } else {
    console.log(
      `Failed to create fulfillment service ${config.app.company_name}`
    );
    console.error(response.userErrors[0]);
    return null;
  }

  return { fulfillmentServiceId, fulfillmentLocationId };
};
