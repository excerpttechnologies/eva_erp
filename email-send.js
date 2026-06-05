const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "jay.excerpt@gmail.com",
    pass: process.env.EMAIL_PASS || "iaki nbfr mqcb oloh",
  },
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// ============ VALIDATION FUNCTION ============
const validateFormData = (data) => {
  const errors = [];

  // Name Validation
  if (!data.name) {
    errors.push("Name is required");
  } else if (typeof data.name !== "string") {
    errors.push("Name must be a text value");
  } else {
    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
      errors.push("Name cannot be empty");
    } else if (trimmedName.length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (trimmedName.length > 100) {
      errors.push("Name cannot exceed 100 characters");
    }
  }

  // Email Validation
  if (!data.email) {
    errors.push("Email is required");
  } else if (typeof data.email !== "string") {
    errors.push("Email must be a text value");
  } else {
    const trimmedEmail = data.email.trim();
    if (trimmedEmail.length === 0) {
      errors.push("Email cannot be empty");
    } else if (trimmedEmail.length > 254) {
      errors.push("Email cannot exceed 254 characters");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.push("Please enter a valid email address");
      }
    }
  }

  // Contact Validation
  if (!data.contact) {
    errors.push("Contact number is required");
  } else {
    const contactStr = String(data.contact).trim();
    if (contactStr.length === 0) {
      errors.push("Contact number cannot be empty");
    } else {
      const digitsOnly = contactStr.replace(/\D/g, "");
      if (digitsOnly.length === 0) {
        errors.push("Contact number must contain at least one digit");
      } else if (digitsOnly.length < 10) {
        errors.push(`Contact number must have at least 10 digits`);
      } else if (digitsOnly.length > 15) {
        errors.push("Contact number cannot exceed 15 digits");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

// ============ EMAIL SENDING FUNCTION (Without Attachment) ============
const sendBrochureEmail = async (formData) => {
  const {
    name,
    email,
    contact,
    city,
    company,
    designation,
    module,
    productType,
  } = formData;

  // Email to the user (customer) - No attachment
  const userMailOptions = {
    from: `"Excerptech" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "GROO ERP - Thank you for your interest!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .download-note { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to GROO ERP!</h1>
            <p>Your journey to business excellence begins here</p>
          </div>
          <div class="content">
            <h2>Dear ${name},</h2>
            <p>Thank you for your interest in <strong>GROO ERP</strong>! We're excited to help you transform your business operations.</p>
            
            <div class="download-note">
              <p>📥 <strong>Your brochure has been downloaded automatically!</strong></p>
              <p>Check your downloads folder for the GROO ERP brochure.</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Request Summary:</h3>
              <p><strong>Module:</strong> ${module || "Customer Relationship Management (CRM)"}</p>
              <p><strong>Product Type:</strong> ${productType || "CRM"}</p>
              <p><strong>Company:</strong> ${company || "Not provided"}</p>
              <p><strong>Designation:</strong> ${designation || "Not provided"}</p>
            </div>
            
            <h3>What's Next?</h3>
            <p>Our sales team will contact you within 24 hours to:</p>
            <ul>
              <li>Understand your specific requirements</li>
              <li>Schedule a personalized demo</li>
              <li>Provide pricing details</li>
              <li>Answer any questions you may have</li>
            </ul>
            
            <p style="margin-top: 20px;">📞 Need immediate assistance? Call us at: <strong>+91 6361527660 / +91 6364657660</strong></p>
            <p>✉️ Email us: <strong>info@excerptech.com</strong></p>
            
            <div class="footer">
             <p>© ${new Date().getFullYear()} Excerptech. All rights reserved.</p>
              <p>This is a confirmation email for your brochure download request.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // Email to the admin/company (Notification)
  const adminMailOptions = {
    from: `"Excerptech" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to yourself or admin email

    subject: "New Brochure Download Request - GROO ERP",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .detail { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #4CAF50; border-radius: 5px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Brochure Download Request</h2>
          </div>
          <div class="content">
            <div class="highlight">
              <p><strong>📅 Request Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
             
            </div>
            
            <h3>Customer Details:</h3>
            <div class="detail"><strong>👤 Name:</strong> ${name}</div>
            <div class="detail"><strong>📧 Email:</strong> ${email}</div>
            <div class="detail"><strong>📞 Contact:</strong> ${contact}</div>
            <div class="detail"><strong>🏢 Company:</strong> ${company || "Not provided"}</div>
            <div class="detail"><strong>💼 Designation:</strong> ${designation || "Not provided"}</div>
            <div class="detail"><strong>📍 City:</strong> ${city || "Not provided"}</div>
            <div class="detail"><strong>📦 Module:</strong> ${module || "CRM"}</div>
            <div class="detail"><strong>🏷️ Product Type:</strong> ${productType || "CRM"}</div>
            
         
            
            <div class="detail">
              <p><strong>📝 Notes:</strong></p>
              <p>Customer has downloaded the brochure automatically from website.</p>
              <p>Priority: <strong style="color: #ff9800;">Medium - Follow up required</strong></p>
            </div>
            
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated notification from your website brochure download system.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    // Send email to user
    const userEmailResult = await transporter.sendMail(userMailOptions);
    console.log(
      "✅ User email sent to:",
      email,
      "Message ID:",
      userEmailResult.messageId,
    );

    // Send notification to admin
    const adminEmailResult = await transporter.sendMail(adminMailOptions);
    console.log(
      "✅ Admin notification sent, Message ID:",
      adminEmailResult.messageId,
    );

    return { success: true, message: "Emails sent successfully" };
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    throw error;
  }
};

// Send brochure notification email endpoint (No attachment)
router.post("/send-brochure", async (req, res) => {
  try {
    const formData = req.body;
    console.log("📨 Received brochure request:", {
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
      module: formData.module,
    });

    // Validate form data
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Send emails (without attachment since frontend handles download)
    const result = await sendBrochureEmail(formData);

    // Return success response
    res.status(200).json({
      success: true,
      message:
        "Request submitted successfully! Check your email for confirmation.",
      data: {
        email: formData.email,
        sentAt: new Date().toISOString(),
        downloadTriggered: true,
      },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request. Please try again later.",
      error: error.message,
    });
  }
});

router.get("/send-test", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || "jay.excerpt@gmail.com",
      to: "jay.excerpt@gmail.com",
      subject: "Test Email",
      text: "Email API is working",
    });

    res.json({
      success: true,
      messageId: info.messageId,
      email: process.env.EMAIL_USER,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
