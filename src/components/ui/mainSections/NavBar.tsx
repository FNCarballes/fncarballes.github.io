import { useState, useEffect } from 'react';
import MusicPlayer from '../../modularized/MusicPlayer';
import { Icon } from '@iconify/react';
// import { Colors } from '@/lib/Colors'; // Descomenta si lo necesitas
import { useLanguage } from '@/lib/hooks/LanguageContext';

interface Props {
  isScrolled: boolean;
  activeSection: string;
  modalIsOpen: boolean;
}

const ContactButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const { language } = useLanguage(); // Traemos el idioma para el tooltip
  const iconClasses = `w-[100%] h-[100%]`;

  const handleCopyEmail = async () => {
    const email = "franco.ncarballes@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error al copiar: ", error);
    }
  };

  return (
    <>
      <a
        className='h-[100px] w-[100px] cursor-pointer'
        onClick={handleCopyEmail}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Icon icon="heroicons:envelope" className={iconClasses} />
      </a>
      <div
        className={`
          absolute -bottom-10 left-1/2 -translate-x-1/2 
          px-3 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-md shadow-lg
          whitespace-nowrap pointer-events-none
          transition-all duration-300 ease-out
          ${isCopied ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
        `}
      >
        {language === 'es' ? '✅ Dirección copiada' : '✅ Address copied'}
        <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-800 -rotate-45"></div>
      </div>
    </>
  );
};

export default function Navbar({ isScrolled, activeSection, modalIsOpen }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Extraemos el estado y función para cambiar idioma
  const { language, toggleLanguage } = useLanguage();

  // Diccionario de textos según el idioma
  const navTexts = {
    es: {
      home: 'Inicio',
      projects: 'Proyectos',
      about: 'Sobre mí'
    },
    en: {
      home: 'Home',
      projects: 'Projects',
      about: 'About me'
    }
  };
  const t = language === 'es' ? navTexts.es : navTexts.en;

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const getNavLinkClasses = (sectionId: string) => {
    const isActive = activeSection === sectionId;
    const isProjectActive = activeSection === "projects";
    return `
      relative font-sans text-3xl tracking-widest cursor-pointer 
      transition-all duration-300 ease-out
      hover:scale-110 ${isProjectActive ? 'hover:text-brand-orange' : "hover:text-brand-wine"}
      after:content-[''] after:absolute after:-bottom-1 after:left-0 
      after:w-full after:h-[2px] ${isProjectActive ? 'after:bg-brand-orange' : 'after:bg-brand-wine'}
      after:origin-center after:transition-transform after:duration-300 after:ease-out
      hover:after:scale-x-100 
      ${isActive && isProjectActive ? 'scale-110 text-[#FF8400] after:scale-x-100' : isActive
        ? 'scale-110 text-[#79043e] after:scale-x-100'
        : `scale-100 after:scale-x-0 ${isScrolled ? 'text-[#FFFFFF]' : 'text-[#000000]'}`
      } 
    `;
  };

  const getMobileNavLinkClasses = (sectionId: string) => {
    const isActive = activeSection === sectionId;
    const isDarkBg = activeSection === "projects" || activeSection === "about";
    return `
      relative font-sans text-3xl tracking-widest cursor-pointer font-bold
      transition-all duration-300 ease-out
      hover:scale-110 hover:text-[#79043e]
      after:content-[''] after:absolute after:-bottom-1 after:left-0 
      after:w-full after:h-[2px]  
      after:origin-center after:transition-transform after:duration-300 after:ease-out
      hover:after:scale-x-100 
    ${isActive && isDarkBg ? 'scale-110 text-brand-orange after:bg-brand-orange after:scale-x-100' : isActive
        ? 'scale-110 text-brand-wine after:bg-brand-wine after:scale-x-100'
        : `scale-100 after:scale-x-0 ${isScrolled ? 'text-[#FFFFFF]' : 'text-[#000000]'}`
      } 
    `;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (targetId === 'presentation') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const iconColor = isScrolled ? '#CBCBCB' : '#000000';
  const iconClasses = `w-[100%] h-[100%]`;

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 w-full h-[100px] sm:h-[90px] px-4 py-4 md:px-10 
          flex items-center justify-between z-50 gap-2 sm:gap-10
          transition-colors duration-300 ease-in-out 
          backdrop-blur-xl ${isScrolled ? 'bg-black/20' : 'bg-transparent'}
          ${modalIsOpen ? '-translate-y-full' : 'translate-y-0'}
        `}
      >
        <div className='w-[33%] py-4 sm:w-[50%]'>
          <MusicPlayer scrolled={isScrolled} />
        </div>

        <div className='w-[66%] sm:w-[50%] gap-2 sm:gap-10 md:gap-10 h-full flex justify-end items-center'>
          <ul className={` min-w-[100px] w-auto h-[100%] flex flex-row items-center gap-2 sm:gap-4 `}>
            {/* SWITCH DE IDIOMAS */}
            <li className="flex items-center mx-4 w-[1.6wv] justify-center pl-2 sm:pl-4 border-l border-neutral-400/40">
              <button
                onClick={toggleLanguage}
                className={`flex items-center  gap-1 text-sm sm:text-base font-bold font-sans tracking-widest transition-all duration-300 hover:scale-110 ${isScrolled ? 'text-[#FFFFFF]' : 'text-[#000000]'}`}
                onTouchStart={(e) => e.stopPropagation()}
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              >
                <span className={`${language === 'es' ? '' : 'opacity-40'}`}>ES</span>
                <span className="opacity-40">|</span>
                <span className={`${language === 'en' ? '' : 'opacity-40'}`}>EN</span>
              </button>
            </li>
            <li className={`${getNavLinkClasses('')}   w-[1.6vw]`}>
              <ContactButton />
            </li>
            <li className={`${getNavLinkClasses('')} w-[1.6vw]`}>
              <a
                href="https://github.com/FNCarballes"
                target="_blank"
                rel="noreferrer"
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Icon icon="mdi:github" className={`${iconClasses}   hover:text-brand-wine ${isScrolled ? 'text-white ' : 'text-black'}`} />
              </a>
            </li>
            <li className={`${getNavLinkClasses('')} w-[1.6vw]`}>
              <a
                href="https://www.linkedin.com/in/franco-carballes-752625345"
                target="_blank"
                rel="noreferrer"
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Icon icon="pepicons-pencil:cv" className={iconClasses} />
              </a>
            </li>
          </ul>

          <ul className="hidden xl:flex flex-row text-[#000000ce] w-auto justify-end items-center gap-6">
            <li className={getNavLinkClasses('presentation')}>
              <a
                onClick={(e) => handleNavClick(e, 'presentation')}
                href="#presentation"
                onTouchStart={(e) => e.stopPropagation()}
              >
                {t.home}
              </a>
            </li>

            <li className={getNavLinkClasses('projects')}>
              <a
                onClick={(e) => handleNavClick(e, 'projects')}
                href="#projects"
                onTouchStart={(e) => e.stopPropagation()}
              >
                {t.projects}
              </a>
            </li>

            <li className={getNavLinkClasses('about')}>
              <a
                onClick={(e) => handleNavClick(e, 'about')}
                href="#about"
                onTouchStart={(e) => e.stopPropagation()}
              >
                {t.about}
              </a>
            </li>
          </ul>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative xl:hidden flex flex-col w-100px justify-center items-center gap-1.5 z-50 p-2 cursor-pointer pointer-events-auto transition-transform duration-300 hover:scale-110"
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Open menu"
          >
            <span className="block w-8 h-[3px] rounded-full transition-colors duration-300" style={{ backgroundColor: iconColor }} />
            <span className="block w-8 h-[3px] rounded-full transition-colors duration-300" style={{ backgroundColor: iconColor }} />
            <span className="block w-8 h-[3px] rounded-full transition-colors duration-300" style={{ backgroundColor: iconColor }} />
          </button>
        </div>
      </nav>

      <aside
        className={`
          xl:hidden fixed top-0 right-0 h-[100dvh] w-[75%] sm:w-[60%] md:w-[45%] z-40
          backdrop-blur-xl flex 
          ${isScrolled ? 'bg-[#1f2121e6]' : 'bg-white/70'}
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0 ' : 'translate-x-full pointer-events-none'}
        `}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-8 right-8 w-10 h-10 flex items-center z-40 justify-center cursor-pointer transition-transform duration-300 hover:scale-110 hover:rotate-90"
          aria-label="Close menu"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <span className="absolute block w-8 h-[3px] rounded-full rotate-45" style={{ backgroundColor: iconColor }} />
          <span className="absolute block w-8 h-[3px] rounded-full -rotate-45" style={{ backgroundColor: iconColor }} />
        </button>

        <ul className="flex flex-col items-center justify-center h-full gap-10 px-8">
          <li className={getMobileNavLinkClasses('presentation')}>
            <a
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => handleNavClick(e, 'presentation')}
              href="#presentation"
            >
              {t.home}
            </a>
          </li>

          <li className={getMobileNavLinkClasses('projects')}>
            <a
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => handleNavClick(e, 'projects')}
              href="#projects"
            >
              {t.projects}
            </a>
          </li>

          <li className={getMobileNavLinkClasses('about')}>
            <a
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => handleNavClick(e, 'about')}
              href="#about"
            >
              {t.about}
            </a>
          </li>
        </ul>
      </aside>
    </>
  );
}