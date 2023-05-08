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
  firebase
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
