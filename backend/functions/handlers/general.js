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
