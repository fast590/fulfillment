import store from "store-js";
import superagent from "superagent";
import config from "../config";
const SALESFORCE_API_URL = config.app.salesforce_api_url;

async function getCustomers(auth, queryParams = null) {
  try {
    let res = await superagent
      .get(SALESFORCE_API_URL + "/customers")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .query(queryParams ? queryParams : {});

    if (res.body.totalCount == 1) {
      return res.body.results[0];
    }

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "NO_RESULTS_FOUND":
          break;
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error getting customer: ", err.message, err);
    }
  }
  return null;
}
async function createCustomers(auth, data) {
  try {
    let res = await superagent
      .post(SALESFORCE_API_URL + "/customers")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .send(data);

    if (Array.isArray(res.body) && res.body.length == 1) {
      return res.body[0];
    }

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "DUPLICATES_DETECTED":
        case "CANNOT_CHANGE_RECORD":
          return getCustomers(auth, {
            clientCustomerId: data.clientCustomerId,
          });
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error creating customer: ", err.message, err);
    }
  }
  return null;
}
async function updateCustomer(auth, recordId, data) {
  try {
    let res = await superagent
      .put(SALESFORCE_API_URL + `/customers?recordId=${recordId}`)
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .send(data);

    return res.body;
  } catch (err) {
    console.error(err.message, err);
  }
  return null;
}
async function upsertCustomer(auth, data) {
  let customer = await getCustomers(auth, {
    clientCustomerId: data.clientCustomerId,
  });
  if (customer == null) {
    customer = await createCustomers(auth, data);
    return customer;
  } else if (
    data.clientCustomerId != customer.clientCustomerId &&
    data.firstName != customer.firstName &&
    data.lastName != customer.lastName &&
    data.shippingStreet != customer.shippingStreet &&
    data.shippingCity != customer.shippingCity &&
    data.shippingPostalCode != customer.shippingPostalCode &&
    data.shippingState != customer.shippingState &&
    data.shippingCountry != customer.shippingCountry &&
    data.email != customer.email &&
    data.phone != customer.phone
  ) {
    return customer;
  }
  customer = await updateCustomer(auth, customer.recordId, data);

  return customer;
}

async function getAccounts(auth, queryParams = null) {
  try {
    let res = await superagent
      .get(SALESFORCE_API_URL + "/accounts")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .query(queryParams ? queryParams : {});

    if (res.body.totalCount == 1) {
      return res.body.results[0];
    }

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "NO_RESULTS_FOUND":
          break;
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error getting accounts: ", err.message, err);
    }
  }
  return null;
}
async function createAccounts(auth, data) {
  try {
    let res = await superagent
      .post(SALESFORCE_API_URL + "/accounts")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .send(data);

    if (Array.isArray(res.body) && res.body.length == 1) {
      return res.body[0];
    }

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "DUPLICATES_DETECTED":
        case "CANNOT_CHANGE_RECORD":
          return getContacts(auth, {
            clientCustomerId: data.clientCustomerId,
          });
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error creating account: ", err.message, err);
    }
  }
  return null;
}
async function updateAccount(auth, recordId, data) {
  try {
    let res = await superagent
      .put(SALESFORCE_API_URL + `/accounts?recordId=${recordId}`)
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .send(data);

    return res.body;
  } catch (err) {
    console.error(err.message, err);
  }
  return null;
}
async function upsertAccount(auth, data) {
  let account = await getAccounts(auth, {
    clientCustomerId: data.clientCustomerId,
  });

  if (account == null) {
    account = await createAccounts(auth, data);
    // console.log("Here 1 >>> ", account);
    return account;
  } else if (
    data.clientCustomerId === account.clientCustomerId &&
    data.name === account.name &&
    data.mailingStreet === account.mailingStreet &&
    data.mailingCity === account.mailingCity &&
    data.mailingPostalCode === account.mailingPostalCode &&
    data.mailingState === account.mailingState &&
    data.mailingCountry === account.mailingCountry &&
    data.phone === account.phone
  ) {
    // console.log("Here 2 >>> ", account);
    return account;
  }
  account = await updateAccount(auth, account.recordId, data);
  // console.log("Here 3 >>> ", account);

  return account;
}

async function getContacts(auth, queryParams = null) {
  try {
    let res = await superagent
      .get(SALESFORCE_API_URL + "/contacts")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .query(queryParams ? queryParams : {});

    if (res.body.totalCount == 1) {
      return res.body.results[0];
    }

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "NO_RESULTS_FOUND":
          break;
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error getting contacts: ", err.message, err);
    }
  }
  return null;
}
async function createContacts(auth, data) {
  try {
    let res = await superagent
      .post(SALESFORCE_API_URL + "/contacts")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .send(data);

    if (Array.isArray(res.body) && res.body.length == 1) {
      return res.body[0];
    }

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "DUPLICATES_DETECTED":
        case "CANNOT_CHANGE_RECORD":
          return getContacts(auth, {
            customerAccountId: data.customerAccountId,
            firstName: data.firstName,
            lastName: data.lastName,
          });
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error creating cibtact: ", err.message, err);
    }
  }
  return null;
}
async function updateContact(auth, recordId, data) {
  try {
    let res = await superagent
      .put(SALESFORCE_API_URL + `/contacts?recordId=${recordId}`)
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .send(data);

    return res.body;
  } catch (err) {
    console.error(err.message, err);
  }
  return null;
}

async function upsertContact(auth, account, data) {
  let contact = await getContacts(auth, {
    q: `{"$and": [{"customerAccountId": "${account.recordId}"},{"$or": [{"customerId":"${data.customerId}"},{"contactUid":"${data.contactUid}"}]}]}`,
  });
  if (contact == null) {
    contact = await createContacts(auth, data);
    // console.log("Here 1 >>> ", contact);
    return contact;
  } else if (
    data.customerId === contact.customerId &&
    data.contactUid === contact.contactUid &&
    data.firstName === contact.firstName &&
    data.lastName === contact.lastName &&
    data.shippingStreet === account.shippingStreet &&
    data.shippingCity === account.shippingCity &&
    data.shippingPostalCode === account.shippingPostalCode &&
    data.shippingState === account.shippingState &&
    data.shippingCountry === account.shippingCountry &&
    data.phone === contact.phone
  ) {
    // console.log("Here 2 >>> ", contact);
    return contact;
  }

  contact = await updateContact(auth, contact.recordId, data);
  // console.log("Here 3 >>> ", contact);
  return contact;
}

async function getOrders(auth, queryParams = null) {
  try {
    let res = await superagent
      .get(SALESFORCE_API_URL + "/orders")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .query(queryParams ? queryParams : {});

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "NO_RESULTS_FOUND":
          break;
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error: ", err);
    }
  }

  return [];
}
async function createOrder(auth, orderRequest) {
  try {
    let res = await superagent
      .post(SALESFORCE_API_URL + "/orders")
      .query({ source: "Shopify App" })
      .send(orderRequest)
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`);

    return res.body[0];
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "DUPLICATES_DETECTED":
          break;
        default:
          console.error("Error: ", err);
          break;
      }
    } else {
      console.error("Error creating customer: ", err.message, err);
    }
  }
  return null;
}
async function updateOrder(auth, recordId, orderRequest) {
  try {
    let res = await superagent
      .put(SALESFORCE_API_URL + "/orders")
      .query({ recordId: recordId })
      .send(orderRequest)
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`);

    return res.body[0];
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "DUPLICATES_DETECTED":
          break;
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error: ", err);
    }
  }
  return null;
}

async function createOrderLines(auth, orderLinesRequest) {
  try {
    let res = await superagent
      .post(SALESFORCE_API_URL + "/orderlines")
      .send(orderLinesRequest)
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`);
    return res.body;
  } catch (err) {
    console.error("Error creating order", orderLinesRequest);
    console.error("Error response", err.response);
    console.error("Error message", err.message);
  }
  return null;
}
async function getFormularies(auth, queryParams = null, returnErrors = false) {
  try {
    let res = await superagent
      .get(SALESFORCE_API_URL + "/formularies")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .query(queryParams ? queryParams : {});

    return res.body.results;
  } catch (err) {
    if (returnErrors) {
      return err;
    }
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "NO_RESULTS_FOUND":
          break;
        default:
          console.error(err.message, err.response.body);
          break;
      }
    } else {
      console.error("Error: ", err);
    }
  }
  return [];
}

async function getProducts(auth, queryParams = null) {
  try {
    let res = await superagent
      .get(SALESFORCE_API_URL + "/products")
      .set("Content-Type", "application/json")
      .set("X-User", `${auth.username}`)
      .set("Authorization", `apiKey ${auth.apikey}`)
      .query(queryParams ? queryParams : {});

    return res.body.results;
  } catch (err) {
    if (err.message == "Bad Request") {
      switch (err.response.body.error.errorCode) {
        case "NO_RESULTS_FOUND":
          break;
        default:
          console.error("Error: ", err);
          break;
      }
    } else if (err.message == "Forbidden") {
    } else {
      console.error("Error getting Product: ", err.response.body.error);
    }
  }
  return [];
}

export default {
  getCustomers,
  createCustomers,
  updateCustomer,
  upsertCustomer,

  getAccounts,
  createAccounts,
  updateAccount,
  upsertAccount,

  getContacts,
  createContacts,
  updateContact,
  upsertContact,

  getOrders,
  createOrder,
  updateOrder,
  createOrderLines,
  getFormularies,
  getProducts,
};
