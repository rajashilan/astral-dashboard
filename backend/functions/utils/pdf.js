const {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  PDFSignature,
} = require("pdf-lib");
const fetch = require("node-fetch");
const { admin, db } = require("../utils/admin");
const crypto = require("crypto");
const { stringify } = require("querystring");

exports.modifyPdf = (req, res) => {
  async function pdf() {
    try {
      const url = req.body.link;
      const existingPdfBytes = await fetch(url).then((res) =>
        res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const signatureFont = await pdfDoc.embedFont(
        StandardFonts.TimesRomanItalic
      );

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      //for each campus or college
      //need to save the pdf data anyways
      //title, id, fields: {fieldName, value, x-axis, y-axis, type, length}
      //y-axis always dependent on being deducted by height of document
      //if type signature: font: signatureFont, size: 14
      //if length: undefined, no length validation
      //if length short: cut per 40 chars
      //if length long: cut per 150 chars
      //pass the fields data along with the axis data
      //run a forEach loop

      let matriculationNo = req.body.matriculationNo;
      let title = req.body.title;

      const fields = req.body.fields;

      fields.forEach((field) => {
        firstPage.drawText(
          field.length !== "none"
            ? addLineBreaks(field.value, field.length === "long" ? 150 : 40)
            : field.value,
          {
            x: field.xAxis,
            y: height - field.yAxis,
            size: field.type === "signature" ? 14 : 8,
            font: field.type === "signature" ? signatureFont : helveticaFont,
            color: rgb(0, 0, 0),
            lineHeight: 12,
          }
        );
      });

      pdfDoc.setTitle(`${matriculationNo} - ${title}`);
      const pdfBytes = await pdfDoc.save();

      const bucket = admin.storage().bucket();

      const filename = crypto.randomBytes(10).toString("hex");
      const file = bucket.file(`generalForms/edited/${filename}.pdf`);
      await file.save(pdfBytes, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      const link = `https://firebasestorage.googleapis.com/v0/b/astral-d3ff5.appspot.com/o/generalForms%2Fedited%2F${filename}.pdf?alt=media`;

      return res.status(201).json({ link });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error editing PDF" });
    }
  }
  pdf();
};

exports.testPdf = (req, res) => {
  async function pdf() {
    try {
      const url =
        "https://firebasestorage.googleapis.com/v0/b/astral-d3ff5.appspot.com/o/generalForms%2FLeave%20of%20Absence%20from%20Class%20Form_22Jan2019.pdf?alt=media";
      const existingPdfBytes = await fetch(url).then((res) =>
        res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const signatureFont = await pdfDoc.embedFont(
        StandardFonts.TimesRomanItalic
      );

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      //for each campus or college
      //need to save the pdf data anyways
      //title, id, fields: {fieldName, x-axis, y-axis, type, length}
      //if type signature: font: signatureFont, size: 14
      //if length: undefined, no length validation
      //if length short: cut per 40 chars
      //if length long: cut per 150 chars
      //pass the fields data along with the axis data
      //run a forEach loop

      //max 80 characters
      firstPage.drawText(
        "Muhammad Jamaluddin Jamal bin Muhammad Yusoof Taiyub Azman",
        {
          x: 140,
          y: height - 104,
          size: 8,
          font: helveticaFont,
          color: rgb(1, 0, 0),
          lineHeight: 12,
        }
      );

      firstPage.drawText("AUG 2020", {
        x: 430,
        y: height - 104,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("p20012892", {
        x: 140,
        y: height - 124,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("BCSCU", {
        x: 430,
        y: height - 124,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("p20012892@student.newinti.edu.my", {
        x: 140,
        y: height - 140,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("0189457077", {
        x: 430,
        y: height - 140,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("23/5/2023", {
        x: 220,
        y: height - 160,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("26/5/2023", {
        x: 405,
        y: height - 160,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      //max 300 characters
      firstPage.drawText(
        "I have a very important event that i need to attend to concerning a very important family function there i said it its a family function i really cant avoid im so sorry huhuhuhuhuhu i like kpop i lied i dont like them",
        {
          x: 40,
          y: height - 200,
          size: 8,
          font: helveticaFont,
          color: rgb(1, 0, 0),
          lineHeight: 12,
        }
      );

      firstPage.drawText("Jamal", {
        x: 90,
        y: height - 255,
        size: 14,
        font: signatureFont,
        color: rgb(1, 0, 0),
      });

      firstPage.drawText("22/5/2023", {
        x: 430,
        y: height - 255,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 0, 0),
      });

      pdfDoc.setTitle("Muhamman Jamaluddin LOA form 23/5/2023 - 30/5/2023");
      const pdfBytes = await pdfDoc.save();

      const bucket = admin.storage().bucket();
      const file = bucket.file("edited.pdf");
      await file.save(pdfBytes, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      console.log("success");
      return res.status(201).json({ meassage: "Success" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error editing PDF" });
    }
  }
  pdf();
};

function addLineBreaks(inputString, charactersPerLine) {
  if (inputString.length < charactersPerLine) return inputString;
  const regex = new RegExp(`.{1,${charactersPerLine}}`, "g");
  return inputString.match(regex).join("\n");
}

exports.createGeneralForm = (req, res) => {
  const generalForm = {
    campusID: req.body.campusID,
    generalFormID: "",
    link: req.body.link,
    title: req.body.title,
    fields: req.body.fields,
  };

  var temp;

  db.collection("generalForms")
    .add(generalForm)
    .then((data) => {
      temp = data.id;
      return db.doc(`/generalForms/${temp}`).update({ generalFormID: temp });
    })
    .then(() => {
      return db.doc(`/generalFormsOverview/${generalForm.campusID}`).get();
    })
    .then((doc) => {
      if (doc.exists) {
        let tempForms = doc.data().forms;
        tempForms.push({ title: generalForm.title, generalFormID: temp });
        return db
          .doc(`/generalFormsOverview/${generalForm.campusID}`)
          .update({ forms: [...tempForms] });
      } else {
        return db
          .collection("generalFormsOverview")
          .doc(generalForm.campusID)
          .set({
            forms: [{ title: generalForm.title, generalFormID: temp }],
          });
      }
    })
    .then(() => {
      return res
        .status(201)
        .json({ message: "New General Form added successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    });
};

// {
//     "campusID": "",
//     "generalFormID": "",
//     "link": "",
//     "title": "",
//     "fields": [
//         {
//             "fieldName": "",
//             "value": "",
//             "xAxis": 0,
//             "yAxis": 0,
//             "type": "",
//             "length": "",
//             "placeHolder": "",
//             "errorMessage": "",
//             "fieldType": "",
//         }
//     ]
// }
//length short = 40 chars, long = 150 chars