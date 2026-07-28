import { motion, useScroll, useTransform, useSpring, type Variants } from 'framer-motion';
import { useRef } from "react";
import typpingVideo from '@/assets/TyppingM.mp4'
import { VideoPlayer } from "../modal/NativeModal";
import elipse1 from "@/assets/Elipse1.avif"
import elipse2 from "@/assets/Elipse2.avif"
import { useLanguage } from '@/lib/hooks/LanguageContext';

export function AbouteMeSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { language } = useLanguage();

    const t = {
        es: {
            title: "Sobre mí",
            p1: "Me especializo en el ecosistema JavaScript (Typescript, React, React Native y Node JS).",
            p2: "Mi camino en IT comenzó en el mundo de las redes y la ciberseguridad. Esta experiencia me dio una perspectiva única, comprendí que un software no solo debe ser funcional y estético, sino robusto y seguro desde su arquitectura inicial. Hoy me enfoco en crear aplicaciones eficientes y seguras, aplicando metodologías ágiles y aprendiendo continuamente. Estoy listo para aportar mi visión técnica y de seguridad en proyectos desafiantes."
        },
        en: {
            title: "About me",
            p1: "I specialize in the JavaScript ecosystem (TypeScript, React, React Native, and Node.js).",
            p2: "My journey in IT began in the world of networking and cybersecurity. This experience gave me a unique perspective, understanding that software must not only be functional and aesthetic but also robust and secure from its initial architecture. Today, I focus on creating efficient and secure applications, applying agile methodologies, and continuously learning. I am ready to bring my technical and security vision to challenging projects."
        }
    }[language] || { title: "", p1: "", p2: "" };

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        mass: 0.3,
    });

    const textsOpacity = useTransform(smoothProgress, [0, 0.5, 0.75], [1, 0.5, 0]);

    const containerVariants: Variants = {
        hidden: {},
        visible: {
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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ opacity: textsOpacity }}
            className="flex flex-col xl:flex-row w-full bg-[#C6C6C6] min-h-[120vw] xl:min-h-[53vw] xl:justify-end overflow-hidden "
        >
            <motion.div
                variants={textVariants}
                className=" xl:w-[100%] pt-20 xl:absolute w-full h-full z-20 pointer-events-none"
            >
                <div className="relative xl:w-[50%] w-full z-20 pointer-events-auto">
                    <VideoPlayer src={typpingVideo} />

                    <div className="
                      absolute object-fill
                        w-[200%] h-[100%]  
                        max-w-none
                        z-40">

                        <img
                            src={elipse1}
                            alt="Elipse background"
                            className="
                        relative hidden xl:flex
                        -top-[93%] -left-[4%] 
                        w-[105%] h-[150%]  max-w-none  
                        object- z-10 
                        "/>

                        <img
                            src={elipse2}
                            alt="Elipse background"
                            className="
                        absolute object-fill z-10
                        w-[200%] h-[100%] max-w-none  
                        top-[-9.5%] left-[-75%]
                        sm:top-[-7%] sm:-rotate-2  sm:right-[75%] sm: sm:h-[100%]
                        xl:hidden 
                        "/>

                        <motion.div className="flex h-[100%]  flex-col z-40 
                       justify-start items-center px-4 
                    w-[50%] 
                    gap-3
                    xl:absolute xl:top-[-78%] xl:right-[-1%] xl:gap-1 xl:pr-32
                    ">

                            <motion.h1
                                variants={textVariants}
                                className="text-brand-darkBV 
                            z-40 font-bold
                            px-4 w-full   
                            text-[4vw]
                             md:text-[4vw]
                            xl:text-[3vw]
                            "
                            >
                                {t.title}
                            </motion.h1>

                            <motion.p className=" z-10
                             font-sans font-semibold text-[#f2f0f0]
                            leading-relaxed text-justify  
                            w-[100%] px-4 pb-10 
                            text-[2.2vw]
                            sm:text-[2.2vw]
                            lg:text-[2vw] lg:pt-4
                            xl:text-[1.2vw] xl:pb-0
                            ">
                                {t.p1}<br />
                                {t.p2}
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}