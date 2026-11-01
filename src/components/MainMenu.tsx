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
    name: 'Stroop Protocol',
    path: '/training/stroop-protocol',
    image: '/assets/brain-side-profile.png',
    definition: 'Mide la capacidad de ignorar una respuesta automática y seleccionar la información relevante del estímulo.',
    benefits: 'Entrena control inhibitorio, flexibilidad cognitiva, atención selectiva y velocidad de procesamiento.',
    available: true,
  },
  {
    id: '04',
    name: 'Spatial Grid',
    path: '/training/spatial-grid',
    image: '/assets/brain-side-profile.png',
    definition: 'Evalúa la capacidad de recordar posiciones visuales y reproducir una secuencia espacial en el orden correcto.',
    benefits: 'Entrena memoria visuoespacial, memoria de trabajo, atención sostenida y precisión secuencial.',
    available: true,
  },
  {
    id: '05',
    name: 'Dimensional Shift',
    path: '/training/dimensional-shift',
    image: '/assets/brain-side-profile.png',
    definition: 'Evalúa la capacidad de cambiar de una regla mental a otra y mantener la estrategia correcta ante estímulos variables.',
    benefits: 'Entrena flexibilidad cognitiva, cambio de criterio, atención y control ejecutivo.',
    available: true,
  },
  {
    id: '06',
    name: 'Pattern Comparison',
    path: '/training/pattern-comparison',
    image: '/assets/brain-side-profile.png',
    definition: 'Evalúa qué tan rápido puedes comparar dos patrones visuales y detectar si son iguales o diferentes.',
    benefits: 'Entrena velocidad de procesamiento, atención visual y precisión bajo presión de tiempo.',
    available: true,
  },
  {
    id: '07',
    name: 'List Sorting',
    path: '/training/list-sorting',
    image: '/assets/brain-side-profile.png',
    definition: 'Evalúa la capacidad de recordar varios elementos y reorganizarlos mentalmente siguiendo una regla.',
    benefits: 'Entrena memoria de trabajo, organización mental, atención y manipulación de información.',
    available: true,
  },
  {
    id: '08',
    name: 'Picture Sequence',
    path: '/training/picture-sequence',
    image: '/assets/brain-side-profile.png',
    definition: 'Evalúa la capacidad de recordar y reconstruir una secuencia visual de imágenes presentada recientemente.',
    benefits: 'Entrena memoria episódica, asociación visual, orden temporal y recuperación de información.',
    available: true,
  },
]

const serialRecallLevels = ['level-3', 'level-5', 'level-8', 'level-13', 'level-21', 'level-34', 'level-55', 'level-89']
const middleVectorLevels = ['vector-3', 'vector-5', 'vector-8', 'vector-13', 'vector-21']
const stroopProtocolLevels = ['stroop-3', 'stroop-5', 'stroop-8', 'stroop-13', 'stroop-21']
const spatialGridLevels = ['spatial-3', 'spatial-5', 'spatial-8', 'spatial-13', 'spatial-21']
const dimensionalShiftLevels = ['shift-3', 'shift-5', 'shift-8', 'shift-13', 'shift-21']
const patternComparisonLevels = ['pattern-3', 'pattern-5', 'pattern-8', 'pattern-13', 'pattern-21']
const listSortingLevels = ['sorting-3', 'sorting-5', 'sorting-8', 'sorting-13', 'sorting-21']
const pictureSequenceLevels = ['picture-3', 'picture-5', 'picture-8', 'picture-13', 'picture-21']
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
  const [stroopProtocolPercent, setStroopProtocolPercent] = useState(() => readGameProgress('cognition-stroop-protocol-progress', stroopProtocolLevels))
  const [spatialGridPercent, setSpatialGridPercent] = useState(() => readGameProgress('cognition-spatial-grid-progress', spatialGridLevels))
  const [dimensionalShiftPercent, setDimensionalShiftPercent] = useState(() => readGameProgress('cognition-dimensional-shift-progress', dimensionalShiftLevels))
  const [patternComparisonPercent, setPatternComparisonPercent] = useState(() => readGameProgress('cognition-pattern-comparison-progress', patternComparisonLevels))
  const [listSortingPercent, setListSortingPercent] = useState(() => readGameProgress('cognition-list-sorting-progress', listSortingLevels))
  const [pictureSequencePercent, setPictureSequencePercent] = useState(() => readGameProgress('cognition-picture-sequence-progress', pictureSequenceLevels))

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
      setStroopProtocolPercent(readGameProgress('cognition-stroop-protocol-progress', stroopProtocolLevels))
      setSpatialGridPercent(readGameProgress('cognition-spatial-grid-progress', spatialGridLevels))
      setDimensionalShiftPercent(readGameProgress('cognition-dimensional-shift-progress', dimensionalShiftLevels))
      setPatternComparisonPercent(readGameProgress('cognition-pattern-comparison-progress', patternComparisonLevels))
      setListSortingPercent(readGameProgress('cognition-list-sorting-progress', listSortingLevels))
      setPictureSequencePercent(readGameProgress('cognition-picture-sequence-progress', pictureSequenceLevels))
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
              <span className="module-card-progress">{module.id === '01' ? serialRecallPercent : module.id === '02' ? middleVectorPercent : module.id === '03' ? stroopProtocolPercent : module.id === '04' ? spatialGridPercent : module.id === '05' ? dimensionalShiftPercent : module.id === '06' ? patternComparisonPercent : module.id === '07' ? listSortingPercent : module.id === '08' ? pictureSequencePercent : 0}% COMPLETADO</span>
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
