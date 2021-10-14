export function formatShopifyId(id) {
  return id ? id.replace(/\?.*$/g, "") : "";
}

export function getShopifyNumericId(id) {
  return id ? id.replace(/gid:\/\/shopify\/\w+\/|\?.*/g, "") : "";
}

export function blankDataValidation(data) {
  return data ? data : "";
}
