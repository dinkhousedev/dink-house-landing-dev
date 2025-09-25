import type { NextApiRequest, NextApiResponse } from "next";

import pool from "@/lib/db";

type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: ContactData;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: "Only POST requests are accepted",
    });
  }

  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !firstName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "First name is required",
      });
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Last name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Invalid email format",
      });
    }

    const contactData: ContactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };

    const client = await pool.connect();

    try {
      const checkQuery = `
        SELECT id FROM contact.contact_notification
        WHERE email = $1
      `;

      const existing = await client.query(checkQuery, [contactData.email]);

      if (existing.rows.length > 0) {
        return res.status(200).json({
          success: true,
          message:
            "You're already on our waitlist! We'll notify you when we open.",
          data: contactData,
        });
      }

      const insertQuery = `
        INSERT INTO contact.contact_notification (
          first_name,
          last_name,
          email
        ) VALUES ($1, $2, $3)
        RETURNING id, created_at
      `;

      const values = [
        contactData.firstName,
        contactData.lastName,
        contactData.email,
      ];

      const result = await client.query(insertQuery, values);

      console.log("Contact notification signup saved:", result.rows[0]);

      return res.status(200).json({
        success: true,
        message:
          "Successfully joined the waitlist! We'll notify you when we open.",
        data: contactData,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error processing contact submission:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Failed to process contact submission",
    });
  }
}
