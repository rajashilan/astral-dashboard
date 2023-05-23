const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");

exports.clawSignIn = (req, res) => {
  const claw = {
    email: req.body.email,
    password: req.body.password,
  };

  db.collection("theClaw")
    .where("email", "==", claw.email)
    .get()
    .then((data) => {
      if (data.docs[0].data().email === claw.email) {
        firebase
          .auth()
          .signInWithEmailAndPassword(claw.email, claw.password)
          .then((data) => {
            // if (data.user.emailVerified === false)
            //   return res.status(400).json({ error: "Please verify" });
            return data.user.getIdToken();
          })
          .then((token) => {
            return res.json({ token: token });
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: "Ayyyy...nah" });
          });
      } else return res.status(400).json({ error: "Uh uh uh" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.addCollegeAndCampus = (req, res) => {
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
    sudoAdmins: 0,
  };

  db.collection("colleges")
    .add(college)
    .then((data) => {
      campus.collegeID = data.id;

      admin
        .firestore()
        .collection("campuses")
        .add(campus)
        .then((data) => {
          campus.departments.forEach((department) => {
            let departmentData = {
              name: department,
              campusID: data.id,
            };

            admin
              .firestore()
              .collection("departments")
              .add(departmentData)
              .then((data) => {
                return res.json({
                  message: `${college.name} created successfully along with its campus ${campus.name}`,
                  linkID: campus.linkID,
                  campusID: data.id,
                });
              })
              .catch((error) => {
                console.error(error);
                return res.status(500).json({ error: "Something went wrong" });
              });
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.addCampus = (req, res) => {
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
    sudoAdmins: 0,
  };

  db.collection("colleges")
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
          campus.departments.forEach((department) => {
            let departmentData = {
              name: department,
              campusID: data.id,
            };

            admin
              .firestore()
              .collection("departments")
              .add(departmentData)
              .then((data) => {
                return res.json({
                  message: `${campus.name} created successfully`,
                  linkID: campus.linkID,
                  campusID: data.id,
                });
              })
              .catch((error) => {
                console.error(error);
                return res.status(500).json({ error: "Something went wrong" });
              });
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.deleteCollege = (req, res) => {
  const collegeID = req.body.collegeID;

  db.doc(`/colleges/${collegeID}`)
    .delete()
    .then(() => {
      admin
        .firestore()
        .collection("campuses")
        .where("collegeID", "==", collegeID)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            db.doc(`/campuses/${doc.id}`).delete();
          });
        })
        .then(() => {
          return res.json({
            message: `College deleted along with its campuses`,
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
};
