import React, { useState } from "react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    phone: "",
    company: "",
    subject: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

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

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    // Optional phone validation if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
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
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        // Clear form after successful submission
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            message: "",
            phone: "",
            company: "",
            subject: "",
          });
        }, 3000);
      } else {
        setSubmitStatus("error");
        setErrors({ submit: result.message || "Failed to send message" });
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrors({
        submit: error instanceof Error
          ? error.message
          : "Network error. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleModalClose = () => {
    // Reset form state when modal closes
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      phone: "",
      company: "",
      subject: "",
    });
    setErrors({});
    setSubmitStatus("idle");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      size="2xl"
      onClose={handleModalClose}
      backdrop="blur"
      className="max-h-[90vh] overflow-y-auto"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col items-center gap-3 pb-2">
              <div className="w-32 h-32 relative">
                <Image
                  src="/dinklogo.jpg"
                  alt="The Dink House Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl font-bold">Contact Us</h2>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <ModalBody className="gap-4 pb-4">
                <p className="text-sm text-gray-600 text-center">
                  We&apos;d love to hear from you! Send us a message and we&apos;ll get back to you as soon as possible.
                </p>

                {submitStatus === "success" && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                    <div className="font-semibold mb-1">Message sent successfully!</div>
                    <div className="text-sm">
                      Thank you for contacting us. We&apos;ll get back to you soon.
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <Input
                  isRequired
                  autoComplete="email"
                  errorMessage={errors.email}
                  isInvalid={!!errors.email}
                  label="Email"
                  name="email"
                  placeholder="your@email.com"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    autoComplete="tel"
                    errorMessage={errors.phone}
                    isInvalid={!!errors.phone}
                    label="Phone (Optional)"
                    name="phone"
                    placeholder="(555) 123-4567"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                  />

                  <Input
                    autoComplete="organization"
                    label="Company (Optional)"
                    name="company"
                    placeholder="Your company"
                    value={formData.company || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <Input
                  label="Subject (Optional)"
                  name="subject"
                  placeholder="What is this about?"
                  value={formData.subject || ""}
                  onChange={handleInputChange}
                />

                <Textarea
                  isRequired
                  errorMessage={errors.message}
                  isInvalid={!!errors.message}
                  label="Message"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  value={formData.message}
                  onChange={handleInputChange}
                  minRows={4}
                  maxRows={8}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleModalClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-dink-lime text-black font-bold"
                  isDisabled={submitStatus === "success"}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {submitStatus === "success" ? "Sent!" : "Send Message"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ContactFormModal;
export { ContactFormModal };