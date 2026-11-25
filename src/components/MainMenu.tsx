import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../styles/main-menu.css'
import { assetUrl } from '../utils/assets'

const areas = {
  memory: 'Memoria',
  attention: 'Atención',
  executive: 'Función ejecutiva',
  speed: 'Velocidad',
  auditory: 'Memoria auditiva',
} as const

type Area = keyof typeof areas

function isArea(value: string | null): value is Area {
  return value !== null && Object.hasOwn(areas, value)
}

type TrainingModule = {
  slug: string
  name: string
  summary: string
  benefits: string
  areas: [Area, ...Area[]]
  storageKey: string
  levels: string[]
}

const modules: TrainingModule[] = [
  {
    slug: 'immediate-serial-recall',
    name: 'Memoria secuencial',
    summary: 'Recuerda las imágenes y repite la secuencia en el mismo orden.',
    benefits: 'Retención visual, asociación entre imagen y nombre, y atención sostenida.',
    areas: ['memory', 'attention'],
    storageKey: 'cognition-training-progress',
    levels: ['level-3', 'level-5', 'level-8', 'level-13', 'level-21', 'level-34', 'level-55', 'level-89'],
  },
  {
    slug: 'middle-vector',
    name: 'Atención central',
    summary: 'Identifica la dirección de la flecha central e ignora las de los lados.',
    benefits: 'Atención selectiva, control inhibitorio y velocidad de respuesta.',
    areas: ['attention', 'executive'],
    storageKey: 'cognition-middle-vector-progress',
    levels: ['vector-3', 'vector-5', 'vector-8', 'vector-13', 'vector-21'],
  },
  {
    slug: 'stroop-protocol',
    name: 'Control de colores',
    summary: 'Identifica el color de la tinta aunque la palabra diga otro color.',
    benefits: 'Control inhibitorio, flexibilidad cognitiva y velocidad de procesamiento.',
    areas: ['executive', 'attention', 'speed'],
    storageKey: 'cognition-stroop-protocol-progress',
    levels: ['stroop-3', 'stroop-5', 'stroop-8', 'stroop-13', 'stroop-21'],
  },
  {
    slug: 'spatial-grid',
    name: 'Memoria espacial',
    summary: 'Recuerda qué casillas se iluminan y selecciónalas en el mismo orden.',
    benefits: 'Memoria visuoespacial, atención sostenida y precisión al reproducir secuencias.',
    areas: ['memory', 'attention'],
    storageKey: 'cognition-spatial-grid-progress',
    levels: ['spatial-3', 'spatial-5', 'spatial-8', 'spatial-13', 'spatial-21'],
  },
  {
    slug: 'dimensional-shift',
    name: 'Cambio de regla',
    summary: 'Clasifica las figuras siguiendo la regla que se indica en cada turno.',
    benefits: 'Flexibilidad cognitiva, cambio de criterio y control ejecutivo.',
    areas: ['executive', 'attention'],
    storageKey: 'cognition-dimensional-shift-progress',
    levels: ['shift-3', 'shift-5', 'shift-8', 'shift-13', 'shift-21'],
  },
  {
    slug: 'pattern-comparison',
    name: 'Comparación visual',
    summary: 'Decide rápidamente si dos patrones son iguales o diferentes.',
    benefits: 'Velocidad de procesamiento, atención visual y precisión bajo presión de tiempo.',
    areas: ['speed', 'attention'],
    storageKey: 'cognition-pattern-comparison-progress',
    levels: ['pattern-3', 'pattern-5', 'pattern-8', 'pattern-13', 'pattern-21'],
  },
  {
    slug: 'list-sorting',
    name: 'Ordenamiento mental',
    summary: 'Recuerda los elementos de una lista y ordénalos según la regla del ejercicio.',
    benefits: 'Memoria de trabajo, organización mental y manipulación de información.',
    areas: ['memory', 'executive'],
    storageKey: 'cognition-list-sorting-progress',
    levels: ['sorting-3', 'sorting-5', 'sorting-8', 'sorting-13', 'sorting-21'],
  },
  {
    slug: 'symbol-digit',
    name: 'Símbolo y número',
    summary: 'Usa la clave en pantalla para asociar cada símbolo con su número.',
    benefits: 'Velocidad de procesamiento, atención y memoria asociativa.',
    areas: ['speed', 'memory'],
    storageKey: 'cognition-symbol-digit-progress',
    levels: ['symbol-3', 'symbol-5', 'symbol-8', 'symbol-13', 'symbol-21'],
  },
  {
    slug: 'auditory-recall',
    name: 'Recuerdo auditivo',
    summary: 'Escucha una lista de palabras y reconoce cuáles oíste.',
    benefits: 'Memoria auditiva, aprendizaje verbal y recuperación de información.',
    areas: ['auditory', 'memory', 'attention'],
    storageKey: 'cognition-auditory-recall-progress',
    levels: ['auditory-3', 'auditory-5', 'auditory-8', 'auditory-13', 'auditory-21'],
  },
  {
    slug: 'go-no-go',
    name: 'Inhibición',
    summary: 'Responde a la señal indicada y detente cuando aparezca la señal de bloqueo.',
    benefits: 'Control inhibitorio, atención sostenida y regulación de la respuesta.',
    areas: ['executive', 'attention'],
    storageKey: 'cognition-go-no-go-progress',
    levels: ['gng-3', 'gng-5', 'gng-8', 'gng-13', 'gng-21'],
  },
  {
    slug: 'n-back',
    name: 'Memoria N-Back',
    summary: 'Detecta si el estímulo actual coincide con el que viste varios turnos antes.',
    benefits: 'Memoria de trabajo, actualización mental y control de interferencias.',
    areas: ['memory', 'attention'],
    storageKey: 'cognition-nback-progress',
    levels: ['nback-3', 'nback-5', 'nback-8', 'nback-13', 'nback-21'],
  },
  {
    slug: 'visual-search',
    name: 'Búsqueda visual',
    summary: 'Encuentra el objetivo entre distractores o indica si no aparece.',
    benefits: 'Atención selectiva, exploración visual y velocidad de detección.',
    areas: ['attention', 'speed'],
    storageKey: 'cognition-visual-search-progress',
    levels: ['search-3', 'search-5', 'search-8', 'search-13', 'search-21'],
  },
]

const areaOptions = (Object.keys(areas) as Area[]).map((area) => ({
  area,
  name: areas[area],
  count: modules.filter((module) => module.areas.includes(area)).length,
}))
const perfectRunsRequired = 25

function exerciseCount(count: number) {
  return `${count} ${count === 1 ? 'ejercicio' : 'ejercicios'}`
}

function readGameProgress({ storageKey, levels }: TrainingModule) {
  try {
    const stored: Record<string, unknown> | null = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    const completedRuns = levels.reduce((total, level) => {
      const value = stored?.[level]
      const runs = typeof value === 'number' || typeof value === 'string' ? Number(value) : 0
      return total + (Number.isFinite(runs) ? Math.min(perfectRunsRequired, Math.max(0, Math.floor(runs))) : 0)
    }, 0)
    const requiredRuns = levels.length * perfectRunsRequired

    if (completedRuns === 0) return 0
    if (completedRuns === requiredRuns) return 100
    return Math.max(1, Math.min(99, Math.round((completedRuns / requiredRuns) * 100)))
  } catch {
    return 0
  }
}

function readProgress() {
  return Object.fromEntries(modules.map((module) => [module.slug, readGameProgress(module)]))
}

export function MainMenu() {
  const [searchParams] = useSearchParams()
  const requestedArea = searchParams.get('area')
  const activeArea = requestedArea === 'all' || isArea(requestedArea) ? requestedArea : null
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [progress, setProgress] = useState(readProgress)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const sectionHeading = useRef<HTMLHeadingElement>(null)
  const previousArea = useRef(activeArea)
  const visibleModules = isArea(activeArea)
    ? modules.filter((module) => module.areas.includes(activeArea))
    : modules
  const title = activeArea === null ? 'Entrenamiento cognitivo' : activeArea === 'all' ? 'Todos los ejercicios' : areas[activeArea]

  useEffect(() => {
    if (previousArea.current === activeArea) return

    previousArea.current = activeArea
    if (dialogRef.current?.open) {
      dialogRef.current.close()
      setSelectedModule(null)
    }
    window.scrollTo(0, 0)
    sectionHeading.current?.focus()
  }, [activeArea])

  useEffect(() => {
    const refreshProgress = () => setProgress(readProgress())
    window.addEventListener('storage', refreshProgress)
    window.addEventListener('focus', refreshProgress)

    return () => {
      window.removeEventListener('storage', refreshProgress)
      window.removeEventListener('focus', refreshProgress)
    }
  }, [])

  useEffect(() => {
    if (selectedModule) dialogRef.current?.showModal()
  }, [selectedModule])

  function closeDetails() {
    dialogRef.current?.close()
    setSelectedModule(null)
  }

  return (
    <main className="main-menu" aria-labelledby="menu-title">
      <header className="menu-header">
        {activeArea !== null && (
          <Link className="area-back" to="/"><span aria-hidden="true">←</span> Cambiar área</Link>
        )}
        <span className="menu-brand training-label">Cognition</span>
      </header>

      <div className="module-catalog">
        <div className="module-catalog-heading">
          <img className="menu-emblem training-emblem" src={assetUrl('assets/cognition-brain-logo.png')} alt="" width="44" height="44" />
          <p className="module-catalog-kicker training-label" id="module-catalog-context">
            {activeArea === null ? 'Elige un área' : exerciseCount(visibleModules.length)}
          </p>
          <h1 id="menu-title" ref={sectionHeading} tabIndex={-1} aria-describedby="module-catalog-context">{title}</h1>
        </div>

        {activeArea === null ? (
          <>
            <ul className="area-options" role="list">
              {areaOptions.map(({ area, name, count }) => (
                <li key={area}>
                  <Link
                    className="area-option training-panel"
                    to={`/?area=${area}`}
                    aria-labelledby={`area-${area}-name`}
                    aria-describedby={`area-${area}-count`}
                  >
                    <span>
                      <span className="catalog-item-title" id={`area-${area}-name`}>{name}</span>
                      <span className="catalog-item-meta" id={`area-${area}-count`}>{exerciseCount(count)}</span>
                    </span>
                    <span className="catalog-item-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="area-all">
              <Link className="training-action" to="/?area=all">Ver los {modules.length} ejercicios <span aria-hidden="true">→</span></Link>
            </div>
          </>
        ) : (
          <ul className="module-rail" role="list">
            {visibleModules.map((module) => {
              const percent = progress[module.slug]
              const area = activeArea === 'all' ? module.areas[0] : activeArea
              const status = percent === 0 ? 'Sin iniciar' : percent === 100 ? 'Completado' : `${percent}% completado`

              return (
                <li className="module-card" key={module.slug}>
                  <button
                    className="module-card-action training-panel"
                    type="button"
                    id={`${module.slug}-details`}
                    aria-labelledby={`${module.slug}-title`}
                    aria-describedby={`${module.slug}-meta`}
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      event.currentTarget.focus({ preventScroll: true })
                      setSelectedModule(module)
                    }}
                  >
                    <span>
                      <span className="catalog-item-title" id={`${module.slug}-title`}>{module.name}</span>
                      <span className="catalog-item-meta" id={`${module.slug}-meta`}>
                        {activeArea === 'all' ? `${areas[area]} · ` : ''}{status}
                      </span>
                    </span>
                    <span className="catalog-item-arrow" aria-hidden="true">→</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <dialog
        className="module-modal"
        ref={dialogRef}
        aria-labelledby="module-modal-title"
        onCancel={(event) => {
          event.preventDefault()
          closeDetails()
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return

          const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect()
          if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
            closeDetails()
          }
        }}
      >
        {selectedModule && (
          <div className="module-modal-copy">
            <div className="module-modal-header">
              <h2 id="module-modal-title">{selectedModule.name}</h2>
              <button type="button" aria-label="Cerrar ficha" onClick={closeDetails}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <p className="module-modal-summary">{selectedModule.summary}</p>
            <h3>Qué entrenas</h3>
            <p>{selectedModule.benefits}</p>
            <ul className="module-modal-areas" role="list" aria-label="Áreas cognitivas">
              {selectedModule.areas.map((area) => <li key={area}>{areas[area]}</li>)}
            </ul>
            <Link className="module-modal-action training-action" to={`/training/${selectedModule.slug}`} onClick={closeDetails}>
              Ir al entrenamiento <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </dialog>
    </main>
  )
}
