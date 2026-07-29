import { useState, useEffect, lazy } from 'react';
import type { ProjectsProps } from '@/App';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

// 🔥 OPTIMIZACIÓN 1: Code-Splitting con React.lazy
const FriendzoneSection = lazy(() => import('../ProjectsOpenedSections/FriendzoneSection'));
const WonderSection = lazy(() => import('../ProjectsOpenedSections/WonderSection'));
const AAPGSection = lazy(() => import('../ProjectsOpenedSections/AAPGSection'));
const AutoMediaSection = lazy(() => import('../ProjectsOpenedSections/AutoMediaSection'));

// 🔥 Los componentes pesados de cada proyecto se separan en archivos individuales
// const FriendzoneMedia = lazy(() => import('../ProjectsMedia/FriendzoneMedia'));
// const WonderMedia = lazy(() => import('../ProjectsMedia/WonderMedia'));
// const AAPGMedia = lazy(() => import('../ProjectsMedia/AAPGMedia'));
// const AutoMediaConverterMedia = lazy(() => import('../ProjectsMedia/AutoMediaConverterMedia'));
const projectMediaMap: Record<string, React.ComponentType<any>> = {
  "1": FriendzoneSection,
  "2": WonderSection,
  "3": AAPGSection,
  "4": AutoMediaSection,
};
interface VideoProps {
  src: string;
  deviceType?: string;
}

interface SlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectsProps | null;
}

export const VideoPlayer = ({ src }: VideoProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full z-10 flex justify-center items-center bg-[#c6c6c6] overflow-hidden ">
      {/* Activity Indicator */}
      {isLoading && (
        <div className="absolute z-10 flex flex-col items-center gap-2">
          <Icon icon="eos-icons:loading" className="text-white text-4xl" />
          <span className="text-white/70 text-sm">Cargando visualización...</span>
        </div>
      )}

      {/* Video optimizado */}
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setIsLoading(false)}
        className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`}
      />
    </div>
  );
};

export const SlideModal = ({ isOpen, project, onClose }: SlideModalProps) => {
  // Bloquear el scroll de la página cuando el modal está abierto


  // Obtenemos el componente multimedia dinámicamente según el ID
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  
  // Función interna para generar el fondo adaptativo idéntico al de tus tarjetas
  const getDynamicBackground = (colors: string[], direction: string) => {
    if (!colors || colors.length < 3) return {};
    
    // Mapeamos direcciones comunes para que coincidan con la estructura radial
    let radialDirection = "circle at top right";
    if (direction.includes("bottom")) radialDirection = "circle at bottom right";
    if (direction.includes("left")) radialDirection = "circle at top left";
    
    return {
      backgroundImage: `
      radial-gradient(${radialDirection}, ${colors[0]}, transparent 60%),
      radial-gradient(circle at bottom left, ${colors[2]}, ${colors[1]})
      `,
    };
  };
const DynamicMedia = project ? projectMediaMap[project.id] : null;
  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md"
        >
          {/* Clickeando afuera cerramos el modal */}
          <div className="absolute inset-0 z-0" onClick={onClose} />

          {/* Contenedor principal del Modal con FONDO ÚNICO DINÁMICO */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={getDynamicBackground(project.colors, project.direction[0])} // 🌟 Inyección de colores únicos
            className="relative z-10 w-full xl:w-[85vw] h-full border-l border-white/10 overflow-y-auto flex flex-col shadow-2xl"
          >
{DynamicMedia && <DynamicMedia />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};