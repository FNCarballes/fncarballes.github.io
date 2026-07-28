import DgtSgn from "@/assets/DigSign.avif"
import { useMemo } from 'react';
import { useLanguage } from '@/lib/hooks/LanguageContext';

interface Review {
    name: string;
    devolution: string;
}

interface Props {
    review: Review;
}

function ReviewCard({ review }: Props) {
    return (
        <div className="group relative xl:w-[30%] md:[75%] min-h-[10dvh] flex flex-col gap-6 p-8
            bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl
            border border-white/40 rounded-3xl
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),_inset_0_1px_0_rgba(255,255,255,0.8)]
            hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7),_inset_0_1px_0_rgba(255,255,255,1)]
            hover:-translate-y-2 transition-all duration-500 ease-out
            will-change-transform">

            {/* Comilla decorativa de fondo */}
            <span className="absolute top-2 right-6 text-[8rem] leading-none font-serif 
                text-[#0d0326]/10 select-none pointer-events-none">
                "
            </span>

            {/* Header: avatar + nombre + estrellas */}
            <div className="flex items-center gap-4 relative z-10">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-semibold text-[#0d0326] tracking-tight">
                        {review.name}
                    </h3>
                    <div className="flex gap-0.5 mt-1">
                    </div>
                </div>
            </div>

            {/* Separador sutil */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#0d0326]/20 to-transparent" />

            {/* Devolución */}
            <p className="text-2xl leading-relaxed text-[#1a1a1a]/80 italic relative z-10">
                {review.devolution}
            </p>

            {/* Brillo inferior decorativo */}
            <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-2/3 h-px 
                bg-gradient-to-r from-transparent via-[#0d0326]/30 to-transparent" />
        </div>
    );
}

// Diccionario de reseñas
const getReviews = (lang: string): Review[] => {
    const isEs = lang === 'es';
    return [
        {
            name: "Federico L.",
            devolution: isEs 
                ? "¡La página quedó increíble! Superó ampliamente mis expectativas, me encantó. La sección de noticias es un plus muy útil, gracias Fran!" 
                : "The website turned out amazing! It far exceeded my expectations, I loved it. The news section is a very useful plus, thanks Fran!",
        },
        {
            name: "Luciana U.",
            devolution: isEs 
                ? "Muy dedicado y confiable, me reparó la computadora en 24 horas y a un excelente precio." 
                : "Very dedicated and reliable, he repaired my computer in 24 hours at an excellent price.",
        },
        { 
            name: "Gonzalo U.", 
            devolution: isEs 
                ? "Me revivió una compu viejita con Linux y me enseñó a instalar Windows, un 10." 
                : "He revived an old computer with Linux for me and taught me how to install Windows, a 10/10." 
        }
    ];
};

export default function ReviewSection() {
    const { language } = useLanguage();
    
    // Memoizamos las reviews
    const reviews = useMemo(() => getReviews(language), [language]);

    // Título de la sección
    const title = language === 'es' ? 'Reseñas' : 'Reviews';

    return (
        <div className="p-20 pb-40 w-full relative overflow-hidden">
            <span className="text-[#031135] pl-4 flex gap-6 flex-row text-3xl sm:text-5xl md:text-6xl pt-10 lg:text-5xl 
                    font-bold text-left mb-8 md:mb-12 ">
                {title}
            </span>
            <div className="w-full flex flex-wrap justify-center gap-8 py-20 px-10">
                {reviews.map((r, i) => (
                    <ReviewCard key={i} review={r} />
                ))}
            </div>
            <img src={DgtSgn} alt="Firma digital" className='w-[300px] sm:w-[400px] absolute right-[1%] bottom-10 sm:right-[10%]' />
        </div>
    );
}