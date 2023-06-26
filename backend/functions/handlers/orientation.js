const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const config = require("../utils/config");

//orientation overview details required:
//a possible video
//a title
//content
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
    campusID: campusID,
    createdAt: new Date().toISOString(),
    orientationID: orientationID,
    title: req.body.title,
    header: req.body.header,
    content: req.body.content,
    video: req.body.video,
    image: req.body.image,
    files: req.body.files,
    subcontent: [],
  };

  let orientationPageID;

  db.collection("orientationPages")
    .add(data)
    .then((data) => {
      orientationPageID = data.id;

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ orientationPageID: orientationPageID });
    })
    .then((data) => {
      return res.status(201).json({ orientationPageID: orientationPageID });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.getOrientationPages = (req, res) => {
  const campusID = req.params.campusID;

  db.collection("orientationPages")
    .where("campusID", "==", campusID)
    .get()
    .then((data) => {
      let orientationPages = [];
      data.forEach((doc) => {
        orientationPages.push(doc.data());
      });
      return res.status(200).json(orientationPages);
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
    image: req.body.image,
    files: req.body.files,
    subcontentID: crypto.randomBytes(10).toString("hex"),
    createdAt: new Date().toISOString(),
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
          return res.status(201).json({ subcontent: data });
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

//edit orientation page content
exports.editOrientationPageContent = (req, res) => {
  const orientationPageID = req.params.orientationPageID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .update({ content: req.body.content })
    .then(() => {
      return res
        .status(201)
        .json({ message: "Orientation page content updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//edit subcontent title
exports.editSubcontentTitle = (req, res) => {
  const orientationPageID = req.params.orientationPageID;
  const subcontentID = req.params.subcontentID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      let subcontent = doc.data().subcontent;

      index = subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === subcontentID
      );
      subcontent[index].title = req.body.title;

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: subcontent });
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "Subcontent title updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//edit subcontent content
exports.editSubcontentContent = (req, res) => {
  const orientationPageID = req.params.orientationPageID;
  const subcontentID = req.params.subcontentID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      let subcontent = doc.data().subcontent;

      index = subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === subcontentID
      );
      subcontent[index].content = req.body.content;

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: subcontent });
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "Subcontent content updated successfully" });
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

//upload image for posts

//pass the folder name and the document collection name
//use these values to upload to storage and update firestore
exports.uploadOrientationPostImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  console.log(req.headers);

  let request = "orientation%2Fpages%2Fimages%2F";

  //need to get details from orientationPageID first
  //look for the particular subcontent using subcontentID
  //and update the subcontent

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  let imageUrl;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

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

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        destination: "orientation/pages/images/" + imageFileName,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${request}${imageFileName}?alt=media`;

        return res.status(201).json({ downloadUrl: imageUrl });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};

exports.uploadOrientationPostFile = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  let request = "orientation%2Fpages%2Ffiles%2F";

  //need to get details from orientationPageID first
  //look for the particular subcontent using subcontentID
  //and update the subcontent

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  let imageUrl;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(mimetype);
    if (mimetype === "image/jpeg" || mimetype === "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    const randomNum = crypto.randomBytes(10).toString("hex");

    imageFileName = `${randomNum}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = {
      filepath,
      mimetype,
    };

    console.log(imageToBeUploaded);

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        destination: "orientation/pages/files/" + imageFileName,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        fileUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${request}${imageFileName}?alt=media`;

        return res.status(201).json({ downloadUrl: fileUrl });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};
