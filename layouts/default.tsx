import { Head } from "./head";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Head />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="w-full bg-black text-white py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-display text-2xl uppercase mb-2">
                <span className="text-white">The Dink</span>{" "}
                <span className="bg-dink-lime text-black px-1">House</span>
              </h3>
              <p className="text-gray-400 text-sm">Where Champions Play</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-dink-lime font-bold mb-2">HOURS</p>
              <p className="text-sm text-gray-300">24/7</p>
            </div>
            <div className="flex flex-col items-center md:items-end text-center md:text-right">
              <p className="text-dink-lime font-bold mb-2">CONTACT</p>
              <p className="text-sm text-gray-300">contact@dinkhousepb.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 The Dink House - All Rights Reserved
              </p>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="text-dink-lime text-2xl">★</span>
                <span className="text-dink-lime text-3xl">★</span>
                <span className="text-dink-lime text-2xl">★</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
