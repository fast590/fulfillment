import React from "react";
import { withRouter } from "next/router";
import { RoutePropagator as AppBridgeRoutePropagator } from "@shopify/app-bridge-react";

function RoutePropagator(props) {
  const { route } = props;
  return <AppBridgeRoutePropagator location={route} />;
}

export default withRouter(RoutePropagator);
