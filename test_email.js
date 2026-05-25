const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

// Load env from backend dir
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const { sendEmailNotification } = require('../backend/utils/notificationService');

async function test() {
  console.log("Testing Email System...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  
  const result = await sendEmailNotification({
    to: process.env.EMAIL_USER,
    subject: "Test Email from Smart Civic Connectivity",
    body: "This is a test to verify the SMTP configuration.",
    complaintData: {
      id: "TEST-1234",
      citizenName: "Test User",
      category: "Drainage",
      address: "123 Test Street",
      status: "Resolved",
      resolutionNote: "Test successful",
      imageUrl: "https://via.placeholder.com/300"
    },
    authorityDetails: {
      name: "Debug Officer",
      department: "QA Department",
      phone: "000-000-0000"
    }
  });

  if (result) {
    console.log("Email test PASSED (Check your inbox or Ethereal logs)");
  } else {
    console.log("Email test FAILED (Check server logs)");
  }
}

test();
