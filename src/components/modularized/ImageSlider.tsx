import { useState, useEffect } from "react";
interface Props {
    images: string[];
    title: string;
}
export const ImageSlider = ({ images, title }: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Si no hay imágenes o hay solo 1, no hacemos loop
        if (!images || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 7000); // 7 segundos

        // Limpiamos el intervalo cuando se desmonta
        return () => clearInterval(interval);
    }, [images]);

    if (!images || images.length === 0) return null;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Imagen */}
            <img
                src={images[currentIndex]}
                className="rounded-xl shadow-2xl shadow-black/60 object-cover transition-opacity duration-500"
                alt={`${title} - imagen ${currentIndex + 1}`}
            />

            {/* Indicadores (bolitas) - Solo se muestran si hay más de 1 imagen */}
            {images.length > 1 && (
                <div className="flex gap-3 mt-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === index
                                    ? "bg-white"
                                    : "bg-[#CBCBCB]/40 hover:bg-[#CBCBCB]"
                                }`}
                            aria-label={`Ir a la imagen ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};