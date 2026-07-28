import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, type Variants } from 'framer-motion';
import './ScrollBeyond.css';
import Navbar from './mainSections/NavBar';





interface Props {
    children: React.ReactNode;
}

const ScrollBeyond = ({ children }: Props) => {
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        mass: 0.3,
    });

    // ---------------------------------------------------------------
    // SCROLL TIMELINE (no intro phase — mount animation handles that)
    //   0.00 - 0.40 : Hold  — texts stay centered, user reads them
    //   0.40 - 0.85 : PUSH  — children rise, texts get shoved apart
    //   0.85 - 1.00 : Outro — children settled, ready for next section
    // ---------------------------------------------------------------



    // Children rise into the gap during the push window
    const childrenY = useTransform(smoothProgress, [0.4, 0.85], ['40vh', '0px']);
    const childrenOpacity = useTransform(
        smoothProgress,
        [0.4, 0.6, 1],
        [0, 1, 1]
    );
    const childrenScale = useTransform(smoothProgress, [0.4, 0.85], [0.9, 1]);

    const pointerEvents = useTransform(
        smoothProgress,
        [0, 0.84, 0.85, 1],
        ['none', 'none', 'auto', 'auto']
    );

    // ---------------------------------------------------------------
    // MOUNT ANIMATION — runs once on load
    // Variants give us a clean parent/child orchestration with stagger.
    // ---------------------------------------------------------------


    return (
        <section ref={sectionRef} className="scroll-beyond">
            {/* <div
            
                style={{
                    background: 'linear-gradient(to bottom, ' +
                        'rgba(255, 26, 2  ,2, 0.15) 0%, ' +
                        'rgba(255, 10, 26, 0.08) 25%, ' +
                        'rgba(255, 26, 26, 0.03) 55%, ' +
                        'rgba(0, 0, 0, 0) 100%)'
                }} className='  position: relative;
  height: 300vh'> */}
                <Navbar />
                <div className="scroll-beyond__wrapper">
                    {/* Background — children */}
                    <motion.div
                        className="scroll-beyond__children"
                        style={{
                            y: childrenY,
                            opacity: childrenOpacity,
                            scale: childrenScale,
                            pointerEvents,
                        }}
                    >
                        {children}
                    </motion.div>

                    {/* Foreground — title pair */}
                    {/*
          The outer motion.div drives the scroll-based opacity AND the mount
          orchestration. Inner h1s combine the mount transform (via variants)
          with the scroll-based transform (via style.y) — Framer merges them
          automatically.
        */}
   
                </div>
            {/* </div> */}
        </section>
    );
};

export default ScrollBeyond;