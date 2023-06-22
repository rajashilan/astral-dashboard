import {
  SET_ADMINS,
  SET_UPDATED_ADMIN,
  SET_NEW_ADMIN_LINK,
  CLEAR_NEW_ADMIN_LINK,
  SET_DEPARTMENTS,
  LOADING_DATA,
  STOP_LOADING_DATA,
  SET_ORIENTATION_OVERVIEW,
  UPDATE_ORIENTATION_OVERVIEW_TITLE,
  SET_ORIENTATION_PAGES,
  SET_ORIENTATION_PAGE_TITLE,
  SET_ORIENTATION_PAGE_HEADER,
  SET_ORIENTATION_PAGE_CONTENT,
  SET_SUBCONTENT_TITLE,
  SET_SUBCONTENT_CONTENT,
  DELETE_SUBCONTENT,
  DELETE_ORIENTATION_PAGE,
  ADD_ORIENTATION_PAGE,
  ADD_ORIENTATION_POST,
} from "../types";

const initialState = {
  admins: [],
  departments: {},
  orientation: {
    overview: {},
    pages: [],
  },
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
    case SET_UPDATED_ADMIN:
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
    case SET_ORIENTATION_OVERVIEW:
      return {
        ...state,
        orientation: {
          pages: [...state.orientation.pages],
          overview: { ...action.payload },
        },
      };
    case UPDATE_ORIENTATION_OVERVIEW_TITLE:
      return {
        ...state,
        orientation: {
          pages: [...state.orientation.pages],
          overview: {
            ...state.orientation.overview,
            title: action.payload,
          },
        },
      };
    case SET_ORIENTATION_PAGE_TITLE:
      let orientationPageTitleIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );
      state.orientation.pages[orientationPageTitleIndex] = {
        ...state.orientation.pages[orientationPageTitleIndex],
        title: action.payload.title,
      };
      return {
        ...state,
      };
    case SET_ORIENTATION_PAGE_HEADER:
      let orientationPageHeaderIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );
      state.orientation.pages[orientationPageHeaderIndex] = {
        ...state.orientation.pages[orientationPageHeaderIndex],
        header: action.payload.header,
      };
      return {
        ...state,
      };
    case SET_ORIENTATION_PAGE_CONTENT:
      let orientationPageContentIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );
      state.orientation.pages[orientationPageContentIndex] = {
        ...state.orientation.pages[orientationPageContentIndex],
        content: action.payload.content,
      };
      return {
        ...state,
      };
    case SET_SUBCONTENT_TITLE:
      let subcontentPageIndexTitle = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let subcontentIndexTitle = state.orientation.pages[
        subcontentPageIndexTitle
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      state.orientation.pages[subcontentPageIndexTitle].subcontent[
        subcontentIndexTitle
      ] = {
        ...state.orientation.pages[subcontentPageIndexTitle].subcontent[
          subcontentIndexTitle
        ],
        title: action.payload.title,
      };
      return {
        ...state,
      };
    case SET_SUBCONTENT_CONTENT:
      let subcontentPageIndexContent = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let subContentIndexContent = state.orientation.pages[
        subcontentPageIndexContent
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      state.orientation.pages[subcontentPageIndexContent].subcontent[
        subContentIndexContent
      ] = {
        ...state.orientation.pages[subcontentPageIndexContent].subcontent[
          subContentIndexContent
        ],
        content: action.payload.content,
      };
      return {
        ...state,
      };
    case DELETE_SUBCONTENT:
      let deleteSubcontentPageIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let deleteSubcontentIndex = state.orientation.pages[
        deleteSubcontentPageIndex
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      state.orientation.pages[deleteSubcontentPageIndex].subcontent.splice(
        deleteSubcontentIndex,
        1
      );
      return {
        ...state,
      };
    case DELETE_ORIENTATION_PAGE:
      let deleteOrientationPageIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      state.orientation.pages.splice(deleteOrientationPageIndex, 1);
      return {
        ...state,
      };
    case SET_ORIENTATION_PAGES:
      return {
        ...state,
        orientation: {
          overview: { ...state.orientation.overview },
          pages: [...action.payload],
        },
      };
    case ADD_ORIENTATION_PAGE:
      state.orientation.pages.unshift(action.payload);
      return {
        ...state,
      };
    case ADD_ORIENTATION_POST:
      let orientationPageAddPostIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );
      console.log(
        state.orientation.pages[orientationPageAddPostIndex].subcontent
      );
      state.orientation.pages[orientationPageAddPostIndex].subcontent.unshift(
        action.payload
      );
      return {
        ...state,
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
