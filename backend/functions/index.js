const functions = require("firebase-functions");

const express = require("express");
const firebase = require("firebase");
firebase.initializeApp(config);

const config = require("./utils/config");

const app = express();

const { NormalAuth, sudoAdminAuth } = require("./utils/Auth");

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
  firstTimeSignUpLinkValidity,
  addedAdminSignUpLinkValidity,
  adminFirstTimeSignUp,
  addedAdminSignUp,
  generateNewAdminLink,
  adminLogin,
  editCampusDepartment,
  editCampusIntake,
  editAdminRole,
  deactivateAdmin,
  reactivateAdmin,
} = require("./handlers/campusAdmin");

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
app.post("/login/", adminLogin);

//edit a campus' department
app.post("/edit-department/:campusID", sudoAdminAuth, editCampusDepartment);

//edit a campus' intake
app.post("/edit-intake/:campusID", sudoAdminAuth, editCampusIntake);

//edit an admin's role
app.post("/admin-role", sudoAdminAuth, editAdminRole);

//deactivate an admin
app.post("/deactivate-admin/:campusID", sudoAdminAuth, deactivateAdmin);

//reactivating an admin
app.post("/reactivate-admin/:campusID", sudoAdminAuth, reactivateAdmin);

exports.api = functions.region("asia-southeast1").https.onRequest(app);
