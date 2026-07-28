import { useEffect, useState } from "react";
import PhoneMockup3D from "../mockups/PhoneMockup";
import FriendzoneIcon from "@/assets/MateManos.png";
import fzBack from "@/assets/fzBack.png"
import { ImageSlider } from "@/components/modularized/ImageSlider";

// Separar la data te hace el código más limpio y fácil de mapear
const sectionsData = [
  {
    id: "backend",
    img: [fzBack,],
    title: "Backend",
    content: "Construído con Node Js y Express priorizando la seguridad con el uso de tecnologías robustas y la eficiencia aplicando buenas prácticas como separación de infraestrucura."
  },
  {
    id: "solidaridad",
    title: "Solidaridad",
    content: "Mapa interactivo de lugares que necesitan ayuda. Implementado con..."
  },
  {
    id: "sockets",
    title: "Sockets",
    content: "Comunicación en tiempo real para eventos y chat usando Socket.io..."
  }
];

export default function FriendzoneSection() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Configuramos el observador
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si la sección entra en la vista, la seteamos como activa
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      // rootMargin ajusta el área de detección (ej: detecta cuando está en el medio de la pantalla)
      { rootMargin: "-20% 0px -60% 0px" }
    );

    // Buscamos todas las secciones que tengan el atributo data-section
    const sections = document.querySelectorAll("div[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Función para scroll suave al hacer clic en el menú
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    // Contenedor principal relativo con flex-row
    <div className="w-full relative flex items-start gap-10 p-10  pr-0 xl:pr-0">

      {/* COLUMNA IZQUIERDA: Contenido Principal */}
      <div className="flex-1 flex flex-col gap-32">

        {/* Cabecera / Hero de Friendzone */}
        <section className="w-full flex flex-col gap-10">
          <h1 className="text-white font-bold text-6xl">Friendzone</h1>
          <div className="w-full flex flex-row gap-5">
            <div className="w-[50%]">
              <PhoneMockup3D images={[FriendzoneIcon]} />
            </div>
            <div className="w-[50%]">
              <PhoneMockup3D images={[FriendzoneIcon]} />
            </div>
          </div>
        </section>
<div className="flex flex-col items-center max-w-full mx-auto gap-32 pb-[50vh]">
  {sectionsData.map((section) => (
    <div
      key={section.id}
      id={section.id}
      data-section // Atributo clave para el querySelector
      className="flex flex-col items-center w-full scroll-mt-24 gap-10"
    >
      <div className="w-full text-center">
        <h2 className="text-white text-4xl font-bold mb-6">
          {section.title}
        </h2>
        <p className="text-[#CBCBCB] text-xl leading-relaxed max-w-3xl mx-auto">
          {section.content}
        </p>
      </div>
      {/* Reemplazamos la imagen estática por el Carrusel */}
      {section.img && section.img.length > 0 && (
        <ImageSlider images={section.img} title={section.title} />
      )}
    </div>
  ))}
</div>
      </div>

      {/* COLUMNA DERECHA: Menú Sticky (Grid/Columna) */}
      <aside className="hidden xl:flex flex-col w-[250px] sticky top-[40%] gap-4 -mr-10 p-6 bg-black/10 backdrop-blur-md rounded-2xl border border-white/5">
        <h3 className="text-white/50 text-sm tracking-widest uppercase mb-4 font-bold">
          En esta sección
        </h3>

        <div className="flex flex-col gap-2 relative">
          {sectionsData.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  text-left px-4 py-2 transition-all duration-300 border-l-2
                  ${isActive
                    ? 'text-white border-[#E04882] translate-x-2 font-bold drop-shadow-[0_0_10px_rgba(224,72,130,0.8)]'
                    : 'text-white/40 border-transparent hover:text-white/80 hover:border-white/20'
                  }
                `}
              >
                {section.title}
              </button>
            );
          })}
        </div>
      </aside>

    </div>
  );
}