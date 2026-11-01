import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cognitive-games.css";

const levels = [
  { id: "nback-3", name: "RECLUTA", trials: 3 },
  { id: "nback-5", name: "RASTREADOR", trials: 5 },
  { id: "nback-8", name: "OPERADOR", trials: 8 },
  { id: "nback-13", name: "VANGUARDIA", trials: 13 },
  { id: "nback-21", name: "CENTINELA", trials: 21 },
] as const;
type Level = (typeof levels)[number];
type Phase = "setup" | "countdown" | "trial" | "result";
type Speed = "lento" | "normal" | "rapido";
type NBackTrial = { symbol: string; match: boolean };
const SYMBOLS = ["◆", "●", "▲", "■", "✦", "⬟"];
const PERFECT = 25;
const PROGRESS = "cognition-nback-progress";
const SCORES = "cognition-nback-scores";
function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS) ?? "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}
function gamePercent(progress: Record<string, number>) {
  return Math.round(
    (levels.reduce(
      (sum, level) => sum + Math.min(progress[level.id] ?? 0, PERFECT),
      0,
    ) /
      (levels.length * PERFECT)) *
      100,
  );
}
function makeSequence(length: number): NBackTrial[] {
  const sequence: NBackTrial[] = [];
  for (let index = 0; index < length; index += 1) {
    if (index < 2) {
      sequence.push({
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        match: false,
      });
      continue;
    }
    const match = Math.random() < 0.42;
    if (match)
      sequence.push({ symbol: sequence[index - 2].symbol, match: true });
    else {
      const alternatives = SYMBOLS.filter(
        (symbol) => symbol !== sequence[index - 2].symbol,
      );
      sequence.push({
        symbol: alternatives[Math.floor(Math.random() * alternatives.length)],
        match: false,
      });
    }
  }
  const scored = sequence.slice(2);
  if (scored.length >= 2 && !scored.some((trial) => trial.match))
    sequence[2] = { symbol: sequence[0].symbol, match: true };
  if (scored.length >= 2 && scored.every((trial) => trial.match)) {
    const alternatives = SYMBOLS.filter(
      (symbol) => symbol !== sequence[1].symbol,
    );
    sequence[3] = {
      symbol: alternatives[Math.floor(Math.random() * alternatives.length)],
      match: false,
    };
  }
  return sequence;
}

export function NBackScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<Level>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [sequence, setSequence] = useState<NBackTrial[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    perfect: number;
    game: number;
  } | null>(null);
  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setInterval(
      () =>
        setCountdown((current) => {
          if (current <= 1) {
            window.clearInterval(timer);
            setIndex(0);
            setCorrect(0);
            setPhase("trial");
            return 0;
          }
          return current - 1;
        }),
      700,
    );
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "trial") return;
    const duration = speed === "lento" ? 2200 : speed === "rapido" ? 850 : 1400;
    const timer = window.setTimeout(() => {
      if (index < sequence.length - 1) setIndex((current) => current + 1);
      else finish(correct);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [phase, index, sequence, speed]);
  useEffect(() => {
    if (phase !== "setup") return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [phase]);
  const start = (nextLevel: Level) => {
    setLevel(nextLevel);
    setSequence(makeSequence(nextLevel.trials));
    setIndex(0);
    setCorrect(0);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };
  const finish = (totalCorrect: number) => {
    const scoredTrials = Math.max(sequence.length - 2, 1);
    const perfect = totalCorrect === scoredTrials;
    const next = { ...progress };
    if (perfect) next[level.id] = Math.min(PERFECT, (next[level.id] ?? 0) + 1);
    setProgress(next);
    if (perfect)
      try {
        localStorage.setItem(PROGRESS, JSON.stringify(next));
      } catch {
        /* restricted */
      }
    const data = {
      score: Math.round((totalCorrect / scoredTrials) * 100),
      correct: totalCorrect,
      total: scoredTrials,
      perfect: next[level.id] ?? 0,
      game: gamePercent(next),
    };
    setResult(data);
    setPhase("result");
    try {
      const history = JSON.parse(localStorage.getItem(SCORES) ?? "[]");
      const list = Array.isArray(history) ? history : [];
      list.push({
        ...data,
        level: level.id,
        sequence,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES, JSON.stringify(list.slice(-100)));
    } catch {
      /* restricted */
    }
  };
  const answer = (match: boolean) => {
    if (phase !== "trial" || index < 2) return;
    const isMatch = sequence[index].match;
    const next = correct + (match === isMatch ? 1 : 0);
    setCorrect(next);
    if (index < sequence.length - 1) setIndex((current) => current + 1);
    else finish(next);
  };
  const display = sequence[index]?.symbol;
  return (
    <main className="cognitive-game-screen">
      <header className="cognitive-game-header">
        <button type="button" onClick={() => navigate("/")}>
          ← MENÚ
        </button>
        <span>COGNITION // ENTRENAMIENTO 11</span>
      </header>
      {phase === "setup" && (
        <section className="cognitive-game-setup">
          <div className="cognitive-game-intro">
            <img src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span>MEMORIA DE TRABAJO // ACTUALIZACIÓN MENTAL</span>
            <h1>MEMORIA N-BACK</h1>
            <p>
              Mira un símbolo a la vez. Las dos primeras rondas son de
              preparación. Desde la tercera, responde SÍ si coincide con el
              símbolo de hace dos rondas o NO si es diferente.
            </p>
          </div>
          <div className="cognitive-speed-picker">
            <span>RITMO DE ESTÍMULOS</span>
            <div>
              {(["lento", "normal", "rapido"] as Speed[]).map((option) => (
                <button
                  className={speed === option ? "is-active" : ""}
                  type="button"
                  key={option}
                  onClick={() => setSpeed(option)}
                >
                  {option === "rapido" ? "RÁPIDO" : option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="cognitive-levels">
            {levels.map((item) => (
              <button type="button" key={item.id} onClick={() => start(item)}>
                <small>{item.trials} RONDAS</small>
                <strong>{item.name}</strong>
                <em>
                  {progress[item.id] ?? 0}/{PERFECT} PERFECTAS
                </em>
              </button>
            ))}
          </div>
        </section>
      )}
      {phase !== "setup" && (
        <section className="cognitive-game-session">
          {phase === "countdown" && (
            <div className="cognitive-countdown" key={countdown}>
              {countdown}
            </div>
          )}
          {phase === "trial" && (
            <div className="cognitive-trial nback-trial-enter" key={index}>
              <span>
                {index < 2
                  ? `PREPARACIÓN ${index + 1} / 2`
                  : `RESPUESTA ${index - 1} / ${sequence.length - 2}`}
              </span>
              <div className="nback-symbol">{display}</div>
              <p>
                {index < 2
                  ? "MEMORIZA ESTE SÍMBOLO"
                  : "COMPARA CON EL SÍMBOLO DE HACE DOS RONDAS"}
              </p>
              <strong>
                {index < 2
                  ? "PREPARACIÓN"
                  : "COMPARA, RESPONDE Y MEMORIZA ESTE SÍMBOLO"}
              </strong>
              {index < 2 ? (
                <div className="nback-preparation-note">
                  NO RESPONDAS TODAVÍA · SOLO MEMORIZA
                </div>
              ) : (
                <div className="cognitive-actions">
                  <button type="button" onClick={() => answer(true)}>
                    SÍ COINCIDE
                  </button>
                  <button type="button" onClick={() => answer(false)}>
                    NO COINCIDE
                  </button>
                </div>
              )}
            </div>
          )}
          {phase === "result" && result && (
            <div className="cognitive-result">
              <span>SESIÓN COMPLETA</span>
              <h2>
                {result.score === 100
                  ? "MEMORIA CONFIRMADA"
                  : "SESIÓN FINALIZADA"}
              </h2>
              <strong>
                {result.score}
                <small>%</small>
              </strong>
              <p>
                {result.correct} de {result.total} respuestas correctas
              </p>
              <em>
                NIVEL: {result.perfect}/{PERFECT} PERFECTAS · JUEGO:{" "}
                {result.game}%
              </em>
              <div>
                <button type="button" onClick={() => start(level)}>
                  NUEVA SESIÓN
                </button>
                <button type="button" onClick={() => setPhase("setup")}>
                  CONFIGURAR
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
