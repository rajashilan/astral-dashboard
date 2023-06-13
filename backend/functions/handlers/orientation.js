const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

//orientation overview details required:
//a possible video
//a title
//list of all orientation pages

//only sudo and admins with general and focused:college can create this

//create new orientation overview (video and title)
exports.createOrientationOverview = (req, res) => {
  const campusID = req.params.campusID;

  let data = {
    title: req.body.title,
    campusID: campusID,
    createdAt: new Date().toISOString(),
    orientationID: "",
  };

  db.collection("orientations")
    .add(data)
    .then((data) => {
      data.orientationID = data.id;
      return db
        .doc(`/orientations/${data.orientationID}`)
        .update({ orientationID: data.orientationID });
    })
    .then(() => {
      return db
        .doc(`/campuses/${campusID}`)
        .update({ orientationID: data.orientationID });
    })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Orientation overview created successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//get orientation overview
exports.getOrientationOverview = (req, res) => {
  const campusID = req.params.campusID;

  let orientationData;

  db.collection("orientations")
    .where("campusID", "==", campusID)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        orientationData = {
          ...doc.data(),
          orientationID: doc.id,
        };
      });
      return res.status(200).json(orientationData);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//edit orientation overview (video and title)
exports.editOrientationOverview = (req, res) => {
  const orientationID = req.params.orientationID;

  let data = {
    title: req.body.title,
  };

  db.doc(`/orientations/${orientationID}`)
    .update({ title: data.title })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Orientation overview updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

// orientationPages:
// {
//     orienatationPageID: id,
//     campusID: campusID,
//     createdAt: Date,
//     orientationID: id,
//     title: title,
//     header: header,
//     subcontent: [
//         {
//             title: title,
//             content: content,
//             images: [{image: imageUrl,}],
//             files: [{title:title, link: link}],
//         }
//     ]
// }

//create new orientation page
exports.createOrientationPage = (req, res) => {
  const orientationID = req.params.orientationID;
  const campusID = req.params.campusID;

  let data = {
    orientationPageID: "",
    campusID: campusID,
    createdAt: new Date().toISOString(),
    orientationID: orientationID,
    title: req.body.title,
    header: req.body.header,
    subcontent: [],
  };

  db.collection("orientationPages")
    .add(data)
    .then((data) => {
      data.orientationPageID = data.id;

      return db
        .doc(`/orientationPages/${data.orientationPageID}`)
        .update({ orientationPageID: data.orientationPageID });
    })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Orientation page successfully created" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//create new subcontent
//     subcontent: [
//         {
//             title: title,
//             content: content,
//             images: [{image: imageUrl,}],
//             files: [{title:title, link: link}],
//         }
//     ]

exports.createNewSubcontent = (req, res) => {
  const orientationPageID = req.params.orientationPageID;

  //first get the subcontents for the orientation page
  //save them to temp
  //take new subcontent and append to temp
  //update the orientation page's subcontent

  let data = {
    title: req.body.title,
    content: req.body.content,
    subcontentID: crypto.randomBytes(10).toString("hex"),
  };

  let tempData = [];

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      tempData = doc.data().subcontent;

      tempData.push(data);

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: tempData })
        .then(() => {
          return res
            .status(201)
            .json({ message: "Subcontent created successfully" });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//delete subcontent
exports.deleteSubcontent = (req, res) => {
  const orientationPageID = req.params.orientationPageID;
  const subcontentID = req.params.subcontentID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      let tempSubcontent = doc.data().subcontent;
      tempSubcontent = tempSubcontent.filter(
        (subcontent) => subcontent.subcontentID !== subcontentID
      );

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: tempSubcontent });
    })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Subcontent deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//edit orientation page title
exports.editOrientationPageTitle = (req, res) => {
  const orientationPageID = req.params.orientationPageID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .update({ title: req.body.title })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Orientation page title updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//edit orientation page header
exports.editOrientationPageHeader = (req, res) => {
  const orientationPageID = req.params.orientationPageID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .update({ header: req.body.header })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Orientation page header updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//delete orientation page
exports.deleteOrientationPage = (req, res) => {
  const orientationPageID = req.params.orientationPageID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .delete()
    .then(() => {
      return res
        .status(200)
        .json({ message: "Orientation page deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};
