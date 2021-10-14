import { gql } from "apollo-boost";
import { createClient } from "../client";
import db from "../../../database";

export function GET_ASSIGNED_ORDERS(kind) {
  return gql`
  {
    shop {
      assignedFulfillmentOrders(first: 50, assignmentStatus: ${kind + "ED"}) {
        edges {
          node {
            id
            status
            requestStatus
            order {
              id
            }
            merchantRequests(first: 1, kind: ${kind}, reverse: true) {
              edges {
                node {
                  id
                  kind
                  message
                }
              }
            }
          }
        }
      }
    }
  }
  `;
}

export const getAssignedFulfillmentOrders = async (ctx, kind) => {
  try {
    const { client } = ctx;
    const result = await client.query({
      query: GET_ASSIGNED_ORDERS(kind),
    });
    return result.data.shop.assignedFulfillmentOrders;
  } catch (err) {
    console.error(err);
  }
};
