const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

//get all clubs
exports.getAllClubs = (req, res) => {
  const campusID = req.params.campusID;

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
};

//approve a club
exports.approveClub = (req, res) => {
  const clubID = req.params.clubID;
  const campusID = req.params.campusID;
  const createdBy = req.body.createdBy;
  const rejectionReason = "";

  //have to update in clubs, clubsOverview, and in Users

  //for users, the only logic is if the club approval is pending, approved, or rejected
  //so we'll only have to access user's data when it comes to this part
  //and we can access it using the createdBy since only the createdBy user will be in the club

  db.doc(`/users/${createdBy}`)
    .get()
    .then((doc) => {
      let temp = doc.data().clubs;
      let index = temp.findIndex((club) => club.clubID === clubID);
      temp[index].approval = "approved";

      return db.doc(`/users/${createdBy}`).update({ clubs: [...temp] });
    })
    .then(() => {
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
      temp[index].approval = "approved";
      temp[index].rejectionReason = "";
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

  //have to update in clubs, clubsOverview, and in Users

  //for users, the only logic is if the club approval is pending, approved, or rejected
  //so we'll only have to access user's data when it comes to this part
  //and we can access it using the createdBy since only the createdBy user will be in the club

  db.doc(`/users/${createdBy}`)
    .get()
    .then((doc) => {
      let temp = doc.data().clubs;
      let index = temp.findIndex((club) => clubID === clubID);
      temp[index].approval = "rejected";

      return db.doc(`/users/${createdBy}`).update({ clubs: [...temp] });
    })
    .then(() => {
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
      temp[index].approval = "rejected";
      temp[index].rejectionReason = rejectionReason;
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
      return res.status(200).json({ ...doc.data().members });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};
