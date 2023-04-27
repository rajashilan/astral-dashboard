const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello World!");
});

exports.getColleges = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("colleges")
    .get()
    .then((data) => {
      let colleges = [];
      data.forEach((doc) => {
        colleges.push(doc.data());
      });
      return res.json(colleges);
    })
    .catch((error) => {
      console.error(error);
    });
});
