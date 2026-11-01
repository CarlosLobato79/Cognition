import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cognitive-games.css";

const levels = [
  { id: "nback-3", name: "INICIO", trials: 3 },
  { id: "nback-5", name: "EXPLORACIÓN", trials: 5 },
  { id: "nback-8", name: "ENFOQUE", trials: 8 },
  { id: "nback-13", name: "PRECISIÓN", trials: 13 },
  { id: "nback-21", name: "DOMINIO", trials: 21 },
] as const;

type Level = (typeof levels)[number];
type Phase = "setup" | "countdown" | "trial" | "result";
type Speed = "lento" | "normal" | "rapido";
type Block = { first: string; second: string; answer: string; match: boolean };

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

function randomSymbol(exclude?: string) {
  const pool = exclude
    ? SYMBOLS.filter((symbol) => symbol !== exclude)
    : SYMBOLS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function createBlock(): Block {
  const first = randomSymbol();
  const second = randomSymbol();
  const match = Math.random() > 0.5;
  return { first, second, answer: match ? first : randomSymbol(first), match };
}

export function NBackScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<Level>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [block, setBlock] = useState<Block>(createBlock);
  const [blockIndex, setBlockIndex] = useState(0);
  const [step, setStep] = useState(0);
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
            setStep(0);
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
      if (step < 2) setStep((current) => current + 1);
      else completeBlock(correct);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [phase, step, block, speed]);

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
    setBlock(createBlock());
    setBlockIndex(0);
    setStep(0);
    setCorrect(0);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };

  const completeBlock = (totalCorrect: number) => {
    if (blockIndex < level.trials - 1) {
      setCorrect(totalCorrect);
      setBlockIndex((current) => current + 1);
      setBlock(createBlock());
      setStep(0);
      return;
    }
    const perfect = totalCorrect === level.trials;
    const next = { ...progress };
    if (perfect) next[level.id] = Math.min(PERFECT, (next[level.id] ?? 0) + 1);
    setProgress(next);
    if (perfect) {
      try {
        localStorage.setItem(PROGRESS, JSON.stringify(next));
      } catch {
        /* restricted */
      }
    }
    const data = {
      score: Math.round((totalCorrect / level.trials) * 100),
      correct: totalCorrect,
      total: level.trials,
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
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES, JSON.stringify(list.slice(-100)));
    } catch {
      /* restricted */
    }
  };

  const answer = (match: boolean) => {
    if (phase !== "trial" || step !== 2) return;
    completeBlock(correct + (match === block.match ? 1 : 0));
  };

  const display =
    step === 0 ? block.first : step === 1 ? block.second : block.answer;
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
              Memoriza dos símbolos. En el tercero, compara con el primero y
              responde. Después comenzará un bloque nuevo.
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
                <small>{item.trials} BLOQUES</small>
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
            <div
              className="cognitive-trial nback-trial-enter"
              key={`${blockIndex}-${step}`}
            >
              <span>
                {step < 2
                  ? `MEMORIZA ${step + 1} / 2`
                  : `RESPUESTA · BLOQUE ${blockIndex + 1} / ${level.trials}`}
              </span>
              <div className="nback-symbol">{display}</div>
              <p>
                {step < 2
                  ? "MEMORIZA ESTE SÍMBOLO"
                  : "COMPARA CON EL PRIMER SÍMBOLO DEL BLOQUE"}
              </p>
              <strong>{step < 2 ? "PREPARACIÓN" : "ELIGE UNA OPCIÓN"}</strong>
              {step < 2 ? (
                <div className="nback-preparation-note">
                  NO RESPONDAS · SOLO MEMORIZA
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
                {result.correct} de {result.total} bloques correctos
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
