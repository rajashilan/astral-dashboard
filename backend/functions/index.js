const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

const express = require("express");
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyCWTo3wSODQjVDJVSnPXzu4ah3MlLAjVsE",
  authDomain: "astral-d3ff5.firebaseapp.com",
  projectId: "astral-d3ff5",
  storageBucket: "astral-d3ff5.appspot.com",
  messagingSenderId: "404637096308",
  appId: "1:404637096308:web:b70f799ee61e66c9b0b421",
  measurementId: "G-K2P8EFFST0",
};

firebase.initializeApp(firebaseConfig);

const app = express();

//get all colleges
app.get("/colleges", (req, res) => {
  admin
    .firestore()
    .collection("colleges")
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
});

app.post("/campuses", (req, res) => {
  const college = req.body.college;

  admin
    .firestore()
    .collection("campuses")
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
});

// exports.getCampusesForCollege = functions.https.onRequest((req, res) => {
//   const college = req.body.college

//   admin.firestore().collection('campuses').where('college', '==', college)
//   .get()
//   .then((data) => {

//   })

// })

//add a college and also add a campus
app.post("/college", (req, res) => {
  //for the campus, the admin has not been created yet, so create a dynamic link
  //the link will be stored in the campus database
  //set adminCreated to false under campus so that we can use it to prompt admin to sign up
  //if the link the admin is accessing from is the same as the one in the database, allow the admin to create an account
  //if account is created successfully, set adminCreated to true

  const college = {
    createdAt: new Date().toISOString(),
    name: req.body.college,
    suffix: req.body.suffix,
    adminSuffix: req.body.adminSuffix,
  };

  const campus = {
    createdAt: new Date().toISOString(),
    college: req.body.college,
    name: req.body.campus,
    departments: req.body.departments,
    intakes: req.body.intakes,
    adminCreated: false,
    linkID: crypto.randomBytes(10).toString("hex"),
    collegeID: "",
  };

  admin
    .firestore()
    .collection("colleges")
    .add(college)
    .then((data) => {
      campus.collegeID = data.id;

      admin
        .firestore()
        .collection("campuses")
        .add(campus)
        .then((data) => {
          return res.json({
            message: `${college.name} created successfully along with its campus ${campus.name}`,
            linkID: campus.linkID,
            campusID: data.id,
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
});

app.post("/campus", (req, res) => {
  //first choose under which college

  const college = req.body.college;

  const campus = {
    createdAt: new Date().toISOString(),
    college: req.body.college,
    name: req.body.campus,
    departments: req.body.departments,
    intakes: req.body.intakes,
    adminCreated: false,
    linkID: crypto.randomBytes(10).toString("hex"),
    collegeID: "",
  };

  admin
    .firestore()
    .collection("colleges")
    .where("name", "==", college)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        campus.collegeID = doc.id;
      });

      admin
        .firestore()
        .collection("campuses")
        .add(campus)
        .then((data) => {
          return res.json({
            message: `${campus.name} created successfully`,
            linkID: campus.linkID,
            campusID: data.id,
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
});

//only get validity of first time login link
app.post("/validate-link/:campusID/:linkID", (req, res) => {
  const campusID = req.params.campusID;
  const linkID = req.params.linkID;

  admin
    .firestore()
    .doc(`/campuses/${campusID}`)
    .get()
    .then((doc) => {
      if (doc.data().linkID === linkID && doc.data().adminCreated === false) {
        return res.json({ valid: true });
      } else {
        return res.json({ valid: false });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
});

//admin first time login
//only allow if adminCreated is false
app.post("/admin-signup/:campusID/:linkID", (req, res) => {
  const campusID = req.params.campusID;
  const linkID = req.params.linkID;

  const adminAccount = {
    name: req.body.name,
    role: "sudo",
    email: req.body.email,
    password: req.body.password,
    userID: "",
  };

  admin
    .firestore()
    .doc(`/campuses/${campusID}`)
    .get()
    .then((doc) => {
      //check if the link is valid and if adminCreated is false
      if (doc.data().linkID === linkID && doc.data().adminCreated === false) {
        //check if admin suffix is correct
        admin
          .firestore()
          .doc(`/colleges/${doc.data().collegeID}`)
          .get()
          .then((doc) => {
            if (adminAccount.email.split("@")[1] === doc.data().adminSuffix) {
              firebase
                .auth()
                .createUserWithEmailAndPassword(
                  adminAccount.email,
                  adminAccount.password
                )
                .then((data) => {
                  userID = data.user.uid;

                  adminAccount.userID = userID;

                  admin
                    .firestore()
                    .collection("admins")
                    .add(adminAccount)
                    .then(() => {
                      firebase
                        .auth()
                        .currentUser.sendEmailVerification()
                        .then(() => {
                          return admin
                            .firestore()
                            .doc(`/campuses/${campusID}`)
                            .update({ adminCreated: true });
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
                    return res.json({ email: "Email is already in use." });
                  } else {
                    return res.status(500).json({
                      general: "Something went wrong, please try again",
                    });
                  }
                });
            } else {
              return res.json({ error: "Invalid admin email" });
            }
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: "Something went wrong" });
          });
      } else return res.json({ error: "Invalid link" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
});

//create a new admin (only by admins with sudo role)
//verify using req.user.userID

//for creating another admin,
//sudo admin generates a linkID along with the role
//sudo admin is returned a link similar to the above one, with campus id and link id
//linkID is added to a an array of linkIDs that contain json object {linkID, role} (only to be used for additional admins)
//the new admin registers using campus email and is sent email verification as usual
//role is added automatically according to the data retrieved
//once the new admin that calls with the linkID is registered, the link is deleted

//there should also be a link to update admin roles

//to generate the link
app.post("/generate-admin-link/:campusID", (req, res) => {
  const campusID = req.params.campusID;

  //roles:
  //sudo (all)
  //general (everything else other than adding new admins)
  //focused (only one function -> specify)
  //department (perform all actions for one department -> specify)

  const linkArray = [
    {
      role: req.body.role,
      linkID: crypto.randomBytes(10).toString("hex"),
    },
  ];

  //first check if the user requesting the link is a sudo user
  admin
    .firestore()
    .collection("admins")
    .where("userID", "==", req.body.userID)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        if (doc.data().role === "sudo") {
          //valid admin

          admin
            .firestore()
            .doc(`/campuses/${campusID}`)
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
            });
        } else
          return res.json({
            error:
              "Invalid admin, please have a sudo admin perform this action.",
          });
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
});

//delete a college
app.delete("/college", (req, res) => {
  const collegeID = req.body.collegeID;
  const college = req.body.college;

  admin
    .firestore()
    .doc(`/colleges/${collegeID}`)
    .delete()
    .then(() => {
      admin
        .firestore()
        .collection("campuses")
        .where("college", "==", college)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            admin.firestore().doc(`/campuses/${doc.id}`).delete();
          });
        })
        .then(() => {
          return res.json({
            message: `${college} deleted along with its campuses`,
          });
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({ error: "Something went wrong" });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
});

exports.api = functions.region("asia-southeast1").https.onRequest(app);
