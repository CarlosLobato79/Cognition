import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useNavigate } from 'react-router-dom'
import '../styles/main-menu.css'

const modules = [
  {
    id: '01',
    name: 'Immediate Serial Recall',
    image: '/assets/animals/perro.png',
    definition: 'Evalúa la capacidad de mantener una secuencia breve en la memoria de trabajo y reproducirla en el orden exacto.',
    benefits: 'Entrena retención visual, asociación imagen-nombre, orden serial y atención sostenida.',
    available: true,
  },
  {
    id: '02',
    name: 'Neural Grid',
    image: '/assets/animals/gato.png',
    definition: 'Ejercicio de actualización mental para recordar posiciones y detectar cambios dentro de una cuadrícula.',
    benefits: 'Entrena memoria espacial, velocidad de procesamiento y atención selectiva.',
    available: false,
  },
  {
    id: '03',
    name: 'Echo Span',
    image: '/assets/animals/leon.png',
    definition: 'Mide la capacidad de retener y reproducir información breve después de una exposición inmediata.',
    benefits: 'Entrena memoria de trabajo, control atencional y precisión de respuesta.',
    available: false,
  },
  {
    id: '04',
    name: 'Focus Vector',
    image: '/assets/animals/tigre.png',
    definition: 'Propone mantener el foco mientras estímulos relevantes y distractores aparecen en movimiento.',
    benefits: 'Entrena atención sostenida, inhibición de distractores y velocidad de reacción.',
    available: false,
  },
  {
    id: '05',
    name: 'Cortex Lock',
    image: '/assets/animals/elefante.png',
    definition: 'Desafío de consolidación y recuperación de patrones complejos bajo presión de tiempo.',
    benefits: 'Entrena flexibilidad cognitiva, planificación y recuperación de información.',
    available: false,
  },
]

export function MainMenu() {
  const navigate = useNavigate()
  const menuRef = useRef<HTMLElement>(null)
  const [selectedModule, setSelectedModule] = useState<(typeof modules)[number] | null>(null)

  useEffect(() => {
    const cards = menuRef.current?.querySelectorAll('.module-card')
    if (!cards?.length) return

    const entrance = animate(cards, {
      opacity: [0, 1],
      delay: (_el, index) => (index ?? 0) * 90,
      duration: 680,
      ease: 'outQuad',
    })

    return () => {
      entrance.pause()
    }
  }, [])

  useEffect(() => {
    if (!selectedModule) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedModule(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedModule])

  useEffect(() => {
    if (!selectedModule) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedModule])

  return (
    <main ref={menuRef} className="main-menu" aria-label="Módulos de Cognition">
      <div className="menu-grid" aria-hidden="true" />
      <header className="menu-header">
        <div className="menu-brand">
          <img src="/assets/cognition-brain-logo.png" alt="" />
          <span>COGNITIVE READINESS SYSTEM</span>
        </div>
        <h1>COGNITION</h1>
      </header>

      <section className="module-rail" aria-label="Módulos de entrenamiento">
        {modules.map((module) => (
          <button
            className="module-card"
            key={module.id}
            type="button"
            aria-label={`Módulo ${module.id}: ${module.name}`}
            onClick={() => setSelectedModule(module)}
          >
            <span className="module-card-number">{module.id}</span>
            <span className="module-card-content">
              <span className="module-card-status">{module.available ? 'READY' : 'PROXIMAMENTE'}</span>
              <span className="module-card-name">{module.name}</span>
            </span>
            <img className="module-card-image" src={module.image} alt="" />
          </button>
        ))}
      </section>

      {selectedModule && (
        <div className="module-modal-backdrop" role="presentation" onClick={() => setSelectedModule(null)}>
          <section
            className="module-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="module-modal-visual">
              <span>{selectedModule.id}</span>
              <img src={selectedModule.image} alt="" />
            </div>
            <div className="module-modal-copy">
              <div className="module-modal-topline">
                <span>{selectedModule.available ? 'TRAINING READY' : 'IN DEVELOPMENT'}</span>
                <button type="button" aria-label="Cerrar" onClick={() => setSelectedModule(null)}>×</button>
              </div>
              <h2 id="module-modal-title">{selectedModule.name}</h2>
              <span className="module-modal-kicker">DEFINICIÓN PSICOLÓGICA</span>
              <p>{selectedModule.definition}</p>
              <span className="module-modal-kicker">QUÉ ENTRENA</span>
              <p>{selectedModule.benefits}</p>
              <button
                className="module-modal-action"
                type="button"
                disabled={!selectedModule.available}
                onClick={() => {
                  if (selectedModule.available) navigate('/training/immediate-serial-recall')
                }}
              >
                {selectedModule.available ? 'ENTRENAR' : 'PRÓXIMAMENTE'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
