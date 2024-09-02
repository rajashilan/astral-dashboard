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
  verifyClaw,
  appCheckVerification,
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
  uploadCollegeLogo,
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
  editOrientationSubcontentVideos,
  deleteOrientationSubcontentVideo,
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
app.post("/college", verifyClaw, addCollegeAndCampus);

//add a campus only
app.post("/campus", verifyClaw, addCampus);

//delete a college
app.delete("/college", verifyClaw, deleteCollege);

app.get("/changeid", verifyClaw, changeID);

app.get("/testUpload", verifyClaw, createTestOrientationOverview);

app.post("/college/logo/:collegeID", verifyClaw, uploadCollegeLogo);

//college routes ==============================================================

//get all colleges
app.get("/colleges", appCheckVerification, getAllColleges);

//get all campuses for a college
app.post("/campuses", appCheckVerification, getCampuses);

//get all admins for a college
app.get(
  "/admins/:campusID",
  appCheckVerification,
  sudoAdminAuth,
  getAdminsForCampus
);

//get all departments for a college
app.get(
  "/departments/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getDepartmentsForCampus
);

//get validity of first time signup link
app.post(
  "/validate-link/:campusID/:linkID",
  appCheckVerification,
  firstTimeSignUpLinkValidity
);

//get validity of admin add link
app.post(
  "/validate-add-admin-link/:campusID/:linkID",
  appCheckVerification,
  addedAdminSignUpLinkValidity
);

//admin first time login
app.post(
  "/admin-signup/:campusID/:linkID",
  appCheckVerification,
  adminFirstTimeSignUp
);

//added admin signup
app.post(
  "/add-admin-signup/:campusID/:linkID",
  appCheckVerification,
  addedAdminSignUp
);

//to generate the link to create a new admin
app.post(
  "/admin/generate-link/:campusID",
  [appCheckVerification, sudoAdminAuth],
  generateNewAdminLink
);

//admin login
app.post("/login", appCheckVerification, adminLogin);

//get admin's session data
app.get(
  "/session-data/:campusID",
  [appCheckVerification, verifyAdminForSessionData],
  getSessionData
);

//edit a campus' department
app.post(
  "/department/edit/:campusID",
  [appCheckVerification, sudoAdminAuth],
  editCampusDepartment
);

//edit a campus' intake
app.post(
  "department/edit-intake/:campusID",
  [appCheckVerification, sudoAdminAuth],
  editCampusIntake
);

//edit an admin's role
app.post(
  "/admin/role/:campusID",
  [appCheckVerification, sudoAdminAuth],
  editAdminRole
);

//deactivate an admin
app.post(
  "/admin/deactivate/:campusID",
  [appCheckVerification, sudoAdminAuth],
  deactivateAdmin
);

//reactivating an admin
app.post(
  "/admin/reactivate/:campusID",
  [appCheckVerification, sudoAdminAuth],
  reactivateAdmin
);

//orientation routes ==============================================================

app.get(
  "/orientation/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getOrientationOverview
);

app.post(
  "/orientation/overview/edit",
  [appCheckVerification, sudoAdminAuth],
  editOrientationOverview
);

app.post(
  "/orientation/content/:campusID/:orientationID",
  [appCheckVerification, sudoAdminAuth],
  editOrientationOverviewContent
);

app.post(
  "/orientation/page/:campusID/:orientationID",
  [appCheckVerification, sudoAdminAuth],
  createOrientationPage
);

app.get(
  "/orientation/page/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getOrientationPages
);

app.post(
  "/orientation/subcontent/:campusID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  createNewSubcontent
);

app.post(
  "/orientation/subcontent-title/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  editSubcontentTitle
);

app.post(
  "/orientation/subcontent-content/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  editSubcontentContent
);

app.post(
  "/orientation/subcontent-image/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  editSubcontentImage
);

app.delete(
  "/orientation/subcontent-image/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  deleteSubcontentImage
);

app.post(
  "/orientation/subcontent-file/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  editSubcontentFile
);

app.post(
  "/orientation/subcontent-file-delete/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  deleteSubcontentFile
);

app.delete(
  "/orientation/subcontent/:campusID/:orientationPageID/:subcontentID",
  [appCheckVerification, sudoAdminAuth],
  deleteSubcontent
);

app.post(
  "/orientation/overview-video/:campusID/:orientationID",
  [appCheckVerification, sudoAdminAuth],
  editOrientationOverviewVideos
);

app.post(
  "/orientation/overview-video-delete/:campusID/:orientationID",
  [appCheckVerification, sudoAdminAuth],
  deleteOrientationOverviewVideo
);

app.post(
  "/orientation/subcontent-video/:campusID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  editOrientationSubcontentVideos
);

app.post(
  "/orientation/subcontent-video-delete/:campusID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  deleteOrientationSubcontentVideo
);

//problem is it mistakens another url that is before this, as this url

app.post(
  "/orientation/subcontent-image/upload",
  [appCheckVerification, sudoAdminAuth],
  uploadOrientationPostImage
);

app.post(
  "/orientation/subcontent-file/upload",
  [appCheckVerification, sudoAdminAuth],
  uploadOrientationPostFile
);

app.post(
  "/orientation/overview-video/:campusID",
  [appCheckVerification, sudoAdminAuth],
  uploadOrientationOverviewVideo
);

app.post(
  "/orientation/page-title/:campusID/:orientationID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  editOrientationPageTitle
);

app.post(
  "/orientation/page-header/:campusID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  editOrientationPageHeader
);

app.post(
  "/orientation/page-content/:campusID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  editOrientationPageContent
);

app.delete(
  "/orientation/page/:campusID/:orientationID/:orientationPageID",
  [appCheckVerification, sudoAdminAuth],
  deleteOrientationPage
);

app.post(
  "/clubs/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getAllClubs
);
app.get(
  "/clubs-sa/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getPendingClubsForSA
);
app.get(
  "/clubs/admin/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getPendingClubsForAdmin
);

app.post(
  `/clubs/approve/:campusID/:clubID`,
  [appCheckVerification, sudoAdminAuth],
  approveClub
);
app.post(
  `/clubs-sa/approve/:campusID/:clubID`,
  [appCheckVerification, sudoAdminAuth],
  approveClub
);

app.post(
  `/clubs/reject/:campusID/:clubID`,
  [appCheckVerification, sudoAdminAuth],
  rejectClub
);
app.post(
  `/clubs-sa/reject/:campusID/:clubID`,
  [appCheckVerification, sudoAdminAuth],
  rejectClub
);

app.post(
  `/clubs/suspend/:campusID/:clubID`,
  [appCheckVerification, sudoAdminAuth],
  suspendClub
);

app.post(
  `/clubs/remove-suspension/:campusID/:clubID`,
  [appCheckVerification, sudoAdminAuth],
  removeSuspension
);

app.post(
  "/clubs/president/:campusID",
  [appCheckVerification, sudoAdminAuth],
  changePresident
);

app.post(
  "/clubs/members/:clubID/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getClubMembers
);

app.get(
  "/clubs/activities/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getAllClubActivities
);
app.post(
  "/clubs/activities/event/:campusID",
  [appCheckVerification, sudoAdminAuth],
  handleEventActivity
);
app.post(
  "/clubs/activities/gallery/:campusID",
  [appCheckVerification, sudoAdminAuth],
  handleGalleryActivity
);

app.post(
  "/clubs/events/true/:campusID",
  [appCheckVerification, sudoAdminAuth],
  setClubEventToTrue
);
app.post(
  "/clubs/gallery/true/:campusID",
  [appCheckVerification, sudoAdminAuth],
  setClubGalleryToTrue
);
app.post(
  "/clubs/:clubID/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getAClub
);
app.get(
  "/clubs/approved/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getApprovedClubs
);

app.post("/pdf", modifyPdf);
app.get("/pdf-test", testPdf);
app.post(
  "/admin/add-pdf/:campusID",
  [appCheckVerification, sudoAdminAuth],
  createGeneralForm
);
app.post(
  "/admin/upload-pdf/:campusID",
  [appCheckVerification, sudoAdminAuth],
  uploadForm
);
app.get(
  "/admin/general-forms/:campusID",
  [appCheckVerification, sudoAdminAuth],
  getGeneralForms
);
app.post(
  "/admin/delete-pdf/:campusID",
  [appCheckVerification, sudoAdminAuth],
  deleteGeneralForm
);

app.post(
  "/notification/:campusID",
  [appCheckVerification, NormalAuth],
  createNotification
);
app.post(
  "/notification/email/:campusID",
  [appCheckVerification, NormalAuth],
  sendEmailNotification
);

exports.api = functions.region("asia-southeast1").https.onRequest(app);
