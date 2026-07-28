import { motion } from 'framer-motion'
import { useMemo } from 'react';
import { useLanguage } from '@/lib/hooks/LanguageContext';

// Función para obtener las habilidades según el idioma
const getSoftSkills = (lang: string) => {
  const isEs = lang === 'es';
  return [
    { 
      name: isEs ? 'Autonomía' : 'Autonomy', 
      description: isEs ? 'Investigo y decido sin depender' : 'I research and make decisions independently' 
    },
    { 
      name: isEs ? 'Pensamiento reflexivo' : 'Reflective thinking', 
      description: isEs ? 'Me gusta tomarme tiempo para analizar' : 'I like to take my time to analyze' 
    },
    { 
      name: isEs ? 'Resolución' : 'Problem-solving', 
      description: isEs ? 'Descompongo problemas en partes para encontrar fuentes' : 'I break down problems to find the root cause' 
    },
    { 
      name: isEs ? 'Paciencia' : 'Patience', 
      description: isEs ? 'El bug siempre cae' : 'The bug always gets caught' 
    },
    { 
      name: isEs ? 'Adaptabilidad' : 'Adaptability', 
      description: isEs ? 'Si tengo que implementar una tecnología nueva, la investigo a fondo y analizo las mejores decisiones de arquitectura e implementación' : 'If I need to implement a new technology, I research it thoroughly and analyze the best architecture and implementation decisions' 
    },
    { 
      name: isEs ? 'Comunicación' : 'Communication', 
      description: isEs ? 'Explico lo técnico en palabras simples' : 'I explain technical concepts in simple words' 
    },
    { 
      name: isEs ? 'Colaboración' : 'Collaboration', 
      description: isEs ? 'Valoro la opinión ajena y siempre estoy dispuesto a ayudar mas allá de mis responsabilidades' : 'I value others\' opinions and am always willing to help beyond my responsibilities' 
    },
    { 
      name: isEs ? 'Empatía' : 'Empathy', 
      description: isEs ? 'Siempre intento comprender desde el lugar del otro' : 'I always try to understand things from the other person\'s perspective' 
    },
    { 
      name: isEs ? 'Curiosidad' : 'Curiosity', 
      description: isEs ? 'Aprendo constantemente' : 'I am constantly learning' 
    },
  ];
};

export default function SkillsSection() {
  const { language } = useLanguage();
  
  // Memoizamos el arreglo para no recrearlo en cada render
  const softSkills = useMemo(() => getSoftSkills(language), [language]);
  
  // Título localizado
  const title = language === 'es' ? 'Habilidades blandas' : 'Soft Skills';

  return (
    <div className="w-full relative">
      <div className="w-full py-4 px-20 mx-auto bg-[#C6C6C6]">
        <span className="text-[#031135] pl-4 flex gap-6 flex-row text-3xl sm:text-5xl md:text-6xl pt-10 lg:text-5xl 
                    font-bold text-left mb-8 md:mb-12 ">
          {title}
        </span>

        {/* CAMBIO 1: gap-0 en móvil para que las dos mitades se peguen, gap-20 en md para separarlas */}
        <div className="grid grid-cols-1 pt-20 md:grid-cols-2 gap-0 md:gap-20 ">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "backIn" }} 
            className='flex flex-col'
          >
            {/* CAMBIO 2: pb-10 en móvil. Esto extiende la línea vertical de la primera mitad para que alcance a tocar la segunda mitad */}
            <div className="flex flex-col gap-10 border-l-2 z-50 border-[#f5a0cb] pl-8 pb-10 md:pb-0">

              {softSkills.slice(0, Math.ceil(softSkills.length / 2)).map((skill, i) => (
                <motion.div
                  key={`left-${i}`}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "backIn" }}
                  className="relative"
                >
                  <div className="absolute -left-[42px] w-4 h-4 mt-2 rounded-full backdrop-blur-xl bg-[#79043e] border-2 border-[#f5a0cb]" />
                  <motion.h3 className="text-[#120F17] font-montserrat text-3xl font-bold">{skill.name}</motion.h3>
                  <p className="text-[#120F17] font-montserrat text-2xl mt-1">{skill.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "backIn" }} 
            // CAMBIO 3: mt-[10px] pasa a ser md:mt-[10px] para que en móvil no genere un hueco en la línea
            className='flex md:mt-[10px] flex-col'
          >
            {/* CAMBIO 4: gap-8 pasa a gap-10 para que la distancia de los ítems sea exactamente igual a la de la primera mitad */}
            <div className="flex flex-col gap-10 border-l-2 z-50 border-[#f5a0cb] pl-8">
              {softSkills.slice(Math.ceil(softSkills.length / 2)).map((skill, i) => (
                <motion.div
                  key={`right-${i}`}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "backIn" }}
                  className="relative"
                >
                  <div className="absolute -left-[42px] w-4 h-4 mt-2 rounded-full backdrop-blur-xl bg-[#79043e] border-2 border-[#f5a0cb]" />
                  {/* Nota: Agregué font-montserrat aquí que faltaba respecto a la primera mitad */}
                  <motion.h3 className="text-[#120F17] font-montserrat text-3xl font-bold">{skill.name}</motion.h3>
                  <p className="text-[#120F17] font-montserrat text-2xl mt-1">{skill.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}