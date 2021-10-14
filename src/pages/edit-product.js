import React, { useEffect, useState, useCallback } from "react";
import {
  Banner,
  Card,
  ChoiceList,
  DisplayText,
  Form,
  FormLayout,
  Frame,
  Layout,
  Page,
  PageActions,
  TextField,
  Toast,
  Spinner,
} from "@shopify/polaris";
import { gql, useMutation } from "@apollo/client";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import localStorage from "store-js";
import request from "superagent";
import config from "../server/config";
import capsuleApi from "../server/helpers/capsuleApiHelper";

const UPDATE_PRODUCT = gql`
  mutation updateProduct(
    $productInput: ProductInput!
    $inventoryId: ID!
    $inventoryItemInput: InventoryItemUpdateInput!
  ) {
    m1: productUpdate(input: $productInput) {
      product {
        id
        tags
        metafields(namespace: "okcapsule", first: 4) {
          edges {
            node {
              id
              namespace
              key
              value
              valueType
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
    m2: inventoryItemUpdate(id: $inventoryId, input: $inventoryItemInput) {
      inventoryItem {
        id
        unitCost {
          amount
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function EditProduct(props) {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [productVariant, setProductVariant] = useState();
  const [shopOrigin, setShopOrigin] = useState(props.shopOrigin);
  const [formularies, setFormularies] = useState([]);
  const [selectedFormularies, setSelectedFormularies] = useState([]);
  const [setting, setSetting] = useState();
  const [servingSize, setServingSize] = useState(1);
  const [selectedToa, setSelectedToa] = useState(["Morning"]);
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const handleChoiceChange = useCallback((value) => {
    if (value.length <= 8) {
      setSelectedFormularies(value);
    }
  }, []);
  const handleToaChange = useCallback((value) => {
    if (value.length >= 1) {
      setSelectedToa(value);
    }
  }, []);
  const handleServingSizeChange = useCallback(
    (value) =>
      typeof value === "string" ? setServingSize(parseInt(value)) : value,
    []
  );
  const showError = (
    errorTitle = "Error",
    errorMessage = "Unexpected Error has ocurred"
  ) => {
    return (
      <Page fullWidth>
        <Banner title={errorTitle} status="critical">
          <p>{errorMessage}</p>
        </Banner>
      </Page>
    );
  };
  const [updateProduct, { loading, error, data }] = useMutation(
    UPDATE_PRODUCT,
    {
      onCompleted: (data) => redirect.dispatch(Redirect.Action.APP, "/"),
      onError: (error) => console.error("Error running mutation", error),
    }
  );
  const pageActions = () => {
    return (
      <PageActions
        primaryAction={[
          {
            content: "Save",
            onAction: () => {
              let metafieldIds = {};
              for (const metafield of productVariant.product.metafields.edges) {
                metafieldIds[metafield.node.key] = metafield.node.id;
              }
              let tags = [];
              if (
                productVariant.product.tags &&
                !productVariant.product.tags.includes(
                  config.app.fulfillment_service_name
                )
              ) {
                productVariant.product.tags.push(
                  config.app.fulfillment_service_name
                );
              }

              let requestData = {
                variables: {
                  productInput: {
                    id: productVariant.product.id,
                    tags: productVariant.product.tags,
                    metafields: [
                      {
                        id: metafieldIds.hasOwnProperty("formulary")
                          ? metafieldIds.formulary
                          : null,
                        namespace: config.app.namespace,
                        key: "formulary",
                        value:
                          selectedFormularies && selectedFormularies.length
                            ? selectedFormularies.join(",")
                            : null,
                        valueType: "STRING",
                      },
                      {
                        id: metafieldIds.hasOwnProperty("timeOfAdministration")
                          ? metafieldIds.timeOfAdministration
                          : null,
                        namespace: config.app.namespace,
                        key: "timeOfAdministration",
                        value:
                          selectedToa && selectedToa.length
                            ? selectedToa.join(",")
                            : "",
                        valueType: "STRING",
                      },
                      {
                        id: metafieldIds.hasOwnProperty("servingSize")
                          ? metafieldIds.servingSize
                          : null,
                        namespace: config.app.namespace,
                        key: "servingSize",
                        value: servingSize ? servingSize.toString() : "",
                        valueType: "STRING",
                      },
                    ],
                  },
                  inventoryId: productVariant.inventoryItem.id,
                  inventoryItemInput: {
                    cost: calculatedCost,
                  },
                },
              };
              updateProduct(requestData);
            },
          },
        ]}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              redirect.dispatch(Redirect.Action.APP, "/");
            },
          },
        ]}
      />
    );
  };

  const loadAsyncData = async () => {
    try {
      let variant = localStorage.get("item");
      console.log("props.shopOrigin => ", props.shopOrigin);
      setProductVariant(variant);

      const settingResponse = await request
        .get("/api/setting")
        .query({ shop: shopOrigin })
        .type("application/json");
      setSetting(settingResponse.body);

      if (settingResponse.body && settingResponse.body.CapsuleUsername) {
        let records = await capsuleApi.getFormularies(
          {
            username: settingResponse.body.CapsuleUsername,
            apikey: settingResponse.body.CapsuleApiKey,
          },
          { brandId: settingResponse.body.CapsuleBrandId }
        );

        if (variant && variant.product.metafields.edges.length) {
          let validated = [];
          let values = [];

          for (const metafield of variant.product.metafields.edges) {
            validated = [];
            values = metafield.node.value.split(",");
            switch (metafield.node.key) {
              case "formulary":
                for (const record of records) {
                  if (values.includes(record.name)) {
                    validated.push(record.name);
                  }
                }
                setSelectedFormularies(validated);
                break;
              case "timeOfAdministration":
                for (const toa of ["Morning", "Midday", "Evening"]) {
                  if (values.includes(toa)) {
                    validated.push(toa);
                  }
                }
                setSelectedToa(validated.length ? validated : ["Morning"]);
                break;
              case "servingSize":
                setServingSize(
                  /\d+/.test(metafield.node.value) ? metafield.node.value : "1"
                );
                break;
            }
          }
        }

        setFormularies(records);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      await setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAsyncData();
  }, []);

  useEffect(() => {
    let cost = 0;
    let filteredFormularies = formularies.filter((formulary) => {
      return selectedFormularies.includes(formulary.name);
    });
    for (const formulary of filteredFormularies) {
      cost += formulary.clientPricePerPill * 30 * servingSize;
    }
    setCalculatedCost(cost.toFixed(2));
  }, [selectedFormularies, servingSize, formularies]);

  if (isLoading || loading || data) {
    return (
      <Page fullWidth>
        <div className="Polaris-Layout">
          <div
            className="Polaris-Layout__Section"
            style={{ textAlign: "center" }}
          >
            <Card sectioned>
              <Spinner accessibilityLabel="Loading" size="large" />
            </Card>
          </div>
        </div>
      </Page>
    );
  } else if (!setting) {
    return showError(
      undefined,
      "Unable to Setup Products. Please configure your App Settings first."
    );
  } else if (!formularies.length) {
    return showError(
      undefined,
      "There are no Formularies Available in your Capsule Account"
    );
  }

  const formularyChoices = formularies.map((formulary) => {
    return {
      value: formulary.name,
      label: formulary.productName,
    };
  });

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <DisplayText size="large">{productVariant.product.title}</DisplayText>
          <Form>
            {pageActions()}
            <Card sectioned>
              <FormLayout>
                <FormLayout.Group title="Formularies">
                  <div className="capsule-formularies">
                    <ChoiceList
                      allowMultiple
                      title="If this is a single supplement, select the single matching supplement below. If this is a supplement pack, select up to eight products below."
                      selected={selectedFormularies}
                      onChange={handleChoiceChange}
                      choices={formularyChoices}
                    />
                  </div>
                </FormLayout.Group>
                <FormLayout.Group>
                  <ChoiceList
                    allowMultiple
                    title="Time of administration"
                    selected={selectedToa}
                    onChange={handleToaChange}
                    choices={[
                      { label: "Morning", value: "Morning" },
                      { label: "Midday", value: "Midday" },
                      { label: "Evening", value: "Evening" },
                    ]}
                  />
                </FormLayout.Group>
                <FormLayout.Group>
                  <TextField
                    label="Serving Size"
                    type="number"
                    onChange={handleServingSizeChange}
                    value={servingSize.toString()}
                    min="1"
                    max="4"
                  />
                </FormLayout.Group>
                <FormLayout.Group>
                  <TextField
                    label="Calculated Capsule Cost"
                    type="currency"
                    value={calculatedCost.toString()}
                    disabled
                  />
                </FormLayout.Group>
              </FormLayout>
            </Card>
            {pageActions()}
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default EditProduct;
