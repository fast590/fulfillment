import Router from "koa-router";

const router = new Router({ prefix: "/gdpr" });

router.post("/shop/redact", async (ctx, next) => {
  /*
        Requests deletion of shop data.
        48 hours after a store owner uninstalls your app, Shopify sends you a shop/redact webhook. 
        This webhook provides the store's shop_id and shop_domain so that you can erase the 
        customer information for that store from your database.
    */
  console.log("shop/redact");
  ctx.status = 200;
  ctx.body = "OK";
});

router.post("/customers/redact", async (ctx, next) => {
  /*
        Requests deletion of customer data.
        When a store owner requests deletion of data on behalf of a customer, Shopify sends a payload on the customers/redact topic to the apps installed on that store.
        If the customer hasn't placed an order in the past six months, then Shopify sends the payload 10 days after their request. 
        Otherwise, the the request will be withheld until 6 months have passed. If your app has been granted access to the store's customers or orders, 
        then you receive a redaction request webhook with the resource IDs that you need to redact or delete. 
        In some cases, a customer record contains only the customer's email address.
    */
  console.log("customers/redact");
  ctx.status = 200;
  ctx.body = "OK";
});

router.post("/customers/data_request", async (ctx, next) => {
  /*
        Requests to view stored customer data.
        When a customer requests their data from a store owner, Shopify sends a payload on the customers/data_request topic to the apps installed on that store. 
        If your app has been granted access to customers or orders, then you receive a data request webhook with the resource IDs of the data that you need to provide to the store owner. 
        It's your responsibility to provide this data to the store owner directly. In some cases, a customer record contains only the customer's email address.
     */
  console.log("customers/data_request");
  ctx.status = 200;
  ctx.body = "OK";
});

export default router;