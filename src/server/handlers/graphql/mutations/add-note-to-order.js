import "isomorphic-fetch";
import { gql } from "apollo-boost";

export const addNoteToOrder = async (ctx, orderId, message) => {
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
      input: {
        id: orderId,
        note: message,
      },
    },
  });
  return result.data.orderUpdate;
};
