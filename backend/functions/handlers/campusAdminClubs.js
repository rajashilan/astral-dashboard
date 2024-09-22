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
        return db
          .doc(`/clubs/${clubID}`)
          .update({
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

exports.changePresident = (req, res) => {
  const clubID = req.body.clubID;
  const previousPresident = req.body.previousPresident;
  const newPresident = req.body.newPresident;

  //update in clubs, clubMembers, and users
  db.doc(`/clubs/${clubID}`)
    .get()
    .then((doc) => {
      let temp = { ...doc.data().roles };

      //check if user has had a previous role, if yes, remove
      for (role in temp) {
        if (temp[role].userID === newPresident.userID) {
          temp[role].userID = "";
          temp[role].memberID = "";
          break;
        }
      }

      temp["president"].userID = newPresident.userID;
      temp["president"].memberID = newPresident.memberID;

      return db.doc(`/clubs/${clubID}`).update({ roles: { ...temp } });
    })
    .then(() => {
      return db.doc(`/clubMembers/${clubID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().members];
      //change previous president's role to member
      let prevPresidentIndex = temp.findIndex(
        (member) => member.userID === previousPresident.userID
      );
      temp[prevPresidentIndex].role = "member";

      //change new president's role to president
      let newPresidentIndex = temp.findIndex(
        (member) => member.userID === newPresident.userID
      );
      temp[newPresidentIndex].role = "president";

      return db.doc(`/clubMembers/${clubID}`).update({ members: [...temp] });
    })
    .then(() => {
      //update old president's role in users
      return db.doc(`/users/${previousPresident.userID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().clubs];

      let clubIndex = temp.findIndex((club) => club.clubID === clubID);
      temp[clubIndex].role = "member";

      return db
        .doc(`/users/${previousPresident.userID}`)
        .update({ clubs: [...temp] });
    })
    .then(() => {
      //update new president's role in users
      return db.doc(`/users/${newPresident.userID}`).get();
    })
    .then((doc) => {
      let temp = [...doc.data().clubs];

      let clubIndex = temp.findIndex((club) => club.clubID === clubID);
      temp[clubIndex].role = "president";

      return db
        .doc(`/users/${newPresident.userID}`)
        .update({ clubs: [...temp] });
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "Changed president successfully" });
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
