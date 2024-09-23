const { admin, db } = require("../utils/admin");
const crypto = require("crypto");
const config = require("../utils/config");
const { Expo } = require("expo-server-sdk");

exports.createNotification = async (req, res) => {
  const notification = req.body.notification;
  const userIDs = req.body.userIDs;

  const batch = db.batch();

  userIDs.forEach((userID) => {
    const ref = db.collection("notifications").doc();
    notification.notificationID = ref.id;
    notification.userID = userID;
    batch.set(ref, notification);
  });

  try {
    await batch.commit();

    // Create an array to store promises for fetching push tokens
    const pushTokenPromises = userIDs.map(async (userID) => {
      const doc = await db.doc(`/users/${userID}`).get();
      console.log(
        `--------- sendPushNotifications: user data from db `,
        doc.data()
      );
      return doc.data().pushNotificationToken || null; // Return null if no token
    });

    // Wait for all promises to resolve
    const pushTokens = await Promise.all(pushTokenPromises);

    // Filter out null tokens
    const validPushTokens = pushTokens.filter((token) => token);

    if (validPushTokens.length > 0) {
      sendPushNotifications(validPushTokens, notification);
    }

    return res
      .status(201)
      .json({ message: "Notification created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
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

const sendPushNotifications = (pushTokens, notification) => {
  console.log(
    `--------- sendPushNotifications: pushTokens received: `,
    pushTokens
  );
  let expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
  });

  let body = notification.defaultText
    ? notification.defaultText
    : `${notification.preText} ${notification.sourceName} ${notification.postText}`;
  body = body.trim();

  console.log(`--------- sendPushNotifications: body: `, body);

  // Create the messages that you want to send to clients
  let messages = [];
  for (let pushToken of pushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: "default",
      body: body,
      data: {
        sourceDestination: notification.sourceDestination,
        sourceID: notification.sourceID,
      },
    });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();

  // Later, after the Expo push notification service has delivered the
  // notifications to Apple or Google (usually quickly, but allow the service
  // up to 30 minutes when under load), a "receipt" for each notification is
  // created. The receipts will be available for at least a day; stale receipts
  // are deleted.
  //
  // The ID of each receipt is sent back in the response "ticket" for each
  // notification. In summary, sending a notification produces a ticket, which
  // contains a receipt ID you later use to get the receipt.
  //
  // The receipts may contain error codes to which you must respond. In
  // particular, Apple or Google may block apps that continue to send
  // notifications to devices that have blocked notifications or have uninstalled
  // your app. Expo does not control this policy and sends back the feedback from
  // Apple and Google so you can handle it appropriately.
  let receiptIds = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.status === "ok") {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
