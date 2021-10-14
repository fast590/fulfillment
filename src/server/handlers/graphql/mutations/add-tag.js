import "isomorphic-fetch";
import { gql } from "apollo-boost";

export const addTag = async (ctx, data) => {
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
        tags: tags,
      },
    },
  });
  return result.data.orderUpdate;
};
