import {
  SET_GENERAL_ERRORS,
  CLEAR_GENERAL_ERRORS,
  LOADING_UI,
  STOP_LOADING_UI,
} from "../types";

const initialState = {
  loading: false,
  error: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOADING_UI:
      return {
        ...state,
        loading: true,
      };
    case STOP_LOADING_UI:
      return {
        ...state,
        loading: false,
      };
    case SET_GENERAL_ERRORS:
      return {
        ...state,
        error: action.payload,
      };
    case CLEAR_GENERAL_ERRORS:
      return {
        ...state,
        error: "",
      };
    default:
      return state;
  }
}
