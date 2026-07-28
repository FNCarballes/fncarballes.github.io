import React, { useState, useCallback, useMemo, useRef, memo } from "react";

interface LenovoLaptopProps {
  screenImage?: string[];
  alt?: string;
  className?: string;
  width?: number | string;
  tiltIntensity?: number; // How much it tilts with mouse (default 10)
  enableTilt?: boolean;
}

// Memoized keyboard — 70 keys render only once
const Keyboard = memo(() => (
  <div
    style={{
      background: "#151515",
      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
      height: "62%",
      borderRadius: "6px",
      padding: "2%",
    }}
  >
    <div
      style={{
        display: "grid",
        gap: "3px",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "repeat(14, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
      }}
    >
      {Array.from({ length: 70 }, (_, i) => (
        <div
          key={i}
          style={{
            borderRadius: "2px",
            background: "linear-gradient(145deg, #2c2c2c, #1a1a1a)",
            boxShadow:
              "inset 0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)",
          }}
        />
      ))}
    </div>
  </div>
));
Keyboard.displayName = "Keyboard";

// Static styles
const SCREEN_GRADIENT =
  "linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)";
const BASE_GRADIENT =
  "linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 50%, #2a2a2a 100%)";
const PLACEHOLDER_GRADIENT =
  "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)";
const REFLECTION_GRADIENT =
  "linear-gradient(105deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.04) 100%)";

// Base "always open" rotation
const BASE_ROTATE_X = -15;
const BASE_ROTATE_Y = 0;

const LenovoLaptop: React.FC<LenovoLaptopProps> = ({
  screenImage,
  alt = "Laptop screen",
  className = "",
  width = "100%",
  tiltIntensity = 10,
  enableTilt = true,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [tilt, setTilt] = useState({ x: BASE_ROTATE_X, y: BASE_ROTATE_Y });
  const [isHovering, setIsHovering] = useState(false);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || prefersReducedMotion || !wrapperRef.current) return;

      // Throttle with requestAnimationFrame for smooth 60fps updates
      if (rafRef.current !== null) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      rafRef.current = requestAnimationFrame(() => {
        // Normalize mouse position to [-1, 1] relative to element center
        const relX = (clientX - rect.left) / rect.width - 0.5;
        const relY = (clientY - rect.top) / rect.height - 0.5;

        setTilt({
          x: BASE_ROTATE_X + -relY * tiltIntensity, // tilt up/down
          y: BASE_ROTATE_Y + relX * tiltIntensity,  // tilt left/right
        });

        rafRef.current = null;
      });
    },
    [enableTilt, prefersReducedMotion, tiltIntensity]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Reset to base position smoothly
    setTilt({ x: BASE_ROTATE_X, y: BASE_ROTATE_Y });
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`laptop-wrapper ${className} xl:w-[500px] w-[300px]`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={alt}
      style={{
        perspective: "1800px",
        width,
        // maxWidth: "500px",
      }}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          // Snappy while hovering (follows the mouse), smooth easing when leaving
          transition: isHovering
            ? "transform 0.15s ease-out"
            : "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* SCREEN (lid) — always open */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 10",
            background: SCREEN_GRADIENT,
            transformOrigin: "bottom",
            transform: "rotateX(0deg)",
            boxShadow:
              "0 0 0 2px #0a0a0a, inset 0 0 0 2px #333, 0 20px 40px rgba(0,0,0,0.3)",
            padding: "3.5%",
            borderRadius: "12px 12px 0 0",
          }}
        >
          {/* Inner bezel */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "6px",
              overflow: "hidden",
              background: "#000",
              boxShadow: "inset 0 0 0 2px #111",
            }}
          >
            {/* Webcam */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#222",
                boxShadow: "inset 0 0 2px #000, 0 0 1px #444",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "2px",
                  height: "2px",
                  borderRadius: "50%",
                  background: "#0a0a0a",
                }}
              />
            </div>

            {/* Screen content */}
            {screenImage ? (
              <img
                src={screenImage[0]}
                alt={alt}
                loading="lazy"
                decoding="async"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: PLACEHOLDER_GRADIENT,
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                }}
              >
                Sin imagen
              </div>
            )}

            {/* Reflection */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: REFLECTION_GRADIENT,
              }}
            />
          </div>

          {/* Lenovo logo */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "2px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.5rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#888",
            }}
          >
            Lenovo
          </div>
        </div>

        {/* BASE (keyboard) — always flat/open */}
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            aspectRatio: "16 / 10.5",
            background: BASE_GRADIENT,
            transformOrigin: "top",
            transform: "rotateX(90deg)",
            boxShadow:
              "0 0 0 2px #0a0a0a, inset 0 0 0 2px #333, 0 10px 20px rgba(0,0,0,0.4)",
            padding: "5% 7.5%",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Keyboard />

          {/* Trackpad */}
          <div
            aria-hidden="true"
            style={{
              margin: "2% auto 0",
              width: "35%",
              height: "28%",
              borderRadius: "6px",
              background: "linear-gradient(145deg, #1a1a1a, #252525)",
              boxShadow:
                "inset 0 0 0 1px #333, inset 0 2px 4px rgba(0,0,0,0.4)",
            }}
          />

          {/* ThinkPad label */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "4px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.4375rem",
              letterSpacing: "0.15em",
              color: "#555",
            }}
          >
            ThinkPad
          </div>
        </div>

        {/* Shadow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "200%",
            left: "50%",
            width: "85%",
            height: "30px",
            transform: "translateX(-50%) translateY(20px)",
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)",
            filter: "blur(8px)",
            opacity: isHovering ? 0.7 : 0.5,
            transition: "opacity 0.4s ease-out",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

export default memo(LenovoLaptop);