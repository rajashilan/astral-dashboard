const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const config = require("../utils/config");
const { ExportBundleInfo } = require("firebase-functions/v1/analytics");

//orientation overview should also contain
//content, photo, files, and a video
//photo, files, and videos are in array format

//what if they want to have more images
//or more videos?

//in the app, more than 1 image turns into a carousel
//videos are just shown one after another

exports.createOrientationOverview = (req, res) => {
  const campusID = req.params.campusID;

  let data = {
    title: req.body.title,
    campusID: campusID,
    createdAt: new Date().toISOString(),
    orientationID: "",
    images: req.body.images,
    videos: req.body.videos,
    content: req.body.content,
    files: req.body.files,
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

exports.editOrientationOverviewVideos = (req, res) => {};

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

//edit subcontent image
exports.editSubcontentImage = (req, res) => {
  const orientationPageID = req.params.orientationPageID;
  const subcontentID = req.params.subcontentID;

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      let subcontent = doc.data().subcontent;

      index = subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === subcontentID
      );
      subcontent[index].image = req.body.image;

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: subcontent });
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "Subcontent image updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

//edit subcontent file
exports.editSubcontentFile = (req, res) => {
  const orientationPageID = req.params.orientationPageID;
  const subcontentID = req.params.subcontentID;

  let file = {
    url: req.body.file,
    filename: req.body.filename,
  };

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      let subcontent = doc.data().subcontent;

      index = subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === subcontentID
      );

      subcontent[index].files.push(file);

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: subcontent });
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "Subcontent file updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.deleteSubcontentFile = (req, res) => {
  const orientationPageID = req.params.orientationPageID;
  const subcontentID = req.params.subcontentID;
  const url = req.body.url;

  console.log(req.body.url);

  db.doc(`/orientationPages/${orientationPageID}`)
    .get()
    .then((doc) => {
      let subcontent = doc.data().subcontent;

      let index = subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === subcontentID
      );

      let temp = subcontent[index].files;
      fileIndex = temp.findIndex((file) => file.url === url);
      temp.splice(fileIndex, 1);

      console.log(fileIndex);

      subcontent[index].files = [...temp];

      return db
        .doc(`/orientationPages/${orientationPageID}`)
        .update({ subcontent: subcontent });
    })
    .then(() => {
      return db.doc(`/orientationPages/${orientationPageID}`).get();
    })
    .then((doc) => {
      //return only the new subcontent files data
      let subcontent = doc.data().subcontent;
      let index = subcontent.findIndex(
        (subcontent) => subcontent.subcontentID === subcontentID
      );
      console.log(subcontent[index].files);
      return res.status(200).json({ files: subcontent[index].files });
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
  let originalImageFileName = "";

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(mimetype);
    if (mimetype === "image/jpeg" || mimetype === "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    originalImageFileName = filename;

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

        return res
          .status(201)
          .json({ downloadUrl: fileUrl, filename: originalImageFileName });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};

exports.uploadOrientationOverviewImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  console.log(req.headers);

  let request = "orientation%2Foverview%2Fimages%2F";

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
        destination: "orientation/overview/images/" + imageFileName,
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

exports.uploadOrientationOverviewFile = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  let request = "orientation%2Foverview%2Ffiles%2F";

  //need to get details from orientationPageID first
  //look for the particular subcontent using subcontentID
  //and update the subcontent

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  let imageUrl;
  let originalImageFileName = "";

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(mimetype);
    if (mimetype === "image/jpeg" || mimetype === "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    originalImageFileName = filename;

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
        destination: "orientation/overview/files/" + imageFileName,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        fileUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${request}${imageFileName}?alt=media`;

        return res
          .status(201)
          .json({ downloadUrl: fileUrl, filename: originalImageFileName });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};

exports.uploadOrientationOverviewVideo = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  let request = "orientation%2Foverview%2Fvideos%2F";

  //need to get details from orientationPageID first
  //look for the particular subcontent using subcontentID
  //and update the subcontent

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  let imageUrl;
  let originalImageFileName = "";

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(mimetype);
    if (mimetype !== "video/mp4") {
      return res.status(400).json({ error: "Please only upload mp4 videos" });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    originalImageFileName = filename;

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
        destination: "orientation/overview/videos/" + imageFileName,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        fileUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${request}${imageFileName}?alt=media`;

        return res
          .status(201)
          .json({ downloadUrl: fileUrl, filename: originalImageFileName });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};
