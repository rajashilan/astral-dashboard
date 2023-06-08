import {
  SET_ADMINS,
  SET_UPDATED_ADMIN_ROLE,
  SET_DEPARTMENTS,
  LOADING_DATA,
  STOP_LOADING_DATA,
  SET_GENERAL_ERRORS,
  CLEAR_GENERAL_ERRORS,
} from "../types";
import axios from "axios";

export const getAdminsForCampus = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  const campusID = localStorage.getItem("AdminCampus");
  axios
    .get(`/admins/${campusID}`)
    .then((res) => {
      dispatch({ type: SET_ADMINS, payload: res.data });
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
    })
    .catch((error) => {
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error.response.data.error,
      });
      console.error(error);
      dispatch({ type: STOP_LOADING_DATA });
    });
};

export const getDepartmentsForCampus = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  const campusID = localStorage.getItem("AdminCampus");
  axios
    .get(`/departments/${campusID}`)
    .then((res) => {
      dispatch({ type: SET_DEPARTMENTS, payload: res.data });
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
    })
    .catch((error) => {
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error.response.data.error,
      });
      console.error(error);
      dispatch({ type: STOP_LOADING_DATA });
    });
};

export const updateAdminsRole = (data) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .post(`/admin-role/${campusID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: SET_UPDATED_ADMIN_ROLE, payload: data });
      alert("Admin role updated");
    })
    .catch((error) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error.response.data.error,
      });
      console.error(error);
    });
};
