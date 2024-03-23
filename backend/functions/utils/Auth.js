const admin = require("firebase-admin");

exports.NormalAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    //get the id token from the header
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //check whether the id token is from our database
  //if yes, decode the token to get user data
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // if (!decodedToken.email_verified) {
      //   return res.status(401).json({ general: "Please verify your email" });
      // }
      req.user = decodedToken;
      return next();
    })
    .catch((error) => {
      console.error("Error while verifying token", error);
      return res.status(401).json({ error });
    });
};

exports.sudoAdminAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    //get the id token from the header
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //check whether the id token is from our database
  //if yes, decode the token to get user data
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // if (!decodedToken.email_verified) {
      //   return res.status(401).json({ general: "Please verify your email" });
      // }
      req.user = decodedToken;
      admin
        .firestore()
        .doc(`/admins/${req.user.user_id}`)
        .get()
        .then((doc) => {
          //check if the admin is:
          //a sudo admin
          //has the same campus id as the requesting campusID
          //is active

          //check based on data being requested and admin role
          //sudo: all
          //clubs: clubs
          //orientation: orientation
          //college: college
          //student government: pending clubs

          let toCheckRole = "";
          let url = req.url.split("/")[1];
          if (url === "admins" || url === "admin")
            toCheckRole = "focused:college";
          else if (url === "clubs") toCheckRole = "focused:clubs";
          else if (url === "orientation") toCheckRole = "focused:orientation";
          else if (url === "clubs-sa")
            toCheckRole = "focused:studentgovernment";

          const campusID = req.params.campusID || req.query.campusID;

          if (
            (doc.data().role[0] === "sudo" &&
              doc.data().campusID === campusID &&
              doc.data().active === true) ||
            (doc.data().role.includes(toCheckRole) &&
              doc.data().campusID === campusID &&
              doc.data().active === true)
          ) {
            req.user.role = doc.data().role;
            return next();
          } else return res.status(400).json({ error: "Invalid admin" });
        });
    })
    .catch((error) => {
      console.error("Error while verifying token", error);
      return res.status(401).json({ error });
    });
};

exports.verifyAdminForSessionData = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    //get the id token from the header
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //check whether the id token is from our database
  //if yes, decode the token to get user data
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // if (!decodedToken.email_verified) {
      //   return res.status(401).json({ general: "Please verify your email" });
      // }
      req.user = decodedToken;
      admin
        .firestore()
        .doc(`/admins/${req.user.user_id}`)
        .get()
        .then((doc) => {
          //check if the admin is:
          //a sudo admin
          //has the same campus id as the requesting campusID
          //is active
          if (
            doc.data().campusID === req.params.campusID &&
            doc.data().active === true
          ) {
            req.user.role = doc.data().role;
            return next();
          } else return res.status(400).json({ error: "Invalid admin" });
        });
    })
    .catch((error) => {
      console.error("Error while verifying token", error);
      return res.status(401).json({ error });
    });
};

exports.verifyClaw = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    //get the id token from the header
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //check whether the id token is from our database
  //if yes, decode the token to get user data
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // if (!decodedToken.email_verified) {
      //   return res.status(401).json({ general: "Please verify your email" });
      // }
      req.user = decodedToken;
      admin
        .firestore()
        .doc(`/claws/admins`)
        .get()
        .then((doc) => {
          if (doc.data().emails.includes(req.user.email)) {
            return next();
          } else return res.status(400).json({ error: "Invalid claw" });
        });
    })
    .catch((error) => {
      console.error("Error while verifying token", error);
      return res.status(401).json({ error });
    });
};
