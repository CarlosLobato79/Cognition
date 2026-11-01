import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useNavigate } from 'react-router-dom'
import '../styles/serial-recall.css'

const silhouettes = [
  { name: 'Abeja', image: '/assets/animals/abeja.svg' },
  { name: 'Aguila', image: '/assets/animals/aguila.svg' },
  { name: 'Alce', image: '/assets/animals/alce.svg' },
  { name: 'Anguila', image: '/assets/animals/anguila.svg' },
  { name: 'Antilope', image: '/assets/animals/antilope.svg' },
  { name: 'Arana', image: '/assets/animals/arana.svg' },
  { name: 'Ardilla', image: '/assets/animals/ardilla.svg' },
  { name: 'Armadillo', image: '/assets/animals/armadillo.svg' },
  { name: 'Avestruz', image: '/assets/animals/avestruz.svg' },
  { name: 'Ballena', image: '/assets/animals/ballena.svg' },
  { name: 'Bisonte', image: '/assets/animals/bisonte.svg' },
  { name: 'Bufalo', image: '/assets/animals/bufalo.svg' },
  { name: 'Buho', image: '/assets/animals/buho.svg' },
  { name: 'Burro', image: '/assets/animals/burro.svg' },
  { name: 'Caballito De Mar', image: '/assets/animals/caballito-de-mar.svg' },
  { name: 'Caballo', image: '/assets/animals/caballo.svg' },
  { name: 'Cabra', image: '/assets/animals/cabra.svg' },
  { name: 'Camaleon', image: '/assets/animals/camaleon.svg' },
  { name: 'Camaron', image: '/assets/animals/camaron.svg' },
  { name: 'Camello', image: '/assets/animals/camello.svg' },
  { name: 'Cangrejo', image: '/assets/animals/cangrejo.svg' },
  { name: 'Canguro', image: '/assets/animals/canguro.svg' },
  { name: 'Caracol', image: '/assets/animals/caracol.svg' },
  { name: 'Caracol De Mar', image: '/assets/animals/caracol-de-mar.svg' },
  { name: 'Castor', image: '/assets/animals/castor.svg' },
  { name: 'Cebra', image: '/assets/animals/cebra.svg' },
  { name: 'Cerdo', image: '/assets/animals/cerdo.svg' },
  { name: 'Chimpance', image: '/assets/animals/chimpance.svg' },
  { name: 'Ciervo', image: '/assets/animals/ciervo.svg' },
  { name: 'Cisne', image: '/assets/animals/cisne.svg' },
  { name: 'Cocodrilo', image: '/assets/animals/cocodrilo.svg' },
  { name: 'Comadreja', image: '/assets/animals/comadreja.svg' },
  { name: 'Conejo', image: '/assets/animals/conejo.svg' },
  { name: 'Cuervo', image: '/assets/animals/cuervo.svg' },
  { name: 'Delfin', image: '/assets/animals/delfin.svg' },
  { name: 'Elefante', image: '/assets/animals/elefante.svg' },
  { name: 'Erizo', image: '/assets/animals/erizo.svg' },
  { name: 'Escorpion', image: '/assets/animals/escorpion.svg' },
  { name: 'Estrella De Mar', image: '/assets/animals/estrella-de-mar.svg' },
  { name: 'Flamenco', image: '/assets/animals/flamenco.svg' },
  { name: 'Foca', image: '/assets/animals/foca.svg' },
  { name: 'Gacela', image: '/assets/animals/gacela.svg' },
  { name: 'Gallina', image: '/assets/animals/gallina.svg' },
  { name: 'Gallo', image: '/assets/animals/gallo.svg' },
  { name: 'Gato', image: '/assets/animals/gato.svg' },
  { name: 'Gorila', image: '/assets/animals/gorila.svg' },
  { name: 'Guepardo', image: '/assets/animals/guepardo.svg' },
  { name: 'Gusano De Seda', image: '/assets/animals/gusano-de-seda.svg' },
  { name: 'Hiena', image: '/assets/animals/hiena.svg' },
  { name: 'Hipopotamo', image: '/assets/animals/hipopotamo.svg' },
  { name: 'Iguana', image: '/assets/animals/iguana.svg' },
  { name: 'Jabali', image: '/assets/animals/jabali.svg' },
  { name: 'Jaguar', image: '/assets/animals/jaguar.svg' },
  { name: 'Jirafa', image: '/assets/animals/jirafa.svg' },
  { name: 'Koala', image: '/assets/animals/koala.svg' },
  { name: 'Lagarto', image: '/assets/animals/lagarto.svg' },
  { name: 'Langosta', image: '/assets/animals/langosta.svg' },
  { name: 'Leon', image: '/assets/animals/leon.svg' },
  { name: 'Leopardo', image: '/assets/animals/leopardo.svg' },
  { name: 'Libelula', image: '/assets/animals/libelula.svg' },
  { name: 'Llama', image: '/assets/animals/llama.svg' },
  { name: 'Lobo', image: '/assets/animals/lobo.svg' },
  { name: 'Loro', image: '/assets/animals/loro.svg' },
  { name: 'Manati', image: '/assets/animals/manati.svg' },
  { name: 'Mantis', image: '/assets/animals/mantis.svg' },
  { name: 'Mapache', image: '/assets/animals/mapache.svg' },
  { name: 'Mariposa', image: '/assets/animals/mariposa.svg' },
  { name: 'Mariquita', image: '/assets/animals/mariquita.svg' },
  { name: 'Medusa', image: '/assets/animals/medusa.svg' },
  { name: 'Mono', image: '/assets/animals/mono.svg' },
  { name: 'Morsa', image: '/assets/animals/morsa.svg' },
  { name: 'Murcielago', image: '/assets/animals/murcielago.svg' },
  { name: 'Nutria', image: '/assets/animals/nutria.svg' },
  { name: 'Orangutan', image: '/assets/animals/orangutan.svg' },
  { name: 'Oso', image: '/assets/animals/oso.svg' },
  { name: 'Oveja', image: '/assets/animals/oveja.svg' },
  { name: 'Panda', image: '/assets/animals/panda.svg' },
  { name: 'Pantera', image: '/assets/animals/pantera.svg' },
  { name: 'Pato', image: '/assets/animals/pato.svg' },
  { name: 'Pavo', image: '/assets/animals/pavo.svg' },
  { name: 'Perezoso', image: '/assets/animals/perezoso.svg' },
  { name: 'Perro', image: '/assets/animals/perro.svg' },
  { name: 'Pinguino', image: '/assets/animals/pinguino.svg' },
  { name: 'Pulpo', image: '/assets/animals/pulpo.svg' },
  { name: 'Puma', image: '/assets/animals/puma.svg' },
  { name: 'Rana', image: '/assets/animals/rana.svg' },
  { name: 'Raya', image: '/assets/animals/raya.svg' },
  { name: 'Rinoceronte', image: '/assets/animals/rinoceronte.svg' },
  { name: 'Salamandra', image: '/assets/animals/salamandra.svg' },
  { name: 'Saltamontes', image: '/assets/animals/saltamontes.svg' },
  { name: 'Serpiente', image: '/assets/animals/serpiente.svg' },
  { name: 'Suricata', image: '/assets/animals/suricata.svg' },
  { name: 'Tapir', image: '/assets/animals/tapir.svg' },
  { name: 'Tiburon', image: '/assets/animals/tiburon.svg' },
  { name: 'Tigre', image: '/assets/animals/tigre.svg' },
  { name: 'Topo', image: '/assets/animals/topo.svg' },
  { name: 'Tortuga', image: '/assets/animals/tortuga.svg' },
  { name: 'Vaca', image: '/assets/animals/vaca.svg' },
  { name: 'Yak', image: '/assets/animals/yak.svg' },
  { name: 'Zorro', image: '/assets/animals/zorro.svg' },
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

const PERFECT_RUNS_REQUIRED = 25
const PROGRESS_STORAGE_KEY = 'cognition-training-progress'

type TrainingLevel = typeof levels[number]

type TrainingPhase = 'idle' | 'countdown' | 'memorize' | 'selection' | 'result'

type TrainingResult = {
  score: number
  correctAnswers: number
  total: number
  perfect: boolean
  levelPerfectRuns: number
  gameProgress: number
}

type LevelProgress = Record<string, number>

function readLevelProgress(): LevelProgress {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}')
    return stored && typeof stored === 'object' ? stored : {}
  } catch {
    return {}
  }
}

function calculateGameProgress(progress: LevelProgress) {
  const playableLevels = levels.filter((level) => level.available)
  const totalRuns = playableLevels.reduce((sum, level) => sum + Math.min(progress[level.id] ?? 0, PERFECT_RUNS_REQUIRED), 0)
  const totalRequired = playableLevels.length * PERFECT_RUNS_REQUIRED
  return totalRequired ? Math.round((totalRuns / totalRequired) * 100) : 0
}

export function SerialRecallScreen() {
  const navigate = useNavigate()
  const [sequence, setSequence] = useState(() => silhouettes.slice(0, 3))
  const [isSetupScreen, setIsSetupScreen] = useState(true)
  const [isVaultOpen, setIsVaultOpen] = useState(false)
  const [vaultPage, setVaultPage] = useState(0)
  const [trainingPhase, setTrainingPhase] = useState<TrainingPhase>('idle')
  const [activeSequence, setActiveSequence] = useState<typeof silhouettes>([])
  const [selectionCards, setSelectionCards] = useState<typeof silhouettes>([])
  const [selectionOrder, setSelectionOrder] = useState<string[]>([])
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0])
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null)
  const [levelProgress, setLevelProgress] = useState<LevelProgress>(readLevelProgress)
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
    }, 900)

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
      levelPerfectRuns: levelProgress[activeLevel.id] ?? 0,
      gameProgress: calculateGameProgress(levelProgress),
    }

    let nextProgress = levelProgress
    if (result.perfect) {
      nextProgress = {
        ...levelProgress,
        [activeLevel.id]: Math.min(PERFECT_RUNS_REQUIRED, (levelProgress[activeLevel.id] ?? 0) + 1),
      }
      setLevelProgress(nextProgress)
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress))
      } catch {
        // localStorage may be unavailable in private browsing or restricted webviews.
      }
    }

    result.levelPerfectRuns = nextProgress[activeLevel.id] ?? 0
    result.gameProgress = calculateGameProgress(nextProgress)

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
  const vaultPageSize = 20
  const vaultPageCount = Math.ceil(silhouettes.length / vaultPageSize)
  const visibleVaultSilhouettes = silhouettes.slice(vaultPage * vaultPageSize, (vaultPage + 1) * vaultPageSize)

  return (
    <main className="serial-recall-screen">
      <header className="training-header">
        <button className="back-button" type="button" onClick={() => navigate('/')}>
          ← MENÚ
        </button>
        <span className="training-code">COGNITION // ENTRENAMIENTO 01</span>
      </header>

      <section className="training-intro">
        <span className="training-kicker">MEMORIA DE TRABAJO</span>
        <h1>MEMORIA SECUENCIAL</h1>
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
              ← MENÚ
            </button>
            <span className="training-code">COGNITION // CONFIGURATION</span>
            <button className="silhouette-vault-button" type="button" onClick={() => { setVaultPage(0); setIsVaultOpen(true) }}>
              ALMACÉN DE SILUETAS
            </button>
          </header>

          <div className="training-setup-intro">
            <img className="training-setup-logo" src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span className="training-kicker">MEMORIA SECUENCIAL</span>
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
                  <span className="training-level-progress">{levelProgress[level.id] ?? 0}/{PERFECT_RUNS_REQUIRED} PERFECTAS</span>
              </button>
            ))}
          </div>

          <p className="training-setup-note">Más niveles estarán disponibles al incorporar nuevas siluetas al sistema.</p>

          {isVaultOpen && (
            <div className="vault-panel-backdrop" role="presentation" onClick={() => setIsVaultOpen(false)}>
              <section className="vault-panel" role="dialog" aria-modal="true" aria-labelledby="vault-title" onClick={(event) => event.stopPropagation()}>
                <div className="vault-panel-heading">
                  <div>
                    <span className="training-info-kicker">ASSET LIBRARY</span>
                    <h2 id="vault-title">ALMACÉN DE SILUETAS</h2>
                  </div>
                  <button type="button" aria-label="Cerrar almacén" onClick={() => setIsVaultOpen(false)}>×</button>
                </div>
                <p>La biblioteca contiene {silhouettes.length} siluetas vectorizadas para los protocolos de entrenamiento.</p>
                <span className="vault-panel-count">{silhouettes.length} ACTIVOS DISPONIBLES</span>
                <div className="vault-grid" aria-label="Siluetas disponibles">
                  {visibleVaultSilhouettes.map((animal) => (
                    <div className="vault-item" key={animal.name}>
                      <div className="vault-item-image">
                        <img loading="lazy" decoding="async" src={animal.image} alt={`Silueta de ${animal.name}`} />
                      </div>
                      <span>{animal.name.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <div className="vault-pagination" aria-label="Paginación del almacén">
                  <button type="button" disabled={vaultPage === 0} onClick={() => setVaultPage((page) => page - 1)}>
                    ← ANTERIOR
                  </button>
                  <span>{vaultPage + 1} / {vaultPageCount}</span>
                  <button type="button" disabled={vaultPage === vaultPageCount - 1} onClick={() => setVaultPage((page) => page + 1)}>
                    SIGUIENTE →
                  </button>
                </div>
              </section>
            </div>
          )}
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
            <div className={`selection-display${activeSequence.length > 5 ? ' selection-large' : ''}`}>
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
              <span className="result-kicker">SESIÓN COMPLETA</span>
              <h2>{trainingResult.perfect ? 'SECUENCIA CORRECTA' : 'SECUENCIA INCORRECTA'}</h2>
              <div className="result-score">{trainingResult.score}<small>%</small></div>
              <p>{trainingResult.correctAnswers} de {trainingResult.total} posiciones correctas</p>
              <span className="result-progress">NIVEL: {trainingResult.levelPerfectRuns}/{PERFECT_RUNS_REQUIRED} PERFECTAS · JUEGO: {trainingResult.gameProgress}%</span>
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
