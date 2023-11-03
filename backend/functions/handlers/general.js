const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");

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

  //different message templates according to notification types (req.body)
  //types: create a club, club resubmission, create an event, event resubmission, create a gallery, gallery resubmission

  let message;

  if (type === "createAClub")
    message =
      "<h1>New club request</h1></br><p>Head over to</p><a href='http://localhost:3000/clubs'>astral dashboard</a><p>to view the request.</p>";
  else if (type === "clubResubmission")
    message =
      "<h1>New club resubmission</h1></br><p>Head over to</p><a href='http://localhost:3000/clubs'>astral dashboard</a><p>to view the request.</p>";
  else if (type === "createAnEvent")
    message = `<h1>Request to add new event from ${clubName}</h1></br><p>Head over to</p><a href='http://localhost:3000/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "eventResubmission")
    message = `<h1>New event resubmission from ${clubName}</h1></br><p>Head over to</p><a href='http://localhost:3000/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "createAGallery")
    message = `<h1>Request to add new gallery from ${clubName}</h1></br><p>Head over to</p><a href='http://localhost:3000/clubs'>astral dashboard</a><p>to view the request.</p>`;
  else if (type === "galleryResubmission")
    message = `<h1>New gallery resubmission from ${clubName}</h1></br><p>Head over to</p><a href='http://localhost:3000/clubs'>astral dashboard</a><p>to view the request.</p>`;

  db.collection("admins")
    .where("campusID", "==", campusID)
    .where("role", "array-contains-any", ["sudo", "focused:clubs"])
    .get()
    .then((data) => {
      let admins = [];
      data.forEach((doc) => {
        admins.push(doc.data().testEmail);
      });
      return admins;
    })
    .then((admins) => {
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
};
