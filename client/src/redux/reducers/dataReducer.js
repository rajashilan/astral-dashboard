import {
  SET_ADMINS,
  SET_UPDATED_ADMIN_ROLE,
  SET_NEW_ADMIN_LINK,
  CLEAR_NEW_ADMIN_LINK,
  SET_DEPARTMENTS,
  LOADING_DATA,
  STOP_LOADING_DATA,
} from "../types";

const initialState = {
  admins: [],
  departments: {},
  loading: false,
  newAdminLink: "",
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
    case SET_NEW_ADMIN_LINK:
      return {
        ...state,
        newAdminLink: `http://localhost:3000/${action.payload.campusID}/${action.payload.linkID}/2`,
      };
    case CLEAR_NEW_ADMIN_LINK:
      return {
        ...state,
        newAdminLink: "",
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
