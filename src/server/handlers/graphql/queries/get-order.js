import { gql } from "apollo-boost";
import config from "../../../config";

export const getOrder = async (ctx, fulfillmentLocationId, orderId) => {
  try {
    const { client } = ctx;
    const result = await client.query({
      query: gql`
      {
        order(id: "${orderId}") {
          id
          name
          displayFinancialStatus
          phone
          email
          tags
          note
          fulfillmentOrders(first: 1, reverse: true, query: "assigned_location_id:${fulfillmentLocationId} AND (status:OPEN OR status:CLOSED)") {
            edges {
              node {
                id
                status
                lineItems(first: 100) {
                  edges {
                    node {
                      id
                      lineItem {
                        id
                        name
                        quantity
                        originalUnitPrice
                        product {
                          id
                          title
                          metafields(first: 4, namespace: "okcapsule") {
                            edges {
                              node {
                                namespace
                                key
                                value
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          shippingAddress {
            firstName
            lastName
            phone
            address1
            address2
            city
            province
            country
            zip
          }
          customer {
            id
            displayName
            firstName
            lastName
            email
            phone
            defaultAddress {
              firstName
              lastName
              phone
              address1
              address2
              city
              province
              country
              zip
            }
          }
        }
      }  
      `,
    });
    return result.data.order;
  } catch (err) {
    console.error(err);
  }
};

export const getOrders = async (ctx, fulfillmentLocationId, orderIds) => {
  try {
    const { client } = ctx;
    const result = await client.query({
      query: gql`
        query getOrders($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Order {
              id
              name
              displayFinancialStatus
              phone
              email
              tags
              note
              fulfillmentOrders(first: 1, reverse: true, query: "assigned_location_id:${fulfillmentLocationId}") {
                edges {
                  node {
                    id
                    status
                    lineItems(first: 100) {
                      edges {
                        node {
                          id
                          lineItem {
                            id
                            name
                            quantity
                            originalUnitPrice
                            product {
                              id
                              title
                              metafields(first: 4, namespace: "okcapsule") {
                                edges {
                                  node {
                                    namespace
                                    key
                                    value
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                phone
                address1
                address2
                city
                province
                country
                zip
              }
              customer {
                id
                firstName
                lastName
                email
                phone
                defaultAddress {
                  firstName
                  lastName
                  phone
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
              }
            }
          }
        }
      `,
      variables: {
        ids: orderIds,
      },
    });
    return result.data.nodes;
  } catch (err) {
    console.error(err);
  }
};
