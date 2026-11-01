import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useNavigate } from 'react-router-dom'
import '../styles/serial-recall.css'

const silhouettes = [
  { name: 'Abeja', image: '/assets/animals/abeja.png' },
  { name: 'Aguila', image: '/assets/animals/aguila.png' },
  { name: 'Alce', image: '/assets/animals/alce.png' },
  { name: 'Anguila', image: '/assets/animals/anguila.png' },
  { name: 'Antilope', image: '/assets/animals/antilope.png' },
  { name: 'Arana', image: '/assets/animals/arana.png' },
  { name: 'Ardilla', image: '/assets/animals/ardilla.png' },
  { name: 'Armadillo', image: '/assets/animals/armadillo.png' },
  { name: 'Avestruz', image: '/assets/animals/avestruz.png' },
  { name: 'Ballena', image: '/assets/animals/ballena.png' },
  { name: 'Bisonte', image: '/assets/animals/bisonte.png' },
  { name: 'Bufalo', image: '/assets/animals/bufalo.png' },
  { name: 'Buho', image: '/assets/animals/buho.png' },
  { name: 'Burro', image: '/assets/animals/burro.png' },
  { name: 'Caballito De Mar', image: '/assets/animals/caballito-de-mar.png' },
  { name: 'Caballo', image: '/assets/animals/caballo.png' },
  { name: 'Cabra', image: '/assets/animals/cabra.png' },
  { name: 'Camaleon', image: '/assets/animals/camaleon.png' },
  { name: 'Camaron', image: '/assets/animals/camaron.png' },
  { name: 'Camello', image: '/assets/animals/camello.png' },
  { name: 'Cangrejo', image: '/assets/animals/cangrejo.png' },
  { name: 'Canguro', image: '/assets/animals/canguro.png' },
  { name: 'Caracol', image: '/assets/animals/caracol.png' },
  { name: 'Caracol De Mar', image: '/assets/animals/caracol-de-mar.png' },
  { name: 'Castor', image: '/assets/animals/castor.png' },
  { name: 'Cebra', image: '/assets/animals/cebra.png' },
  { name: 'Cerdo', image: '/assets/animals/cerdo.png' },
  { name: 'Chimpance', image: '/assets/animals/chimpance.png' },
  { name: 'Ciervo', image: '/assets/animals/ciervo.png' },
  { name: 'Cisne', image: '/assets/animals/cisne.png' },
  { name: 'Cocodrilo', image: '/assets/animals/cocodrilo.png' },
  { name: 'Comadreja', image: '/assets/animals/comadreja.png' },
  { name: 'Conejo', image: '/assets/animals/conejo.png' },
  { name: 'Cuervo', image: '/assets/animals/cuervo.png' },
  { name: 'Delfin', image: '/assets/animals/delfin.png' },
  { name: 'Elefante', image: '/assets/animals/elefante.png' },
  { name: 'Erizo', image: '/assets/animals/erizo.png' },
  { name: 'Escorpion', image: '/assets/animals/escorpion.png' },
  { name: 'Estrella De Mar', image: '/assets/animals/estrella-de-mar.png' },
  { name: 'Flamenco', image: '/assets/animals/flamenco.png' },
  { name: 'Foca', image: '/assets/animals/foca.png' },
  { name: 'Gacela', image: '/assets/animals/gacela.png' },
  { name: 'Gallina', image: '/assets/animals/gallina.png' },
  { name: 'Gallo', image: '/assets/animals/gallo.png' },
  { name: 'Gato', image: '/assets/animals/gato.png' },
  { name: 'Gorila', image: '/assets/animals/gorila.png' },
  { name: 'Guepardo', image: '/assets/animals/guepardo.png' },
  { name: 'Gusano De Seda', image: '/assets/animals/gusano-de-seda.png' },
  { name: 'Hiena', image: '/assets/animals/hiena.png' },
  { name: 'Hipopotamo', image: '/assets/animals/hipopotamo.png' },
  { name: 'Iguana', image: '/assets/animals/iguana.png' },
  { name: 'Jabali', image: '/assets/animals/jabali.png' },
  { name: 'Jaguar', image: '/assets/animals/jaguar.png' },
  { name: 'Jirafa', image: '/assets/animals/jirafa.png' },
  { name: 'Koala', image: '/assets/animals/koala.png' },
  { name: 'Lagarto', image: '/assets/animals/lagarto.png' },
  { name: 'Langosta', image: '/assets/animals/langosta.png' },
  { name: 'Leon', image: '/assets/animals/leon.png' },
  { name: 'Leopardo', image: '/assets/animals/leopardo.png' },
  { name: 'Libelula', image: '/assets/animals/libelula.png' },
  { name: 'Llama', image: '/assets/animals/llama.png' },
  { name: 'Lobo', image: '/assets/animals/lobo.png' },
  { name: 'Loro', image: '/assets/animals/loro.png' },
  { name: 'Manati', image: '/assets/animals/manati.png' },
  { name: 'Mantis', image: '/assets/animals/mantis.png' },
  { name: 'Mapache', image: '/assets/animals/mapache.png' },
  { name: 'Mariposa', image: '/assets/animals/mariposa.png' },
  { name: 'Mariquita', image: '/assets/animals/mariquita.png' },
  { name: 'Medusa', image: '/assets/animals/medusa.png' },
  { name: 'Mono', image: '/assets/animals/mono.png' },
  { name: 'Morsa', image: '/assets/animals/morsa.png' },
  { name: 'Murcielago', image: '/assets/animals/murcielago.png' },
  { name: 'Nutria', image: '/assets/animals/nutria.png' },
  { name: 'Orangutan', image: '/assets/animals/orangutan.png' },
  { name: 'Oso', image: '/assets/animals/oso.png' },
  { name: 'Oveja', image: '/assets/animals/oveja.png' },
  { name: 'Panda', image: '/assets/animals/panda.png' },
  { name: 'Pantera', image: '/assets/animals/pantera.png' },
  { name: 'Pato', image: '/assets/animals/pato.png' },
  { name: 'Pavo', image: '/assets/animals/pavo.png' },
  { name: 'Perezoso', image: '/assets/animals/perezoso.png' },
  { name: 'Perro', image: '/assets/animals/perro.png' },
  { name: 'Pinguino', image: '/assets/animals/pinguino.png' },
  { name: 'Pulpo', image: '/assets/animals/pulpo.png' },
  { name: 'Puma', image: '/assets/animals/puma.png' },
  { name: 'Rana', image: '/assets/animals/rana.png' },
  { name: 'Raya', image: '/assets/animals/raya.png' },
  { name: 'Rinoceronte', image: '/assets/animals/rinoceronte.png' },
  { name: 'Salamandra', image: '/assets/animals/salamandra.png' },
  { name: 'Saltamontes', image: '/assets/animals/saltamontes.png' },
  { name: 'Serpiente', image: '/assets/animals/serpiente.png' },
  { name: 'Suricata', image: '/assets/animals/suricata.png' },
  { name: 'Tapir', image: '/assets/animals/tapir.png' },
  { name: 'Tiburon', image: '/assets/animals/tiburon.png' },
  { name: 'Tigre', image: '/assets/animals/tigre.png' },
  { name: 'Topo', image: '/assets/animals/topo.png' },
  { name: 'Tortuga', image: '/assets/animals/tortuga.png' },
  { name: 'Vaca', image: '/assets/animals/vaca.png' },
  { name: 'Yak', image: '/assets/animals/yak.png' },
  { name: 'Zorro', image: '/assets/animals/zorro.png' },
]

const levels = [
  { id: 'level-3', name: 'RECLUTA', description: '3 siluetas · activación', count: 3, available: true },
  { id: 'level-5', name: 'RASTREADOR', description: '5 siluetas · enfoque inicial', count: 5, available: true },
  { id: 'level-8', name: 'OPERADOR', description: '8 siluetas · memoria activa', count: 8, available: true },
  { id: 'level-13', name: 'VANGUARDIA', description: '13 siluetas · ritmo táctico', count: 13, available: true },
  { id: 'level-21', name: 'CENTINELA', description: '21 siluetas · intensidad avanzada', count: 21, available: true },
  { id: 'level-34', name: 'NÚCLEO', description: '34 siluetas · intensidad avanzada', count: 34, available: true },
  { id: 'level-55', name: 'ESTRATEGA', description: '55 siluetas · intensidad avanzada', count: 55, available: true },
  { id: 'level-89', name: 'MAESTRO', description: '89 siluetas · intensidad avanzada', count: 89, available: true },
  { id: 'level-144', name: 'COMANDO', description: '144 siluetas · próximamente', count: 144, available: false },
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
  const [isSetupScreen, setIsSetupScreen] = useState(true)
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
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [activeSequence, memorizeIndex, trainingPhase])

  useEffect(() => {
    const shouldLockScroll = isSetupScreen || trainingPhase !== 'idle'
    if (!shouldLockScroll) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isSetupScreen, trainingPhase])

  const startTraining = (level: TrainingLevel) => {
    const nextSequence = [...silhouettes].sort(() => Math.random() - 0.5).slice(0, level.count)
    setActiveSequence(nextSequence)
    setActiveLevel(level)
    setCountdown(3)
    setSelectionOrder([])
    setTrainingResult(null)
    setTrainingPhase('countdown')
    setIsSetupScreen(false)
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
        <button className="start-training-button" type="button" onClick={() => setIsSetupScreen(true)}>
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

      {isSetupScreen && (
        <section className="training-setup-screen" aria-label="Configuración del entrenamiento">
          <header className="training-setup-header">
            <button className="back-button" type="button" onClick={() => navigate('/')}>
              ← MENU
            </button>
            <span className="training-code">COGNITION // CONFIGURATION</span>
          </header>

          <div className="training-setup-intro">
            <span className="training-kicker">IMMEDIATE SERIAL RECALL</span>
            <h1>CONFIGURA TU ENTRENAMIENTO</h1>
            <p>Selecciona la cantidad de siluetas para configurar tu sesión.</p>
          </div>

          <div className="training-level-grid">
            {levels.map((level, index) => (
              <button
                className={`training-level-card${level.available ? '' : ' is-locked'}`}
                type="button"
                key={level.id}
                disabled={!level.available}
                onClick={() => startTraining(level)}
              >
                <span className="training-level-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="training-level-count">{level.count}</span>
                <span className="training-level-copy">
                  <strong>{level.name}</strong>
                  <small>{level.description}</small>
                </span>
                <span className="training-level-status">{level.available ? 'SELECCIONAR' : 'BLOQUEADO'}</span>
              </button>
            ))}
          </div>

          <p className="training-setup-note">Más niveles estarán disponibles al incorporar nuevas siluetas al sistema.</p>
        </section>
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
                <button className="result-button" type="button" onClick={() => { setTrainingPhase('idle'); setIsSetupScreen(true) }}>
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
