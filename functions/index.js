/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
functions.setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Configure the mail transporter using your email service provider's details
// We are using Gmail in this example.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendMail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {name, email, company, message} = req.body;

    if (!name || !email || !message) {
      return res.status(400)
        .send("Missing required fields: name, email, message");
    }

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: functions.config().gmail.email,
      subject: `New Retailer Inquiry from ${company || name}`,
      html: `<p><b>From:</b> ${name} (${email})</p>
             <p><b>Company:</b> ${company || "N/A"}</p>
             <p><b>Message:</b></p>
             <p>${message}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending mail:", error);
        return res.status(500).send("Error sending email.");
      }
      return res.status(200).send("Email sent successfully.");
    });
  });
});
