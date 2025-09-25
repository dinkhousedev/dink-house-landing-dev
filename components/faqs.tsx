"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Icon } from "@iconify/react";

import faqs from "./faqs-data";

export default function FAQsSection() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
      id="faqs"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
        <h2 className="px-2 text-3xl leading-7">
          <span className="inline-block lg:hidden">FAQs</span>
          <span className="hidden bg-gradient-to-br from-black to-dink-lime dark:from-white dark:to-dink-lime bg-clip-text pt-4 text-5xl font-semibold tracking-tight text-transparent lg:inline-block">
            Frequently
            <br />
            asked
            <br />
            questions
          </span>
        </h2>
        <Accordion
          fullWidth
          keepContentMounted
          className="gap-3"
          itemClasses={{
            base: "px-0 sm:px-6",
            title: "font-medium",
            trigger: "py-6 flex-row-reverse",
            content: "pt-0 pb-6 text-base text-default-500",
          }}
          items={faqs}
          selectionMode="multiple"
        >
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              indicator={<Icon icon="lucide:plus" width={24} />}
              title={item.title}
            >
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
