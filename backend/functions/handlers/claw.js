const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const config = require("../utils/config");

exports.clawSignIn = (req, res) => {
  const claw = {
    email: req.body.email,
    password: req.body.password,
  };

  db.doc("claws/admins")
    .get()
    .then((doc) => {
      if (doc.data().emails.includes(claw.email)) {
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
  const college = {
    createdAt: new Date().toISOString(),
    name: req.body.college,
    suffix: req.body.suffix,
    adminSuffix: req.body.adminSuffix,
    logo: req.body.logo,
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
    orientationID: "",
    sudoAdmins: 0,
    sa: req.body.sa,
    saName: req.body.saName,
    clubCreationDoc: req.body.clubCreationDoc,
    clubCreationDocName: req.body.clubCreationDocName,
    logo: req.body.logo,
  };

  let orientationData = {
    title: `${campus.name}'s Orientation`,
    campusID: "",
    createdAt: new Date().toISOString(),
    orientationID: "",
    videos: [],
    pages: [],
  };

  //make sure college and campus' name are not similar to others
  db.collection("colleges")
    .where("name", "==", college.name)
    .get()
    .then((collegeData) => {
      if (!collegeData.empty) {
        return res.status(500).json({ error: "College name already exists" });
      } else {
        return db.collection("campuses").where("name", "==", campus.name).get();
      }
    })
    .then((campusData) => {
      if (!campusData.empty) {
        return res.status(500).json({ error: "Campus name already exists" });
      } else {
        return db.collection("colleges").add(college);
      }
    })
    .then((data) => {
      campus.collegeID = data.id;

      admin
        .firestore()
        .collection("campuses")
        .add(campus)
        .then((data) => {
          orientationData.campusID = data.id;

          campus.departments.forEach((department) => {
            let departmentData = {
              name: department,
              campusID: data.id,
            };

            admin.firestore().collection("departments").add(departmentData);
          });
        })
        .then(() => {
          //create orientation overview

          db.collection("orientations")
            .add(orientationData)
            .then((data) => {
              orientationData.orientationID = data.id;
              return db
                .doc(`/orientations/${orientationData.orientationID}`)
                .update({ orientationID: orientationData.orientationID });
            })
            .then(() => {
              return db
                .doc(`/campuses/${orientationData.campusID}`)
                .update({ orientationID: orientationData.orientationID });
            })
            .then(() => {
              return res.status(201).json({
                message: `${campus.name} created successfully`,
                linkID: campus.linkID,
                campusID: orientationData.campusID,
                collegeID: campus.collegeID,
                link: `https://astral-app.com/${orientationData.campusID}/${campus.linkID}/1`,
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
    orientationID: "",
    sudoAdmins: 0,
    sa: req.body.sa,
    saName: req.body.saName,
    clubCreationDoc: req.body.clubCreationDoc,
    clubCreationDocName: req.body.clubCreationDocName,
  };

  let orientationData = {
    title: `${campus.name}'s Orientation`,
    campusID: "",
    createdAt: new Date().toISOString(),
    orientationID: "",
    videos: [],
    pages: [],
  };

  db.collection("campuses")
    .where("name", "==", campus.name)
    .get()
    .then((campusData) => {
      if (!campusData.empty) {
        return res.status(500).json({ error: "Campus name already exists" });
      } else {
        return db.collection("colleges").where("name", "==", college).get();
      }
    })
    .then((data) => {
      data.forEach((doc) => {
        campus.collegeID = doc.id;
        campus.logo = doc.data().logo;
      });

      admin
        .firestore()
        .collection("campuses")
        .add(campus)
        .then((data) => {
          orientationData.campusID = data.id;

          campus.departments.forEach((department) => {
            let departmentData = {
              name: department,
              campusID: data.id,
            };

            admin.firestore().collection("departments").add(departmentData);
          });
        })
        .then(() => {
          //create orientation overview

          db.collection("orientations")
            .add(orientationData)
            .then((data) => {
              orientationData.orientationID = data.id;
              return db
                .doc(`/orientations/${orientationData.orientationID}`)
                .update({ orientationID: orientationData.orientationID });
            })
            .then(() => {
              return db
                .doc(`/campuses/${orientationData.campusID}`)
                .update({ orientationID: orientationData.orientationID });
            })
            .then(() => {
              return res.status(201).json({
                message: `${campus.name} created successfully`,
                linkID: campus.linkID,
                campusID: orientationData.campusID,
                collegeID: campus.collegeID,
                link: `https://astral-app.com/${orientationData.campusID}/${campus.linkID}/1`,
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

exports.changeID = (req, res) => {
  db.doc(`/generalFormsOverview/hgvlJ4CKoZYA765tfXSL`)
    .get()
    .then((doc) => {
      let temp = [...doc.data().forms];
      return db
        .doc(`/generalFormsOverview/W0ZatA2fKMe01xk025S6`)
        .set({ forms: [...temp] });
    })
    .then(() => {
      return res.status(201).json({ message: "success" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.createTestClubsOverview = (req, res) => {
  let toUpload = [];

  for (var i = 0; i < 40; i++) {
    let data = {
      name: `test ${crypto.randomBytes(10).toString("hex")}`,
      image:
        "https://firebasestorage.googleapis.com/v0/b/astral-d3ff5.appspot.com/o/clubs%2Fclubs_default.jpeg?alt=media&token=8a9c42e0-d937-4389-804f-9fd6953644ac&_gl=1*1c0ck02*_ga*NTQ3Njc0ODExLjE2ODA3MTQ2Mjg.*_ga_CW55HF8NVT*MTY5ODI5NzM4MS4xOTUuMS4xNjk4MzAwMDYzLjU4LjAuMA..",
      clubID: 123456, //to be added later
      approval: "approved",
      approvalText: "",
      reviewLevel: "admin",
      saFeedback: "",
      saApproval: "",
      rejectionReason: "",
      status: "active",
      createdBy: "test",
      createdAt: i + 1,
      campusID: "W0ZatA2fKMe01xk025S6",
    };
    toUpload.push(data);
  }

  db.doc(`clubsOverview/W0ZatA2fKMe01xk025S6`)
    .update({ test: [...toUpload] })
    .then(() => {
      return res.status(201).json({ message: "Success" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.createTestOrientationOverview = (req, res) => {
  let toUpload = [];

  for (var i = 0; i < 40; i++) {
    let data = {
      orientationPageID: crypto.randomBytes(10).toString("hex"),
      title: `test ${crypto.randomBytes(10).toString("hex")}`,
    };
    toUpload.push(data);
  }

  db.doc(`orientations/4dCJIooWXaFyDlHn2BeZ`)
    .update({ test: [...toUpload] })
    .then(() => {
      return res.status(201).json({ message: "Success" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.uploadCollegeLogo = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const collegeID = req.params.collegeID;

  let request = `colleges%2F${collegeID}%2F`;

  //need to get details from orientationPageID first
  //look for the particular subcontent using subcontentID
  //and update the subcontent

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  let imageUrl;
  let batch = db.batch();

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/png" &&
      mimetype !== "image/svg+xml"
    ) {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    const randomNum = crypto.randomBytes(10).toString("hex");

    imageFileName = `${randomNum}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = {
      filepath,
      mimetype,
    };

    file.pipe(fs.createWriteStream(filepath));
  });

  let token = crypto.randomBytes(20).toString("hex");

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        destination: `colleges/${collegeID}/` + imageFileName,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
            firebaseStorageDownloadTokens: token,
          },
        },
      })
      .then(() => {
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${request}${imageFileName}?alt=media&token=${token}`;

        return db.doc(`/colleges/${collegeID}`).update({ logo: imageUrl });
      })
      .then(() => {
        return db
          .collection("campuses")
          .where("collegeID", "==", collegeID)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          const ref = db.doc(`/campuses/${doc.id}`);
          batch.update(ref, { logo: imageUrl });
        });
        return batch.commit();
      })
      .then(() => {
        return res.status(201).json({ message: "Logo uploaded successfully" });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};
