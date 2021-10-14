import React, { useEffect, useState } from "react";
import {
  MediaCard,
  EmptyState,
  List,
  TextContainer,
  Heading,
  Spinner,
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Layout,
  Pagination,
  Banner,
  Link,
} from "@shopify/polaris";
import { ProductsMajor } from "@shopify/polaris-icons";
import { gql, useQuery } from "@apollo/client";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import localStorage from "store-js";
import request from "superagent";
import config from "../../server/config";
import { getShopifyNumericId } from "../../server/utils";
const img = "https://img.okcapsule.com/Shopify%20Assets/SetupGuide.png";

const GET_PRODUCTS = gql`
  query ProductVariantFeed(
    $first: Int
    $last: Int
    $before: String
    $after: String
    $query: String
  ) {
    productVariants(
      first: $first
      last: $last
      before: $before
      after: $after
      query: $query
      sortKey: NAME
    ) {
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          product {
            id
            title
            tags
            featuredImage {
              src
              altText
            }
            metafields(namespace: "${config.app.namespace}", first: 10) {
              edges {
                node {
                  id
                  key
                  value
                  valueType
                }
              }
            }
          }
          inventoryItem {
            id
            unitCost {
              amount
            }
          }
        }
      }
    }
  }
`;

function FulfillmentProductList(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState();
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const renderResourceItem = (item) => {
    const image = item.node.product.featuredImage
      ? item.node.product.featuredImage
      : { src: ProductsMajor, altText: item.node.product.title };
    const media = (
      <Thumbnail
        source={image.src}
        alt={image.altText ? image.altText : item.node.product.title}
        size="large"
      />
    );
    const metafieldsMap = {};

    for (const metafield of item.node.product.metafields.edges) {
      metafieldsMap[metafield.node.key] = metafield.node.value;
    }

    return (
      <ResourceList.Item
        id={item.node.product.id}
        media={media}
        accessibilityLabel={`View details for ${item.node.product.title}`}
        onClick={() => {
          localStorage.set("item", item.node);
          redirect.dispatch(Redirect.Action.APP, "/edit-product");
        }}
      >
        <Stack>
          <Stack.Item fill>
            <h3 className="resource-list-item-heading">
              <TextStyle variation="strong">
                {item.node.product.title}
              </TextStyle>
            </h3>
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <p className="capitalize">
              <strong>Is Supplement Pack:</strong>{" "}
              {metafieldsMap.formulary
                ? metafieldsMap.formulary.includes(",")
                  ? "Yes"
                  : "No"
                : ""}
            </p>
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <p className="capitalize">
              <strong>Formularies:</strong> {metafieldsMap.formulary}
            </p>
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <p className="capitalize">
              <strong>Time of Administration:</strong>{" "}
              {metafieldsMap.timeOfAdministration}
            </p>
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <p className="capitalize">
              <strong>Serving Size:</strong> {metafieldsMap.servingSize}
            </p>
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <p className="capitalize">
              <strong>Capsule Cost:</strong>{" "}
              {item.node.inventoryItem.unitCost
                ? item.node.inventoryItem.unitCost.amount
                : ""}
            </p>
          </Stack.Item>
        </Stack>
      </ResourceList.Item>
    );
  };
  const renderLoading = () => {
    return (
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
    );
  };
  const loadAsyncData = async () => {
    try {
      const shopResponse = await request
        .get("/api/shop?shop=" + props.shopOrigin)
        .type("application/json");
      setShop(shopResponse.body);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAsyncData();
  }, []);

  const recordsToLoad = 5;
  let productQuery = `location_id:${
    shop ? getShopifyNumericId(shop.FulfillmentLocationId) : ""
  }`;

  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: {
      first: recordsToLoad,
      query: productQuery,
    },
    pollInterval: 500,
    fetchPolicy: "cache-and-network",
  });

  if (isLoading || loading || !data) {
    return renderLoading();
  }

  if (error) {
    return (
      <Banner title={error.message} status="critical">
        <p>{error.stack}</p>
      </Banner>
    );
  }

  if (data && !data.productVariants.edges.length) {
    return <EmptyList />;
  }

  return (
    <Card sectioned>
      <ResourceList
        showHeader
        resourceName={{ singular: "Product", plural: "Products" }}
        items={data.productVariants.edges}
        renderItem={renderResourceItem}
      />

      {(data.productVariants.pageInfo.hasPreviousPage ||
        data.productVariants.pageInfo.hasNextPage) && (
        <div className="resource-list-footer">
          <Stack
            alignment="center"
            distribution="equalSpacing"
            vertical={true}
            spacing="loose"
          >
            <Pagination
              hasPrevious={data.productVariants.pageInfo.hasPreviousPage}
              previousKeys={[74]}
              previousTooltip="Previous (J)"
              onPrevious={async () => {
                const startCursor = data.productVariants.edges[0].cursor;
                await fetchMore({
                  query: GET_PRODUCTS,
                  variables: {
                    last: recordsToLoad,
                    before: startCursor,
                    query: productQuery,
                  },
                  updateQuery: (previousResult, { fetchMoreResult }) => {
                    return fetchMoreResult;
                  },
                });
              }}
              hasNext={data.productVariants.pageInfo.hasNextPage}
              nextKeys={[75]}
              nextTooltip="Next (K)"
              onNext={async () => {
                const endCursor = data.productVariants.edges.slice(-1)[0]
                  .cursor;
                await fetchMore({
                  query: GET_PRODUCTS,
                  variables: {
                    first: recordsToLoad,
                    after: endCursor,
                    query: productQuery,
                  },
                  updateQuery: (previousResult, { fetchMoreResult }) => {
                    return fetchMoreResult;
                  },
                });
              }}
            />
          </Stack>
        </div>
      )}
    </Card>
  );
}

function EmptyList(props) {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Card sectioned title="Let's add your Products">
      <TextContainer spacing="tight">
        <div className="setup-steps-list">
          <List type="bullet">
            <List.Item>
              Go to the Settings tab and enter your {config.app.company_name}{" "}
              API credentials and Brand Id information
            </List.Item>
            <List.Item>
              Click the Add Products button on the Products tab to change the
              Fulfillment Service to “{config.app.fulfillment_service_name}” for
              the supplements you’d like us to fulfill.
            </List.Item>
            <List.Item>
              In the app click on your products and configure them according to
              your needs
            </List.Item>
            <List.Item>You are ready to order!</List.Item>
          </List>
        </div>
      </TextContainer>
      <div className="image-container">
        <img src={img} />
      </div>
    </Card>
  );
}
export default FulfillmentProductList;
