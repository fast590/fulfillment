const env = process.env.NODE_ENV || "development";
// const host = process.env.HOST || "";
const host = "https://a408-160-202-160-104.ngrok.io/";

export default {
  shopify: {
    api_key: process.env.SHOPIFY_API_KEY || "",
    api_secret: process.env.SHOPIFY_API_SECRET || "",
    api_version: process.env.SHOPIFY_API_VERSION || "2021-10",
  },
  app: {
    name: process.env.APP_NAME || "",
    environment: env,
    is_development: env !== "production",
    debug: process.env.DEBUG,
    scopes: process.env.SCOPES.split(",") || [],
    host: host.replace(/\/\w*$/, ""),
    host_name: process.env.HOST.replace(/https:\/\//, ""),
    port: parseInt(process.env.PORT, 10) || 8081,
    company_name: process.env.COMPANY_NAME || "",
    namespace: process.env.NAMESPACE || "",
    fulfillment_service_name: process.env.FULFILLMENT_SERVICE_NAME || "",
    salesforce_api_url: process.env.SALESFORCE_API_URL || "",
  },
  database: {
    uri: process.env.DATABASE_URL || "",
    options: {
      dialect: "postgres",
      schema: "shopify",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true, // This will help you. But you will see nwe error
          rejectUnauthorized: false, // This line will fix new error
        },
      },
    },
  },
};
