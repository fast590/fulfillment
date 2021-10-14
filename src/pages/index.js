import React from "react";
import { Page, Layout } from "@shopify/polaris";
import FulfillmentProductList from "./components/FulfillmentProductList";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

function Index(props) {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Page
      primaryAction={{
        content: "Add Products",
        onAction: () => {
          redirect.dispatch(
            Redirect.Action.ADMIN_PATH,
            "/bulk?resource_name=Product" +
              "&edit=variants.fulfillment_service" +
              "&show=&ids=&app_context=" +
              "&metafield_titles=&metafield_options="
          );
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <FulfillmentProductList shopOrigin={props.shopOrigin} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Index;
