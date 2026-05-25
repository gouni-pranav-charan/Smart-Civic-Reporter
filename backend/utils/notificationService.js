const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const logEmail = (msg) => {
  const logPath = path.join(__dirname, '../../email_debug.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
};

/**
 * Sends an email notification to the citizen.
 * In development, this logs to the console.
 * For production, slot in real SMTP credentials.
 */
const sendEmailNotification = async ({ to, subject, body, complaintData = {}, authorityDetails = {} }) => {
  try {
    // Ensure complaintData is safe
    const data = {
      id: complaintData.id || 'N/A',
      citizenName: complaintData.citizenName || 'Citizen',
      category: complaintData.category || 'General',
      address: complaintData.address || 'Location on file',
      resolutionNote: complaintData.resolutionNote || '',
      imageUrl: complaintData.imageUrl || null,
      status: complaintData.status || 'Update'
    };
    // Transporter configuration using environment variables
    const transportConfig = {
      auth: {
        user: process.env.EMAIL_USER || 'test@ethereal.email', 
        pass: process.env.EMAIL_PASS || 'testpass', 
      },
    };

    // Use 'gmail' service if the user is @gmail.com or SMTP_HOST is gmail
    const isGmail = process.env.SMTP_HOST === 'smtp.gmail.com' || (process.env.EMAIL_USER && process.env.EMAIL_USER.endsWith('@gmail.com'));
    
    if (isGmail) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = process.env.SMTP_HOST || "smtp.ethereal.email";
      transportConfig.port = process.env.SMTP_PORT || 587;
      transportConfig.secure = transportConfig.port === 465;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Professional HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
          .header { background: #2563eb; color: white; padding: 32px 24px; text-align: center; }
          .content { padding: 32px 24px; color: #1e293b; line-height: 1.6; }
          .footer { background: #f8fafc; padding: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
          .status-resolved { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
          .status-update { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
          .details-card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-top: 24px; }
          .details-item { margin-bottom: 12px; }
          .details-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; display: block; }
          .details-value { font-weight: 600; color: #334155; }
          .image-preview { width: 100%; border-radius: 12px; margin-top: 16px; border: 1px solid #e2e8f0; }
          .btn { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">Smart Civic Connect</h1>
            <p style="margin:8px 0 0 0; opacity: 0.8;">Municipal Official Dispatch</p>
          </div>
          <div class="content">
            <div class="badge ${data.status === 'Resolved' ? 'status-resolved' : 'status-update'}">${data.status}</div>
            <h2 style="margin:0 0 16px 0;">Hi ${data.citizenName},</h2>
            <p>${body}</p>
            
            <div class="details-card">
              <div class="details-item">
                <span class="details-label">Complaint Reference</span>
                <span class="details-value">#${data.id}</span>
              </div>
              <div class="details-item">
                <span class="details-label">Issue Category</span>
                <span class="details-value">${data.category}</span>
              </div>
              <div class="details-item">
                <span class="details-label">Location Highlight</span>
                <span class="details-value">${data.address}</span>
              </div>
              ${data.resolutionNote ? `
                <div class="details-item" style="margin-top: 16px; padding-top: 16px; border-top: 1px border-dashed #cbd5e1;">
                  <span class="details-label">Officer's Resolution Note</span>
                  <p style="margin:4px 0 0 0; font-style: italic; color: #475569;">"${data.resolutionNote}"</p>
                </div>
              ` : ''}
              
              ${data.imageUrl ? `
                <div class="details-item">
                  <span class="details-label">Visual evidence</span>
                  <img src="${data.imageUrl}" class="image-preview" alt="Evidence Scan" />
                </div>
              ` : ''}
            </div>

            ${data.status === 'Verification Pending' ? `
              <div style="background: #fffbeb; border: 2px solid #fef3c7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <h3 style="margin:0 0 8px 0; color: #92400e;">Final Verification Required</h3>
                <p style="margin:0 0 16px 0; color: #b45309; font-size: 14px;">Does the resolution meet your expectations? Verify now to close the case.</p>
                <a href="http://localhost:3000/verify/${data.id}" class="btn" style="background: #f59e0b; margin-top: 0;">VERIFY ISSUE FIXED</a>
              </div>
            ` : ''}

            <a href="http://localhost:3000/track?id=${data.id}" class="btn">View Full Case Timeline</a>
          </div>
          <div class="footer">
            <p style="margin:0 0 12px 0;"><strong>Official Authority Contact</strong></p>
            <p style="margin:0;">Officer: ${authorityDetails.name}</p>
            <p style="margin:0;">Department: ${authorityDetails.department}</p>
            <p style="margin:0;">Phone: ${authorityDetails.phone}</p>
            <p style="margin:24px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; opacity: 0.6;">
              This is a system-generated notification regarding your civic report. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // LOGGING DISPATCH DATA
    const engineMode = process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('test@ethereal.email') ? 'SMTP' : 'Ethereal';
    const logMsg = `Attempting email to: ${to} | Subject: ${subject} | Engine: ${engineMode}`;
    logEmail(logMsg);
    console.log(`\n===========================================`);
    console.log(`[SECURE EMAIL DISPATCHED]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`ENGINE: ${engineMode}`);
    console.log(`===========================================\n`);

    // Only attempt real send if credentials exist, otherwise mock success
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      logEmail(`Starting SMTP send for ${to}...`);
      const info = await transporter.sendMail({
        from: `"Smart Civic Connect" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
      });
      logEmail(`SMTP SUCCESS: ${info.messageId}`);
    }
    
    return true;
  } catch (error) {
    logEmail(`ERROR: ${error.message}`);
    if (error.stack) logEmail(`STACK: ${error.stack}`);
    console.error("Email notification engine error:", error);
    return false;
  }
};

module.exports = { sendEmailNotification };
