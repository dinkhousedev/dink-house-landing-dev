import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.dinkhousepb.com';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// MailPit configuration
const MAILPIT_HOST = process.env.MAILPIT_HOST || 'localhost';
const MAILPIT_SMTP_PORT = process.env.MAILPIT_SMTP_PORT || '1025';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@dinkhousepb.com';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contact@dinkhousepb.com';

// Create nodemailer transporter for MailPit
const createMailPitTransporter = () => {
  return nodemailer.createTransport({
    host: MAILPIT_HOST,
    port: parseInt(MAILPIT_SMTP_PORT),
    secure: false, // MailPit doesn't use TLS
    ignoreTLS: true,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
};

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

          ${data.phone ? `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${data.phone}</div>
          </div>
          ` : ''}

          ${data.company ? `
          <div class="field">
            <div class="label">Company:</div>
            <div class="value">${data.company}</div>
          </div>
          ` : ''}

          ${data.subject ? `
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${data.subject}</div>
          </div>
          ` : ''}

          <div class="field">
            <div class="label">Message:</div>
            <div class="message">${data.message.replace(/\n/g, '<br>')}</div>
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0;">Thank You!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Thank you for reaching out to The Dink House! We've received your message and appreciate you taking the time to contact us.</p>
          <p>Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
          <p>In the meantime, feel free to explore our website or follow us on social media for the latest updates!</p>
          <p>Best regards,<br>The Dink House Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email via MailPit
async function sendToMailPit(emailData: {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  try {
    console.log(`Attempting to send email via MailPit to ${MAILPIT_HOST}:${MAILPIT_SMTP_PORT}`);
    const transporter = createMailPitTransporter();

    // Verify connection
    await transporter.verify();
    console.log('MailPit connection verified');

    const mailOptions = {
      from: `"The Dink House" <${emailData.from}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: emailData.replyTo
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to MailPit:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('Error sending to MailPit:', {
      message: error.message,
      code: error.code,
      host: MAILPIT_HOST,
      port: MAILPIT_SMTP_PORT
    });
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      message,
      phone,
      company,
      subject
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Prepare the payload for Supabase
    const payload = {
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_message: message,
      p_phone: phone || null,
      p_company: company || null,
      p_subject: subject || null,
      p_source: 'landing_page'
    };

    // Send emails via MailPit
    let emailSent = false;
    let confirmationSent = false;

    try {
      // Send admin notification email
      emailSent = await sendToMailPit({
        from: FROM_EMAIL,
        to: CONTACT_EMAIL,
        subject: subject ? `Contact Form: ${subject}` : 'New Contact Form Submission - The Dink House',
        html: formatAdminEmail({ firstName, lastName, email, message, phone, company, subject }),
        replyTo: email
      });

      // Send user confirmation email
      confirmationSent = await sendToMailPit({
        from: FROM_EMAIL,
        to: email,
        subject: 'Thank you for contacting The Dink House',
        html: formatUserEmail(firstName)
      });

      console.log('Email status:', { emailSent, confirmationSent });
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Continue even if email fails
    }

    // If API key is configured, also save to Supabase
    if (SUPABASE_ANON_KEY) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_contact_form`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Supabase error:', errorText);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database fails
      }
    }

    // Log submission for development
    console.log('Contact Form Submission:', {
      timestamp: new Date().toISOString(),
      data: { firstName, lastName, email, message, phone, company, subject },
      emailSent,
      confirmationSent
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      inquiry_id: `form-${Date.now()}`,
      emailSent,
      confirmationSent
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please try again.'
    });
  }
}