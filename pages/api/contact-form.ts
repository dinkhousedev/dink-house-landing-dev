import type { NextApiRequest, NextApiResponse } from "next";

import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const FROM_EMAIL = process.env.EMAIL_FROM || "hello@dinkhousepb.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "The Dink House";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dinkhousepb.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dinkhousepb.com";

// Rate limiting configuration
const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || "5",
);
const RATE_LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR || "50");

// Simple in-memory rate limiting (consider using Redis in production)
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();

// Rate limiting helper
function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  // Clean old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.firstRequest < hourAgo) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });

    return { allowed: true };
  }

  // Check minute limit
  if (
    record.firstRequest > minuteAgo &&
    record.count >= RATE_LIMIT_PER_MINUTE
  ) {
    return {
      allowed: false,
      message: "Too many requests. Please wait a minute.",
    };
  }

  // Check hour limit
  if (record.count >= RATE_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      message: "Too many requests. Please try again later.",
    };
  }

  record.count++;

  return { allowed: true };
}

// Get client IP address
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return req.socket.remoteAddress || "unknown";
}

// Format HTML email for admin
const formatAdminEmail = (data: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #CDFE00 0%, #9BCF00 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { width: 100px; height: 100px; margin: 0 auto 10px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #666; margin-bottom: 5px; }
        .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd; }
        .message { background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd; white-space: pre-wrap; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0;">The Dink House</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${data.firstName} ${data.lastName}</div>
          </div>

          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>

          ${
            data.phone
              ? `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${data.phone}</div>
          </div>
          `
              : ""
          }

          ${
            data.company
              ? `
          <div class="field">
            <div class="label">Company:</div>
            <div class="value">${data.company}</div>
          </div>
          `
              : ""
          }

          ${
            data.subject
              ? `
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${data.subject}</div>
          </div>
          `
              : ""
          }

          <div class="field">
            <div class="label">Message:</div>
            <div class="message">${data.message.replace(/\n/g, "<br>")}</div>
          </div>

          <div class="footer">
            <p>Submitted on: ${new Date().toLocaleString()}</p>
            <p>Source: Landing Page</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Format confirmation email for user
const formatUserEmail = (firstName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #CDFE00 0%, #9BCF00 100%); padding: 30px; text-align: center; border-radius: 8px; }
        .content { background: white; padding: 30px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #CDFE00; color: black; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        .highlight { background: #f0fff4; padding: 15px; border-left: 4px solid #9BCF00; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Thank you for reaching out to The Dink House! We've received your message and appreciate you taking the time to contact us.</p>

          <div class="highlight">
            <strong>We will reply to your inquiry within 24 hours.</strong>
            <br>Our team is reviewing your message and will get back to you shortly with a personalized response.
          </div>

          <p>In the meantime, feel free to explore our website or follow us on social media for the latest updates about our pickleball facilities and programs!</p>

          <p>If you have any urgent matters, please don't hesitate to reach out to us directly.</p>

          <p>Best regards,<br>The Dink House Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email via SendGrid
async function sendEmail(emailData: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not configured, skipping email send");

      return false;
    }

    const msg: any = {
      to: emailData.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || stripHtml(emailData.html),
    };

    if (emailData.replyTo) {
      msg.replyTo = emailData.replyTo;
    }

    const [response] = await sgMail.send(msg);

    console.log(
      "Email sent successfully via SendGrid:",
      response.headers["x-message-id"],
    );

    return true;
  } catch (error: any) {
    console.error("SendGrid error:", {
      message: error.message,
      code: error.code,
      response: error.response?.body,
    });

    return false;
  }
}

// Strip HTML tags for text version
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check rate limiting
  const clientIp = getClientIp(req);
  const rateLimitCheck = checkRateLimit(clientIp);

  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: rateLimitCheck.message,
    });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      message,
      phone,
      company,
      subject,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Get logo URL from Supabase Cloud storage
    const logoUrl =
      process.env.LOGO_URL ||
      "https://wchxzbuuwssrnaxshseu.supabase.co/storage/v1/object/public/dink-files/dinklogo.jpg";

    // Prepare the payload for Supabase
    const payload = {
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_message: message,
      p_phone: phone || null,
      p_company: company || null,
      p_subject: subject || null,
      p_source: "landing_page",
    };

    // Send emails via SendGrid
    let emailSent = false;
    let confirmationSent = false;

    try {
      // Send admin notification email
      emailSent = await sendEmail({
        to: ADMIN_EMAIL,
        subject: subject
          ? `Contact Form: ${subject}`
          : "New Contact Form Submission - The Dink House",
        html: formatAdminEmail({
          firstName,
          lastName,
          email,
          message,
          phone,
          company,
          subject,
          logoUrl,
        }),
        replyTo: email,
      });

      // Send user confirmation email with branded template
      const userHtml = formatUserEmail(firstName)
        .replace(/{{logo_url}}/g, logoUrl)
        .replace(/{{site_url}}/g, SITE_URL);

      confirmationSent = await sendEmail({
        to: email,
        subject: "Thank you for contacting The Dink House",
        html: userHtml,
      });

      console.log("Email status:", { emailSent, confirmationSent });
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continue even if email fails
    }

    // If API key is configured, also save to Supabase
    if (SUPABASE_ANON_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/submit_contact_form`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error("Supabase error:", errorText);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue even if database fails
      }
    }

    // Log submission for development
    console.log("Contact Form Submission:", {
      timestamp: new Date().toISOString(),
      data: { firstName, lastName, email, message, phone, company, subject },
      emailSent,
      confirmationSent,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
      inquiry_id: `form-${Date.now()}`,
      emailSent,
      confirmationSent,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);

    return res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting your message. Please try again.",
    });
  }
}
