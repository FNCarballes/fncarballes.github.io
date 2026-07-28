import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

type ParallaxBlockProps = {
  className: string;
  y: MotionValue<number>;
  style?: React.CSSProperties;
};
function ParallaxBlock({ className, y, style }: ParallaxBlockProps) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute bottom-0 bg-[#030a24c1] will-change-transform 
        /* Borde superior sutil que brilla con el fondo */
        border-t rounded-t-l border-white/10 
        /* Sombra masiva hacia abajo y arriba */
        shadow-[0_-15px_60px_-15px_rgba(255,255,255,0.05),_0_50px_100px_rgba(0,0,0,0.9)] 
        ${className}`}
      style={{ y, ...style }}
    />
  );
}

export default function SecondSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smooth, delicate motion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 25,
    mass: 0.5,
  });

  // Each block rises at slightly different speeds for parallax depth
  const y1 = useTransform(smoothProgress, [0, 0.5], [600, 0]);
  const y2 = useTransform(smoothProgress, [0, 0.5], [700, 0]);
  const y3 = useTransform(smoothProgress, [0, 0.5], [550, 0]);
  const y4 = useTransform(smoothProgress, [0, 0.5], [800, 0]);
  const y5 = useTransform(smoothProgress, [0, 0.5], [650, 0]);
  const y6 = useTransform(smoothProgress, [0, 0.5], [600, 0]);
  const y7 = useTransform(smoothProgress, [0, 0.5], [720, 0]);
  const y8 = useTransform(smoothProgress, [0, 0.5], [580, 0]);
  const y9 = useTransform(smoothProgress, [0, 0.5], [680, 0]);
  const y10 = useTransform(smoothProgress, [0, 0.5], [620, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden
       bg-transparent px-6 py-32"
    >
      {/* Parallax skyline — black blocks as the background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-full w-full overflow-hidden"
      >
        {/* Each block is anchored to the bottom and rises to form a skyline */}
        <ParallaxBlock
          y={y1}
          className="h-[25%] w-[10%]"
          style={{ left: "0%" }}
        />
        <ParallaxBlock
          y={y2}
          className="h-[35%] w-[9%]"
          style={{ left: "10%" }}
        />
        <ParallaxBlock
          y={y3}
          className="h-[45%] w-[11%]"
          style={{ left: "19%" }}
        />
        <ParallaxBlock
          y={y4}
          className="h-[35%] w-[10%]"
          style={{ left: "30%" }}
        />
        <ParallaxBlock
          y={y5}
          className="h-[48%] w-[9%]"
          style={{ left: "40%" }}
        />
        <ParallaxBlock
          y={y6}
          className="h-[41%] w-[10%]"
          style={{ left: "49%" }}
        />
        <ParallaxBlock
          y={y7}
          className="h-[64%] w-[11%]"
          style={{ left: "59%" }}
        />
        <ParallaxBlock
          y={y8}
          className="h-[79%] w-[9%]"
          style={{ left: "70%" }}
        />
        <ParallaxBlock
          y={y9}
          className="h-[89%] w-[10%]"
          style={{ left: "79%" }}
        />
        <ParallaxBlock
          y={y10}
          className="h-[99%] w-[11%]"
          style={{ left: "89%" }}
        />

      </div>

    </section>
  );
}