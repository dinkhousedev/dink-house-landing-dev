"use client";

import React, { useState } from "react";

import { submitNewsletterSignup } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await submitNewsletterSignup({ email });

      if (result.success) {
        setMessage({
          type: "success",
          text: result.already_subscribed
            ? "You are already subscribed to our newsletter!"
            : "Thank you for subscribing! Check your email for confirmation.",
        });
        if (!result.already_subscribed) {
          setEmail(""); // Clear the form only if it's a new subscription
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-form">
      <h3 className="text-2xl font-bold mb-4">Join Our Newsletter</h3>
      <p className="mb-4 text-gray-600">
        Get the latest updates and exclusive content delivered to your inbox.
      </p>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          required
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          type="submit"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
