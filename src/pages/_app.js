import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import App from "next/app";
import { AppProvider, FooterHelp, Link } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import ClientRouter from "./components/ClientRouter";
import RoutePropagator from "./components/RoutePropagator";
import "../pages/styles.css";

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") ===
        "1" ||
      response.status === 401
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}

function MyProvider(props) {
  const app = useAppBridge();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      credentials: "include",
      headers: {
        "Content-Type": "application/graphql",
      },
      fetch: userLoggedInFetch(app),
    }),
  });
  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

class MyApp extends App {
  render() {
    const { Component, host } = this.props;
    const config = {
      apiKey: API_KEY,
      host: host,
      forceRedirect: true,
    };
    console.log(host);
    let pageProps = this.props.pageProps;
    let shopOrigin = Buffer.from(host ? host : "", "base64")
      .toString("utf-8")
      .replace(/\/admin/, "");
    if (!pageProps) {
      pageProps = {};
    }
    if (this.props.host) {
      pageProps.host = this.props.host;
    }
    if (shopOrigin) {
      pageProps.shopOrigin = shopOrigin;
    }

    return (
      <AppProvider i18n={translations}>
        <Provider config={config}>
          <ClientRouter />
          <MyProvider Component={Component} {...pageProps} />
        </Provider>
        <FooterHelp>
          For questions or additional assistance, please contact{" "}
          <a
            className="Polaris-Link"
            href="mailto:clientsuccess@okcapsule.com"
            target="_blank"
          >
            clientsuccess@okcapsule.com
          </a>
        </FooterHelp>
      </AppProvider>
    );
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  let host = ctx.query.host;
  console.log("host : ", host);
  if (!host && typeof window === "object" && window.__NEXT_DATA__) {
    host = window.__NEXT_DATA__.query.host || window.__NEXT_DATA__.props.host;
  }

  return {
    host: host,
  };
};

export default MyApp;
