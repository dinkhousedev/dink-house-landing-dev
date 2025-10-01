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
  const [images, setImages] = useState<Array<{ src: string; alt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build image URLs from config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wchxzbuuwssrnaxshseu.supabase.co";
    const { bucket, folder } = SUPABASE_CONFIG;

    const imageData = CAROUSEL_IMAGES.map((filename) => ({
      src: `${supabaseUrl}/storage/v1/object/public/${bucket}/${folder}/${filename}`,
      alt: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
    }));

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
