const functions = require("firebase-functions");

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

app.use(
  cors({
    origin: ["http://localhost:3000", "https://web.postman.co/"],
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
app.post("/generate-admin-link/:campusID", sudoAdminAuth, generateNewAdminLink);

//admin login
app.post("/login", adminLogin);

//get admin's session data
app.get("/session-data/:campusID", verifyAdminForSessionData, getSessionData);

//edit a campus' department
app.post("/edit-department/:campusID", sudoAdminAuth, editCampusDepartment);

//edit a campus' intake
app.post("/edit-intake/:campusID", sudoAdminAuth, editCampusIntake);

//edit an admin's role
app.post("/admin-role/:campusID", sudoAdminAuth, editAdminRole);

//deactivate an admin
app.post("/deactivate-admin/:campusID", sudoAdminAuth, deactivateAdmin);

//reactivating an admin
app.post("/reactivate-admin/:campusID", sudoAdminAuth, reactivateAdmin);

//orientation routes ==============================================================

app.get("/orientation/:campusID", sudoAdminAuth, getOrientationOverview);

app.post(
  "/orientation/:campusID/:orientationID",
  sudoAdminAuth,
  editOrientationOverview
);

app.post(
  "/orientation-content/:campusID/:orientationID",
  sudoAdminAuth,
  editOrientationOverviewContent
);

app.post(
  "/orientation-page/:campusID/:orientationID",
  sudoAdminAuth,
  createOrientationPage
);

app.get("/orientation-page/:campusID", sudoAdminAuth, getOrientationPages);

app.post(
  "/subcontent/:campusID/:orientationPageID",
  sudoAdminAuth,
  createNewSubcontent
);

app.post(
  "/subcontent-title/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentTitle
);

app.post(
  "/subcontent-content/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentContent
);

app.post(
  "/subcontent-image/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentImage
);

app.delete(
  "/subcontent-image/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  deleteSubcontentImage
);

app.post(
  "/subcontent-file/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  editSubcontentFile
);

app.post(
  "/subcontent-file-delete/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  deleteSubcontentFile
);

app.delete(
  "/subcontent/:campusID/:orientationPageID/:subcontentID",
  sudoAdminAuth,
  deleteSubcontent
);

app.post(
  "/overview-video/:campusID/:orientationID",
  sudoAdminAuth,
  editOrientationOverviewVideos
);

app.post(
  "/overview-video-delete/:campusID/:orientationID",
  sudoAdminAuth,
  deleteOrientationOverviewVideo
);

app.post(
  "/subcontent-image/:campusID",
  sudoAdminAuth,
  uploadOrientationPostImage
);

app.post(
  "/subcontent-file/:campusID",
  sudoAdminAuth,
  uploadOrientationPostFile
);

app.post(
  "/overview-video/:campusID",
  sudoAdminAuth,
  uploadOrientationOverviewVideo
);

app.post(
  "/orientation-page-title/:campusID/:orientationPageID",
  sudoAdminAuth,
  editOrientationPageTitle
);

app.post(
  "/orientation-page-header/:campusID/:orientationPageID",
  sudoAdminAuth,
  editOrientationPageHeader
);

app.post(
  "/orientation-page-content/:campusID/:orientationPageID",
  sudoAdminAuth,
  editOrientationPageContent
);

app.delete(
  "/orientation-page/:campusID/:orientationPageID",
  sudoAdminAuth,
  deleteOrientationPage
);

exports.api = functions.region("asia-southeast1").https.onRequest(app);
