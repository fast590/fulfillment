import "isomorphic-fetch";
import { gql } from "apollo-boost";
import config from "../../../config";

export const fulfillmentOrderSubmitFulfillmentRequest = async (
  ctx,
  fulfillmentOrderId
) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderSubmitFulfillmentRequest(
        $fulfillmentOrderId: ID!
      ) {
        fulfillmentOrderSubmitFulfillmentRequest(id: $fulfillmentOrderId) {
          originalFulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          submittedFulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          unsubmittedFulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      fulfillmentOrderId: fulfillmentOrderId,
    },
  });
  return result.data.fulfillmentOrderSubmitFulfillmentRequest;
};

export const fulfillmentOrderAcceptFulfillmentRequest = async (
  ctx,
  fulfillmentOrderId
) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderAcceptFulfillmentRequest(
        $fulfillmentOrderId: ID!
        $message: String
      ) {
        fulfillmentOrderAcceptFulfillmentRequest(
          id: $fulfillmentOrderId
          message: $message
        ) {
          fulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          userErrors {
            message
          }
        }
      }
    `,
    variables: {
      fulfillmentOrderId: fulfillmentOrderId,
      message: `Order Fulfillment Received by ${config.app.company_name}`,
    },
  });
  return result.data.fulfillmentOrderAcceptFulfillmentRequest;
};

export const fulfillmentOrderRejectFulfillmentRequest = async (
  ctx,
  fulfillmentOrderId
) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderRejectFulfillmentRequest(
        $fulfillmentOrderId: ID!
        $message: String
      ) {
        fulfillmentOrderRejectFulfillmentRequest(
          id: $fulfillmentOrderId
          message: $message
        ) {
          fulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          userErrors {
            message
          }
        }
      }
    `,
    variables: {
      fulfillmentOrderId: fulfillmentOrderId,
      message: `Order Fulfillment Request: Rejected by ${config.app.company_name}`,
    },
  });
  return result.data.fulfillmentOrderRejectFulfillmentRequest;
};

export const fulfillmentOrderAcceptCancellationRequest = async (
  ctx,
  fulfillmentOrderId
) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderAcceptCancellationRequest(
        $fulfillmentOrderId: ID!
        $message: String
      ) {
        fulfillmentOrderAcceptCancellationRequest(
          id: $fulfillmentOrderId
          message: $message
        ) {
          fulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          userErrors {
            message
          }
        }
      }
    `,
    variables: {
      fulfillmentOrderId: fulfillmentOrderId,
      message: `Order Cancellation Request: Accepted by ${config.app.company_name}`,
    },
  });
  return result.data.fulfillmentOrderAcceptCancellationRequest;
};

export const fulfillmentOrderRejectCancellationRequest = async (
  ctx,
  fulfillmentOrderId
) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderRejectCancellationRequest(
        $fulfillmentOrderId: ID!
        $message: String
      ) {
        fulfillmentOrderRejectCancellationRequest(
          id: "$fulfillmentOrderId"
          message: $message
        ) {
          fulfillmentOrder {
            id
            status
            requestStatus
            order {
              id
            }
          }
          userErrors {
            message
          }
        }
      }
    `,
    variables: {
      fulfillmentOrderId: fulfillmentOrderId,
      message: `Order Cancellation Request: Rejected by ${config.app.company_name}.`,
    },
  });
  return result.data.fulfillmentOrderAcceptCancellationRequest;
};

export const fulfillmentOrderOpen = async (ctx, fulfillmentOrderId) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderOpen($fulfillmentOrderId: ID!) {
        fulfillmentOrderOpen(id: $fulfillmentOrderId) {
          fulfillmentOrder {
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
      fulfillmentOrderId: fulfillmentOrderId,
    },
  });
  return result.data.fulfillmentOrderOpen;
};

export const fulfillmentOrderClose = async (ctx, fulfillmentOrderId) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentOrderClose($fulfillmentOrderId: ID!) {
        fulfillmentOrderClose(id: $fulfillmentOrderId) {
          fulfillmentOrder {
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
      fulfillmentOrderId: fulfillmentOrderId,
    },
  });
  return result.data.fulfillmentOrderOpen;
};

export const fulfillmentCreate = async (ctx, fulfillment) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentCreate($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
            trackingInfo {
              url
              number
              company
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      fulfillment: fulfillment,
    },
  });
  return result.data.fulfillmentCreateV2;
};

export const fulfillmentCancel = async (ctx, fulfillmentId) => {
  const { client } = ctx;
  const result = await client.mutate({
    mutation: gql`
      mutation fulfillmentCreate($fulfillmentId: ID!) {
        fulfillmentCancel(id: $fulfillmentId) {
          fulfillment {
            id
            status
            trackingInfo {
              url
              number
              company
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      fulfillmentId: fulfillmentId,
    },
  });
  return result.data.fulfillmentCancel;
};
