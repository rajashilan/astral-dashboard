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
      console.log(req.user);
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
          if (
            doc.data().role === "sudo" &&
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
