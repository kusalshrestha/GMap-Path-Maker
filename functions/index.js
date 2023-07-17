/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import logger from "firebase-functions/logger"
// import Firestore from "@google-cloud/firestore"
// import { onRequest } from "firebase-functions/v2/https"

const Firestore = require("@google-cloud/firestore");
const {onRequest} = require("firebase-functions/v2/https");


const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  // projectId: 'fp-staging-6382c'
});

const COLLECTION_NAME = "shifts";

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
/**
 * exports.helloWorld = onRequest((request, response) => {
 *  logger.info("Hello logs!", {structuredData: true});
 *  response.send("Hello from Firebase!");
 * });
 */

// export const GMapPathMaker = onRequest((request, response) => {
exports.GMapPathMaker = onRequest((request, response) => {
  const {path} = request;
  const shiftId = path.substring(4, path.length) || "";

  try {
    const collection = firestore.collection(COLLECTION_NAME);
    const documents = [];
    let i = 1;
    do {
      documents.push(collection.doc(`${shiftId}_sync${i}`).get());
      i++;
    } while (i <= 20);

    Promise.all(documents).then((userRecords) => {
      const parsedRecords = userRecords.map((userRecord) => {
        return userRecord.data();
      }).filter((item) => item);
      const curatedRecords = parsedRecords.reduce((acc, crr) => {
        const firstKeyOfRecord = Object.keys(crr)[0];
        return {...acc, [firstKeyOfRecord]: crr[firstKeyOfRecord]};
      }, {});

      const curatedRecordsValues = Object.values(curatedRecords);
      const coordinatesStr = curatedRecordsValues.reduce((acc, crr) => {
        const {_latitude: lat, _longitude: lng} = crr.geoPosition;
        if (acc === "") {
          return `${lat},+${lng}`;
        }
        return `${acc}/${lat},+${lng}`;
      }, "");
      const finalUrl = `https://www.google.com/maps/dir/` + coordinatesStr;

      response.send({success: true, url: finalUrl});
    });

    // logger.info("Hello logs!", {structuredData: true});
  } catch (error) {
    response.send({success: false, error});
  }
});
