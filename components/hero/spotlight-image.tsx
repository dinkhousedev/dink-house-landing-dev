import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";

interface SpotlightImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

const SpotlightImage: React.FC<SpotlightImageProps> = ({
  src,
  alt,
  priority = false,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setMousePosition({ x, y });
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchmove", handleTouchMove);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={containerRef}
        animate={{ opacity: 1 }}
        className="relative w-full h-full overflow-hidden cursor-none"
        initial={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchEnd={() => setIsHovering(false)}
        onTouchStart={() => setIsHovering(true)}
      >
        <Image
          fill
          alt={alt}
          className="object-cover"
          priority={priority}
          sizes="100vw"
          src={src}
        />

        <div className="absolute inset-0 bg-black/80 spotlight-overlay" />

        <div
          className="spotlight-effect"
          style={
            {
              "--mouse-x": `${mousePosition.x}px`,
              "--mouse-y": `${mousePosition.y}px`,
              opacity: 1,
              transition: "opacity 0.3s ease",
            } as React.CSSProperties
          }
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center" />
        </div>
      </m.div>
    </LazyMotion>
  );
};

export default SpotlightImage;
