import React, { useEffect, useState, useCallback } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  TextField,
  Frame,
  Toast,
  Spinner,
} from "@shopify/polaris";
import localStorage from "store-js";
import request from "superagent";
import config from "../server/config";
import capsuleApi from "../server/helpers/capsuleApiHelper";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    console.log("props => ", props);
    console.log("props.shopOrigin => ", props.shopOrigin);
    this.state = {
      origin: props.shopOrigin,
      username: "",
      apikey: "",
      brandid: "",
      isValidConnection: false,
      toggleSavedMessage: false,
      toggleErrorMessage: false,
      isLoading: false,
      errorMessage: "API Credentials Invalid",
    };
  }
  /* 
      Is invoked immediately after a component is mounted (inserted into the tree). 
      Initialization that requires DOM nodes should go here. 
      If you need to load data from a remote endpoint, 
      this is a good place to instantiate the network request.
  */
  async componentDidMount() {
    let auth = {
      username: "",
      apikey: "",
    };

    try {
      this.setState({ isLoading: true });
      const settingResponse = await request
        .get("/api/setting")
        .query({ shop: this.state.origin })
        .type("application/json");
      const setting = settingResponse.body;
      if (setting) {
        auth = {
          username: setting.CapsuleUsername,
          apikey: setting.CapsuleApiKey,
        };

        this.setState({
          username: setting.CapsuleUsername,
          apikey: setting.CapsuleApiKey,
          brandid: setting.CapsuleBrandId,
        });
      }
    } catch (error) {
      if (config.app.is_development) {
        console.error(error);
      }
    }
    this.setState({ isLoading: false });
  }

  /* 
      Is invoked immediately after updating occurs. This method is not called for the initial render.
  */
  async componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    const {
      username,
      apikey,
      brandid,
      toggleSavedMessage,
      toggleErrorMessage,
    } = this.state;

    let toastMarkup = toggleSavedMessage ? (
      <Frame>
        <Toast
          content="Settings Saved"
          duration={1500}
          onDismiss={() => {
            this.setState({ toggleSavedMessage: false });
          }}
        />
      </Frame>
    ) : null;

    let toastErrorMarkup = toggleErrorMessage ? (
      <Frame>
        <Toast
          content={this.state.errorMessage}
          error
          duration={1500}
          onDismiss={() => {
            this.setState({ toggleErrorMessage: false });
          }}
        />
      </Frame>
    ) : null;
    return (
      <Page>
        <Layout>
          <Layout.AnnotatedSection
            title={`${config.app.company_name} API Credentials`}
            description={`Enter your ${config.app.company_name} client portal User Name, API Key, and Brand Id to connect your Shop and ${config.app.company_name} Account.`}
          >
            <Card sectioned>
              {this.state.isLoading ? (
                <div style={{ textAlign: "center" }}>
                  <Spinner accessibilityLabel="Loading" size="large" />
                </div>
              ) : (
                <Form onSubmit={this.handleSubmit}>
                  <FormLayout>
                    <TextField
                      value={username}
                      onChange={this.handleChange("username")}
                      label="Username"
                      type="text"
                    />
                    <TextField
                      value={apikey}
                      onChange={this.handleChange("apikey")}
                      label="API Key"
                      type="text"
                    />
                    <TextField
                      value={brandid}
                      onChange={this.handleChange("brandid")}
                      label="Brand Id"
                      type="text"
                    />
                    <Stack distribution="trailing">
                      <Button primary submit disabled={this.state.isLoading}>
                        Save
                      </Button>
                    </Stack>
                  </FormLayout>
                </Form>
              )}
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
        {toastMarkup}
        {toastErrorMarkup}
      </Page>
    );
  }

  handleSubmit = async () => {
    const { username, apikey, brandid, origin } = this.state;
    let auth = {
      username: username,
      apikey: apikey,
    };
    this.setState({ isLoading: true });

    try {
      const capsuleResult = await capsuleApi.getFormularies(
        auth,
        {
          brandId: this.state.brandid,
        },
        true
      );
      if (!Array.isArray(capsuleResult)) {
        if (capsuleResult.response.body.error?.errorCode == "INVALID_FILTER") {
          this.setState({
            errorMessage: "Invalid Brand Id",
          });
        } else {
          this.setState({
            errorMessage: "API Credentials Invalid",
          });
        }
      }
      this.setState({
        isValidConnection: Array.isArray(capsuleResult) && capsuleResult.length,
      });
    } catch (error) {
      if (config.app.is_development) {
        console.error(error);
      }
    }

    this.setState({
      toggleErrorMessage: !this.state.isValidConnection,
    });

    if (this.state.isValidConnection) {
      try {
        console.log({
          ShopDomain: origin,
          CapsuleUsername: username,
          CapsuleApiKey: apikey,
          CapsuleBrandId: brandid,
        });
        const settingResponse = await request
          .post("/api/setting")
          .type("application/json")
          .send({
            ShopDomain: origin,
            CapsuleUsername: username,
            CapsuleApiKey: apikey,
            CapsuleBrandId: brandid,
          });
        const setting = settingResponse.body;
        if (setting) {
          this.setState({
            username: setting.CapsuleUsername,
            apikey: setting.CapsuleApiKey,
            brandid: setting.CapsuleBrandId,
            toggleSavedMessage: true,
          });
        }
      } catch (error) {
        this.setState({
          toggleSavedMessage: false,
        });
        if (config.app.is_development) {
          console.error(error);
        }
      }
    }
    this.setState({ isLoading: false });
  };

  handleChange = (field) => {
    return (value) => this.setState({ [field]: value ? value.trim() : "" });
  };
}

export default Settings;
