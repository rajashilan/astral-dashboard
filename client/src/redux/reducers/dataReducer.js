import {
  SET_ADMINS,
  SET_DEPARTMENTS,
  LOADING_DATA,
  STOP_LOADING_DATA,
} from "../types";

const initialState = {
  admins: [],
  departments: {},
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_ADMINS:
      return {
        ...state,
        admins: [...action.payload],
      };
    case SET_DEPARTMENTS:
      return {
        ...state,
        departments: { ...action.payload },
      };
    case LOADING_DATA:
      return {
        ...state,
        loading: true,
      };
    case STOP_LOADING_DATA:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}
