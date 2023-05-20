import {
  SET_SESSION_DATA,
  SET_GENERAL_ERRORS,
  CLEAR_GENERAL_ERRORS,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_UNAUTHENTICATED,
} from "../types";
import axios from "axios";

export const loginAdmin = (adminData, navigate) => (dispatch) => {
  dispatch({ type: LOADING_UI });

  axios
    .post("/login", adminData)
    .then((res) => {
      localStorage.setItem("FBIdToken", `Bearer ${res.data.token}`);
      localStorage.setItem("AdminCampus", res.data.campusID);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      dispatch({ type: STOP_LOADING_UI });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch(getSessionData());
      navigate("/");
    })
    .catch((error) => {
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error.response.data.error,
      });
      console.error(error);
      dispatch({ type: STOP_LOADING_UI });
    });
};

export const getSessionData = () => (dispatch) => {
  dispatch({ type: LOADING_UI });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .get(`/session-data/${campusID}`)
    .then((res) => {
      dispatch({ type: SET_SESSION_DATA, payload: res.data });
      dispatch({ type: STOP_LOADING_UI });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
    })
    .catch((error) => {
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error.response.data.error,
      });
      console.error(error);
      dispatch({ type: STOP_LOADING_UI });
    });
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("FBIdToken");
  delete axios.defaults.headers.common["Authorization"];
  dispatch({
    type: SET_UNAUTHENTICATED,
  });
  window.location.replace("/login");
};
