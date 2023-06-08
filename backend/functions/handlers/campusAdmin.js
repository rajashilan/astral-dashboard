const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

exports.getAllColleges = (req, res) => {
  db.collection("colleges")
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      let colleges = [];
      data.forEach((doc) => {
        colleges.push(doc.data());
      });
      return res.json(colleges);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getCampuses = (req, res) => {
  const college = req.body.college;

  db.collection("campuses")
    .where("college", "==", college)
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      let campuses = [];
      data.forEach((doc) => {
        campuses.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return res.json(campuses);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getAdminsForCampus = (req, res) => {
  const campusID = req.params.campusID;

  db.collection("admins")
    .where("campusID", "==", campusID)
    .where("userID", "!=", req.user.uid)
    .get()
    .then((data) => {
      let admins = [];
      data.forEach((doc) => {
        admins.push(doc.data());
      });
      return res.status(200).json(admins);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getDepartmentsForCampus = (req, res) => {
  const campusID = req.params.campusID;

  db.collection("departments")
    .where("campusID", "==", campusID)
    .get()
    .then((data) => {
      let departments = [];
      data.forEach((doc) => {
        departments.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      return res.status(200).json(departments);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.firstTimeSignUpLinkValidity = (req, res) => {
  const campusID = req.params.campusID;
  const linkID = req.params.linkID;

  db.doc(`/campuses/${campusID}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        if (doc.data().linkID === linkID && doc.data().adminCreated === false) {
          return res.json({ valid: true });
        } else {
          return res.json({ valid: false });
        }
      } else return res.status(400).json({ error: "Invalid link" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.addedAdminSignUpLinkValidity = (req, res) => {
  const campusID = req.params.campusID;
  const linkID = req.params.linkID;

  db.doc(`/campuses/${campusID}`)
    .get()
    .then((doc) => {
      if (
        doc.exists &&
        doc.data().adminLinks &&
        doc.data().adminLinks.length > 0
      ) {
        if (doc.data().adminLinks.some((link) => link.linkID === linkID))
          return res.json({ valid: true });
        else return res.json({ valid: false });
      } else return res.status(400).json({ error: "Invalid link" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.adminFirstTimeSignUp = (req, res) => {
  const campusID = req.params.campusID;
  const linkID = req.params.linkID;
  password = req.body.password;

  const adminAccount = {
    name: req.body.name,
    role: "sudo",
    email: req.body.email,
    userID: "",
    active: true,
    campusID: campusID,
    createdAt: new Date().toISOString(),
  };

  let sudoAdmins;

  db.doc(`/campuses/${campusID}`)
    .get()
    .then((doc) => {
      //check if the link is valid and if adminCreated is false
      if (doc.data().linkID === linkID && doc.data().adminCreated === false) {
        //check if admin suffix is correct

        sudoAdmins = doc.data().sudoAdmins;

        admin
          .firestore()
          .doc(`/colleges/${doc.data().collegeID}`)
          .get()
          .then((doc) => {
            if (adminAccount.email.split("@")[1] === doc.data().adminSuffix) {
              firebase
                .auth()
                .createUserWithEmailAndPassword(adminAccount.email, password)
                .then((data) => {
                  userID = data.user.uid;

                  adminAccount.userID = userID;

                  admin
                    .firestore()
                    .collection("admins")
                    .doc(adminAccount.userID)
                    .set(adminAccount)
                    .then(() => {
                      firebase
                        .auth()
                        .currentUser.sendEmailVerification()
                        .then(() => {
                          return admin
                            .firestore()
                            .doc(`/campuses/${campusID}`)
                            .update({
                              adminCreated: true,
                              sudoAdmins: sudoAdmins + 1,
                            });
                        })
                        .then(() => {
                          return res.json({
                            message: "Admin account created successfully",
                          });
                        });
                    });
                })
                .catch((error) => {
                  console.error(error);
                  if (error.code === "auth/email-already-in-use") {
                    return res
                      .status(400)
                      .json({ error: "Email is already in use." });
                  } else {
                    return res.status(500).json({
                      general: "Something went wrong, please try again",
                    });
                  }
                });
            } else {
              return res.status(400).json({ error: "Invalid admin email" });
            }
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: "Something went wrong" });
          });
      } else return res.status(400).json({ error: "Invalid link" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//create a new admin (only by admins with sudo role)
//verify using req.user.userID

//for creating another admin,
//sudo admin generates a linkID along with the role
//sudo admin is returned a link similar to the above one, with campus id and link id
//linkID is added to a an array of linkIDs that contain json object {linkID, role} (only to be used for additional admins)
//the new admin registers using campus email and is sent email verification as usual
//role is added automatically according to the data retrieved
//once the new admin that calls with the linkID is registered, the link is deleted
exports.addedAdminSignUp = (req, res) => {
  const campusID = req.params.campusID;
  const linkID = req.params.linkID;
  password: req.body.password;

  const adminAccount = {
    name: req.body.name,
    role: req.user.role,
    email: req.body.email,
    userID: "",
    active: true,
    campusID: campusID,
    createdAt: new Date().toISOString(),
  };

  //first verify the link
  //then check if the email suffix is correct
  //then, get the role details using the link
  //signup admin
  //add admin details
  //delete link data from adminLinks

  let adminLinks;
  let sudoAdmins;

  db.doc(`/campuses/${campusID}`)
    .get()
    .then((doc) => {
      if (doc.data().adminLinks.some((link) => link.linkID === linkID)) {
        //link verified

        adminLinks = doc.data().adminLinks;
        sudoAdmins = doc.data().sudoAdmins;

        if (adminAccount.role === "sudo") sudoAdmins = sudoAdmins + 1;

        admin
          .firestore()
          .doc(`/colleges/${doc.data().collegeID}`)
          .get()
          .then((doc) => {
            if (adminAccount.email.split("@")[1] === doc.data().adminSuffix) {
              //email suffix verified

              firebase
                .auth()
                .createUserWithEmailAndPassword(adminAccount.email, password)
                .then((data) => {
                  userID = data.user.uid;

                  adminAccount.userID = userID;

                  admin
                    .firestore()
                    .collection("admins")
                    .doc(adminAccount.userID)
                    .set(adminAccount)
                    .then(() => {
                      firebase
                        .auth()
                        .currentUser.sendEmailVerification()
                        .then(() => {
                          //delete link from adminLinks
                          const index = adminLinks.findIndex(
                            (link) => link.linkID === linkID
                          );
                          adminLinks.splice(index, 1);
                          admin
                            .firestore()
                            .doc(`/campuses/${campusID}`)
                            .update({
                              adminLinks: adminLinks,
                              sudoAdmins: sudoAdmins,
                            })
                            .then(() => {
                              return res.json({
                                message:
                                  "New admin account created successfully",
                              });
                            })
                            .catch((error) => {
                              console.error(error);
                              return res.status(500).json({
                                error: "Something went wrong",
                              });
                            });
                        });
                    });
                })
                .catch((error) => {
                  console.error(error);
                  if (error.code === "auth/email-already-in-use") {
                    return res.status(400).json({
                      email: "Email is already in use.",
                    });
                  } else {
                    return res.status(500).json({
                      general: "Something went wrong, please try again",
                    });
                  }
                });
            } else
              return res.status(400).json({ error: "Invalid admin email" });
          });
      } else return res.status(400).json({ error: "Invalid link" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.generateNewAdminLink = (req, res) => {
  const campusID = req.params.campusID;

  //roles:
  //sudo (all)
  //general (everything else other than adding new admins)
  //focused:orientation
  //department:departmentID

  const linkArray = [
    {
      role: req.body.role,
      linkID: crypto.randomBytes(10).toString("hex"),
    },
  ];

  db.doc(`/campuses/${campusID}`)
    .set(
      {
        adminLinks: FieldValue.arrayUnion(...linkArray),
      },
      { merge: true }
    )
    .then(() => {
      return res.json({
        message: `Link for admin with '${linkArray[0].role}' created`,
        linkID: linkArray[0].linkID,
        campusID: campusID,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.adminLogin = (req, res) => {
  //check if the admin is requesting login for the correct college
  //then check if the admin's email is verified

  //admin should just log in, and the campusID should be returned
  //and then the campus data should be returned using the campusID

  const login = {
    email: req.body.email,
    password: req.body.password,
  };

  const returnData = {
    token: "",
    campusID: "",
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(login.email, login.password)
    .then((data) => {
      // if (data.user.emailVerified === false)
      //   return res
      //     .status(400)
      //     .json({
      //       error:
      //         "Please verify your email address to complete your registration process",
      //     });
      const userID = data.user.uid;
      admin
        .firestore()
        .doc(`/admins/${userID}`)
        .get()
        .then((doc) => {
          returnData.campusID = doc.data().campusID;
          return data.user.getIdToken();
        })
        .then((token) => {
          returnData.token = token;
          return res.json(returnData);
        });
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(400)
        .json({ error: "Invalid user credentials, please try again" });
    });
};

exports.getSessionData = (req, res) => {
  const campusID = req.params.campusID;
  const adminID = req.user.user_id;
  console.log(req.user);

  let sessionData = {
    admin: {
      name: "",
      email: "",
      role: "",
    },
    campus: {
      college: "",
      departments: [],
      intakes: [],
      name: "",
    },
  };

  //first get admin data -> name, email, role
  db.doc(`/admins/${adminID}`)
    .get()
    .then((doc) => {
      sessionData.admin.name = doc.data().name;
      sessionData.admin.email = doc.data().email;
      sessionData.admin.role = doc.data().role;

      return db.doc(`/campuses/${campusID}`).get();
    })
    .then((doc) => {
      sessionData.campus.college = doc.data().college;
      sessionData.campus.departments = [...doc.data().departments];
      sessionData.campus.intakes = [...doc.data().intakes];
      sessionData.campus.name = doc.data().name;
    })
    .then(() => {
      return res.json(sessionData);
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(400)
        .json({ error: "Invalid user credentials, please try again" });
    });
};

exports.editCampusDepartment = (req, res) => {
  const department = {
    departments: req.body.departments,
  };

  const campusID = req.params.campusID;

  //check if departments are empty
  if (department.departments.length === 0) {
    return res.status(400).json({
      error: "There must be at least one department in your campus.",
    });
  }

  db.doc(`/campuses/${campusID}`)
    .update(department)
    .then(() => {
      return res.json({ message: "Departments updated" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.editCampusIntake = (req, res) => {
  const intake = {
    intakes: req.body.intakes,
  };

  const campusID = req.params.campusID;

  //check if departments are empty
  if (intake.intakes.length === 0) {
    return res.status(400).json({
      error: "There must be at least one intake in your campus.",
    });
  }

  db.doc(`/campuses/${campusID}`)
    .update(intake)
    .then(() => {
      return res.json({ message: "Intakes updated" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.editAdminRole = (req, res) => {
  const role = {
    role: req.body.role,
    edited: new Date().toISOString(),
  };

  const userID = req.body.userID;
  const campusID = req.params.campusID;

  let sudoAdmins;
  let adminPreviousRole;

  //check if user is being assigned the same role again
  db.doc(`/admins/${userID}`)
    .get()
    .then((doc) => {
      adminPreviousRole = doc.data().role;
      if (adminPreviousRole === role.role)
        return res.status(400).json({ error: "Admin already has this role." });
      else {
        admin
          .firestore()
          .doc(`/admins/${userID}`)
          .update(role)
          .then(() => {
            //if sudo admin, increase campus's sudoAdmins number
            if (role.role === "sudo") {
              admin
                .firestore()
                .doc(`/campuses/${campusID}`)
                .get()
                .then((doc) => {
                  sudoAdmins = doc.data().sudoAdmins;
                  return admin
                    .firestore()
                    .doc(`/campuses/${campusID}`)
                    .update({ sudoAdmins: sudoAdmins + 1 });
                })
                .then(() => {
                  return res.json({
                    message: "New sudo admin sucessfully updated.",
                  });
                });
            } else if (adminPreviousRole === "sudo") {
              //first check the sudoAdmins count for the college, ensure more than 1

              admin
                .firestore()
                .doc(`/campuses/${campusID}`)
                .get()
                .then((doc) => {
                  if (doc.data().sudoAdmins > 1) {
                    admin
                      .firestore()
                      .doc(`/campuses/${campusID}`)
                      .get()
                      .then((doc) => {
                        sudoAdmins = doc.data().sudoAdmins;
                        return admin
                          .firestore()
                          .doc(`/campuses/${campusID}`)
                          .update({
                            sudoAdmins: sudoAdmins - 1,
                          });
                      })
                      .then(() => {
                        return res.json({
                          message:
                            "Previous sudo admin's new role sucessfully updated.",
                        });
                      })
                      .catch((error) => {
                        console.error(error);
                        return res
                          .status(500)
                          .json({ error: "Something went wrong" });
                      });
                  } else
                    return res.status(400).json({
                      error: "The campus needs at least one sudo admin.",
                    });
                });
            } else
              return res.json({
                message: "New user role sucessfully updated.",
              });
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: "Something went wrong" });
          });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.deactivateAdmin = (req, res) => {
  //get admin's details
  //if role is sudo
  //check if there is another active sudo admin for the campus
  //if no, not allowed
  //if yes, deactivate admin

  const campusID = req.params.campusID;
  const deactivateAdminID = req.body.deactivateAdminID;
  let sudoAdmins;

  db.doc(`/admins/${deactivateAdminID}`)
    .get()
    .then((doc) => {
      //check if admin role is sudo
      if (doc.data().role === "sudo") {
        //if it is, check if there is at least another sudo admin for the campus
        admin
          .firestore()
          .doc(`/campuses/${campusID}`)
          .get()
          .then((doc) => {
            if (doc.data().sudoAdmins > 1) {
              //more than 1, so can deactivate
              sudoAdmins = doc.data().sudoAdmins;

              admin
                .firestore()
                .docs(`/admins/${deactivateAdminID}`)
                .update({ active: false })
                .then(() => {
                  //update campus data
                  admin
                    .firestore()
                    .doc(`/campuses/${campusID}`)
                    .update({ sudoAdmins: sudoAdmins - 1 })
                    .then(() => {
                      return res.json({
                        message: "Admin deactivated",
                      });
                    });
                })
                .catch((error) => {
                  console.error(error);
                  return res
                    .status(500)
                    .json({ error: "Something went wrong" });
                });
            } else
              return res.status(400).json({
                error: "The campus needs at least one sudo admin.",
              });
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: "Something went wrong" });
          });
      } else {
        admin
          .firestore()
          .doc(`/admins/${deactivateAdminID}`)
          .update({ active: false })
          .then(() => {
            return res.json({
              message: "Admin deactivated",
            });
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: "Something went wrong" });
          });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.reactivateAdmin = (req, res) => {
  const campusID = req.params.campusID;
  const reactivateAdminID = req.body.reactivateAdminID;

  let sudoAdmins;
  let role;

  //first check if user requesting is sudo and of the same campus
  //then, check if reactivating user is sudo
  //if they are, update sudoAdmins + 1 for the campus

  db.doc(`/admins/${reactivateAdminID}`)
    .get()
    .then((doc) => {
      role = doc.data().role;
      doc.ref.update({ active: true }).then(() => {
        //check if reactivating user is sudo
        if (role === "sudo") {
          //update sudo admins
          admin
            .firestore()
            .doc(`/campuses/${campusID}`)
            .get()
            .then((doc) => {
              sudoAdmins = doc.data().sudoAdmins;

              admin
                .firestore()
                .doc(`/campuses/${campusID}`)
                .update({ sudoAdmins: sudoAdmins + 1 })
                .then(() => {
                  return res.json({
                    message: "Sudo admin reactivated",
                  });
                });
            })
            .catch((error) => {
              console.error(error);
              return res.status(500).json({ error: "Something went wrong" });
            });
        } else
          return res.json({
            message: "Admin reactivated",
          });
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};
