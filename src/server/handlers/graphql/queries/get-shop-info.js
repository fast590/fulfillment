import { gql } from "apollo-boost";

export function GET_SHOP_INFO() {
  return gql`
    {
      shop {
        id
        myshopifyDomain
      }
    }
  `;
}

export const getShopInfo = async (client) => {
  try {
    const result = await client.query({
      query: GET_SHOP_INFO(),
    });
    console.log(result);
    return result.data.shop;
  } catch (err) {
    console.error(err);
  }
};
