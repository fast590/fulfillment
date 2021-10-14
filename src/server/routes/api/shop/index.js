import Router from "koa-router";
import db from "../../../database";
import config from "../../../config"
import queryString from "query-string"

const router = new Router({ prefix: "/shop" });

router.get("/", async (ctx, next) => {
  try {

    let shopDomain = ctx.request.query.shop ? ctx.request.query.shop : queryString.parse(ctx.request.headers.referer).shop;
    
    const result = await db.Shop.findOne({
      where: { ShopDomain: `${shopDomain}` },
    });

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    console.error(error);
  }
});

export default router;
