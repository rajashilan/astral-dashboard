import {
  SET_ADMINS,
  SET_UPDATED_ADMIN,
  SET_NEW_ADMIN_LINK,
  SET_DEPARTMENTS,
  LOADING_DATA,
  STOP_LOADING_DATA,
  SET_GENERAL_ERRORS,
  CLEAR_GENERAL_ERRORS,
  SET_ADMIN_ACTIVATION,
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

export const getOrientationOverview = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  const campusID = localStorage.getItem("AdminCampus");

  axios
    .get(`/orientation/${campusID}`)
    .then((res) => {
      dispatch({ type: SET_ORIENTATION_OVERVIEW, payload: res.data });
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

export const updateOrientationOverviewTitle =
  (data, orientationID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });

    const campusID = localStorage.getItem("AdminCampus");

    axios
      .post(`/orientation/${campusID}/${orientationID}`, data)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: UPDATE_ORIENTATION_OVERVIEW_TITLE,
          payload: data.title,
        });
        alert("Orientation title updated successfully");
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

export const getOrientationPages = (orientationID) => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  const campusID = localStorage.getItem("AdminCampus");

  axios
    .get(`/orientation-page/${campusID}`)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({
        type: SET_ORIENTATION_PAGES,
        payload: res.data,
      });
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

export const updateOrientationPagesTitle =
  (data, orientationID, orientationPageID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      title: data.title,
      orientationPageID: orientationPageID,
    };

    axios
      .post(
        `/orientation-page-title/${campusID}/${orientationID}/${orientationPageID}`,
        data
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_ORIENTATION_PAGE_TITLE,
          payload: payload,
        });
        alert("Orientation page title updated successfully");
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

export const updateOrientationPagesHeader =
  (data, orientationPageID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      header: data.header,
      orientationPageID: orientationPageID,
    };

    axios
      .post(`/orientation-page-header/${campusID}/${orientationPageID}`, data)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_ORIENTATION_PAGE_HEADER,
          payload: payload,
        });
        alert("Orientation page header updated successfully");
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

export const updateOrientationPagesContent =
  (data, orientationPageID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      content: data.content,
      orientationPageID: orientationPageID,
    };

    axios
      .post(`/orientation-page-content/${campusID}/${orientationPageID}`, data)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_ORIENTATION_PAGE_CONTENT,
          payload: payload,
        });
        alert("Orientation page content updated successfully");
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

export const updateSubcontentTitle =
  (data, orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      title: data.title,
      orientationPageID: orientationPageID,
      subcontentID: subcontentID,
    };

    axios
      .post(
        `/subcontent-title/${campusID}/${orientationPageID}/${subcontentID}`,
        data
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_SUBCONTENT_TITLE,
          payload: payload,
        });
        alert("Post title updated successfully");
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

export const updateSubcontentContent =
  (data, orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      content: data.content,
      orientationPageID: orientationPageID,
      subcontentID: subcontentID,
    };

    axios
      .post(
        `/subcontent-content/${campusID}/${orientationPageID}/${subcontentID}`,
        data
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_SUBCONTENT_CONTENT,
          payload: payload,
        });
        alert("Post content updated successfully");
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

export const updateSubcontentImage =
  (data, orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      image: [...data.image],
      orientationPageID: orientationPageID,
      subcontentID: subcontentID,
    };

    axios
      .post(
        `/subcontent-image/${campusID}/${orientationPageID}/${subcontentID}`,
        data
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_SUBCONTENT_IMAGE,
          payload: payload,
        });
        alert("Post image updated successfully");
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

export const deleteSubcontentImage =
  (orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      orientationPageID: orientationPageID,
      subcontentID: subcontentID,
    };

    axios
      .delete(
        `/subcontent-image/${campusID}/${orientationPageID}/${subcontentID}`
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: DELETE_SUBCONTENT_IMAGE,
          payload: payload,
        });
        alert("Post image(s) deleted successfully");
      })
      .catch((error) => {
        // dispatch({
        //   type: SET_GENERAL_ERRORS,
        //   payload: error.response.data.error,
        // });
        console.error(error);
        dispatch({ type: STOP_LOADING_DATA });
      });
  };

export const updateSubcontentFile =
  (data, orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      data: {
        url: data.file,
        filename: data.filename,
      },
      orientationPageID: orientationPageID,
      subcontentID: subcontentID,
    };

    axios
      .post(
        `/subcontent-file/${campusID}/${orientationPageID}/${subcontentID}`,
        data
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: SET_SUBCONTENT_FILE,
          payload: payload,
        });
        alert("Post file updated successfully");
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

export const deleteSubcontentFile =
  (data, orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    axios
      .post(
        `/subcontent-file-delete/${campusID}/${orientationPageID}/${subcontentID}`,
        data
      )
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        let payload = {
          files: { ...res.data.files },
          url: data.url,
          subcontentID,
          orientationPageID,
        };
        dispatch({
          type: DELETE_SUBCONTENT_FILE,
          payload: payload,
        });
        alert("Post file deleted successfully");
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

export const addOrientationOverviewVideo =
  (data, orientationID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    axios
      .post(`/overview-video/${campusID}/${orientationID}`, data)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: UPDATE_ORIENTATION_OVERVIEW_VIDEO,
          payload: res.data,
        });
        alert("Orientation video added successfully");
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

export const deleteOrientationOverviewVideo =
  (data, orientationID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    axios
      .post(`/overview-video-delete/${campusID}/${orientationID}`, data)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: UPDATE_ORIENTATION_OVERVIEW_VIDEO,
          payload: res.data,
        });
        alert("Orientation video deleted successfully");
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

export const deleteSubcontent =
  (orientationPageID, subcontentID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      orientationPageID: orientationPageID,
      subcontentID: subcontentID,
    };

    axios
      .delete(`/subcontent/${campusID}/${orientationPageID}/${subcontentID}`)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: DELETE_SUBCONTENT,
          payload: payload,
        });
        alert("Post deleted successfully");
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

export const deleteOrientationPage =
  (orientationID, orientationPageID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    let payload = {
      orientationPageID: orientationPageID,
    };

    axios
      .delete(
        `/orientation-page/${campusID}/${orientationID}/${orientationPageID}`
      )
      .then((res) => {
        console.log("aifidhjksadhahd");
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        dispatch({
          type: DELETE_ORIENTATION_PAGE,
          payload: payload,
        });
        alert("Page deleted successfully");
      })
      .catch((error) => {
        // dispatch({
        //   type: SET_GENERAL_ERRORS,
        //   payload: error.response.data.error,
        // });
        console.error(error);
        dispatch({ type: STOP_LOADING_DATA });
      });
  };

export const createNewOrientationPage = (data, orientationID) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  let pageData = {
    ...data,
    orientationPageID: "",
    subcontent: [],
  };

  axios
    .post(`/orientation-page/${campusID}/${orientationID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      pageData.orientationPageID = res.data.orientationPageID;
      dispatch({ type: ADD_ORIENTATION_PAGE, payload: pageData });
      alert("Created orientation page successfully");
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

//create new subcontent
export const createNewOrientationPost =
  (data, orientationPageID) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    const campusID = localStorage.getItem("AdminCampus");

    axios
      .post(`/subcontent/${campusID}/${orientationPageID}`, data)
      .then((res) => {
        dispatch({ type: STOP_LOADING_DATA });
        dispatch({ type: CLEAR_GENERAL_ERRORS });
        let payloadData = {
          ...res.data.subcontent,
          orientationPageID: orientationPageID,
        };
        dispatch({ type: ADD_ORIENTATION_POST, payload: payloadData });
        alert("Created orientation post successfully");
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

export const updateAdminsRole = (data) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .post(`/admin-role/${campusID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: SET_UPDATED_ADMIN, payload: data });
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

export const getClubs = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .get(`/clubs/${campusID}`)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: SET_CLUBS, payload: res.data });
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

export const approveClub = (club) => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  let data = {
    createdBy: club.createdBy,
  };

  club.approval = "approved";

  axios
    .post(`/clubs/approve/${club.campusID}/${club.clubID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: APPROVE_CLUB, payload: club });
      alert(`${club.name} approved successfully`);
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

export const rejectClub = (club, rejectionReason) => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  let data = {
    createdBy: club.createdBy,
    rejectionReason,
  };

  club.approval = "rejected";
  club.rejectionReason = rejectionReason;

  axios
    .post(`/clubs/reject/${club.campusID}/${club.clubID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: REJECT_CLUB, payload: club });
      alert(`${club.name} rejected successfully`);
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

export const suspendClub = (club, suspension) => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  let data = {
    suspension,
  };

  if (suspension === "0") suspension = "suspended:0";
  else suspension = `suspended:${suspension}`;

  club.status = suspension;

  axios
    .post(`/clubs/suspend/${club.campusID}/${club.clubID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: SUSPEND_CLUB, payload: club });
      alert(`${club.name} suspended successfully`);
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

export const removeSuspension = (club) => (dispatch) => {
  dispatch({ type: LOADING_DATA });

  club.status = "active";

  axios
    .post(`/clubs/remove-suspension/${club.campusID}/${club.clubID}`)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: CLEAR_GENERAL_ERRORS });
      dispatch({ type: REMOVE_SUSPENSION, payload: club });
      alert(`${club.name}'s suspension removed successfully`);
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

export const createNewAdminLink = (data) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .post(`/generate-admin-link/${campusID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: SET_NEW_ADMIN_LINK, payload: res.data });
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

export const getClubActivities = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .get(`/clubs/activities/${campusID}`)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: SET_CLUB_ACTIVITIES, payload: res.data });
    })
    .catch((error) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error,
      });
      console.error(error);
    });
};

//functions to accept/reject event and gallery
//must delete event and gallery from clubActivities after
export const handleEventActivity = (event, statusData) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  let data = {
    ...event,
    ...statusData,
  };

  axios
    .post(`/clubs/activities/event/${campusID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: UPDATE_CLUB_ACTIVITIES, payload: event.activityID });
    })
    .catch((error) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error,
      });
      console.error(error);
    });
};

export const handleGalleryActivity = (gallery, statusData) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  let data = {
    ...gallery,
    ...statusData,
  };

  axios
    .post(`/clubs/activities/gallery/${campusID}`, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: UPDATE_CLUB_ACTIVITIES, payload: gallery.activityID });
    })
    .catch((error) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({
        type: SET_GENERAL_ERRORS,
        payload: error,
      });
      console.error(error);
    });
};

export const adminActivation = (data) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  const request =
    data.activationType === "activate"
      ? `/reactivate-admin/${campusID}`
      : `/deactivate-admin/${campusID}`;

  const message =
    data.activationType === "activate"
      ? "Admin has been activated"
      : "Admin has been deactivated";

  axios
    .post(request, data)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: SET_UPDATED_ADMIN, payload: data });
      alert(message);
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

export const setClubEventToTrue = (clubID) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  let data = { clubID };

  axios
    .post(`/clubs/events/true/${campusID}`, data)
    .then(() => {
      dispatch({ type: STOP_LOADING_DATA });
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

export const setClubGalleryToTrue = (clubID) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  let data = { clubID };

  axios
    .post(`/clubs/gallery/true/${campusID}`, data)
    .then(() => {
      dispatch({ type: STOP_LOADING_DATA });
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

export const createNotification = (notification, userIDs) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  let data = {
    notification: { ...notification },
    userIDs: [...userIDs],
  };

  axios
    .post(`/notification/${campusID}`, data)
    .then(() => {
      dispatch({ type: STOP_LOADING_DATA });
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

export const getAClub = (clubID) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  const campusID = localStorage.getItem("AdminCampus");

  axios
    .post(`/clubs/${clubID}/${campusID}`)
    .then((res) => {
      dispatch({ type: STOP_LOADING_DATA });
      dispatch({ type: SET_A_CLUB, payload: res.data });
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
