import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import config from "./util/config";
import firebase from "firebase/compat/app";
import "firebase/compat/app-check";
import {
  initializeAppCheck,
  getToken,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

import { logoutUser, getSessionData } from "./redux/actions/userActions";
import { SET_AUTHENTICATED } from "./redux/types";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { checkToken } from "./util/checkToken";

// Initialize Firebase
const app = firebase.initializeApp(config);

// Initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(
    process.env.REACT_APP_RECAPTCHA_ENTERPRISE_PROVIDER
  ),
  isTokenAutoRefreshEnabled: true,
});

// Function to set up Axios interceptors with App Check token
const setupAxiosInterceptors = async () => {
  try {
    const appCheckTokenResponse = await getToken(appCheck, false);
    axios.interceptors.request.use(
      (config) => {
        config.headers["X-Firebase-AppCheck"] = appCheckTokenResponse.token;
        return config;
      },
      (error) => {
        console.error("Axios request error:", error);
        return Promise.reject(error);
      }
    );
  } catch (err) {
    console.error("App Check token retrieval error:", err);
  }
};

// Check and set up authentication
const setupAuth = () => {
  const token = localStorage.FBIdToken;
  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      store.dispatch(logoutUser());
    } else {
      store.dispatch({ type: SET_AUTHENTICATED });
      axios.defaults.headers.common["Authorization"] = token;
      store.dispatch(getSessionData());
    }
  }
};

// Initialize App Check and setup authentication
setupAxiosInterceptors().then(setupAuth);

// Periodically check token validity
setInterval(() => {
  checkToken();
}, 5 * 60 * 1000);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Performance reporting
reportWebVitals();
