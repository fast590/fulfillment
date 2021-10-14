import shop from "../database/models/shop";
import { blankDataValidation, getShopifyNumericId } from "../utils";

export function convertOrderToCapsuleCustomer(shopifyOrder) {
  let customer = {};

  if (shopifyOrder.customer) {
    customer.clientCustomerId = getShopifyNumericId(
      blankDataValidation(shopifyOrder.customer.id)
    );
    customer.firstName = blankDataValidation(shopifyOrder.customer.firstName);
    customer.lastName = blankDataValidation(shopifyOrder.customer.lastName);
  } else if (shopifyOrder.shippingAddress) {
    customer.firstName = blankDataValidation(
      shopifyOrder.shippingAddress.firstName
    );
    customer.lastName = blankDataValidation(
      shopifyOrder.shippingAddress.lastName
    );
  }
  customer.email = shopifyOrder.email
    ? blankDataValidation(shopifyOrder.email)
    : blankDataValidation(shopifyOrder.customer?.email);
  if (shopifyOrder.shippingAddress) {
    customer.phone = blankDataValidation(shopifyOrder.shippingAddress.phone);
    customer.shippingStreet = blankDataValidation(
      shopifyOrder.shippingAddress.address1
    );
    customer.shippingStreet += customer.shippingStreet.length ? " " : "";
    customer.shippingStreet += blankDataValidation(
      shopifyOrder.shippingAddress.address2
    );
    customer.shippingCity = blankDataValidation(
      shopifyOrder.shippingAddress.city
    );
    customer.shippingState = blankDataValidation(
      shopifyOrder.shippingAddress.province
    );
    customer.shippingPostalCode = blankDataValidation(
      shopifyOrder.shippingAddress.zip
    );
    customer.shippingCountry = blankDataValidation(
      shopifyOrder.shippingAddress.country
    );
  } else if (shopifyOrder.customer && shopifyOrder.customer.defaultAddress) {
    customer.phone = blankDataValidation(
      shopifyOrder.customer.defaultAddress.phone
    );
    customer.shippingStreet = blankDataValidation(
      shopifyOrder.customer.defaultAddress.address1
    );
    customer.shippingStreet += customer.shippingStreet.length ? " " : "";
    customer.shippingStreet += blankDataValidation(
      shopifyOrder.customer.defaultAddress.address2
    );
    customer.shippingCity = blankDataValidation(
      shopifyOrder.customer.defaultAddress.city
    );
    customer.shippingState = blankDataValidation(
      shopifyOrder.customer.defaultAddress.province
    );
    customer.shippingPostalCode = blankDataValidation(
      shopifyOrder.customer.defaultAddress.zip
    );
    customer.shippingCountry = blankDataValidation(
      shopifyOrder.customer.defaultAddress.country
    );
  }

  return customer;
}

export function convertOrderToCapsuleAccount(shopifyOrder) {
  let account = {};

  if (shopifyOrder.customer) {
    account.clientCustomerId = getShopifyNumericId(
      blankDataValidation(shopifyOrder.customer.id)
    );
    account.name = blankDataValidation(shopifyOrder.customer.displayName);
  } else if (shopifyOrder.shippingAddress) {
    account.name = blankDataValidation(shopifyOrder.shippingAddress.firstName);
    account.name =
      (account.name.length ? " " : "") +
      blankDataValidation(shopifyOrder.shippingAddress.lastName);
  }

  if (shopifyOrder.shippingAddress) {
    account.phone = blankDataValidation(shopifyOrder.shippingAddress.phone);
    account.shippingStreet = blankDataValidation(
      shopifyOrder.shippingAddress.address1
    );
    account.shippingStreet += account.shippingStreet.length ? " " : "";
    account.shippingStreet += blankDataValidation(
      shopifyOrder.shippingAddress.address2
    );
    account.shippingCity = blankDataValidation(
      shopifyOrder.shippingAddress.city
    );
    account.shippingState = blankDataValidation(
      shopifyOrder.shippingAddress.province
    );
    account.shippingPostalCode = blankDataValidation(
      shopifyOrder.shippingAddress.zip
    );
    account.shippingCountry = blankDataValidation(
      shopifyOrder.shippingAddress.country
    );
  } else if (shopifyOrder.customer && shopifyOrder.customer.defaultAddress) {
    account.phone = blankDataValidation(
      shopifyOrder.customer.defaultAddress.phone
    );
    account.shippingStreet = blankDataValidation(
      shopifyOrder.customer.defaultAddress.address1
    );
    account.shippingStreet += account.shippingStreet.length ? " " : "";
    account.shippingStreet += blankDataValidation(
      shopifyOrder.customer.defaultAddress.address2
    );
    account.shippingCity = blankDataValidation(
      shopifyOrder.customer.defaultAddress.city
    );
    account.shippingState = blankDataValidation(
      shopifyOrder.customer.defaultAddress.province
    );
    account.shippingPostalCode = blankDataValidation(
      shopifyOrder.customer.defaultAddress.zip
    );
    account.shippingCountry = blankDataValidation(
      shopifyOrder.customer.defaultAddress.country
    );
  }

  return account;
}

export function convertOrderToCapsuleContact(capsuleAccount, shopifyOrder) {
  let contact = {};
  contact.customerAccountId = capsuleAccount.recordId;

  if (isSameOrderAndShippingCustomer(shopifyOrder)) {
    if (shopifyOrder.email) {
      contact.email = shopifyOrder.email;
    } else if (shopifyOrder.customer.email) {
      contact.email = shopifyOrder.customer.email;
    }
  }

  if (shopifyOrder.shippingAddress) {
    contact.firstName = blankDataValidation(
      shopifyOrder.shippingAddress.firstName
    );
    contact.lastName = blankDataValidation(
      shopifyOrder.shippingAddress.lastName
    );
    contact.phone = blankDataValidation(shopifyOrder.shippingAddress.phone);
    contact.mailingStreet = blankDataValidation(
      shopifyOrder.shippingAddress.address1
    );
    contact.mailingStreet += contact.mailingStreet.length ? " " : "";
    contact.mailingStreet += blankDataValidation(
      shopifyOrder.shippingAddress.address2
    );
    contact.mailingCity = blankDataValidation(
      shopifyOrder.shippingAddress.city
    );
    contact.mailingState = blankDataValidation(
      shopifyOrder.shippingAddress.province
    );
    contact.mailingPostalCode = blankDataValidation(
      shopifyOrder.shippingAddress.zip
    );
    contact.mailingCountry = blankDataValidation(
      shopifyOrder.shippingAddress.country
    );
  } else if (shopifyOrder.customer && shopifyOrder.customer.defaultAddress) {
    contact.firstName = blankDataValidation(shopifyOrder.customer.firstName);
    contact.lastName = blankDataValidation(shopifyOrder.customer.lastName);

    contact.phone = blankDataValidation(
      shopifyOrder.customer.defaultAddress.phone
    );
    contact.mailingStreet = blankDataValidation(
      shopifyOrder.customer.defaultAddress.address1
    );
    contact.mailingStreet += contact.mailingStreet.length ? " " : "";
    contact.mailingStreet += blankDataValidation(
      shopifyOrder.customer.defaultAddress.address2
    );
    contact.mailingCity = blankDataValidation(
      shopifyOrder.customer.defaultAddress.city
    );
    contact.mailingState = blankDataValidation(
      shopifyOrder.customer.defaultAddress.province
    );
    contact.mailingPostalCode = blankDataValidation(
      shopifyOrder.customer.defaultAddress.zip
    );
    contact.mailingCountry = blankDataValidation(
      shopifyOrder.customer.defaultAddress.country
    );
  }

  if (
    capsuleAccount.clientCustomerId.length &&
    contact.email &&
    contact.email.length
  ) {
    contact.contactUid = capsuleAccount.recordId + "_" + contact.email;
  }

  if (shopifyOrder.customer) {
    contact.customerId = getShopifyNumericId(
      blankDataValidation(shopifyOrder.customer.id)
    );
  }
  if (shopifyOrder.customer && contact.firstName.length) {
    contact.customerId += "_" + contact.firstName;
  }
  if (shopifyOrder.customer && contact.lastName.length) {
    contact.customerId += "_" + contact.lastName;
  }
  return contact;
}

export function isSameOrderAndShippingCustomer(shopifyOrder) {
  if (shopifyOrder.shippingAddress == null || shopifyOrder.customer == null) {
    return true;
  }

  let customerFirstName =
    shopifyOrder.customer.firstName && shopifyOrder.customer.firstName.length
      ? shopifyOrder.customer.firstName.trim()
      : "";
  let customerLastName =
    shopifyOrder.customer.firstName && shopifyOrder.customer.lastName.length
      ? shopifyOrder.customer.lastName.trim()
      : "";
  let shippingFirstName =
    shopifyOrder.shippingAddress.firstName &&
    shopifyOrder.shippingAddress.firstName.length
      ? shopifyOrder.shippingAddress.firstName.trim()
      : "";
  let shippingLastName =
    shopifyOrder.shippingAddress.lastName &&
    shopifyOrder.shippingAddress.firstName.length
      ? shopifyOrder.shippingAddress.lastName.trim()
      : "";

  return (
    customerFirstName.toUpperCase() === shippingFirstName.toUpperCase() &&
    customerLastName.toUpperCase() === shippingLastName.toUpperCase()
  );
}
