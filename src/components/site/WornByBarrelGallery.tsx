import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { galleryImages } from "@/lib/data";

export function WornByBarrelGallery() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [geometry, setGeometry] = useState({ panelWidth: 160, radius: 138 });
  const rotation = useMotionValue(-8);
  const springRotation = useSpring(rotation, { stiffness: 110, damping: 24, mass: 0.9 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const updateGeometry = () => {
      const panelWidth = Math.min(220, Math.max(145, scene.clientWidth * 0.28));
      const radius = panelWidth / (2 * Math.tan(Math.PI / galleryImages.length));
      setGeometry({ panelWidth, radius });
    };

    updateGeometry();
    const observer = new ResizeObserver(updateGeometry);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  const rotateBy = (degrees: number) => {
    rotation.set(rotation.get() + degrees);
  };

  return (
    <div
      ref={sceneRef}
      className="relative mx-auto h-[360px] w-full max-w-5xl overflow-hidden md:h-[460px]"
      style={{ perspective: "1100px", touchAction: "pan-y" }}
    >
      <motion.div
        role="region"
        aria-label="Worn by you gallery. Drag horizontally or use the arrow keys to rotate."
        tabIndex={0}
        onPanStart={() => {
          isDragging.current = true;
        }}
        onPan={(_, info) => rotateBy(info.delta.x * 0.5)}
        onPanEnd={() => {
          window.requestAnimationFrame(() => {
            isDragging.current = false;
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") rotateBy(-24);
          if (event.key === "ArrowRight") rotateBy(24);
        }}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateX: -5 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 110, damping: 24, mass: 0.9 }
        }
        className="absolute inset-0 cursor-grab outline-none active:cursor-grabbing focus-visible:ring-1 focus-visible:ring-foreground"
        style={{
          rotateY: reduceMotion ? rotation : springRotation,
          transformStyle: "preserve-3d",
        }}
      >
        {galleryImages.map((image, index) => {
          const angle = (index / galleryImages.length) * 360;

          return (
            <a
              key={image.src}
              href="https://www.instagram.com/louieheritage"
              aria-label={`View ${image.alt} on Instagram`}
              onClick={(event) => {
                if (isDragging.current) event.preventDefault();
              }}
              className="absolute left-1/2 top-1/2 block overflow-hidden rounded-[8px] bg-secondary shadow-lg"
              style={{
                width: geometry.panelWidth,
                aspectRatio: "4 / 5",
                marginLeft: -geometry.panelWidth / 2,
                marginTop: -(geometry.panelWidth * 1.25) / 2,
                transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full select-none object-cover"
              />
            </a>
          );
        })}
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <p className="rounded-full bg-background/85 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
          Drag to rotate
        </p>
      </div>
    </div>
  );
}
