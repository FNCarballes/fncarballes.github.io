import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[]) {
  // Inicializamos con la primera sección por defecto
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    const handleScroll = () => {
      let currentActive = sectionIds[0];

      // Recorremos los IDs en orden (presentation -> projects -> about)
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          // Si la parte superior de la sección cruza el tercio superior de la pantalla,
          // consideramos que es la sección activa.
          // Al estar en un bucle, si 'about' también cumple, sobrescribe a 'projects'.
          if (rect.top <= window.innerHeight / 8) {
            currentActive = id;
          }
        }
      }

      setActiveSection(currentActive);
    };
    
    // Agregamos passive: true para que el scroll sea ultra suave y no se bloquee
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Ejecutamos una vez al montar para capturar la posición inicial
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds]);

  return activeSection;
}