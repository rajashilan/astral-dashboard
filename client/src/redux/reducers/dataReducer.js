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
  SET_SUBCONTENT_IMAGE,
  SET_SUBCONTENT_FILE,
  DELETE_SUBCONTENT_FILE,
  DELETE_ORIENTATION_OVERVIEW_VIDEO,
  UPDATE_ORIENTATION_OVERVIEW_VIDEO,
  DELETE_SUBCONTENT_IMAGE,
  SET_CLUBS,
  APPROVE_CLUB,
  REJECT_CLUB,
  SUSPEND_CLUB,
  REMOVE_SUSPENSION,
  SET_CLUB_ACTIVITIES,
  UPDATE_CLUB_ACTIVITIES,
  SET_A_CLUB,
  RESET_CLUB,
  SET_CLUB_MEMBERS,
  CLEAR_CLUB_MEMBERS,
  CHANGE_CLUB_PRESIDENT,
  SET_APPROVED_CLUBS,
} from "../types";

const initialState = {
  admins: [],
  departments: {},
  orientation: {
    overview: {},
    pages: [],
  },
  clubs: [],
  club: {},
  clubMembers: [],
  approvedClubs: [],
  clubActivities: [],
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
    case SET_SUBCONTENT_IMAGE:
      let subcontentPageIndexImage = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let subcontentIndexImage = state.orientation.pages[
        subcontentPageIndexImage
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      state.orientation.pages[subcontentPageIndexImage].subcontent[
        subcontentIndexImage
      ] = {
        ...state.orientation.pages[subcontentPageIndexImage].subcontent[
          subcontentIndexImage
        ],
        image: [...action.payload.image],
      };
      return {
        ...state,
      };
    case DELETE_SUBCONTENT_IMAGE:
      let subcontentPageIndexImageDelete = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let subcontentImageIndexDelete = state.orientation.pages[
        subcontentPageIndexImageDelete
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      state.orientation.pages[subcontentPageIndexImageDelete].subcontent[
        subcontentImageIndexDelete
      ] = {
        ...state.orientation.pages[subcontentPageIndexImageDelete].subcontent[
          subcontentImageIndexDelete
        ],
        image: [],
      };
      return {
        ...state,
      };
    case SET_SUBCONTENT_FILE:
      let subcontentPageIndexFile = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let subcontentIndexFile = state.orientation.pages[
        subcontentPageIndexFile
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      let temp =
        state.orientation.pages[subcontentPageIndexFile].subcontent[
          subcontentIndexFile
        ].files;

      temp.push(action.payload.data);

      state.orientation.pages[subcontentPageIndexFile].subcontent[
        subcontentIndexFile
      ] = {
        ...state.orientation.pages[subcontentPageIndexFile].subcontent[
          subcontentIndexFile
        ],
        files: [...temp],
      };
      return {
        ...state,
      };
    case DELETE_SUBCONTENT_FILE:
      let deleteSubcontentPageFileIndex = state.orientation.pages.findIndex(
        (page) => page.orientationPageID === action.payload.orientationPageID
      );

      let deleteSubcontentFileIndex = state.orientation.pages[
        deleteSubcontentPageFileIndex
      ].subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === action.payload.subcontentID
      );

      let deleteSubcontentFileTemp =
        state.orientation.pages[deleteSubcontentPageFileIndex].subcontent[
          deleteSubcontentFileIndex
        ].files;

      let subcontentFileToDelete = deleteSubcontentFileTemp.findIndex(
        (file) => file.url === action.payload.url
      );

      deleteSubcontentFileTemp.splice(subcontentFileToDelete, 1);

      let pages = [...state.orientation.pages];

      pages[deleteSubcontentPageFileIndex].subcontent[
        deleteSubcontentFileIndex
      ] = {
        ...pages[deleteSubcontentPageFileIndex].subcontent[
          deleteSubcontentFileIndex
        ],
        files: [...deleteSubcontentFileTemp],
      };
      return {
        ...state,
        orientation: {
          overview: { ...state.orientation.overview },
          pages: [...pages],
        },
      };
    case UPDATE_ORIENTATION_OVERVIEW_VIDEO:
      return {
        ...state,
        orientation: {
          pages: [...state.orientation.pages],
          overview: {
            ...state.orientation.overview,
            videos: [...action.payload.videos],
          },
        },
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
    case SET_CLUBS:
      return {
        ...state,
        clubs: [...action.payload],
      };
    case APPROVE_CLUB:
      let tempApprove = state.clubs;
      let findApproveClubIndex = tempApprove.findIndex(
        (club) => club.clubID === action.payload.clubID
      );
      tempApprove[findApproveClubIndex] = action.payload;
      return {
        ...state,
        clubs: [...tempApprove],
      };
    case REJECT_CLUB:
      let tempReject = state.clubs;
      let findRejectClubIndex = tempReject.findIndex(
        (club) => club.clubID === action.payload.clubID
      );
      tempReject[findRejectClubIndex] = action.payload;
      return {
        ...state,
        clubs: [...tempReject],
      };
    case SUSPEND_CLUB:
      let tempSuspend = state.clubs;
      let findSuspendClubIndex = tempSuspend.findIndex(
        (club) => club.clubID === action.payload.clubID
      );
      tempSuspend[findSuspendClubIndex] = action.payload;
      return {
        ...state,
        clubs: [...tempSuspend],
      };
    case REMOVE_SUSPENSION:
      let tempRemoveSuspend = state.clubs;
      let findRemoveSuspendClub = tempRemoveSuspend.findIndex(
        (club) => club.clubID === action.payload.clubID
      );
      tempRemoveSuspend[findRemoveSuspendClub] = action.payload;
      return {
        ...state,
        clubs: [...tempRemoveSuspend],
      };
    case SET_CLUB_ACTIVITIES:
      return {
        ...state,
        clubActivities: [...action.payload],
      };
    case SET_APPROVED_CLUBS:
      return {
        ...state,
        approvedClubs: [...action.payload],
      };
    case UPDATE_CLUB_ACTIVITIES:
      let tempClubActivities = [...state.clubActivities];
      let clubActivitiesIndex = tempClubActivities.findIndex(
        (activity) => activity.activityID === action.payload
      );
      tempClubActivities.splice(clubActivitiesIndex, 1);

      return {
        ...state,
        clubActivities: [...tempClubActivities],
      };
    case SET_A_CLUB:
      return {
        ...state,
        club: { ...action.payload },
      };
    case RESET_CLUB:
      return {
        ...state,
        club: {},
      };
    case SET_CLUB_MEMBERS:
      return {
        ...state,
        clubMembers: [...action.payload],
      };
    case CLEAR_CLUB_MEMBERS:
      return {
        ...state,
        clubMembers: [],
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
