import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/pattern-comparison.css'

const levels = [
  { id: 'pattern-3', name: 'RECLUTA', description: '3 rondas · activación', trials: 3 },
  { id: 'pattern-5', name: 'RASTREADOR', description: '5 rondas · velocidad inicial', trials: 5 },
  { id: 'pattern-8', name: 'OPERADOR', description: '8 rondas · precisión activa', trials: 8 },
  { id: 'pattern-13', name: 'VANGUARDIA', description: '13 rondas · presión visual', trials: 13 },
  { id: 'pattern-21', name: 'CENTINELA', description: '21 rondas · velocidad avanzada', trials: 21 },
] as const

type TrainingLevel = typeof levels[number]
type Phase = 'setup' | 'countdown' | 'trial' | 'result'
type Pattern = boolean[]
type Trial = { left: Pattern; right: Pattern; same: boolean }
type Response = { correct: boolean; reactionMs: number }

const PERFECT_RUNS_REQUIRED = 25
const PROGRESS_KEY = 'cognition-pattern-comparison-progress'
const SCORES_KEY = 'cognition-pattern-comparison-scores'

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}')
    return stored && typeof stored === 'object' ? stored : {}
  } catch { return {} }
}

function createPattern() {
  const pattern = Array.from({ length: 9 }, () => Math.random() > 0.5)
  if (pattern.every(Boolean) || pattern.every((cell) => !cell)) pattern[4] = true
  return pattern
}

function createTrial(): Trial {
  const left = createPattern()
  const same = Math.random() > 0.5
  const right = [...left]
  if (!same) {
    const index = Math.floor(Math.random() * right.length)
    right[index] = !right[index]
  }
  return { left, right, same }
}

function gameProgress(progress: Record<string, number>) {
  const total = levels.length * PERFECT_RUNS_REQUIRED
  const completed = levels.reduce((sum, level) => sum + Math.min(progress[level.id] ?? 0, PERFECT_RUNS_REQUIRED), 0)
  return Math.round((completed / total) * 100)
}

export function PatternComparisonScreen() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('setup')
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0])
  const [progress, setProgress] = useState<Record<string, number>>(readProgress)
  const [trials, setTrials] = useState<Trial[]>([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [trialStartedAt, setTrialStartedAt] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [result, setResult] = useState<{ score: number; correct: number; total: number; perfectRuns: number; gamePercent: number } | null>(null)

  useEffect(() => {
    if (phase !== 'countdown') return
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setTrialIndex(0)
          setTrialStartedAt(Date.now())
          setPhase('trial')
          return 0
        }
        return current - 1
      })
    }, 700)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'setup') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [phase])

  const startTraining = (level: TrainingLevel) => {
    setActiveLevel(level)
    setTrials(Array.from({ length: level.trials }, createTrial))
    setResponses([])
    setTrialIndex(0)
    setCountdown(3)
    setResult(null)
    setPhase('countdown')
  }

  const answer = (same: boolean) => {
    if (phase !== 'trial' || !trials[trialIndex]) return
    const response = { correct: same === trials[trialIndex].same, reactionMs: Date.now() - trialStartedAt }
    const nextResponses = [...responses, response]
    setResponses(nextResponses)
    if (trialIndex < trials.length - 1) {
      setTrialIndex((current) => current + 1)
      setTrialStartedAt(Date.now())
      return
    }
    const correct = nextResponses.filter((item) => item.correct).length
    const perfect = correct === trials.length
    const nextProgress = { ...progress }
    if (perfect) nextProgress[activeLevel.id] = Math.min(PERFECT_RUNS_REQUIRED, (nextProgress[activeLevel.id] ?? 0) + 1)
    setProgress(nextProgress)
    if (perfect) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress)) } catch { /* restricted storage */ } }
    const resultData = { score: Math.round((correct / trials.length) * 100), correct, total: trials.length, perfectRuns: nextProgress[activeLevel.id] ?? 0, gamePercent: gameProgress(nextProgress) }
    setResult(resultData)
    setPhase('result')
    try {
      const stored = JSON.parse(localStorage.getItem(SCORES_KEY) ?? '[]')
      const scores = Array.isArray(stored) ? stored : []
      scores.push({ ...resultData, level: activeLevel.id, responses: nextResponses, createdAt: new Date().toISOString() })
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100)))
    } catch { /* restricted storage */ }
  }

  const trial = trials[trialIndex]
  const renderPattern = (pattern: Pattern, label: string) => <div className="comparison-pattern" aria-label={label}>{pattern.map((active, index) => <span className={active ? 'is-active' : ''} key={index} />)}</div>

  return (
    <main className="pattern-comparison-screen">
      {phase === 'setup' && <section className="pattern-comparison-setup" aria-label="Configuración de Pattern Comparison">
        <header className="pattern-comparison-header"><button type="button" onClick={() => navigate('/')}>← MENÚ</button><span>COGNITION // ENTRENAMIENTO 06</span></header>
        <div className="pattern-comparison-intro"><img src="/assets/cognition-brain-logo.png" alt="Cognition" /><span>VELOCIDAD DE PROCESAMIENTO // COMPARACIÓN VISUAL</span><h1>COMPARACIÓN VISUAL</h1><p>Compara los patrones. Decide rápido si son iguales o diferentes.</p></div>
        <div className="pattern-comparison-levels">{levels.map((level, index) => <button className="pattern-comparison-level" type="button" key={level.id} onClick={() => startTraining(level)}><small>0{index + 1}</small><strong>{level.trials}</strong><span><b>{level.name}</b>{level.description}</span><em>{progress[level.id] ?? 0}/{PERFECT_RUNS_REQUIRED} PERFECTAS</em></button>)}</div>
      </section>}
      {phase !== 'setup' && <section className="pattern-comparison-session" aria-label="Sesión Pattern Comparison">
        {phase === 'countdown' && <div className="pattern-comparison-countdown" key={countdown}>{countdown}</div>}
        {phase === 'trial' && trial && <div className="pattern-comparison-trial"><div className="pattern-comparison-status">ROUND {trialIndex + 1} / {trials.length}</div><div className="comparison-pair">{renderPattern(trial.left, 'Patrón izquierdo')}<span className="comparison-divider">VS</span>{renderPattern(trial.right, 'Patrón derecho')}</div><p>¿LOS PATRONES SON IGUALES?</p><div className="pattern-comparison-actions"><button type="button" onClick={() => answer(true)}>IGUALES</button><button type="button" onClick={() => answer(false)}>DIFERENTES</button></div></div>}
        {phase === 'result' && result && <div className="pattern-comparison-result"><span>SESSION COMPLETE</span><h2>{result.score === 100 ? 'VELOCIDAD CONFIRMADA' : 'SESIÓN FINALIZADA'}</h2><strong>{result.score}<small>%</small></strong><p>{result.correct} de {result.total} respuestas correctas</p><em>NIVEL: {result.perfectRuns}/{PERFECT_RUNS_REQUIRED} PERFECTAS · JUEGO: {result.gamePercent}%</em><div><button type="button" onClick={() => startTraining(activeLevel)}>NUEVA SESIÓN</button><button type="button" onClick={() => { setPhase('setup'); setResult(null) }}>CONFIGURAR</button></div></div>}
      </section>}
    </main>
  )
}
