"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "./image-carousel";
import { CAROUSEL_IMAGES, SUPABASE_CONFIG } from "@/config/carousel-images";

interface SupabaseImageCarouselProps {
  autoplayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export const SupabaseImageCarousel = ({
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = "",
}: SupabaseImageCarouselProps) => {
  const [images, setImages] = useState<Array<{ src: string; srcSet?: string; alt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build image URLs from config with responsive transformations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wchxzbuuwssrnaxshseu.supabase.co";
    const { bucket, folder } = SUPABASE_CONFIG;

    const imageData = CAROUSEL_IMAGES.map((filename) => {
      const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${folder}/${filename}`;

      // Use Supabase image transformations for responsive images
      // Browser will choose appropriate size based on viewport
      const mobileSrc = `${baseUrl}?width=640&quality=85`;
      const tabletSrc = `${baseUrl}?width=800&quality=85`;
      const desktopSrc = `${baseUrl}?width=1200&quality=85`;

      return {
        src: desktopSrc, // Default to desktop size
        srcSet: `${mobileSrc} 640w, ${tabletSrc} 800w, ${desktopSrc} 1200w`,
        alt: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      };
    });

    setImages(imageData);
    setLoading(false);
  }, []);

  if (images.length === 0) {
    return null;
  }

  return (
    <ImageCarousel
      images={images}
      autoplayInterval={autoplayInterval}
      showControls={showControls}
      showIndicators={showIndicators}
      className={className}
    />
  );
};

export default SupabaseImageCarousel;
