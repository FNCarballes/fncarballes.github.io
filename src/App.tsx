import { useState } from 'react';
import Navbar from './components/ui/mainSections/NavBar';
import PresentationSection from './components/ui/mainSections/PresentationSection';
import './App.css';
import { useActiveSection } from './lib/hooks/useActiveSection';
import { AbouteMeSection } from './components/ui/mainSections/aboutMe';
import ReviewSection from './components/ui/mainSections/ReviewsSection';
import SkillsSection from './components/ui/mainSections/SkillsSection';
import ProjectSection from './components/ui/mainSections/ProjectSection';
import { LanguageProvider } from './lib/hooks/LanguageContext';
export interface ProjectsProps {
  id: string;
  title: string;
  direction: string[];
  colors: string[];
  image: string[];
  video?: string;
  content: string;
  support: "mobile" | "pc" | "booth";
  tech: string[];
  segments: { title: string; content: string, img?: string }[]
  link?: string
}

const SECTION_IDS = ['presentation', 'projects', 'about'];




export default function App() {
  const activeSection = useActiveSection(SECTION_IDS);
  const isScrolled = activeSection !== 'presentation';
  const [projectSelected, setProjectSelected] = useState<ProjectsProps | null>(null);

  return (
    <LanguageProvider>
    <div className="w-[100%] relative">
      <Navbar modalIsOpen={!!projectSelected} isScrolled={isScrolled} activeSection={activeSection} />
      <section
        id="presentation"
        className="sticky top-0 h-[100dvh] w-[100%] z-10 overflow-hidden flex flex-col justify-center"
      >
        <PresentationSection isActive={activeSection === 'presentation'} />
      </section>

      <section
        id="projects"
        className="relative min-h-screen  w-[100%] z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
      >
        <ProjectSection projectSelected={projectSelected} setProjectSelected={setProjectSelected} activeSection={activeSection} title="Projects" />
      </section>
      <div id="blur" className='relative h-[300px] w-full backdrop-blur-sm z-10'> </div>
      <section
        id="about"
        className="relative w-full z-30 "
      >
        <AbouteMeSection />
      </section>
      <section
        id="about"
        className="relative w-[100%] mt-[-1vw] backdrop-blur-sm bg-white/5 z-30"
      >
        <SkillsSection />
      </section>
      <section
        id="about"
        className="relative w-[100%] backdrop-blur-xl bg-[#c6c6c6] z-30"
      >
        <ReviewSection></ReviewSection>
      </section>
    </div>
    </LanguageProvider>
  );
}