import React from "react";
import config from "../server/config";
import { Page, List, Card, Layout, Link } from "@shopify/polaris";

function Help(props) {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned title="Setup Instructions">
            <div>
              For the latest Instructions and in depth documentation{" "}
              <Link
                external
                url="https://docs.google.com/document/d/1IuMjbbw926XgifZ1QFijVZoUlv0prJ5wh6blPGBL6V4/edit?usp=sharing"
              >
                click here
              </Link>
            </div>
            <div>
              For questions or additional assistance, please contact{" "}
              <Link external url="mailto:clientsuccess@okcapsule.com">
                clientsuccess@okcapsule.com
              </Link>
            </div>
            <Card.Section title="Enter App Settings">
              <List type="number">
                <List.Item>Navigate to the Settings Tab of the App</List.Item>
                <List.Item>
                  Enter the API credentials and Brand Id provided to you by your{" "}
                  {config.app.company_name} Client Success Manager
                </List.Item>
              </List>
              <div className="image-container">
                <img src="https://img.okcapsule.com/Shopify%20Assets/App%20Instructions%20Images/Settings.png" />
              </div>
            </Card.Section>
            <Card.Section title="Add Products to App">
              <List type="number">
                <List.Item>Navigate to the Settings Tab of the App</List.Item>
                <List.Item>
                  If it’s your first time setting up products in the app,
                  navigate to the Products Tab. Then click the "Add Products"
                  button in the upper right hand corner. This will open a Bulk
                  editor screen.
                </List.Item>
                <List.Item>
                  From the Bulk editor, update the Fulfillment service field to{" "}
                  {config.app.fulfillment_service_name} for each product record
                  in the list to be fulfilled through the app. Then click Save.
                </List.Item>
              </List>
              <div className="image-container">
                <img src="https://img.okcapsule.com/Shopify%20Assets/App%20Instructions%20Images/AddProducts.png" />
                <img src="https://img.okcapsule.com/Shopify%20Assets/App%20Instructions%20Images/FulfillmentSelection.png" />
              </div>
            </Card.Section>
            <Card.Section title="Configure Products in App">
              <List type="number">
                <List.Item>
                  Navigate to the Products Tab of the {config.app.name} App. You
                  should see a list of all products set to be fulfilled by{" "}
                  {config.app.company_name} here.
                </List.Item>
                <List.Item>
                  Click into each Product - the pre-populated information is
                  pulling from your brand defaults. Review the following fields
                  on each Product in your app to ensure accuracy:
                  <List type="bullet">
                    <List.Item>
                      Formulary: The Product Name correlating with the Product
                      record you’re reviewing should be checked
                    </List.Item>
                    <List.Item>Time of Administration</List.Item>
                    <List.Item>Serving Size</List.Item>
                  </List>
                </List.Item>
              </List>
              <div className="image-container">
                <img src="https://img.okcapsule.com/Shopify%20Assets/App%20Instructions%20Images/ProductConfiguration.png" />
              </div>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Help;
