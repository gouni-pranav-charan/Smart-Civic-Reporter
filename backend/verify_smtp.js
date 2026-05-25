const nodemailer = require('nodemailer');

const config = {
  service: 'gmail',
  auth: {
    user: "pranavcharang@gmail.com",
    pass: "rshwikpcapfnnahk"
  }
};

async function run() {
  console.log("Testing SMTP connection with Gmail Service...");
  const transporter = nodemailer.createTransport(config);

  try {
    console.log("Verifying transporter...");
    await transporter.verify();
    console.log("SMTP Connection SUCCESS!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: '"Smart Civic Connect" <pranavcharang@gmail.com>',
      to: "pranavcharang@gmail.com",
      subject: "Final SMTP Verification (Service Mode)",
      text: "If you see this, the SMTP system with 'service: gmail' is fully functional.",
      html: "<h1>SMTP SUCCESS</h1><p>The system is now sending emails using the gmail service shortcut.</p>"
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("SMTP Error:", error);
    if (error.code === 'EAUTH') {
        console.log("\n--- TROUBLESHOOTING ---");
        console.log("1. Ensure 2FA is enabled on your Gmail account.");
        console.log("2. Ensure you are using a 16-character APP PASSWORD, not your regular password.");
        console.log("3. Check if Gmail sent you an email about 'Security alert: blocked sign-in attempt'.");
    }
  }
}

run();
