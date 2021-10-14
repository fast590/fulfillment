import Router from "koa-router";
import db from "../../../database";
import config from "../../../config"
import queryString from "query-string"

const router = new Router({ prefix: "/setting" });

router.get("/", async (ctx, next) => {
  try {
    let shopDomain = ctx.request.query.shop ? ctx.request.query.shop : queryString.parse(ctx.request.headers.referer).shop;
    const result = await db.Setting.findOne({
      where: { ShopDomain: `${shopDomain}` },
    });
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    console.error(error);
  }
});

router.post("/", async (ctx, next) => {
  try {
    let data = {
      ShopDomain: ctx.request.body.ShopDomain,
      CapsuleUsername: ctx.request.body.CapsuleUsername,
      CapsuleApiKey: ctx.request.body.CapsuleApiKey,
      CapsuleBrandId: ctx.request.body.CapsuleBrandId,
    };
    console.log('DATA => ' + JSON.stringify(data, null, 2));

    const result = await db.Setting.upsert(data);
    ctx.status = 200;
    ctx.body = result.length ? result[0] : [];
  } catch (error) {
    ctx.status = 500;
    console.error(error);
  }
});

export default router;
