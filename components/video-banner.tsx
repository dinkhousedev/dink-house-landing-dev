import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const VIDEO_URLS = [
  "https://wchxzbuuwssrnaxshseu.supabase.co/storage/v1/object/public/dink-files/video/VID_20251001_113443.mp4",
  "https://wchxzbuuwssrnaxshseu.supabase.co/storage/v1/object/public/dink-files/video/VID_20251001_113600.mp4",
];

const LOGO_URL = "https://wchxzbuuwssrnaxshseu.supabase.co/storage/v1/object/public/dink-files/dinklogo.jpg";

export default function VideoBanner() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnded = () => {
      // Switch to the next video when current one ends
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_URLS.length);
    };

    const handleCanPlay = () => {
      video.play().catch((error) => {
        console.warn("Video autoplay failed:", error);
      });
    };

    video.addEventListener("ended", handleVideoEnded);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("ended", handleVideoEnded);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Reset and play video when index changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && isClient) {
      video.load();
      // Attempt to play after a short delay to ensure load completes
      setTimeout(() => {
        video.play().catch((error) => {
          console.warn("Video autoplay failed:", error);
        });
      }, 100);
    }
  }, [currentVideoIndex, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop={VIDEO_URLS.length === 1}
        preload="auto"
        controls={false}
      >
        <source src={VIDEO_URLS[currentVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Centered Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[200px] h-[200px] sm:w-[200px] sm:h-[200px] lg:w-[200px] lg:h-[200px] rounded-2xl overflow-hidden">
          <Image
            src={LOGO_URL}
            alt="The Dink House Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px"
          />
        </div>
      </div>
    </div>
  );
}
