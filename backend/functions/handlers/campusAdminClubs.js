const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

//get all clubs
exports.getAllClubs = (req, res) => {
  const campusID = req.params.campusID;
  const role = req.body.role;
  const sa = req.body.sa;

  //if sa is present in college, only return pending clubs that are review level admins
  if (sa !== "" && role[0] !== "focused:studentgovernment") {
    db.collection("clubs")
      .where("campusID", "==", campusID)
      .where("reviewLevel", "==", "admin")
      .get()
      .then((data) => {
        if (!data)
          return res.status(200).json({ message: "No clubs for review" });
        let clubs = [];
        data.forEach((doc) => {
          clubs.push({ ...doc.data() });
        });
        return res.status(200).json(clubs);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
      });
    //if the role is sa, return review level sa
  } else if (sa !== "" && role[0] === "focused:studentgovernment") {
    db.collection("clubs")
      .where("campusID", "==", campusID)
      .where("reviewLevel", "==", "sa")
      .get()
      .then((data) => {
        if (!data)
          return res.status(200).json({ message: "No clubs for review" });
        let clubs = [];
        data.forEach((doc) => {
          clubs.push({ ...doc.data() });
        });
        return res.status(200).json(clubs);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
      });
    //else return all clubs
  } else if (sa === "") {
    db.collection("clubs")
      .where("campusID", "==", campusID)
      .get()
      .then((data) => {
        let clubs = [];
        data.forEach((doc) => {
          clubs.push(doc.data());
        });
        return res.status(200).json(clubs);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
      });
  } else return res.status(500).json({ message: "Bad request" });
};

//approve a club
exports.approveClub = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;
  const createdBy = req.body.createdBy;
  const rejectionReason = "";
  const role = req.body.role;

  //have to update in clubs, clubsOverview, and in Users

  //for users, the only logic is if the club approval is pending, approved, or rejected
  //so we'll only have to access user's data when it comes to this part
  //and we can access it using the createdBy since only the createdBy user will be in the club

  //if role = student government:
  //approval = pending
  //reviewLevel = "admin"
  //saApproval = "approved"

  let clubName = "";

  db.doc(`/users/${createdBy}`)
    .get()
    .then((doc) => {
      let temp = doc.data().clubs;
      let index = temp.findIndex((club) => club.clubID === clubID);
      if (role[0] !== "focused:studentgovernment")
        temp[index].approval = "approved";

      return db.doc(`/users/${createdBy}`).update({ clubs: [...temp] });
    })
    .then(() => {
      if (role[0] === "focused:studentgovernment")
        return db.doc(`/clubs/${clubID}`).update({
          saApproval: "approved",
          reviewLevel: "admin",
          approvalText: "pending approval from Admin",
        });
      else
        return db
          .doc(`/clubs/${clubID}`)
          .update({ approval: "approved", rejectionReason });
    })
    .then(() => {
      return db.doc(`/clubsOverview/${campusID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().clubs];
      let index = temp.findIndex((club) => club.clubID === clubID);
      clubName = temp[index].name;
      if (role[0] === "focused:studentgovernment") {
        temp[index].saApproval = "approved";
        temp[index].reviewLevel = "admin";
        temp[index].approvalText = "pending approval from Admin";
      } else {
        temp[index].approval = "approved";
        temp[index].rejectionReason = "";
      }
      return db.doc(`/clubsOverview/${campusID}`).update({ clubs: [...temp] });
    })
    .then(() => {
      if (role[0] === "focused:studentgovernment")
        sendEmailNotificationFromWithin(
          "createAClub",
          clubName,
          "",
          "",
          campusID
        );
      return res.status(200).json({ clubID });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//reject a club
exports.rejectClub = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;
  const createdBy = req.body.createdBy;
  const rejectionReason = req.body.rejectionReason;
  const role = req.body.role;

  //have to update in clubs, clubsOverview, and in Users

  //for users, the only logic is if the club approval is pending, approved, or rejected
  //so we'll only have to access user's data when it comes to this part
  //and we can access it using the createdBy since only the createdBy user will be in the club

  //if role = studentgovernment, set:
  //reviewLevel = "admin" (clubs, clubsOverview)
  //approval= "pending", saApproval = "rejected" (clubs, clubsOverview)
  //approvalText = "pending approval from Admin" (clubs, clubsOverview)
  //no rejectionReason, just saFeedback (clubs, clubsOverview)

  let clubName = "";

  db.doc(`/users/${createdBy}`)
    .get()
    .then((doc) => {
      let temp = doc.data().clubs;
      let index = temp.findIndex((club) => club.clubID === clubID);
      if (role[0] !== "focused:studentgovernment")
        temp[index].approval = "rejected";

      return db.doc(`/users/${createdBy}`).update({ clubs: [...temp] });
    })
    .then(() => {
      if (role[0] === "focused:studentgovernment")
        return db.doc(`/clubs/${clubID}`).update({
          reviewLevel: "admin",
          saFeedback: rejectionReason,
          approvalText: "pending approval from Admin",
          saApproval: "rejected",
        });
      else
        return db
          .doc(`/clubs/${clubID}`)
          .update({ approval: "rejected", rejectionReason });
    })
    .then(() => {
      return db.doc(`/clubsOverview/${campusID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().clubs];
      let index = temp.findIndex((club) => club.clubID === clubID);
      clubName = temp[index].name;
      if (role[0] === "focused:studentgovernment") {
        temp[index].reviewLevel = "admin";
        temp[index].saFeedback = rejectionReason;
        temp[index].approvalText = "pending approval from Admin";
        temp[index].saApproval = "rejected";
      } else {
        temp[index].approval = "rejected";
        temp[index].rejectionReason = rejectionReason;
      }
      return db.doc(`/clubsOverview/${campusID}`).update({ clubs: [...temp] });
    })
    .then(() => {
      if (role[0] === "focused:studentgovernment")
        sendEmailNotificationFromWithin(
          "createAClub",
          clubName,
          "",
          "",
          campusID
        );
      return res.status(200).json({ clubID });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//suspend a club
//indefinetely or for a time period
//time period in terms of days, starting from timestamp
//so, each time club is opened, check for suspension and timestamp
//if present, and if passed the time period
//remove suspension and update in db from app
exports.suspendClub = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;
  let suspension = req.body.suspension;

  if (suspension === "0") suspension = "suspended:0";
  else suspension = `suspended:${suspension}`;

  db.doc(`/clubs/${clubID}`)
    .update({ status: suspension })
    .then(() => {
      return db.doc(`/clubsOverview/${campusID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().clubs];
      let index = temp.findIndex((club) => club.clubID === clubID);
      temp[index].status = suspension;
      return db.doc(`/clubsOverview/${campusID}`).update({ clubs: [...temp] });
    })
    .then(() => {
      return res.status(200).json({ clubID });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//lift club's suspension
exports.removeSuspension = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;
  let suspension = "active";

  db.doc(`/clubs/${clubID}`)
    .update({ status: suspension })
    .then(() => {
      return db.doc(`/clubsOverview/${campusID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().clubs];
      let index = temp.findIndex((club) => club.clubID === clubID);
      temp[index].status = suspension;
      return db.doc(`/clubsOverview/${campusID}`).update({ clubs: [...temp] });
    })
    .then(() => {
      return res.status(200).json({ clubID });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.updateClubRole = (req, res) => {
  const { clubID, previousMember, newMember, newRole, newRoleWithoutSpacing } =
    req.body;

  let membersToReturn;

  // Update in clubs, clubMembers, and users
  db.doc(`/clubs/${clubID}`)
    .get()
    .then((doc) => {
      let roles = { ...doc.data().roles };

      // Check if user has a previous role, if yes, remove
      for (let role in roles) {
        if (roles[role].userID === newMember.userID) {
          roles[role].userID = "";
          roles[role].memberID = "";
          break;
        }
      }

      roles[newRoleWithoutSpacing].userID = newMember.userID;
      roles[newRoleWithoutSpacing].memberID = newMember.memberID;

      return db.doc(`/clubs/${clubID}`).update({ roles });
    })
    .then(() => {
      return db.doc(`/clubMembers/${clubID}`).get();
    })
    .then((doc) => {
      let members = [...doc.data().members];
      // Change previous president's role to member
      if (previousMember) {
        let index = members.findIndex(
          (member) => member.userID === previousMember.userID
        );
        if (index !== -1) {
          members[index].role = "member";
        }
      }

      // Change new president's role
      let index = members.findIndex(
        (member) => member.userID === newMember.userID
      );
      if (index !== -1) {
        members[index].role = newRole;
      }

      membersToReturn = members;

      return db.doc(`/clubMembers/${clubID}`).update({ members });
    })
    .then(() => {
      // Update old president's role in users
      if (!previousMember) return Promise.resolve();

      return db
        .doc(`/users/${previousMember.userID}`)
        .get()
        .then((doc) => {
          let clubs = [...doc.data().clubs];
          let clubIndex = clubs.findIndex((club) => club.clubID === clubID);
          if (clubIndex !== -1) {
            clubs[clubIndex].role = "member";
          }

          return db.doc(`/users/${previousMember.userID}`).update({ clubs });
        });
    })
    .then(() => {
      // Update new president's role in users
      return db
        .doc(`/users/${newMember.userID}`)
        .get()
        .then((doc) => {
          let clubs = [...doc.data().clubs];
          let index = clubs.findIndex((club) => club.clubID === clubID);
          if (index !== -1) {
            clubs[index].role = newRole;
          }

          return db.doc(`/users/${newMember.userID}`).update({ clubs });
        });
    })
    .then(() => {
      return res
        .status(200)
        .json({
          message: "Updated role successfully",
          clubMembers: membersToReturn,
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getClubMembers = (req, res) => {
  const clubID = req.params.clubID;

  db.doc(`/clubMembers/${clubID}`)
    .get()
    .then((doc) => {
      return res.status(200).json([...doc.data().members]);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getApprovedClubs = (req, res) => {
  const campusID = req.params.campusID;

  db.collection("clubs")
    .where("campusID", "==", campusID)
    .where("approval", "==", "approved")
    .get()
    .then((data) => {
      let approvedClubs = [];
      data.forEach((doc) => {
        approvedClubs.push({ ...doc.data() });
      });
      return res.status(200).json(approvedClubs);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//get clubs for SA
//approve clubs for SA
//deny clubs for SA

exports.getPendingClubsForSA = (req, res) => {
  const campusID = req.params.campusID;

  db.collection("clubs")
    .where("campusID", "==", campusID)
    .where("reviewLevel", "==", "sa")
    .get()
    .then((data) => {
      if (!data)
        return res.status(200).json({ message: "No clubs for review" });
      let clubs = [];
      data.forEach((doc) => {
        clubs.push({ ...doc.data() });
      });
      return res.status(200).json(clubs);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getPendingClubsForAdmin = (req, res) => {
  const campusID = req.params.campusID;

  db.collection("clubs")
    .where("campusID", "==", campusID)
    .where("reviewLevel", "==", "admin")
    .get()
    .then((data) => {
      if (!data)
        return res.status(200).json({ message: "No clubs for review" });
      let clubs = [];
      data.forEach((doc) => {
        clubs.push({ ...doc.data() });
      });
      return res.status(200).json({ clubs });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.approveClubUnderSA = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;

  //update in clubs, clubsOverview -> reviewTier, approval, saApproval
  //send notification to admin

  db.doc(`/clubs/${clubID}`)
    .update({
      reviewTier: "admin",
      approval: "pending approval from Admin",
      saApproval: "approved",
    })
    .then(() => {
      return db.doc(`/clubsOverview/${campusID}`).get();
    })
    .then((doc) => {
      let clubs = [...doc.data().clubs];
      let index = clubs.findIndex((club) => club.clubID === clubID);
      clubs[index].reviewTier = "admin";
      clubs[index].approval = "pending approval from Admin";
      clubs[index].saApproval = "approved";

      return db.doc(`/clubsOverview/${campusID}`).update({ clubs: [...clubs] });
    })
    .then(() => {
      return res.status(200).json({ message: "club recommended successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.rejectClubUnderSA = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;
  const feedback = req.body.feedback;

  //update in clubs, clubsOverview -> reviewTier, approval, saApproval
  //send notification to admin

  db.doc(`/clubs/${clubID}`)
    .update({
      reviewTier: "admin",
      approval: "pending approval from Admin",
      saApproval: "rejected",
      saFeedback: feedback,
    })
    .then(() => {
      return db.doc(`/clubsOverview/${campusID}`).get();
    })
    .then((doc) => {
      let clubs = [...doc.data().clubs];
      let index = clubs.findIndex((club) => club.clubID === clubID);
      clubs[index].reviewTier = "admin";
      clubs[index].approval = "pending approval from Admin";
      clubs[index].saApproval = "rejected";
      clubs[index].saFeedback = feedback;

      return db.doc(`/clubsOverview/${campusID}`).update({ clubs: [...clubs] });
    })
    .then(() => {
      return res.status(200).json({ message: "club rejected successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

const sendEmailNotificationFromWithin = (
  type,
  clubName,
  sa,
  saName,
  campusID
) => {
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
        admins.push("rajashilan07@gmail.com");
        return admins;
      })
      .then((admins) => {
        console.log(
          "---------------- admins for email notifications from within: ",
          admins
        );
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
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
  }
};
