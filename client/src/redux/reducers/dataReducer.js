import {
  SET_ADMINS,
  SET_UPDATED_ADMIN_ROLE,
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
    case SET_UPDATED_ADMIN_ROLE:
      let index = state.admins.findIndex(
        (admin) => admin.userID === action.payload.userID
      );
      state.admins[index] = action.payload;
      return {
        ...state,
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
