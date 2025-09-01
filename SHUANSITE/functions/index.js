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

// Import Firebase Functions v2
const {onRequest} = require("firebase-functions/v2/https");

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

// Configure the mail transporter using Zoho mail with Firebase Functions config
// let transporter;
// try {
//   const config = functions.config();
//   console.log('Firebase config loaded:', config);
  
//   const zohoEmail = config.zoho?.email || "sean@shuangear.com";
//   const zohoPassword = config.zoho?.password || "xKfXXCLvy8gy";
  
//   console.log('Zoho email:', zohoEmail);
//   console.log('Zoho password length:', zohoPassword ? zohoPassword.length : 0);
  
//   if (!zohoEmail || !zohoPassword) {
//     console.error("Zoho credentials not configured in Firebase Functions config");
//     console.error("zohoEmail:", zohoEmail);
//     console.error("zohoPassword:", zohoPassword ? "***" : "undefined");
//     transporter = null;
//   } else {
//     console.log('Creating Zoho transporter...');
//     transporter = nodemailer.createTransport({
//       host: "smtp.zoho.com",
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: zohoEmail,
//         pass: zohoPassword,
//       },
//     });
//     console.log('Zoho transporter created successfully');
//   }
// } catch (error) {
//   console.error("Error configuring Zoho transporter:", error);
//   transporter = null;
// }

// Test function to verify v2 setup
exports.testFunction = onRequest({
  cors: true,
  allowUnauthenticated: true,
  maxInstances: 10
}, (req, res) => {
  res.json({ message: "Test function working!", timestamp: new Date().toISOString() });
});

exports.sendMail = onRequest({
  cors: true,
  allowUnauthenticated: true,
  maxInstances: 10,
  region: 'us-central1',
  invoker: 'public'
}, (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { name, email, message, company } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      console.error('Missing required fields:', { name, email, message });
      return res.status(400).json({
        error: "Missing required fields: name, email, message"
      });
    }

    // Create transporter inside function using environment variables
    let transporter;
    try {
      const zohoEmail = process.env.ZOHO_EMAIL || "sean@shuangear.com";
      const zohoPassword = process.env.ZOHO_PASSWORD || "xKfXXCLvy8gy";
      
      console.log('Zoho email:', zohoEmail);
      console.log('Zoho password length:', zohoPassword ? zohoPassword.length : 0);
      
      if (!zohoEmail || !zohoPassword) {
        console.error("Zoho credentials not configured");
        console.error("zohoEmail:", zohoEmail);
        console.error("zohoPassword:", zohoPassword ? "***" : "undefined");
        return res.status(500).json({
          error: "Email service not configured."
        });
      }
      
      console.log('Creating Zoho transporter...');
      transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: zohoEmail,
          pass: zohoPassword,
        },
      });
      console.log('Zoho transporter created successfully');
    } catch (error) {
      console.error("Error configuring Zoho transporter:", error);
      return res.status(500).json({
        error: "Email service not configured."
      });
    }

    const mailOptions = {
      from: `"SHUAN Contact Form" <sean@shuangear.com>`,
      replyTo: `"${name}" <${email}>`,
      to: "sean@shuangear.com",
      subject: `New Retailer Inquiry from ${company || name}`,
      html: `<p><b>From:</b> ${name} (${email})</p>
             <p><b>Company:</b> ${company || 'Not specified'}</p>
             <p><b>Message:</b></p>
             <p>${message}</p>`,
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
          error: `Error sending email: ${error.message}`
        });
      }
      
      console.log('Email sent successfully:', info.messageId);
      res.status(200).json({
        message: 'Email sent successfully',
        messageId: info.messageId
      });
    });

  } catch (error) {
    console.error('Unexpected error in sendMail function:', error);
    res.status(500).json({
      error: 'An unexpected error occurred.'
    });
  }
});
