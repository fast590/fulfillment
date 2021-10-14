import "isomorphic-fetch";
import { gql } from "apollo-boost";
import config from "../../../config";

export const orderUpdate = async (ctx, data) => {
  const { client } = ctx;

  const result = await client.mutate({
    mutation: gql`
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      input: data,
    },
  });
  return result.data.orderUpdate;
};

export function addOrderError(ctx, shopifyOrder, message) {
  let tags =
    shopifyOrder.tags && shopifyOrder.tags.length ? shopifyOrder.tags : [];
  if (!tags.includes(config.app.company_name + " Order Error - Needs Review")) {
    tags.push(config.app.company_name + " Order Error - Needs Review");
  }

  let note =
    shopifyOrder.note && shopifyOrder.note.length
      ? shopifyOrder.note + "\n"
      : "";
  note += message;

  orderUpdate(ctx, {
    id: shopifyOrder.id,
    note: note,
    tags: tags,
  });
}
