import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useNavigate } from 'react-router-dom'
import '../styles/main-menu.css'

const modules = [
  {
    id: '01',
    name: 'Immediate Serial Recall',
    path: '/training/immediate-serial-recall',
    image: '/assets/brain-side-profile.png',
    definition: 'Evalúa la capacidad de mantener una secuencia breve en la memoria de trabajo y reproducirla en el orden exacto.',
    benefits: 'Entrena retención visual, asociación imagen-nombre, orden serial y atención sostenida.',
    available: true,
  },
  {
    id: '02',
    name: 'Middle Vector',
    path: '/training/middle-vector',
    image: '/assets/brain-side-profile.png',
    definition: 'Mide la capacidad de enfocar un estímulo central e inhibir la información distractora que aparece a sus lados.',
    benefits: 'Entrena atención selectiva, control inhibitorio, velocidad de respuesta y resistencia a distractores.',
    available: true,
  },
  {
    id: '03',
    name: 'Echo Span',
    path: '#',
    image: '/assets/animals/leon.svg',
    definition: 'Mide la capacidad de retener y reproducir información breve después de una exposición inmediata.',
    benefits: 'Entrena memoria de trabajo, control atencional y precisión de respuesta.',
    available: false,
  },
  {
    id: '04',
    name: 'Focus Vector',
    path: '#',
    image: '/assets/animals/tigre.svg',
    definition: 'Propone mantener el foco mientras estímulos relevantes y distractores aparecen en movimiento.',
    benefits: 'Entrena atención sostenida, inhibición de distractores y velocidad de reacción.',
    available: false,
  },
  {
    id: '05',
    name: 'Cortex Lock',
    path: '#',
    image: '/assets/animals/elefante.svg',
    definition: 'Desafío de consolidación y recuperación de patrones complejos bajo presión de tiempo.',
    benefits: 'Entrena flexibilidad cognitiva, planificación y recuperación de información.',
    available: false,
  },
]

const serialRecallLevels = ['level-3', 'level-5', 'level-8', 'level-13', 'level-21', 'level-34', 'level-55', 'level-89']
const middleVectorLevels = ['vector-3', 'vector-5', 'vector-8', 'vector-13', 'vector-21']
const PERFECT_RUNS_REQUIRED = 25

function readGameProgress(storageKey: string, levelIds: string[]) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    const completedRuns = levelIds.reduce((sum, levelId) => sum + Math.min(Number(stored[levelId]) || 0, PERFECT_RUNS_REQUIRED), 0)
    return Math.round((completedRuns / (levelIds.length * PERFECT_RUNS_REQUIRED)) * 100)
  } catch {
    return 0
  }
}

export function MainMenu() {
  const navigate = useNavigate()
  const menuRef = useRef<HTMLElement>(null)
  const [selectedModule, setSelectedModule] = useState<(typeof modules)[number] | null>(null)
  const [serialRecallPercent, setSerialRecallPercent] = useState(() => readGameProgress('cognition-training-progress', serialRecallLevels))
  const [middleVectorPercent, setMiddleVectorPercent] = useState(() => readGameProgress('cognition-middle-vector-progress', middleVectorLevels))

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
    const refreshProgress = () => {
      setSerialRecallPercent(readGameProgress('cognition-training-progress', serialRecallLevels))
      setMiddleVectorPercent(readGameProgress('cognition-middle-vector-progress', middleVectorLevels))
    }
    window.addEventListener('storage', refreshProgress)
    window.addEventListener('focus', refreshProgress)
    return () => {
      window.removeEventListener('storage', refreshProgress)
      window.removeEventListener('focus', refreshProgress)
    }
  }, [])

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
              <span className="module-card-progress">{module.id === '01' ? serialRecallPercent : module.id === '02' ? middleVectorPercent : 0}% COMPLETADO</span>
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
              <img className="module-modal-logo" src="/assets/cognition-brain-logo.png" alt="Cognition" />
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
                  if (selectedModule.available) navigate(selectedModule.path)
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
