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

const app = firebase.initializeApp(config);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(
    "6LfrRcIpAAAAAL9YTE9wZwWLXpNPcaSWL1TWU3e-"
  ),
  isTokenAutoRefreshEnabled: true,
});

const getAppCheckToken = async () => {
  let appCheckTokenResponse;
  try {
    appCheckTokenResponse = await getToken(appCheck, /* forceRefresh= */ false);
  } catch (err) {
    console.error(err);
    return;
  }

  axios.interceptors.request.use(
    (config) => {
      config.headers["X-Firebase-AppCheck"] = appCheckTokenResponse.token;
      return config;
    },
    (error) => {
      console.error(error);
      return Promise.reject(error);
    }
  );
};

getAppCheckToken().then(() => {
  const token = localStorage.FBIdToken;

  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      store.dispatch(logoutUser());
    } else {
      store.dispatch({
        type: SET_AUTHENTICATED,
      });
      axios.defaults.headers.common["Authorization"] = token;
      store.dispatch(getSessionData());
    }
  }
});

// Periodically check token validity every 5 minutes
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
