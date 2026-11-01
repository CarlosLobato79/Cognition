import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auditory-recall.css'

const levels = [
  { id: 'auditory-3', name: 'RECLUTA', description: '3 palabras · activación', length: 3 },
  { id: 'auditory-5', name: 'RASTREADOR', description: '5 palabras · escucha inicial', length: 5 },
  { id: 'auditory-8', name: 'OPERADOR', description: '8 palabras · memoria activa', length: 8 },
  { id: 'auditory-13', name: 'VANGUARDIA', description: '13 palabras · retención verbal', length: 13 },
  { id: 'auditory-21', name: 'CENTINELA', description: '21 palabras · memoria avanzada', length: 21 },
] as const

const words = ['BRÚJULA', 'TORRE', 'RÍO', 'MOTOR', 'NUBE', 'LLAVE', 'FARO', 'CAMINO', 'NÚCLEO', 'PUENTE', 'CÓDIGO', 'ESTRELLA', 'BOSQUE', 'RELOJ', 'SEÑAL', 'MÁSCARA', 'ÓRBITA', 'TRUENO', 'PLATA', 'HORIZONTE', 'CIRCUITO', 'RADAR', 'MONTAÑA', 'SOMBRA', 'VÉRTICE', 'ANCLA', 'PLANETA', 'MÓDULO', 'PULSO', 'AURORA']
type TrainingLevel = typeof levels[number]
type Phase = 'setup' | 'countdown' | 'listen' | 'recall' | 'result'

const PERFECT_RUNS_REQUIRED = 25
const PROGRESS_KEY = 'cognition-auditory-recall-progress'
const SCORES_KEY = 'cognition-auditory-recall-scores'

function readProgress() {
  try { const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}'); return stored && typeof stored === 'object' ? stored : {} } catch { return {} }
}

function gameProgress(progress: Record<string, number>) {
  const total = levels.length * PERFECT_RUNS_REQUIRED
  const completed = levels.reduce((sum, level) => sum + Math.min(progress[level.id] ?? 0, PERFECT_RUNS_REQUIRED), 0)
  return Math.round((completed / total) * 100)
}

function randomWords(length: number) { return [...words].sort(() => Math.random() - 0.5).slice(0, length) }

export function AuditoryRecallScreen() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('setup')
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0])
  const [progress, setProgress] = useState<Record<string, number>>(readProgress)
  const [targetWords, setTargetWords] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [listenIndex, setListenIndex] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [result, setResult] = useState<{ score: number; correct: number; distractors: number; total: number; perfectRuns: number; gamePercent: number } | null>(null)

  useEffect(() => {
    if (phase !== 'countdown') return
    const timer = window.setInterval(() => setCountdown((current) => {
      if (current <= 1) { window.clearInterval(timer); setListenIndex(0); setPhase('listen'); return 0 }
      return current - 1
    }), 700)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'listen' || !targetWords[listenIndex]) return
    const word = targetWords[listenIndex]
    const speak = () => {
      if (typeof speechSynthesis === 'undefined') {
        const fallbackTimer = window.setTimeout(() => {
          if (listenIndex >= targetWords.length - 1) setPhase('recall')
          else setListenIndex((current) => current + 1)
        }, 900)
        return () => window.clearTimeout(fallbackTimer)
      }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'es-MX'
      utterance.rate = 0.82
      utterance.volume = 1
      utterance.onend = () => {
        if (listenIndex >= targetWords.length - 1) window.setTimeout(() => setPhase('recall'), 500)
        else setListenIndex((current) => current + 1)
      }
      window.speechSynthesis.speak(utterance)
    }
    const timer = window.setTimeout(speak, 180)
    return () => { window.clearTimeout(timer); window.speechSynthesis?.cancel() }
  }, [phase, listenIndex, targetWords])

  useEffect(() => {
    if (phase !== 'setup') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [phase])

  const startTraining = (level: TrainingLevel) => {
    const nextTargets = randomWords(level.length)
    const distractors = randomWords(5).filter((word) => !nextTargets.includes(word)).slice(0, 4)
    setActiveLevel(level); setTargetWords(nextTargets); setOptions([...nextTargets, ...distractors].sort(() => Math.random() - 0.5)); setSelected([]); setListenIndex(0); setCountdown(3); setResult(null); setPhase('countdown')
  }

  const finish = () => {
    const correct = selected.filter((word) => targetWords.includes(word)).length
    const distractors = selected.filter((word) => !targetWords.includes(word)).length
    const perfect = correct === targetWords.length && distractors === 0
    const nextProgress = { ...progress }
    if (perfect) nextProgress[activeLevel.id] = Math.min(PERFECT_RUNS_REQUIRED, (nextProgress[activeLevel.id] ?? 0) + 1)
    setProgress(nextProgress)
    if (perfect) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress)) } catch { /* restricted storage */ } }
    const resultData = { score: Math.max(0, Math.round(((correct - distractors) / targetWords.length) * 100)), correct, distractors, total: targetWords.length, perfectRuns: nextProgress[activeLevel.id] ?? 0, gamePercent: gameProgress(nextProgress) }
    setResult(resultData); setPhase('result')
    try { const stored = JSON.parse(localStorage.getItem(SCORES_KEY) ?? '[]'); const scores = Array.isArray(stored) ? stored : []; scores.push({ ...resultData, level: activeLevel.id, targetWords, selected, createdAt: new Date().toISOString() }); localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100))) } catch { /* restricted storage */ }
  }

  const toggleWord = (word: string) => setSelected((current) => current.includes(word) ? current.filter((item) => item !== word) : [...current, word])

  return <main className="auditory-recall-screen">
    {phase === 'setup' && <section className="auditory-recall-setup" aria-label="Configuración de Auditory Recall"><header className="auditory-recall-header"><button type="button" onClick={() => navigate('/')}>← MENU</button><span>COGNITION // TRAINING 09</span></header><div className="auditory-recall-intro"><img src="/assets/cognition-brain-logo.png" alt="Cognition" /><span>EPISODIC MEMORY // AUDITORY LEARNING</span><h1>AUDITORY RECALL</h1><p>Escucha la lista. Después selecciona las palabras que recuerdes.</p></div><div className="auditory-recall-levels">{levels.map((level, index) => <button className="auditory-recall-level" type="button" key={level.id} onClick={() => startTraining(level)}><small>0{index + 1}</small><strong>{level.length}</strong><span><b>{level.name}</b>{level.description}</span><em>{progress[level.id] ?? 0}/{PERFECT_RUNS_REQUIRED} PERFECTAS</em></button>)}</div></section>}
    {phase !== 'setup' && <section className="auditory-recall-session" aria-label="Sesión Auditory Recall">
      {phase === 'countdown' && <div className="auditory-recall-countdown" key={countdown}>{countdown}</div>}
      {phase === 'listen' && <div className="auditory-recall-listen"><div className="auditory-recall-status">LISTEN {listenIndex + 1} / {targetWords.length}</div><div className="auditory-wave"><i /><i /><i /><i /><i /></div><strong>ESCUCHA</strong><span>{targetWords[listenIndex]}</span><p>LA PALABRA SE REPRODUCIRÁ EN VOZ ALTA</p></div>}
      {phase === 'recall' && <div className="auditory-recall-options"><div className="auditory-recall-status">RECALL // {selected.length} SELECCIONADAS</div><h2>¿QUÉ PALABRAS ESCUCHASTE?</h2><p>Selecciona las palabras que recuerdes.</p><div className="auditory-word-grid">{options.map((word) => <button type="button" className={selected.includes(word) ? 'is-selected' : ''} onClick={() => toggleWord(word)} key={word}>{word}</button>)}</div><button className="auditory-finish" type="button" onClick={finish}>FINALIZAR RESPUESTA</button></div>}
      {phase === 'result' && result && <div className="auditory-recall-result"><span>SESSION COMPLETE</span><h2>{result.score === 100 ? 'RECUERDO CONFIRMADO' : 'SESIÓN FINALIZADA'}</h2><strong>{result.score}<small>%</small></strong><p>{result.correct} correctas · {result.distractors} distractores</p><em>NIVEL: {result.perfectRuns}/{PERFECT_RUNS_REQUIRED} PERFECTAS · JUEGO: {result.gamePercent}%</em><div><button type="button" onClick={() => startTraining(activeLevel)}>NUEVA SESIÓN</button><button type="button" onClick={() => { setPhase('setup'); setResult(null) }}>CONFIGURAR</button></div></div>}
    </section>}
  </main>
}
