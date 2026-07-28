import {
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  style?: React.CSSProperties;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

/* ------------------------------------------------------------------ */
/*  Pure helpers (module-scope, never re-created)                     */
/* ------------------------------------------------------------------ */
function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

const SHADOW_LAYERS: ReadonlyArray<[number, number, number, number, number, boolean]> = [
  [0, 0, 0, 1, 100, true],
  [0, 0, 1, 0, 60, true],
  [0, 0, 3, 0, 50, true],
  [0, 0, 6, 0, 40, true],
  [0, 0, 15, 0, 30, true],
  [0, 0, 25, 2, 20, true],
  [0, 0, 50, 2, 10, true],
  [0, 0, 1, 0, 60, false],
  [0, 0, 3, 0, 50, false],
  [0, 0, 6, 0, 40, false],
  [0, 0, 15, 0, 30, false],
  [0, 0, 25, 2, 20, false],
  [0, 0, 50, 2, 10, false],
];

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  let out = '';
  for (let i = 0; i < SHADOW_LAYERS.length; i++) {
    const [x, y, blur, spread, alpha, inset] = SHADOW_LAYERS[i];
    const a = Math.min(alpha * intensity, 100);
    if (i > 0) out += ', ';
    out += `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
  }
  return out;
}

function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x: number) { return x * x * x; }

interface AnimateOpts {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
  isCancelled?: () => boolean;
}

function animateValue({
  start = 0, end = 100, duration = 1000, delay = 0,
  ease = easeOutCubic, onUpdate, onEnd, isCancelled,
}: AnimateOpts) {
  let rafId = 0;
  const timerId = window.setTimeout(() => {
    const t0 = performance.now();
    const tick = () => {
      if (isCancelled?.()) return;
      const t = Math.min((performance.now() - t0) / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) rafId = requestAnimationFrame(tick);
      else onEnd?.();
    };
    rafId = requestAnimationFrame(tick);
  }, delay);

  return () => {
    clearTimeout(timerId);
    cancelAnimationFrame(rafId);
  };
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = new Array(8);
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients[i] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  gradients[7] = `linear-gradient(${colors[0]} 0 100%)`;
  return gradients;
}

// Static mask layers (don't depend on angle) — built once per component instance
const STATIC_FILL_MASK_LAYERS = [
  'linear-gradient(to bottom, black, black)',
  'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
  'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
  'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
  'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
  'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
];
const STATIC_FILL_MASK_PREFIX = STATIC_FILL_MASK_LAYERS.join(', ');

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor,
  borderRadius = 28,
  glowRadius = 40,
  style,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // We keep angles/proximity in refs and ONLY trigger a render when the
  // visibility-affecting state changes. Visual updates apply via direct
  // style mutation inside rAF — bypassing React entirely on hot path.
  const angleRef = useRef(45);
  const proximityRef = useRef(0);

  // Refs to the layers we mutate directly
  const borderLayerRef = useRef<HTMLDivElement>(null);
  const fillLayerRef = useRef<HTMLDivElement>(null);
  const glowLayerRef = useRef<HTMLSpanElement>(null);

  const [isOnScreen, setIsOnScreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sweepActive, setSweepActive] = useState(false);

  // Active = mouse is hovering OR animated sweep is playing,
  // AND the component is on screen.
  const active = isOnScreen && (isHovered || sweepActive);

  /* ------- IntersectionObserver: track on-screen state ------- */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ------- Memoize expensive strings ------- */
  const meshGradients = useMemo(() => buildMeshGradients(colors), [colors]);
  const borderBgSuffix = useMemo(() => meshGradients.map(g => `${g} border-box`).join(', '), [meshGradients]);
  const fillBgString = useMemo(() => meshGradients.map(g => `${g} padding-box`).join(', '), [meshGradients]);
  const borderBaseBg = useMemo(
    () =>
      `linear-gradient(${backgroundColor} 0 100%) padding-box, ` +
      `linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box, ` +
      borderBgSuffix,
    [backgroundColor, borderBgSuffix],
  );
  const boxShadowString = useMemo(
    () => buildBoxShadow(glowColor, glowIntensity),
    [glowColor, glowIntensity],
  );
  const colorSensitivity = edgeSensitivity + 20;

  /* ------- Direct-DOM updater (no React re-render) ------- */
  const applyStyles = useCallback(() => {
    const angle = angleRef.current;
    const prox = proximityRef.current;
    const proxPct = prox * 100;

    const borderOpacity = Math.max(0, (proxPct - colorSensitivity) / (100 - colorSensitivity));
    const glowOpacity = Math.max(0, (proxPct - edgeSensitivity) / (100 - edgeSensitivity));

    const angleDeg = `${angle.toFixed(2)}deg`;

    // Border layer
    const borderEl = borderLayerRef.current;
    if (borderEl) {
      const mask =
        `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, ` +
        `transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, ` +
        `black ${100 - coneSpread}%)`;
      borderEl.style.opacity = String(borderOpacity);
      borderEl.style.maskImage = mask;
      borderEl.style.webkitMaskImage = mask;
    }

    // Fill layer
    const fillEl = fillLayerRef.current;
    if (fillEl) {
      const mask =
        STATIC_FILL_MASK_PREFIX +
        `, conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, ` +
        `black 85%, transparent 95%)`;
      fillEl.style.opacity = String(borderOpacity * fillOpacity);
      fillEl.style.maskImage = mask;
      fillEl.style.webkitMaskImage = mask;
    }

    // Glow layer
    const glowEl = glowLayerRef.current;
    if (glowEl) {
      const mask =
        `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, ` +
        `transparent 90%, black 97.5%)`;
      glowEl.style.opacity = String(glowOpacity);
      glowEl.style.maskImage = mask;
      glowEl.style.webkitMaskImage = mask;
    }
  }, [coneSpread, colorSensitivity, edgeSensitivity, fillOpacity]);

  /* ------- rAF-throttled pointer handler ------- */
  const rafPendingRef = useRef(false);
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card || !isOnScreen) return; // 👈 skip work entirely when off-screen

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      // edge proximity
      let kx = Infinity, ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      proximityRef.current = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

      // angle
      if (dx === 0 && dy === 0) {
        angleRef.current = 0;
      } else {
        let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (deg < 0) deg += 360;
        angleRef.current = deg;
      }

      if (!rafPendingRef.current) {
        rafPendingRef.current = true;
        requestAnimationFrame(() => {
          rafPendingRef.current = false;
          applyStyles();
        });
      }
    },
    [isOnScreen, applyStyles],
  );

  /* ------- Animated sweep (only when on-screen) ------- */
  useEffect(() => {
    if (!animated || !isOnScreen) return;

    let cancelled = false;
    const isCancelled = () => cancelled;
    const angleStart = 110;
    const angleEnd = 465;
    setSweepActive(true);
    angleRef.current = angleStart;

    const setProx = (v: number) => {
      proximityRef.current = v / 100;
      applyStyles();
    };
    const setAngle = (v: number) => {
      angleRef.current = (angleEnd - angleStart) * (v / 100) + angleStart;
      applyStyles();
    };

    const cancels = [
      animateValue({ duration: 500, onUpdate: setProx, isCancelled }),
      animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: setAngle, isCancelled }),
      animateValue({
        ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100,
        onUpdate: setAngle, isCancelled,
      }),
      animateValue({
        ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
        onUpdate: setProx,
        onEnd: () => setSweepActive(false),
        isCancelled,
      }),
    ];

    return () => {
      cancelled = true;
      cancels.forEach(c => c());
    };
  }, [animated, isOnScreen, applyStyles]);

  /* ------- When becoming inactive, reset styles to 0 ------- */
  useEffect(() => {
    if (active) {
      // Apply current state immediately when becoming active
      applyStyles();
    } else {
      // Fade out via CSS transition (opacity 0 lets the browser skip painting)
      [borderLayerRef.current, fillLayerRef.current, glowLayerRef.current]
        .forEach(el => { if (el) el.style.opacity = '0'; });
    }
  }, [active, applyStyles]);

  /* ------- Render ------- */
  const transition = active ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out';

  return (
    <div
      ref={cardRef}
      onPointerMove={active ? handlePointerMove : undefined}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`relative grid  ${className}`}
      style={{
        background: backgroundColor,
        borderRadius: `${borderRadius}px`,
        // transform: 'translate3d(0, 0, 0.01px)',
        boxShadow:
          'rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, ' +
          'rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, ' +
          'rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px',
        ...style,
      }}
    >
      {/* Heavy glow layers only mounted when on screen */}
      {isOnScreen && (
        <>
          {/* mesh gradient border */}
          <div
            ref={borderLayerRef}
            className="absolute inset-0  w-full h-full rounded-[inherit] -z-[1]"
            style={{
              background: borderBaseBg,
              opacity: 0,
              zIndex:99,
              transition,
              willChange: 'opacity, mask-image',
            }}
          />
{/* h-full w-full */}
          {/* mesh gradient fill near edges */}
          <div
            ref={fillLayerRef}
            className="absolute inset-0  w-full h-full rounded-[inherit] -z-[1]"
            style={{
              border: '1px solid transparent',
              background: fillBgString,
              maskComposite: 'subtract, add, add, add, add, add',
              WebkitMaskComposite:
                'source-out, source-over, source-over, source-over, source-over, source-over',
              opacity: 0,
              mixBlendMode: 'hard-light',
              transition,
              willChange: 'opacity, mask-image',
            } as React.CSSProperties}
          />

          {/* outer glow */}
          <span
            ref={glowLayerRef}
            className="absolute   w-full h-full  pointer-events-none  rounded-[inherit]"
            style={{
              inset: `${-glowRadius}px`,
              opacity: 0,
              mixBlendMode: 'plus-lighter',
              overflow: "visible",
              transition,
              willChange: 'opacity, mask-image',
            } as React.CSSProperties}
          >
            <span
              className="absolute  w-full h-full rounded-[inherit]"
              style={{
                inset: `${glowRadius}px`,
                boxShadow: boxShadowString,
              }}
            />
          </span>
        </>
      )}

      <div style={{zIndex:999}} className="flex w-full h-full flex-col relative  ">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;