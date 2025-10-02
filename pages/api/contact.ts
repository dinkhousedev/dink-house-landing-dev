import type { NextApiRequest, NextApiResponse } from "next";

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

    // Call the Supabase API endpoint
    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://api.dinkhousepb.com";
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/submit_newsletter_signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          p_email: contactData.email,
          p_first_name: contactData.firstName,
          p_last_name: contactData.lastName,
        }),
      },
    );

    const result = await response.json();

    // Log the actual response for debugging
    console.log("API Response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("API returned non-OK status:", response.status, result);
      throw new Error(result.message || "Failed to submit");
    }

    // Check if result is the direct response or wrapped
    const actualResult = result.success !== undefined ? result : result;

    if (actualResult.success) {
      if (actualResult.already_subscribed) {
        return res.status(200).json({
          success: true,
          message:
            "You're already on our waitlist! We'll notify you when we open.",
          data: contactData,
        });
      }

      console.log("Contact notification signup saved:", actualResult.subscriber_id);

      // New signups now require email confirmation
      if (actualResult.requires_confirmation) {
        return res.status(200).json({
          success: true,
          message:
            "Almost there! Check your email to confirm your subscription and join the waitlist.",
          data: contactData,
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Successfully joined the waitlist! We'll notify you when we open.",
        data: contactData,
      });
    } else {
      console.error("API returned success: false", actualResult);
      throw new Error(actualResult.message || "Submission failed");
    }
  } catch (error) {
    console.error("Error processing contact submission:", error);

    // Provide more helpful error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: `Failed to process contact submission: ${errorMessage}`,
    });
  }
}
