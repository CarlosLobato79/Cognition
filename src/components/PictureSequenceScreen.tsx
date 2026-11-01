import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/picture-sequence.css'

const levels = [
  { id: 'picture-3', name: 'RECLUTA', description: '3 imágenes · activación', length: 3 },
  { id: 'picture-5', name: 'RASTREADOR', description: '5 imágenes · memoria inicial', length: 5 },
  { id: 'picture-8', name: 'OPERADOR', description: '8 imágenes · secuencia activa', length: 8 },
  { id: 'picture-13', name: 'VANGUARDIA', description: '13 imágenes · contexto visual', length: 13 },
  { id: 'picture-21', name: 'CENTINELA', description: '21 imágenes · memoria avanzada', length: 21 },
] as const

const animals = [
  ['perro', 'PERRO'], ['gato', 'GATO'], ['leon', 'LEÓN'], ['tigre', 'TIGRE'], ['elefante', 'ELEFANTE'], ['jirafa', 'JIRAFA'],
  ['cebra', 'CEBRA'], ['oso', 'OSO'], ['lobo', 'LOBO'], ['zorro', 'ZORRO'], ['mono', 'MONO'], ['panda', 'PANDA'],
  ['koala', 'KOALA'], ['canguro', 'CANGURO'], ['delfin', 'DELFIN'], ['ballena', 'BALLENA'], ['tiburon', 'TIBURÓN'], ['aguila', 'ÁGUILA'],
  ['pinguino', 'PINGÜINO'], ['tortuga', 'TORTUGA'], ['cocodrilo', 'COCODRILO'], ['serpiente', 'SERPIENTE'], ['rana', 'RANA'],
] as const

type Animal = { file: string; name: string }
type TrainingLevel = typeof levels[number]
type Phase = 'setup' | 'countdown' | 'show' | 'select' | 'result'
type Response = { correct: boolean; reactionMs: number }

const PERFECT_RUNS_REQUIRED = 25
const PROGRESS_KEY = 'cognition-picture-sequence-progress'
const SCORES_KEY = 'cognition-picture-sequence-scores'

function readProgress() {
  try { const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}'); return stored && typeof stored === 'object' ? stored : {} } catch { return {} }
}

function createSequence(length: number): Animal[] {
  return [...animals].sort(() => Math.random() - 0.5).slice(0, length).map(([file, name]) => ({ file, name }))
}

function gameProgress(progress: Record<string, number>) {
  const total = levels.length * PERFECT_RUNS_REQUIRED
  const completed = levels.reduce((sum, level) => sum + Math.min(progress[level.id] ?? 0, PERFECT_RUNS_REQUIRED), 0)
  return Math.round((completed / total) * 100)
}

export function PictureSequenceScreen() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('setup')
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0])
  const [progress, setProgress] = useState<Record<string, number>>(readProgress)
  const [sequence, setSequence] = useState<Animal[]>([])
  const [showIndex, setShowIndex] = useState(0)
  const [selected, setSelected] = useState<Animal[]>([])
  const [countdown, setCountdown] = useState(3)
  const [startedAt, setStartedAt] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; total: number; perfectRuns: number; gamePercent: number } | null>(null)

  useEffect(() => {
    if (phase !== 'countdown') return
    const timer = window.setInterval(() => setCountdown((current) => {
      if (current <= 1) { window.clearInterval(timer); setShowIndex(0); setPhase('show'); return 0 }
      return current - 1
    }), 700)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'show') return
    const timer = window.setTimeout(() => {
      if (showIndex >= sequence.length - 1) { setSelected([]); setStartedAt(Date.now()); setPhase('select') }
      else setShowIndex((current) => current + 1)
    }, 650)
    return () => window.clearTimeout(timer)
  }, [phase, showIndex, sequence.length])

  useEffect(() => {
    if (phase !== 'setup') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [phase])

  const startTraining = (level: TrainingLevel) => {
    setActiveLevel(level); setSequence(createSequence(level.length)); setShowIndex(0); setSelected([]); setCountdown(3); setResult(null); setPhase('countdown')
  }

  const finish = (correct: number, responses: Response[]) => {
    const perfect = correct === sequence.length
    const nextProgress = { ...progress }
    if (perfect) nextProgress[activeLevel.id] = Math.min(PERFECT_RUNS_REQUIRED, (nextProgress[activeLevel.id] ?? 0) + 1)
    setProgress(nextProgress)
    if (perfect) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress)) } catch { /* restricted storage */ } }
    const resultData = { score: Math.round((correct / sequence.length) * 100), correct, total: sequence.length, perfectRuns: nextProgress[activeLevel.id] ?? 0, gamePercent: gameProgress(nextProgress) }
    setResult(resultData); setPhase('result')
    try {
      const stored = JSON.parse(localStorage.getItem(SCORES_KEY) ?? '[]'); const scores = Array.isArray(stored) ? stored : []
      scores.push({ ...resultData, level: activeLevel.id, sequence, selected, responses, createdAt: new Date().toISOString() }); localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100)))
    } catch { /* restricted storage */ }
  }

  const choose = (animal: Animal) => {
    if (phase !== 'select' || selected.some((entry) => entry.file === animal.file)) return
    const nextSelected = [...selected, animal]
    setSelected(nextSelected)
    const expected = sequence[nextSelected.length - 1]
    const response = { correct: animal.file === expected.file, reactionMs: Date.now() - startedAt }
    const responses = nextSelected.map((entry, index) => ({ correct: entry.file === sequence[index].file, reactionMs: response.reactionMs }))
    if (!response.correct) finish(nextSelected.filter((entry, index) => entry.file === sequence[index]?.file).length, responses)
    else if (nextSelected.length === sequence.length) finish(sequence.length, responses)
  }

  const animalImage = (animal: Animal) => `/assets/animals/${animal.file}.svg`

  return <main className="picture-sequence-screen">
    {phase === 'setup' && <section className="picture-sequence-setup" aria-label="Configuración de Picture Sequence"><header className="picture-sequence-header"><button type="button" onClick={() => navigate('/')}>← MENU</button><span>COGNITION // TRAINING 08</span></header><div className="picture-sequence-intro"><img src="/assets/cognition-brain-logo.png" alt="Cognition" /><span>EPISODIC MEMORY // VISUAL SEQUENCE</span><h1>PICTURE SEQUENCE</h1><p>Observa las imágenes y reconstruye la secuencia correcta.</p></div><div className="picture-sequence-levels">{levels.map((level, index) => <button className="picture-sequence-level" type="button" key={level.id} onClick={() => startTraining(level)}><small>0{index + 1}</small><strong>{level.length}</strong><span><b>{level.name}</b>{level.description}</span><em>{progress[level.id] ?? 0}/{PERFECT_RUNS_REQUIRED} PERFECTAS</em></button>)}</div></section>}
    {phase !== 'setup' && <section className="picture-sequence-session" aria-label="Sesión Picture Sequence">
      {phase === 'countdown' && <div className="picture-sequence-countdown" key={countdown}>{countdown}</div>}
      {phase === 'show' && sequence[showIndex] && <div className="picture-sequence-playback"><div className="picture-sequence-status">MEMORIZE {showIndex + 1} / {sequence.length}</div><img className="sequence-animal" src={animalImage(sequence[showIndex])} alt={sequence[showIndex].name} /><strong>{sequence[showIndex].name}</strong><p>OBSERVA Y RECUERDA</p></div>}
      {phase === 'select' && <div className="picture-sequence-playback"><div className="picture-sequence-status">ORDER {selected.length + 1} / {sequence.length}</div><p>SELECCIONA LA SECUENCIA CORRECTA</p><div className="sequence-options">{sequence.map((animal) => <button type="button" disabled={selected.some((entry) => entry.file === animal.file)} className={selected.some((entry) => entry.file === animal.file) ? 'is-selected' : ''} onClick={() => choose(animal)} key={animal.file}><img src={animalImage(animal)} alt="" /><span>{animal.name}</span></button>)}</div></div>}
      {phase === 'result' && result && <div className="picture-sequence-result"><span>SESSION COMPLETE</span><h2>{result.score === 100 ? 'SECUENCIA CONFIRMADA' : 'SESIÓN FINALIZADA'}</h2><strong>{result.score}<small>%</small></strong><p>{result.correct} de {result.total} posiciones correctas</p><em>NIVEL: {result.perfectRuns}/{PERFECT_RUNS_REQUIRED} PERFECTAS · JUEGO: {result.gamePercent}%</em><div><button type="button" onClick={() => startTraining(activeLevel)}>NUEVA SESIÓN</button><button type="button" onClick={() => { setPhase('setup'); setResult(null) }}>CONFIGURAR</button></div></div>}
    </section>}
  </main>
}
