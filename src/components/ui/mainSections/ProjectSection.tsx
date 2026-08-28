import { useState, memo, useMemo } from 'react';
import fzPhoto from "@/assets/fzScreen.png";
import aapg from "@/assets/aapgImg.png";
import BorderGlow from '../card/HoverCard';
import { SlideModal } from '../modal/NativeModal';
import zustandIcon from "@/assets/zustand.svg";
import zodIcon from "@/assets/zod.svg";
import { Icon } from '@iconify/react';
import PhoneMockup3D from '../mockups/PhoneMockup';
import LenovoLaptop from '../mockups/LaptopMockup';
import mediaConvImg from '@/assets/MediaConverterImg.png';
import munchies0 from '@/assets/munchiesImg0.png';
import munchies1 from '@/assets/munchiesImg1.jpg';
import BoothMockup from '../mockups/BoothMockup';
import { type ProjectsProps } from '@/App';
import { useLanguage } from '@/lib/hooks/LanguageContext'; // ✅ Importamos el hook

interface ContentProps {
  title: string;
  activeSection: string;
  projectSelected: ProjectsProps | null;
  setProjectSelected: (value: ProjectsProps | null) => void;
}

interface TechProps {
  icon: string;
  src?: string;
  label: string;
  rounded?: boolean;
}

const techStack: TechProps[] = [
  { icon: "devicon:linux", label: "Linux" },
  { icon: "devicon:kalilinux", label: "Kali Linux" },
  { icon: "devicon:javascript", label: "JavaScript" },
  { icon: "devicon:typescript", label: "TypeScript" },
  { icon: "devicon:react", label: "React" },
  { icon: "devicon:reactnative", label: "React Native" },
  { icon: "devicon:tailwindcss", label: "Tailwind CSS" },
  { icon: "devicon:socketio", label: "Socket.IO", rounded: true },
  { icon: "devicon:nodejs", label: "Node.js" },
  { icon: "devicon:express", label: "Express", rounded: true },
  { icon: "devicon:mongodb", label: "MongoDB" },
  { icon: "devicon:firebase", label: "Firebase" },
  { icon: "devicon:mongoose", label: "Mongoose" },
  { icon: "devicon:redis", label: "Redis" },
  { icon: "simple-icons:zustand", src: zustandIcon, label: "Zustand" },
  { icon: "simple-icons:zod", src: zodIcon, label: "Zod" },
  { icon: "devicon:googlecloud", label: "Google Cloud" },
  { icon: "devicon:cloudflare", label: "Cloudflare" },
  { icon: "devicon:expo", label: "Expo", rounded: true },
  { icon: "devicon:vitejs", label: "Vite" },
  { icon: "devicon:tauri", label: "Tauri" },
  { icon: "devicon:electron", label: "Electron" },
  { icon: "devicon:git", label: "GitHub" },
  { icon: "devicon:figma", label: "Figma" },
];

const getCardsData = (lang: string): ProjectsProps[] => {
  const isEs = lang === 'es';

  return [
        {
      id: "1",
      colors: ['#0E1130', '#FF8800', '#0E1130'],
      direction: ["bottom", "left"],
      title: "Munchies",
      support: "booth",
      image: [munchies0, munchies1],
      content: isEs
        ? `Ecosistema multiplataforma para franquicias de comida rápida que centraliza ventas, fidelización y la administración de múltiples sucursales.\n\n▸ <strong>App Clientes:</strong> Programa de fidelización con acumulación de puntos, canje de beneficios y promociones personalizadas.\n\n▸ <strong>App Staff (PC/Mobile):</strong> Gestión multirol de pedidos, stock y promociones, con analíticas centralizadas por sucursal.\n\n▸ <strong>Backend:</strong> Procesamiento de pagos con Stripe, comunicación en tiempo real mediante WebSockets y pipelines de agregación optimizados para consultas de alto rendimiento.\n\n▸ <strong>Seguridad:</strong> Tokenización de pagos, autenticación con tokens asimétricos (RS256) y cifrado de contraseñas con bcrypt.`
        : `Multi-platform ecosystem for fast food franchises that centralizes sales, loyalty programs, and the administration of multiple branches.\n\n▸ <strong>Customer App:</strong> Loyalty program with point accumulation, benefit redemption, and personalized promotions.\n\n▸ <strong>Staff App (PC/Mobile):</strong> Multi-role management of orders, stock, and promotions, with centralized analytics per branch.\n\n▸ <strong>Backend:</strong> Payment processing with Stripe, real-time communication via WebSockets, and aggregation pipelines optimized for high-performance queries.\n\n▸ <strong>Security:</strong> Payment tokenization, asymmetric token authentication (RS256), and password hashing with bcrypt.`,
      tech: ["Linux", "JavaScript", "Express", "Google Cloud", "Redis", "TypeScript", "Node.js", "MongoDB", "Mongoose", "Socket.IO", "Zustand", "Zod", "Expo", "Tauri", "React Native", "Tailwind CSS", "Figma"],
      segments: isEs ? [
        { title: "Backend", content: "Detalles del backend robusto con pipelines de agregación..." },
        { title: "¿Por qué multiplataforma?", content: "Beneficios de usar Tauri y React Native..." },
        { title: "App de clientes", content: "Detalles de la UI/UX y sistema de puntos..." },
        { title: "App de staff", content: "Gestión de roles y sucursales en PC..." }
      ] : [
        { title: "Backend", content: "Details of the robust backend with aggregation pipelines..." },
        { title: "Why multi-platform?", content: "Benefits of using Tauri and React Native..." },
        { title: "Customer App", content: "UI/UX details and points system..." },
        { title: "Staff App", content: "Role and branch management on PC..." }
      ]
    },
    {
      id: "2",
      colors: ['#E04882', '#38385C', '#070736'],
      direction: ["bottom", "right"],
      title: "Friend Zone",
      support: "mobile",
      image: [fzPhoto],
      content: isEs
        ? `Aplicación móvil para la gestión de eventos lúdicos y solidarios con enfoque en entornos seguros y ayuda social.\n\n▸  <strong>Características principales:</strong> Chats privados y grupales en tiempo real exclusivos para participantes, junto con un mapa interactivo que visibiliza puntos de ayuda y causas sociales.\n\n▸  <strong>Frontend:</strong> React Native (Expo), React Query para gestión de estado del servidor y caché, y Zustand para estado global.\n\n▸  <strong>Backend:</strong> Arquitectura orientada a eventos mediante WebSockets, colas/workers para procesamiento asíncrono, Redis como capa de caché, MongoDB como base de datos y Firebase Storage para archivos.\n\n▸  <strong>Seguridad:</strong> Autenticación con tokens RS256, cifrado de contraseñas con bcrypt y gestión segura de secretos y variables de entorno.`
        : `Mobile application for managing recreational and charity events, focusing on safe environments and social assistance.\n\n▸  <strong>Main features:</strong> Real-time private and group chats exclusive to participants, along with an interactive map that highlights help points and social causes.\n\n▸  <strong>Frontend:</strong> React Native (Expo), React Query for server state and cache management, and Zustand for global state.\n\n▸  <strong>Backend:</strong> Event-driven architecture using WebSockets, queues/workers for asynchronous processing, Redis as a caching layer, MongoDB as the database, and Firebase Storage for files.\n\n▸  <strong>Security:</strong> Authentication with RS256 tokens, password hashing with bcrypt, and secure management of secrets and environment variables.`,
      tech: ["React Native", "Linux", "Express", "JavaScript", "Firebase", "Google Cloud", "Redis", "Figma", "TypeScript", "Node.js", "MongoDB", "Mongoose", "Socket.IO", "Zustand", "Zod", "Expo"],
      segments: isEs ? [
        { title: "Backend", content: "Aquí va el detalle de la arquitectura del backend de Friendzone..." },
        { title: "Sección solidaria", content: "Friendzone es un proyecto que nació de la idea de que las personas cada vez estan mas distanciadas por diferentes motivos. Muchas veces ignoramos la realidad de nuestro mundo real, esta sección en particular busca recordar que cerca nuestro hay personas que vienen a mejorar el mundo, otras que lo necesitan y hoy será mas fácil encontrarnos en medio de todo el ruido.", img: "" },
        { title: "Sockets", content: "Explicación de la comunicación en tiempo real con Socket.IO..." },
        { title: "¿Por qué elegí estas tecnologías?", content: "Razones y trade-offs de la stack elegida..." }
      ] : [
        { title: "Backend", content: "Details of the Friendzone backend architecture go here..." },
        { title: "Solidarity Section", content: "Friendzone is a project born from the idea that people are increasingly distanced for various reasons. We often ignore the reality of our real world; this section specifically seeks to remind us that close to us there are people who come to improve the world, others who need it, and today it will be easier to find each other amidst all the noise.", img: "" },
        { title: "Sockets", content: "Explanation of real-time communication with Socket.IO..." },
        { title: "Why did I choose these technologies?", content: "Reasons and trade-offs of the chosen stack..." }
      ]
    },

    {
      id: "3",
      colors: ['#000000', '#041387', '#111530'],
      direction: ["right", "top"],
      title: "AAPG",
      support: "pc",
      image: [aapg],
      content: isEs
        ? `Sitio web institucional del Student Chapter Córdoba de la American Association of Petroleum Geologists (AAPG). Centraliza la difusión de actividades, el contacto con la organización y la inscripción de nuevos miembros.\n\n▸ <strong>Portal institucional:</strong> Información sobre la organización, eventos y canales de contacto.\n\n▸ <strong>Integración de datos:</strong> Consumo de una API propia que recopila y agrega noticias relevantes de la industria petrolera a nivel internacional, junto con una sección especializada en el sector argentino.\n\n▸ <strong>Backend:</strong> Sistema de agregación de noticias con filtrado mediante agentes de IA. Implementa conmutación automática entre Gemini y Groq para garantizar la disponibilidad del servicio.`
        : `Institutional website of the American Association of Petroleum Geologists (AAPG) Student Chapter Córdoba. It centralizes the dissemination of activities, contact with the organization, and the registration of new members.\n\n▸ <strong>Institutional portal:</strong> Information about the organization, events, and contact channels.\n\n▸ <strong>Data integration:</strong> Consumption of a custom API that collects and aggregates relevant oil industry news internationally, along with a specialized section for the Argentine sector.\n\n▸ <strong>Backend:</strong> News aggregation system with AI agent filtering. Implements automatic switching between Gemini and Groq to ensure service availability.`,
      tech: ["TypeScript", "React", "Tailwind CSS", "Vite", "Cloudflare"],
      segments: isEs ? [{ title: "Bot informativo", content: "" }] : [{ title: "Informative bot", content: "" }],
      link: "https://aapg.unc-sc.workers.dev/"
    },
    {
      id: "4",
      colors: ['#f44336', '#002E04', '#4CAF50'],
      direction: ["left", "top"],
      title: "Auto Media Converter",
      support: "pc",
      image: [mediaConvImg],
      content: isEs
        ? `Aplicación de escritorio para la optimización de imágenes mediante procesamiento automatizado y monitoreo del sistema de archivos.\n\n▸ <strong>Optimización:</strong> Conversión de PNG, JPG y JPEG a WebP o AVIF con reducciones de tamaño de hasta un 99%.\n\n▸ <strong>Automatización:</strong> Monitoreo en tiempo real de directorios para ejecutar tareas de conversión sin intervención del usuario.\n\n▸ <strong>Configuración:</strong> Procesamiento por lotes, reglas personalizables y eliminación opcional del archivo original.`
        : `Desktop application for image optimization through automated processing and file system monitoring.\n\n▸ <strong>Optimization:</strong> Conversion of PNG, JPG, and JPEG to WebP or AVIF with size reductions of up to 99%.\n\n▸ <strong>Automation:</strong> Real-time directory monitoring to execute conversion tasks without user intervention.\n\n▸ <strong>Configuration:</strong> Batch processing, customizable rules, and optional deletion of the original file.`,
      tech: ["JavaScript", "HTML", "Node.js", "Electron", "GitHub"],
      segments: []
    },
  ];
};

const TitleClasses = `
 text-[3dvh] sm:text-[4dvh] text font-montserrat font-700 xl:text-[6dvh] tracking-wide 
  text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]
  leading-none py-4
`;

interface TechIconProps extends TechProps {
  highlighted?: boolean;
  dimmed?: boolean;
}

const TechIcon = memo(({ icon, src, label, rounded = false, highlighted = false, dimmed = false }: TechIconProps) => {
  const iconClasses = `
    h-[5dvh] w-[5dvh] transition-all duration-300
    ${highlighted && rounded
      ? 'saturate-100 bg-white/90 p-3 rounded-full  scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'
      : highlighted ? 'saturate-100  scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'saturate-100 group-hover:saturate-100 group-hover:scale-110'}
      
    ${!highlighted && rounded ? 'bg-white/90 p-3 rounded-full ' : ''}
    ${!highlighted && !rounded ? 'group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}
    ${dimmed ? 'saturate-100 opacity-10 ' : 'opacity-100'}
  `;
  return (
    <div className="flex flex-col items-center gap-2 group transition-opacity duration-300">
      {src ? (
        <img src={src} alt={label} className={iconClasses} />
      ) : icon ? (
        <Icon icon={icon} className={iconClasses} />
      ) : null}

      <span className={`text-[#CBCBCB] text-sm transition-opacity duration-300 `}>
        {label}
      </span>
    </div>
  );
});
TechIcon.displayName = 'TechIcon';

const ProjectMockup = memo(({ card }: { card: ProjectsProps }) => {
  if (card.support === 'mobile') return (
    <div className='mb-10
    w-[50%] max-w-[220px] max-h-[550px]
    sm:w-[220px] sm:max-w-none
    md:ml-2  md:w-[240px]  md:max-w-none
     lg:ml-4 lg:w-[240px] lg:max-w-none
    xl:w-[280px] xl:mx-4 xl:max-w-none
    2xl:max-w-none  z-50
     
    '>
      <PhoneMockup3D images={card.image} />
    </div>
  );

  if (card.support === 'pc') return (
    <div className="w-[80%]  h-[280px] mb-14  z-50 max-w-[300px]  sm:w-[350px] sm:h-[300px] sm:max-w-none / md:w-[350px] md:h-[300px] md:max-w-none/ lg:h-[400px] lg:w-[450px] lg:max-w-none/ xl:h-[350px] xl:w-[380px] xl:max-w-none / 2xl:h-[350px] 2xl:w-[440px] 2xl:max-w-none
    md:mx-6 lg:mx-10 xl:mx-8  
     flex justify-start items-start ">
      <LenovoLaptop screenImage={[card.image[0]]} />
    </div>
  );

  if (card.support === 'booth') return (
    <div className="w-fit flex mb-10 z-50 lg:mb-20 lg:mx-10 justify-center items-center">
      <BoothMockup laptopImage={card.image} phoneImages={[card.image[1]]} />
    </div>
  );

  return null;
});
ProjectMockup.displayName = 'ProjectMockup';

/* ---------- ProjectCard (Memoizado) ---------- */
interface ProjectCardProps {
  card: ProjectsProps;
  titleClasses: string;
  onHoverChange: (card: ProjectsProps | null) => void;
  onSelect: (card: ProjectsProps) => void;
}

const ProjectCard = memo(({ card, titleClasses, onHoverChange }: ProjectCardProps) => {
  const isPhone = card.support === 'mobile'
  return (
    <BorderGlow
      edgeSensitivity={20}
      glowColor="100 120 100"
      borderRadius={28}
      glowRadius={0}
      glowIntensity={1}
      className="w-full min-h-[60dvh] z-20 xl:pr-2 xl:pl-4 py-10"
      style={{
        backgroundImage: `
        radial-gradient(circle at ${card.direction[0]} ${card.direction[1]}, ${card.colors[0]}, transparent 60%),
        radial-gradient(circle at ${card.direction[1]} ${card.direction[0]}, ${card.colors[2]}, ${card.colors[1]}, transparent 90% )
        `,
      }}
      coneSpread={25}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
    >
      <div
        onMouseEnter={() => onHoverChange(card)}
        onMouseLeave={() => onHoverChange(null)}
        className="block w-full px-6 xl:px-6 "
      >
        <div className={`float-right w-[100%] h-fit lg:w-fit xl:w-fit z-50
  flex justify-center items-center ${isPhone ? 'md:w-fit md:justify-end md:items-end' : 'justify-center items-center w-[100%]'} 
  lg:justify-end lg:items-end  xl:justify-end xl:items-end`}>
          <ProjectMockup card={card} />
        </div>

        <div className="z-30  relative block">
          <h1 className={titleClasses}>{card.title}</h1>

          <h2
            className="text-[#CBCBCB] whitespace-pre-line leading-relaxed text-xl font-sans font-normal mt-4
            xl:text-[1.1vw]"
            dangerouslySetInnerHTML={{ __html: card.content }}
          />
        </div>
      </div>
    </BorderGlow>
  );
});
ProjectCard.displayName = 'ProjectCard';


const ProjectSection = ({ projectSelected, setProjectSelected }: ContentProps) => {
  const [hoveredProject, setHoveredProject] = useState<ProjectsProps | null>(null);

  const { language } = useLanguage();

  const localizedCards = useMemo(() => getCardsData(language), [language]);

  const t = {
    es: {
      title: "Experiencia",
      banner: "Cada proyecto busca ir más allá de la interfaz y la estética. Priorizo seguridad, rendimiento y escalabilidad en cada entrega atendiendo cada detalle."
    },
    en: {
      title: "Experience",
      banner: "Every project seeks to go beyond UI and aesthetics. I prioritize security, performance, and scalability in every delivery, taking care of every detail."
    }
  }[language] || { title: "Experience", banner: "" };

  return (
    <div className="flex flex-col bg-[#0c0910]  justify-center items-center w-full h-full pt-20 pb-10 z-10  relative">
      <h1
        className="text-[#CBCBCB]  flex gap-6 flex-row text-3xl sm:text-5xl md:text-6xl lg:text-6xl 
                    font-bold text-center md:mb-12"
      >
        {t.title}
      </h1>
      <div className="flex flex-col-reverse xl:flex-row mt-20 w-full gap-20 px-14">

        <div className="flex w-[100%] md:w-[100%] xl:w-[70%] mt-20 xl:mt-0 flex-col 
         justify-center gap-20  flex-nowrap xl:flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {localizedCards.map((card) => (
            <ProjectCard
              key={card.id}
              card={card}
              titleClasses={TitleClasses}
              onHoverChange={setHoveredProject}
              onSelect={setProjectSelected}
            />
          ))}
        </div>

        <div className="xl:w-[30%] w-full grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-4  gap-7 justify-center items-center pt-10 xl:sticky xl:top-40 xl:h-fit">
          {techStack.map((i) => {
            const isHighlighted = hoveredProject?.tech.includes(i.label) ?? false;
            const isDimmed = !!hoveredProject && !isHighlighted;

            return (
              <TechIcon
                key={i.label}
                icon={i.icon}
                src={i.src ?? undefined}
                label={i.label}
                rounded={i.rounded ?? false}
                highlighted={isHighlighted}
                dimmed={isDimmed}
              />
            );
          })}
        </div>
      </div>

      <div className='w-[80%]  rounded-3xl flex justify-start p-10 mt-40 font-montserrat font-medium
       text-lg md:text-2xl group relative md:[75%] min-h-[10dvh]              
      bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl
            border border-white/40
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),_inset_0_1px_0_rgba(255,255,255,0.8)]
            hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7),_inset_0_1px_0_rgba(255,255,255,1)]
            hover:-translate-y-2 transition-all duration-500 ease-out
            will-change-transform'>
        {t.banner}
      </div>

      <SlideModal
        isOpen={!!projectSelected}
        project={projectSelected}
        onClose={() => setProjectSelected(null)}
      />
    </div>
  );
};

export default ProjectSection;
