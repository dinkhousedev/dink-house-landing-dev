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
      <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">
        Join Our Newsletter
      </h3>
      <p className="mb-6 text-gray-600">
        Get exclusive access to court bookings, events, pro tips, and special offers.
      </p>

      <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
        <input
          required
          className="flex-1 px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B3FF00] focus:border-[#B3FF00] transition-all"
          disabled={loading}
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="px-8 py-3 bg-[#B3FF00] text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          disabled={loading}
          type="submit"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 border-l-4 ${
            message.type === "success"
              ? "bg-green-50 border-[#B3FF00] text-green-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          <p className="font-semibold">{message.text}</p>
        </div>
      )}
    </div>
  );
}
