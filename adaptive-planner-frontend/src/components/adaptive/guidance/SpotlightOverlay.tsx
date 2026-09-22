import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SpotlightOverlayProps {
  targetSelector: string;
  padding?: number;
  borderRadius?: number;
  children?: (rect: DOMRect | null) => React.ReactNode;
  onBackdropClick?: () => void;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  targetSelector,
  padding = 8,
  borderRadius = 16,
  children,
  onBackdropClick,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const updateRect = useCallback(() => {
    if (typeof window === 'undefined') return;

    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const element = document.querySelector(targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [targetSelector]);

  useEffect(() => {
    updateRect();

    // Smoothly scroll target into view if outside viewport
    const element = document.querySelector(targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const inView =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth;

      if (!inView) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const handleScrollOrResize = () => {
      window.requestAnimationFrame(updateRect);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateRect);
    });

    if (element) {
      observer.observe(element);
    }

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      observer.disconnect();
    };
  }, [targetSelector, updateRect]);

  const { width: winW, height: winH } = windowDimensions;

  // Mask path: outer fullscreen rectangle + inverted inner rounded rectangle
  const cutoutX = targetRect ? Math.max(0, targetRect.left - padding) : 0;
  const cutoutY = targetRect ? Math.max(0, targetRect.top - padding) : 0;
  const cutoutW = targetRect ? Math.min(winW, targetRect.width + padding * 2) : 0;
  const cutoutH = targetRect ? Math.min(winH, targetRect.height + padding * 2) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden select-none">
        {/* SVG Cutout Mask */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onClick={onBackdropClick}
          aria-hidden="true"
        >
          <defs>
            <mask id="spotlight-mask">
              {/* Fill everything with white (fully visible mask) */}
              <rect x="0" y="0" width={winW} height={winH} fill="white" />
              {/* Cutout target element with black (transparent mask) */}
              {targetRect && (
                <rect
                  x={cutoutX}
                  y={cutoutY}
                  width={cutoutW}
                  height={cutoutH}
                  rx={borderRadius}
                  ry={borderRadius}
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Semi-transparent dimmed background using the mask */}
          <rect
            x="0"
            y="0"
            width={winW}
            height={winH}
            fill="currentColor"
            className="text-zinc-950/65 dark:text-black/80 transition-colors duration-300"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlight Focus Ring around target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              top: `${cutoutY}px`,
              left: `${cutoutX}px`,
              width: `${cutoutW}px`,
              height: `${cutoutH}px`,
              borderRadius: `${borderRadius}px`,
            }}
            className="absolute pointer-events-none ring-2 ring-teal-500/80 shadow-[0_0_24px_rgba(20,184,166,0.35)] transition-all duration-200"
          />
        )}

        {/* Render Floating CoachMark via children */}
        <div className="pointer-events-auto">
          {children && children(targetRect)}
        </div>
      </div>
    </AnimatePresence>
  );
};
