import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, type Variants } from 'framer-motion';
import { Ballpit } from "../ballPit/BallPit";
import { useLanguage } from '@/lib/hooks/LanguageContext';

interface Props {
    isActive: boolean;
}

export default function Presentationdiv({ isActive }: Props) {
    const divRef = useRef<HTMLDivElement>(null);
    const { language } = useLanguage();

    // Diccionario de traducciones
    const t = {
        es: {
            role: "Full Stack Developer",
            description: "Desarrollo aplicaciones web, de escritorio y mobile de punta a punta, desde el diseño de la arquitectura y la experiencia de usuario hasta el backend, la infraestructura, la seguridad y el despliegue en producción."
        },
        en: {
            role: "Full Stack Developer",
            description: "I develop end-to-end web, desktop, and mobile applications, from architecture design and user experience to backend, infrastructure, security, and production deployment."
        }
    }[language] || { role: "", description: "" };

    const { scrollYProgress } = useScroll({
        target: divRef,
        offset: ['start start', 'end start'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        mass: 0.3,
    });

    const titleY = useTransform(smoothProgress, [0, 0.4, 0.85], ['0px', '-10vh', '-25vh']);
    const subtitleY = useTransform(smoothProgress, [0, 0.4, 0.85], ['0px', '10vh', '25vh']);
    const textsOpacity = useTransform(smoothProgress, [0, 0.5, 0.75], [1, 0.5, 0]);

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const textVariants: Variants = {
        hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const miPaleta = [0xff0080, 0x120F17, 0x100438, 0x47ccdd];

    return (
        <div ref={divRef} className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">
            
            <div className="absolute inset-0 h-full bg-gradient-to-br from-[#dcc2a1] via-[#cbcbcb] to-[#CBCBCB]">
                <Ballpit
                    count={100}
                    gravity={0.09}
                    colors={miPaleta}
                    friction={0.98}
                    wallBounce={0.85}
                    followCursor={false}
                    paused={!isActive}
                />
            </div>

            {isActive && (
                <motion.div
                    className="absolute w-[90%] sm:w-[80%] md:w-[70%] max-w-4xl p-6 sm:p-8 md:p-10 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl pointer-events-none flex flex-col items-center justify-center"
                    style={{ opacity: textsOpacity }}
                >
                    <motion.div
                        className="w-full flex flex-col items-center text-center pointer-events-none"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h1
                            variants={textVariants}
                            style={{ y: titleY }}
                            className="text-[#07112d] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                        >
                            Franco Carballes<br />
                            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold opacity-90">{t.role}</span>
                        </motion.h1>

                        <motion.h2
                            variants={textVariants}
                            style={{ y: subtitleY }}
                            className="text-[#07112d] text-sm sm:text-lg md:text-xl lg:text-xl xl:text-3xl font-medium font-sans mt-4 max-w-2xl tracking-wide leading-relaxed"
                        >
                            {t.description}
                        </motion.h2>
                    </motion.div>
                </motion.div>
            )}

            <div className="absolute bottom-0 left-0 w-full h-32 sm:h-60 bg-gradient-to-b from-transparent to-neutral-950 pointer-events-none" />
        </div>
    );
}