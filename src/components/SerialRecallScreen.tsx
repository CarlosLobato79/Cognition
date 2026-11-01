import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useNavigate } from 'react-router-dom'
import '../styles/serial-recall.css'

const silhouettes = [
  { name: 'Perro', image: '/assets/animals/perro.png' },
  { name: 'Gato', image: '/assets/animals/gato.png' },
  { name: 'León', image: '/assets/animals/leon.png' },
  { name: 'Tigre', image: '/assets/animals/tigre.png' },
  { name: 'Elefante', image: '/assets/animals/elefante.png' },
]

const levels = [
  { id: 'recluta', name: 'RECLUTA', description: 'Inicio guiado · 3 siluetas', count: 3 },
  { id: 'operador', name: 'OPERADOR', description: 'Ritmo táctico · 5 siluetas', count: 5 },
  { id: 'elite', name: 'ÉLITE', description: 'Máxima exigencia · 5 siluetas', count: 5 },
] as const

type TrainingLevel = typeof levels[number]

type TrainingPhase = 'idle' | 'countdown' | 'memorize' | 'selection' | 'result'

type TrainingResult = {
  score: number
  correctAnswers: number
  total: number
  perfect: boolean
}

export function SerialRecallScreen() {
  const navigate = useNavigate()
  const [sequence, setSequence] = useState(() => silhouettes.slice(0, 3))
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [trainingPhase, setTrainingPhase] = useState<TrainingPhase>('idle')
  const [activeSequence, setActiveSequence] = useState<typeof silhouettes>([])
  const [selectionCards, setSelectionCards] = useState<typeof silhouettes>([])
  const [selectionOrder, setSelectionOrder] = useState<string[]>([])
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0])
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [memorizeIndex, setMemorizeIndex] = useState(0)
  const sequenceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const shuffled = [...silhouettes].sort(() => Math.random() - 0.5)
      setSequence(shuffled.slice(0, 3))
    }, 4200)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!sequenceRef.current) return

    const transition = animate(sequenceRef.current.querySelectorAll('.preview-silhouette'), {
      opacity: [0, 1],
      scale: [0.98, 1],
      delay: (_element, index) => (index ?? 0) * 220,
      duration: 1600,
      ease: 'inOutSine',
    })

    return () => {
      transition.pause()
    }
  }, [sequence])

  useEffect(() => {
    if (trainingPhase !== 'countdown') return

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setMemorizeIndex(0)
          setTrainingPhase('memorize')
          return 0
        }
        return current - 1
      })
    }, 900)

    return () => window.clearInterval(timer)
  }, [trainingPhase])

  useEffect(() => {
    if (trainingPhase !== 'memorize') return

    const timer = window.setTimeout(() => {
      if (memorizeIndex >= activeSequence.length - 1) {
        setSelectionCards([...activeSequence].sort(() => Math.random() - 0.5))
        setSelectionOrder([])
        setTrainingPhase('selection')
        return
      }
      setMemorizeIndex((current) => current + 1)
    }, 1600)

    return () => window.clearTimeout(timer)
  }, [activeSequence, memorizeIndex, trainingPhase])

  useEffect(() => {
    if (!isLevelModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLevelModalOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLevelModalOpen])

  useEffect(() => {
    const shouldLockScroll = isLevelModalOpen || trainingPhase !== 'idle'
    if (!shouldLockScroll) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLevelModalOpen, trainingPhase])

  const startTraining = (level: TrainingLevel) => {
    const nextSequence = [...silhouettes].sort(() => Math.random() - 0.5).slice(0, level.count)
    setActiveSequence(nextSequence)
    setActiveLevel(level)
    setCountdown(3)
    setSelectionOrder([])
    setTrainingResult(null)
    setTrainingPhase('countdown')
    setIsLevelModalOpen(false)
  }

  const handleCardSelection = (name: string) => {
    if (selectionOrder.includes(name)) return

    const nextOrder = [...selectionOrder, name]
    setSelectionOrder(nextOrder)

    if (nextOrder.length !== activeSequence.length) return

    const correctAnswers = nextOrder.reduce(
      (total, selectedName, index) => total + (selectedName === activeSequence[index].name ? 1 : 0),
      0,
    )
    const result = {
      score: Math.round((correctAnswers / activeSequence.length) * 100),
      correctAnswers,
      total: activeSequence.length,
      perfect: correctAnswers === activeSequence.length,
    }

    setTrainingResult(result)
    setTrainingPhase('result')

    try {
      const storedScores = JSON.parse(localStorage.getItem('cognition-serial-recall-scores') ?? '[]')
      const scores = Array.isArray(storedScores) ? storedScores : []
      scores.push({
        ...result,
        level: activeLevel.id,
        sequence: activeSequence.map((animal) => animal.name),
        answer: nextOrder,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem('cognition-serial-recall-scores', JSON.stringify(scores.slice(-20)))
    } catch {
      // localStorage may be unavailable in private browsing or restricted webviews.
    }
  }

  const startNewSession = () => startTraining(activeLevel)

  return (
    <main className="serial-recall-screen">
      <header className="training-header">
        <button className="back-button" type="button" onClick={() => navigate('/')}>
          ← MENU
        </button>
        <span className="training-code">COGNITION // TRAINING 01</span>
      </header>

      <section className="training-intro">
        <span className="training-kicker">WORKING MEMORY</span>
        <h1>IMMEDIATE SERIAL RECALL</h1>
        <p>Memorize the sequence. Reproduce it in the exact order.</p>
        <button className="start-training-button" type="button" onClick={() => setIsLevelModalOpen(true)}>
          ENTRENAR
        </button>
      </section>

      <section ref={sequenceRef} className="preview-sequence" aria-label="Vista previa de la secuencia">
        {sequence.map((silhouette, index) => (
          <div className="preview-silhouette" key={`${silhouette.name}-${index}`}>
            <img src={silhouette.image} alt="" />
          </div>
        ))}
      </section>

      <section className="training-info" aria-label="Información psicológica del ejercicio">
        <div className="training-definition">
          <span className="training-info-kicker">DEFINICIÓN PSICOLÓGICA</span>
          <p>
            El recuerdo serial inmediato evalúa la capacidad de mantener una secuencia breve en la memoria de trabajo y reproducirla en el orden exacto en que fue presentada.
          </p>
        </div>
        <div className="training-features">
          <span className="training-info-kicker">ENTRENA</span>
          <ul>
            <li>Retención visual temporal</li>
            <li>Asociación imagen-nombre</li>
            <li>Recuerdo del orden serial</li>
            <li>Atención sostenida</li>
          </ul>
        </div>
      </section>

      {isLevelModalOpen && (
        <div className="level-modal-backdrop" role="presentation" onClick={() => setIsLevelModalOpen(false)}>
          <section
            className="level-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="level-modal-header">
              <div>
                <span className="training-info-kicker">TRAINING PROTOCOL</span>
                <h2 id="level-modal-title">SELECCIONA TU NIVEL</h2>
              </div>
              <button className="modal-close-button" type="button" aria-label="Cerrar" onClick={() => setIsLevelModalOpen(false)}>
                ×
              </button>
            </div>

            <p className="level-modal-description">Configura la intensidad de tu primera sesión.</p>

            <div className="level-options">
              {levels.map((level, index) => (
                <button className="level-option" type="button" key={level.id} onClick={() => startTraining(level)}>
                  <span className="level-index">0{index + 1}</span>
                  <span className="level-copy">
                    <strong>{level.name}</strong>
                    <small>{level.description}</small>
                  </span>
                </button>
              ))}
            </div>

            <p className="level-modal-note">Más protocolos se desbloquearán con tu progreso.</p>
          </section>
        </div>
      )}

      {trainingPhase !== 'idle' && (
        <section className="training-session" aria-label="Sesión de entrenamiento">
          {trainingPhase === 'countdown' && (
            <div className="countdown-display" key={countdown} aria-live="assertive">
              {countdown}
            </div>
          )}

          {trainingPhase === 'memorize' && activeSequence[memorizeIndex] && (
            <div className="memorize-display" key={activeSequence[memorizeIndex].name}>
              <img src={activeSequence[memorizeIndex].image} alt="" />
              <span>{activeSequence[memorizeIndex].name.toUpperCase()}</span>
            </div>
          )}

          {trainingPhase === 'selection' && (
            <div className="selection-display">
              <div className="selection-heading">
                <span>RECONSTRUYE LA SECUENCIA</span>
                <small>{selectionOrder.length} / {activeSequence.length}</small>
              </div>
              <div className="selection-cards">
                {selectionCards.map((animal) => {
                  const order = selectionOrder.indexOf(animal.name) + 1
                  return (
                    <button
                      className={`selection-card${order > 0 ? ' is-selected' : ''}`}
                      type="button"
                      key={animal.name}
                      aria-label={`Elegir ${animal.name}`}
                      onClick={() => handleCardSelection(animal.name)}
                    >
                      {order > 0 && <span className="selection-order">{order}</span>}
                      <img src={animal.image} alt="" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {trainingPhase === 'result' && trainingResult && (
            <div className="result-display" role="status">
              <span className="result-kicker">SESSION COMPLETE</span>
              <h2>{trainingResult.perfect ? 'SECUENCIA CORRECTA' : 'SECUENCIA INCORRECTA'}</h2>
              <div className="result-score">{trainingResult.score}<small>%</small></div>
              <p>{trainingResult.correctAnswers} de {trainingResult.total} posiciones correctas</p>
              <span className="result-saved">PUNTAJE GUARDADO LOCALMENTE</span>
              <div className="result-actions">
                <button className="result-button result-button-primary" type="button" onClick={startNewSession}>
                  NUEVA SESIÓN
                </button>
                <button className="result-button" type="button" onClick={() => setTrainingPhase('idle')}>
                  VOLVER
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
