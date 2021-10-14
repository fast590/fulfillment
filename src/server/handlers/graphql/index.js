import { createClient } from "./client";
import { registerFulfillmentService } from "./mutations/register-fulfillment-service";
import {
  fulfillmentOrderSubmitFulfillmentRequest,
  fulfillmentOrderAcceptFulfillmentRequest,
  fulfillmentOrderRejectFulfillmentRequest,
  fulfillmentOrderAcceptCancellationRequest,
  fulfillmentOrderRejectCancellationRequest,
  fulfillmentOrderOpen,
  fulfillmentOrderClose,
  fulfillmentCreate,
  fulfillmentCancel,
} from "./mutations/fulfillment-orders-request";
import { orderUpdate, addOrderError } from "./mutations/order-update";
import { addTag } from "./mutations/add-tag";
import { addNoteToOrder } from "./mutations/add-note-to-order";
import { getOrder, getOrders } from "./queries/get-order";
import { getShopInfo } from "./queries/get-shop-info";
import { getAssignedFulfillmentOrders } from "./queries/get-assigned-fulfillment-orders";

export {
  createClient,
  addTag,
  addNoteToOrder,
  orderUpdate,
  addOrderError,
  registerFulfillmentService,
  getOrder,
  getOrders,
  getShopInfo,
  getAssignedFulfillmentOrders,
  fulfillmentOrderSubmitFulfillmentRequest,
  fulfillmentOrderAcceptFulfillmentRequest,
  fulfillmentOrderRejectFulfillmentRequest,
  fulfillmentOrderAcceptCancellationRequest,
  fulfillmentOrderRejectCancellationRequest,
  fulfillmentOrderOpen,
  fulfillmentOrderClose,
  fulfillmentCreate,
  fulfillmentCancel,
};
