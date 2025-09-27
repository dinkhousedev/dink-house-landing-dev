// Example of how to use the ContactFormModal component
import React, { useState } from 'react';
import { Button } from '@heroui/button';
import ContactFormModal from './contact-form';

const ContactFormExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        className="bg-dink-lime text-black font-bold"
        onPress={() => setIsOpen(true)}
      >
        Contact Us
      </Button>

      <ContactFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default ContactFormExample;