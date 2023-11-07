import {
  SET_SESSION_DATA,
  SET_GENERAL_ERRORS,
  CLEAR_GENERAL_ERRORS,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_AUTHENTICATED,
  SET_UNAUTHENTICATED,
  REACTIVATE_SA,
  DEACTIVATE_SA,
} from "../types";

const initialState = {
  campusData: {},
  adminData: {},
  authenticated: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true,
      };
    case SET_UNAUTHENTICATED:
      return initialState;
    case SET_SESSION_DATA:
      return {
        authenticated: true,
        campusData: { ...action.payload.campus },
        adminData: { ...action.payload.admin },
      };
    case REACTIVATE_SA:
      return {
        ...state,
        campusData: {
          ...state.campusData,
          sa: action.payload.email,
        },
      };
    case DEACTIVATE_SA:
      return {
        ...state,
        campusData: {
          ...state.campusData,
          sa: "",
        },
      };
    default:
      return state;
  }
}
