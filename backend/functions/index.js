const functions = require("firebase-functions/v1");

const express = require("express");
const firebase = require("firebase");

const config = require("./utils/config");
firebase.initializeApp(config);

const app = express();
const cors = require("cors");

const {
  NormalAuth,
  sudoAdminAuth,
  verifyAdminForSessionData,
} = require("./utils/Auth");

//import claw handlers
const {
  clawSignIn,
  addCollegeAndCampus,
  addCampus,
  deleteCollege,
  changeID,
  createTestClubsOverview,
  createTestOrientationOverview,
} = require("./handlers/claw");

//import college admin handlers
const {
  getAllColleges,
  getCampuses,
  getAdminsForCampus,
  getDepartmentsForCampus,
  firstTimeSignUpLinkValidity,
  addedAdminSignUpLinkValidity,
  adminFirstTimeSignUp,
  addedAdminSignUp,
  generateNewAdminLink,
  adminLogin,
  getSessionData,
  editCampusDepartment,
  editCampusIntake,
  editAdminRole,
  deactivateAdmin,
  reactivateAdmin,
  getAllClubActivities,
  handleEventActivity,
  handleGalleryActivity,
  setClubEventToTrue,
  setClubGalleryToTrue,
  getAClub,
} = require("./handlers/campusAdmin");

const {
  getOrientationOverview,
  editOrientationOverview,
  editOrientationOverviewContent,
  createOrientationPage,
  getOrientationPages,
  createNewSubcontent,
  deleteSubcontent,
  editOrientationPageTitle,
  editOrientationPageHeader,
  editOrientationPageContent,
  deleteOrientationPage,
  editSubcontentTitle,
  editSubcontentContent,
  uploadOrientationPostImage,
  uploadOrientationPostFile,
  editSubcontentImage,
  editSubcontentFile,
  deleteSubcontentFile,
  uploadOrientationOverviewImage,
  uploadOrientationOverviewFile,
  uploadOrientationOverviewVideo,
  editOrientationOverviewVideos,
  deleteOrientationOverviewVideo,
  deleteSubcontentImage,
} = require("./handlers/orientation");

const {
  getAllClubs,
  approveClub,
  rejectClub,
  suspendClub,
  removeSuspension,
  changePresident,
  getClubMembers,
  getPendingClubsForSA,
  getPendingClubsForAdmin,
  getApprovedClubs,
  approveClubUnderSA,
  rejectClubUnderSA,
} = require("./handlers/campusAdminClubs");

const { modifyPdf, testPdf, createGeneralForm } = require("./utils/pdf");

const {
  createNotification,
  sendEmailNotification,
  getGeneralForms,
  deleteGeneralForm,
  uploadForm,
} = require("./handlers/general");

app.use(
  cors({
    origin: [
      // "http://localhost:3000",
      // "https://web.postman.co/",
      "exp://192.168.0.8:19000",
      "https://astral-d3ff5.web.app",
      "https://astral-app.com",
    ],
  })
);

//claw routes ==============================================================

//theClaw login
app.post("/theClaw", clawSignIn);

//add a college and also add a campus
app.post("/college", addCollegeAndCampus);

//add a campus only
app.post("/campus", addCampus);

//delete a college
app.delete("/college", deleteCollege);

app.get("/changeid", changeID);

app.get("/testUpload", createTestOrientationOverview);

//college routes ==============================================================

//get all colleges
app.get("/colleges", getAllColleges);

//get all campuses for a college
app.post("/campuses", getCampuses);

//get all admins for a college
app.get("/admins/:campusID", sudoAdminAuth, getAdminsForCampus);

//get all departments for a college
app.get("/departments/:campusID", sudoAdminAuth, getDepartmentsForCampus);

//get validity of first time signup link
app.post("/validate-link/:campusID/:linkID", firstTimeSignUpLinkValidity);

//get validity of admin add link
app.post(
  "/validate-add-admin-link/:campusID/:linkID",
  addedAdminSignUpLinkValidity
);

//admin first time login
app.post("/admin-signup/:campusID/:linkID", adminFirstTimeSignUp);

//added admin signup
app.post("/add-admin-signup/:campusID/:linkID", addedAdminSignUp);

//to generate the link to create a new admin
app.post("/admin/generate-link/:campusID", sudoAdminAuth, generateNewAdminLink);

//admin login
app.post("/login", adminLogin);

//get admin's session data
app.get("/session-data/:campusID", verifyAdminForSessionData, getSessionData);

//edit a campus' department
app.post("/department/edit/:campusID", sudoAdminAuth, editCampusDepartment);

//edit a campus' intake
app.post("department/edit-intake/:campusID", sudoAdminAuth, editCampusIntake);

//edit an admin's role
app.post("/admin/role/:campusID", sudoAdminAuth, editAdminRole);

//deactivate an admin
app.post("/admin/deactivate/:campusID", sudoAdminAuth, deactivateAdmin);

//reactivating an admin
app.post("/admin/reactivate/:campusID", sudoAdminAuth, reactivateAdmin);

//orientation routes ==============================================================

app.get("/orientation/:campusID", sudoAdminAuth, getOrientationOverview);

app.post("/orientation/overview/edit", sudoAdminAuth, editOrientationOverview);

app.post(
  "/orientation/content/:campusID/:orientationID",
  sudoAdminAuth,
  editOrientationOverviewContent
);

app.post(
  "/orientation/page/:campusID/:orientationID",
  sudoAdminAuth,
  createOrientationPage
);

app.get("/orientation/page/:campusID", sudoAdminAuth, getOrientationPages);

app.post(
  "/orientation/subcontent/:campusID/:orientationPageID",
  sudoAdminAuth,
  createNewSubcontent
);

app.post(
  "/orientation/subcontent-title/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentTitle
);

app.post(
  "/orientation/subcontent-content/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentContent
);

app.post(
  "/orientation/subcontent-image/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentImage
);

app.delete(
  "/orientation/subcontent-image/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  deleteSubcontentImage
);

app.post(
  "/orientation/subcontent-file/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentFile
);

app.post(
  "/orientation/subcontent-file-delete/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  deleteSubcontentFile
);

app.delete(
  "/orientation/subcontent/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  deleteSubcontent
);

app.post(
  "/orientation/overview-video/:campusID/:orientationID",
  sudoAdminAuth,
  editOrientationOverviewVideos
);

app.post(
  "/orientation/overview-video-delete/:campusID/:orientationID",
  sudoAdminAuth,
  deleteOrientationOverviewVideo
);

//problem is it mistakens another url that is before this, as this url

app.post(
  "/orientation/subcontent-image/upload",
  sudoAdminAuth,
  uploadOrientationPostImage
);

app.post(
  "/orientation/subcontent-file/upload",
  sudoAdminAuth,
  uploadOrientationPostFile
);

app.post(
  "/orientation/overview-video/:campusID",
  sudoAdminAuth,
  uploadOrientationOverviewVideo
);

app.post(
  "/orientation/page-title/:campusID/:orientationID/:orientationPageID",
  sudoAdminAuth,
  editOrientationPageTitle
);

app.post(
  "/orientation/page-header/:campusID/:orientationPageID",
  sudoAdminAuth,
  editOrientationPageHeader
);

app.post(
  "/orientation/page-content/:campusID/:orientationPageID",
  sudoAdminAuth,
  editOrientationPageContent
);

app.delete(
  "/orientation/page/:campusID/:orientationID/:orientationPageID",
  sudoAdminAuth,
  deleteOrientationPage
);

app.post("/clubs/:campusID", sudoAdminAuth, getAllClubs);
app.get("/clubs-sa/:campusID", sudoAdminAuth, getPendingClubsForSA);
app.get("/clubs/admin/:campusID", sudoAdminAuth, getPendingClubsForAdmin);

app.post(`/clubs/approve/:campusID/:clubID`, sudoAdminAuth, approveClub);
app.post(`/clubs-sa/approve/:campusID/:clubID`, sudoAdminAuth, approveClub);

app.post(`/clubs/reject/:campusID/:clubID`, sudoAdminAuth, rejectClub);
app.post(`/clubs-sa/reject/:campusID/:clubID`, sudoAdminAuth, rejectClub);

app.post(`/clubs/suspend/:campusID/:clubID`, sudoAdminAuth, suspendClub);

app.post(
  `/clubs/remove-suspension/:campusID/:clubID`,
  sudoAdminAuth,
  removeSuspension
);

app.post("/clubs/president/:campusID", sudoAdminAuth, changePresident);

app.post("/clubs/members/:clubID/:campusID", sudoAdminAuth, getClubMembers);

app.get("/clubs/activities/:campusID", sudoAdminAuth, getAllClubActivities);
app.post(
  "/clubs/activities/event/:campusID",
  sudoAdminAuth,
  handleEventActivity
);
app.post(
  "/clubs/activities/gallery/:campusID",
  sudoAdminAuth,
  handleGalleryActivity
);

app.post("/clubs/events/true/:campusID", sudoAdminAuth, setClubEventToTrue);
app.post("/clubs/gallery/true/:campusID", sudoAdminAuth, setClubGalleryToTrue);
app.post("/clubs/:clubID/:campusID", sudoAdminAuth, getAClub);
app.get("/clubs/approved/:campusID", sudoAdminAuth, getApprovedClubs);

app.post("/pdf", modifyPdf);
app.get("/pdf-test", testPdf);
app.post("/admin/add-pdf/:campusID", sudoAdminAuth, createGeneralForm);
app.post("/admin/upload-pdf/:campusID", sudoAdminAuth, uploadForm);
app.get("/admin/general-forms/:campusID", sudoAdminAuth, getGeneralForms);
app.post("/admin/delete-pdf/:campusID", sudoAdminAuth, deleteGeneralForm);

app.post("/notification/:campusID", NormalAuth, createNotification);
app.post("/notification/email/:campusID", NormalAuth, sendEmailNotification);

exports.api = functions.region("asia-southeast1").https.onRequest(app);
