const { admin, db } = require("../utils/admin");
const crypto = require("crypto");
const config = require("../utils/config");

exports.createNotification = (req, res) => {
  const notification = req.body.notification;
  const userIDs = req.body.userIDs;

  let batch = db.batch();

  userIDs.forEach((userID) => {
    const ref = db.collection("notifications").doc();
    notification.notificationID = ref.id;
    notification.userID = userID;
    batch.set(ref, notification);
  });
  batch
    .commit()
    .then(() => {
      return res
        .status(201)
        .json({ message: "Notification created successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.sendEmailNotification = (req, res) => {
  const campusID = req.params.campusID;
  const type = req.body.type;
  const clubName = req.body.clubName;
  const sa = req.body.sa;
  const saName = req.body.saName;

  //different message templates according to notification types (req.body)
  //types: create a club, club resubmission, create an event, event resubmission, create a gallery, gallery resubmission

  let message;

  if (type === "createAClub" && sa === "")
    message =
      "<h1>New club request</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>";
  else if (type === "createAClub" && sa !== "")
    message = `<h1>New club request, please review and submit for admin to approve.</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "clubResubmission")
    message =
      "<h1>New club resubmission</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>";
  else if (type === "createAnEvent")
    message = `<h1>Request to add new event from ${clubName}</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "eventResubmission")
    message = `<h1>New event resubmission from ${clubName}</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "createAGallery")
    message = `<h1>Request to add new gallery from ${clubName}</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "galleryResubmission")
    message = `<h1>New gallery resubmission from ${clubName}</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "saClubReview")
    message = `<h1>New club review from ${saName} for ${clubName}</h1></br><p>Head over to</p><a href='https://astral-app.com/clubs'>astral dashboard</a><p>to view the request.</p>`;

  if (type === "createAClub" && sa !== "") {
    admin
      .firestore()
      .collection("mail")
      .add({
        to: sa,
        message: {
          subject: "New request from astral.",
          text: "",
          html: message,
        },
      })
      .then(() => {})
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
      });
  } else {
    db.collection("admins")
      .where("campusID", "==", campusID)
      .where("role", "array-contains-any", ["sudo", "focused:clubs"])
      .get()
      .then((data) => {
        let admins = [];
        data.forEach((doc) => {
          admins.push(doc.data().email);
        });
        return admins;
      })
      .then((admins) => {
        console.log(admins);
        return admin
          .firestore()
          .collection("mail")
          .add({
            to: admins,
            message: {
              subject: "New request from astral.",
              text: "",
              html: message,
            },
          });
      })
      .then(() => {
        return res
          .status(201)
          .json({ message: "Email notifications sent succesfully" });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
      });
  }
};

exports.getGeneralForms = (req, res) => {
  const campusID = req.params.campusID;

  db.doc(`/generalFormsOverview/${campusID}`)
    .get()
    .then((doc) => {
      if (doc.exists) return res.status(200).json(doc.data());
      else return res.status(200).json({ forms: [] });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.deleteGeneralForm = (req, res) => {
  const campusID = req.params.campusID;
  const generalFormID = req.body.generalFormID;

  //delete in generalFormsOverview and in generalForms

  db.doc(`/generalFormsOverview/${campusID}`)
    .get()
    .then((doc) => {
      let temp = doc.data().forms;
      console.log(generalFormID);
      let index = temp.findIndex(
        (form) => form.generalFormID === generalFormID
      );
      temp.splice(index, 1);

      return db
        .doc(`/generalFormsOverview/${campusID}`)
        .update({ forms: [...temp] });
    })
    .then(() => {
      return db.doc(`/generalForms/${generalFormID}`).delete();
    })
    .then(() => {
      return res.status(201).json({ message: "Form deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.uploadForm = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const campusID = req.params.campusID;

  let request = `generalForms%2F${campusID}%2F`;

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
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
        destination: `generalForms/${campusID}/` + imageFileName,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
            firebaseStorageDownloadTokens: token,
          },
        },
      })
      .then(() => {
        formUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${request}${imageFileName}?alt=media&token=${token}`;

        return res.status(201).json({ downloadUrl: formUrl });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};
