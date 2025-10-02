import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [acceptNotifications, setAcceptNotifications] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error" | "duplicate"
  >("idle");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!acceptNotifications) {
      newErrors.consent = "Please confirm that you want to receive notifications";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if this is a duplicate based on the message
        if (data.message && data.message.includes("already on our waitlist")) {
          setSubmitStatus("duplicate");
        } else {
          setSubmitStatus("success");
          setFormData({ firstName: "", lastName: "", email: "" });
          setAcceptNotifications(false);
        }
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
          setFormData({ firstName: "", lastName: "", email: "" });
          setAcceptNotifications(false);
        }, 3000);
      } else {
        setSubmitStatus("error");
        setErrors({ submit: data.error || "Something went wrong" });
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };

        delete newErrors[name];

        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Join Our Notification List
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <p className="text-sm text-gray-600 mb-4">
                  Join our email list to be notified of our opening date and
                  exclusive updates!
                </p>

                {submitStatus === "success" && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    Thank you for joining our notification list! We&apos;ll be
                    in touch soon.
                  </div>
                )}

                {submitStatus === "duplicate" && (
                  <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
                    <div className="font-semibold mb-1">
                      You&apos;re already subscribed! 🎉
                    </div>
                    <div className="text-sm">
                      We have your email on our notification list. Please check
                      your spam folder to make sure our emails aren&apos;t being
                      filtered.
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {submitStatus !== "duplicate" && (
                  <div className="space-y-4">
                    <Input
                      isRequired
                      autoComplete="given-name"
                      errorMessage={errors.firstName}
                      isInvalid={!!errors.firstName}
                      label="First Name"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />

                    <Input
                      isRequired
                      autoComplete="family-name"
                      errorMessage={errors.lastName}
                      isInvalid={!!errors.lastName}
                      label="Last Name"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />

                    <Input
                      isRequired
                      autoComplete="email"
                      errorMessage={errors.email}
                      isInvalid={!!errors.email}
                      label="Email"
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />

                    {/* Notification Consent Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        required
                        checked={acceptNotifications}
                        className="mt-1 w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#B3FF00] accent-[#B3FF00] cursor-pointer"
                        disabled={isSubmitting}
                        id="accept-notifications-modal"
                        type="checkbox"
                        onChange={(e) => setAcceptNotifications(e.target.checked)}
                      />
                      <label
                        className="text-sm text-gray-700 cursor-pointer select-none"
                        htmlFor="accept-notifications-modal"
                      >
                        I agree to receive email notifications about court bookings,
                        events, tips, and special offers from The Dink House.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>

                    {errors.consent && (
                      <div className="text-sm text-red-600 mt-1">
                        {errors.consent}
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  isDisabled={isSubmitting}
                  variant="light"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-dink-lime text-black font-bold"
                  isDisabled={
                    submitStatus === "success" ||
                    submitStatus === "duplicate" ||
                    !acceptNotifications
                  }
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {submitStatus === "success"
                    ? "Success!"
                    : submitStatus === "duplicate"
                      ? "Already Subscribed"
                      : "Join Waitlist"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default WaitlistModal;
