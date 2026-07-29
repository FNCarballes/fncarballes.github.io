import { useState, useRef, useEffect, type MouseEvent } from 'react';

interface PhoneMockupProps {
    images: string[];
    autoPlay?: boolean;
    interval?: number;
}

export default function PhoneMockup3D({ 
    images, 
    autoPlay = false, 
    interval = 3000 
}: PhoneMockupProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null); // Ref para manipular la rotación directamente

    // 1. SOLUCIÓN AL TIMEOUT: Loop controlado sin fugas de memoria
    useEffect(() => {
        if (!autoPlay || images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer); // Limpieza estricta al desmontar
    }, [autoPlay, interval, images.length]);

    // 2. ROTACIÓN ULTRA-OPTIMIZADA: Modifica el DOM directamente saltándose a React
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !cardRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateY = ((e.clientX - centerX) / rect.width) * 40;
        const rotateX = -((e.clientY - centerY) / rect.height) * 25;

        // Inyección directa en los estilos del elemento
        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (cardRef.current) {
            // Regresa suavemente a la posición inicial
            cardRef.current.style.transform = 'rotateX(0deg) rotateY(-15deg)';
        }
    };

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex items-center z-50 justify-center"
            style={{ perspective: '1500px' }}
        >
            {/* Cuerpo del dispositivo móvil/laptop */}
            <div
                ref={cardRef}
                className=" relative w-full max-w-[300px] aspect-[1/2.04] my-auto"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(0deg) rotateY(-15deg)',
                    // Truco maestro: Solo aplicamos transición cuando NO hay hover (para el reset suave).
                    // Durante el hover es 'none' para que no compita contra el puntero del mouse.
                    transition: isHovering ? 'none' : 'transform 0.5s ease-out',
                    // Le avisa al navegador que prepare la GPU para esta capa animada
                    willChange: 'transform', 
                }}
            >
                {/* Sombra del teléfono */}
                     <div
                    className="absolute -bottom-[5%] left-1/2 -translate-x-1/2 w-[80%] h-[5%] 
                        bg-black/50 blur-2xl rounded-full"
                    style={{ transform: 'translateZ(-20px) rotateX(90deg)' }}
                />

                {/* Frame del teléfono */}
                <div
                    className="absolute inset-0 rounded-[1.5rem] xl:rounded-[3rem] 
                        bg-gradient-to-br from-[#2a2a2a] via-[#0a0a0a] to-[#1a1a1a]
                        shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_2px_rgba(255,255,255,0.3)]
                        border border-white/10"
                    style={{ transform: 'translateZ(0px)' }}
                >
                    <div className="absolute top-0 left-1/4 right-1/4 h-[2px] 
                        bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                </div>

                {/* Botones */}
                <div className="absolute left-0 top-[25%] w-[3px] h-[10%] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-l-sm" style={{ transform: 'translateZ(-5px) translateX(-2px)' }} />
                <div className="absolute left-0 top-[38%] w-[3px] h-[13%] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-l-sm" style={{ transform: 'translateZ(-5px) translateX(-2px)' }} />
                <div className="absolute right-0 top-[30%] w-[3px] h-[16%] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-r-sm" style={{ transform: 'translateZ(-5px) translateX(2px)' }} />

                {/* Pantalla */}
                <div
                    className="absolute inset-[8px]  xl:p-0 rounded-[1.5rem] xl:rounded-[2.5rem] overflow-hidden bg-black"
                    style={{ transform: 'translateZ(2px)' }}
                >
                    <div className="relative w-full h-full">
                        {images.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`Screen ${i + 1}`}
                                className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-700
                                    ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}

                        {/* Reflejo (glare) */}
                        <div
                            className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-transparent transition-opacity duration-300"
                            style={{ opacity: isHovering ? 0.3 : 0.15 }}
                        />

                        {/* Notch */}
                     <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[25%] h-[5.5%] bg-black rounded-full flex items-center justify-end px-3 gap-2 z-10">
                            <div className="w-[8px] h-[8px] rounded-full bg-[#1a1a1a] ring-1 ring-[#333]" />
                        </div>

                    </div>
                </div>

                {/* Brillo lateral */}
                <div className="absolute top-4 bottom-4 right-0 w-[2px] rounded-r-[3rem] bg-gradient-to-b from-transparent via-white/30 to-transparent" style={{ transform: 'translateZ(1px)' }} />
            </div>

            {/* Controles externos */}
            {images.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 items-center">
                    <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors">→</button>
                    <div className="flex gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[#E04882]' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </div>
                    <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors">→</button>
                </div>
            )}
        </div>
    );
}