import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/symbol-digit.css'

const levels = [
  { id: 'symbol-3', name: 'RECLUTA', description: '3 rondas · activación', trials: 3 },
  { id: 'symbol-5', name: 'RASTREADOR', description: '5 rondas · asociación inicial', trials: 5 },
  { id: 'symbol-8', name: 'OPERADOR', description: '8 rondas · velocidad activa', trials: 8 },
  { id: 'symbol-13', name: 'VANGUARDIA', description: '13 rondas · presión visual', trials: 13 },
  { id: 'symbol-21', name: 'CENTINELA', description: '21 rondas · asociación avanzada', trials: 21 },
] as const

const symbolSet = ['◆', '●', '▲', '■', '✦', '⬟']
type TrainingLevel = typeof levels[number]
type Phase = 'setup' | 'countdown' | 'trial' | 'result'
type Mapping = Record<string, number>
type Response = { correct: boolean; reactionMs: number }

const PERFECT_RUNS_REQUIRED = 25
const PROGRESS_KEY = 'cognition-symbol-digit-progress'
const SCORES_KEY = 'cognition-symbol-digit-scores'

function readProgress() {
  try { const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}'); return stored && typeof stored === 'object' ? stored : {} } catch { return {} }
}

function createMapping() {
  const digits = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5)
  return Object.fromEntries(symbolSet.map((symbol, index) => [symbol, digits[index]])) as Mapping
}

function gameProgress(progress: Record<string, number>) {
  const total = levels.length * PERFECT_RUNS_REQUIRED
  const completed = levels.reduce((sum, level) => sum + Math.min(progress[level.id] ?? 0, PERFECT_RUNS_REQUIRED), 0)
  return Math.round((completed / total) * 100)
}

export function SymbolDigitScreen() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('setup')
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0])
  const [progress, setProgress] = useState<Record<string, number>>(readProgress)
  const [mapping, setMapping] = useState<Mapping>({})
  const [symbols, setSymbols] = useState<string[]>([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [trialStartedAt, setTrialStartedAt] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [result, setResult] = useState<{ score: number; correct: number; total: number; perfectRuns: number; gamePercent: number } | null>(null)

  useEffect(() => {
    if (phase !== 'countdown') return
    const timer = window.setInterval(() => setCountdown((current) => {
      if (current <= 1) { window.clearInterval(timer); setTrialIndex(0); setTrialStartedAt(Date.now()); setPhase('trial'); return 0 }
      return current - 1
    }), 700)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'setup') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [phase])

  const startTraining = (level: TrainingLevel) => {
    setActiveLevel(level); setMapping(createMapping()); setSymbols(Array.from({ length: level.trials }, () => symbolSet[Math.floor(Math.random() * symbolSet.length)])); setTrialIndex(0); setResponses([]); setCountdown(3); setResult(null); setPhase('countdown')
  }

  const answer = (digit: number) => {
    if (phase !== 'trial' || !symbols[trialIndex]) return
    const response = { correct: digit === mapping[symbols[trialIndex]], reactionMs: Date.now() - trialStartedAt }
    const nextResponses = [...responses, response]
    setResponses(nextResponses)
    if (trialIndex < symbols.length - 1) { setTrialIndex((current) => current + 1); setTrialStartedAt(Date.now()); return }
    const correct = nextResponses.filter((item) => item.correct).length
    const perfect = correct === symbols.length
    const nextProgress = { ...progress }
    if (perfect) nextProgress[activeLevel.id] = Math.min(PERFECT_RUNS_REQUIRED, (nextProgress[activeLevel.id] ?? 0) + 1)
    setProgress(nextProgress)
    if (perfect) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress)) } catch { /* restricted storage */ } }
    const resultData = { score: Math.round((correct / symbols.length) * 100), correct, total: symbols.length, perfectRuns: nextProgress[activeLevel.id] ?? 0, gamePercent: gameProgress(nextProgress) }
    setResult(resultData); setPhase('result')
    try { const stored = JSON.parse(localStorage.getItem(SCORES_KEY) ?? '[]'); const scores = Array.isArray(stored) ? stored : []; scores.push({ ...resultData, level: activeLevel.id, mapping, symbols, responses: nextResponses, createdAt: new Date().toISOString() }); localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100))) } catch { /* restricted storage */ }
  }

  const currentSymbol = symbols[trialIndex]
  const correctDigit = mapping[currentSymbol]
  const options = [correctDigit, ...[1, 2, 3, 4, 5, 6].filter((digit) => digit !== correctDigit).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5)

  return <main className="symbol-digit-screen">
    {phase === 'setup' && <section className="symbol-digit-setup" aria-label="Configuración de Símbolo y Número"><header className="symbol-digit-header"><button type="button" onClick={() => navigate('/')}>← MENÚ</button><span>COGNITION // ENTRENAMIENTO 08</span></header><div className="symbol-digit-intro"><img src="/assets/cognition-brain-logo.png" alt="Cognition" /><span>VELOCIDAD DE PROCESAMIENTO // ASOCIACIÓN VISUAL</span><h1>SÍMBOLO Y NÚMERO</h1><p>Consulta la clave y responde con el número asociado al símbolo.</p></div><div className="symbol-digit-levels">{levels.map((level, index) => <button className="symbol-digit-level" type="button" key={level.id} onClick={() => startTraining(level)}><small>0{index + 1}</small><strong>{level.trials}</strong><span><b>{level.name}</b>{level.description}</span><em>{progress[level.id] ?? 0}/{PERFECT_RUNS_REQUIRED} PERFECTAS</em></button>)}</div></section>}
    {phase !== 'setup' && <section className="symbol-digit-session" aria-label="Sesión Symbol Digit">
      {phase === 'countdown' && <div className="symbol-digit-countdown" key={countdown}>{countdown}</div>}
      {phase === 'trial' && currentSymbol && <div className="symbol-digit-trial"><div className="symbol-digit-status">ROUND {trialIndex + 1} / {symbols.length}</div><div className="symbol-digit-key">{symbolSet.map((symbol) => <span key={symbol}><b>{symbol}</b><small>{mapping[symbol]}</small></span>)}</div><div className="symbol-digit-symbol">{currentSymbol}</div><p>¿QUÉ NÚMERO CORRESPONDE?</p><div className="symbol-digit-actions">{options.map((digit) => <button type="button" onClick={() => answer(digit)} key={digit}>{digit}</button>)}</div></div>}
      {phase === 'result' && result && <div className="symbol-digit-result"><span>SESSION COMPLETE</span><h2>{result.score === 100 ? 'ASOCIACIÓN CONFIRMADA' : 'SESIÓN FINALIZADA'}</h2><strong>{result.score}<small>%</small></strong><p>{result.correct} de {result.total} respuestas correctas</p><em>NIVEL: {result.perfectRuns}/{PERFECT_RUNS_REQUIRED} PERFECTAS · JUEGO: {result.gamePercent}%</em><div><button type="button" onClick={() => startTraining(activeLevel)}>NUEVA SESIÓN</button><button type="button" onClick={() => { setPhase('setup'); setResult(null) }}>CONFIGURAR</button></div></div>}
    </section>}
  </main>
}
