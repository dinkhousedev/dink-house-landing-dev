import { useState, useEffect } from "react";
import { Button } from "@heroui/button";

import DefaultLayout from "@/layouts/default";
import ContactFormModal from "@/components/contact-form";
import { title, subtitle } from "@/components/primitives";

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Automatically open the modal when the page loads
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Contact&nbsp;</h1>
          <h1 className={title({ color: "green" })}>The Dink House</h1>
          <h2 className={subtitle({ class: "mt-4" })}>
            We&apos;re here to answer your questions and can&apos;t wait to hear
            from you!
          </h2>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            className="bg-dink-lime text-black font-bold"
            size="lg"
            onPress={() => setIsModalOpen(true)}
          >
            Open Contact Form
          </Button>
        </div>

        <div className="mt-8 max-w-2xl text-center">
          <p className="text-gray-600">
            Whether you have questions about our facilities, want to learn more
            about pickleball, or are interested in membership options,
            we&apos;re here to help!
          </p>
        </div>

        <ContactFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </section>
    </DefaultLayout>
  );
}
