import { useState } from 'react'
import './App.css'

// En Vite, es una excelente práctica importar las imágenes así 
// para que el empaquetador las procese correctamente:
import portfolioDesktop from './assets/PortfolioDesktop.png'
import portfolioMobile from './assets/PortfolioMobile.png' // Asumí que faltaba el .png

function App() {

  return (
    // Reemplacé los fragmentos <> por un contenedor principal
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      
      {/* IMAGEN DE ESCRITORIO */}
      {/* hidden = oculta por defecto. md:block = se muestra en pantallas medianas en adelante */}
      <img 
        src={portfolioDesktop} 
        alt="Diseño de portafolio para escritorio"
        className="w-full max-w-5xl" 
      />

      {/* IMAGEN DE MÓVIL */}
      {/* block = visible por defecto. md:hidden = se oculta en pantallas medianas en adelante */}
      <img 
        src={portfolioMobile} 
        alt="Diseño de portafolio para móvil"
        className="w-full max-w-sm" 
      />

    </div>
  )
}

export default App