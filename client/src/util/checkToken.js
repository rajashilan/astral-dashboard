import jwtDecode from "jwt-decode";
import { logoutUser } from "../redux/actions/userActions";
import store from "../redux/store";

export const checkToken = () => {
  const token = localStorage.FBIdToken;
  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      alert("Session expired, you will be redirected to login");
      store.dispatch(logoutUser());
    }
  } else {
    alert("Session expired, you will be redirected to login");
    store.dispatch(logoutUser());
  }
};
