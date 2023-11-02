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

  //different message templates according to notification types (req.body)
  //types: create a club, club resubmission, create an event, event resubmission, create a gallery, gallery resubmission

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
            subject: "Notification for astral",
            text: "Notification test",
            html: "<h1>New event request from Computer Science Club</h1></br><p>Head over to dashboard to approve or reject.</p>",
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
