import React from "react";
import { Route, Navigate } from "react-router-dom";

export default function AuthRoute({
  component: Component,
  authenticated,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated === true ? (
          <Navigate replace to="/" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
}
