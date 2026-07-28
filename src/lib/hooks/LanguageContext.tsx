import { createContext, useState, useEffect, useContext } from 'react';

export interface LanguageContextType {
    language: string;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    // Inicializamos en inglés por defecto (o español, tu decides)
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Al montar, revisamos si el usuario ya había elegido un idioma antes
        const savedLanguage = localStorage.getItem('portfolio_lang');

        if (savedLanguage) {
            setLanguage(savedLanguage);
        } else {
            // Si es su primera vez, detectamos el idioma de su navegador
            const browserLang = navigator.language
            const isSpanish = browserLang.toLowerCase().startsWith('es');
            setLanguage(isSpanish ? 'es' : 'en');
        }
    }, []);

    // Función para cambiar de idioma
    const toggleLanguage = () => {
        const newLanguage = language === 'es' ? 'en' : 'es';
        setLanguage(newLanguage);
        localStorage.setItem('portfolio_lang', newLanguage); // Guardamos la preferencia
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  
  // A partir de esta línea, TypeScript descarta el "undefined"
  return context; 
};

