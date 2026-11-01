import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cognitive-games.css";

const levels = [
  { id: "gng-3", name: "INICIO", trials: 3 },
  { id: "gng-5", name: "EXPLORACIÓN", trials: 5 },
  { id: "gng-8", name: "ENFOQUE", trials: 8 },
  { id: "gng-13", name: "PRECISIÓN", trials: 13 },
  { id: "gng-21", name: "DOMINIO", trials: 21 },
] as const;
type Level = (typeof levels)[number];
type Trial = { go: boolean };
type Phase = "setup" | "countdown" | "trial" | "result";
type Speed = "lento" | "normal" | "rapido";
const PERFECT = 25;
const PROGRESS = "cognition-go-no-go-progress";
const SCORES = "cognition-go-no-go-scores";

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

function createTrials(length: number): Trial[] {
  const required = [{ go: true }, { go: false }];
  const remaining = Array.from(
    { length: Math.max(0, length - required.length) },
    () => ({ go: Math.random() > 0.45 }),
  );
  return [...required, ...remaining].sort(() => Math.random() - 0.5);
}

export function GoNoGoScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<Level>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [trials, setTrials] = useState<Trial[]>([]);
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
    const duration = speed === "lento" ? 1600 : speed === "rapido" ? 650 : 1000;
    const timer = window.setTimeout(() => {
      const nextCorrect = correct + (trials[index]?.go ? 0 : 1);
      setCorrect(nextCorrect);
      if (index < trials.length - 1) setIndex((current) => current + 1);
      else finish(nextCorrect);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [phase, index, trials, speed]);
  useEffect(() => {
    if (phase !== "setup") return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [phase]);

  const start = (nextLevel: Level) => {
    const nextTrials = createTrials(nextLevel.trials);
    setLevel(nextLevel);
    setTrials(nextTrials);
    setIndex(0);
    setCorrect(0);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };
  const finish = (totalCorrect: number) => {
    const perfect = totalCorrect === trials.length;
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
      score: Math.round((totalCorrect / trials.length) * 100),
      correct: totalCorrect,
      total: trials.length,
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
        trials,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES, JSON.stringify(list.slice(-100)));
    } catch {
      /* restricted */
    }
  };
  const answer = (go: boolean) => {
    if (phase !== "trial" || !trials[index]) return;
    if (go === trials[index].go) setCorrect((current) => current + 1);
    if (index < trials.length - 1) setIndex((current) => current + 1);
    else finish(correct + (go === trials[index].go ? 1 : 0));
  };

  return (
    <main className="cognitive-game-screen">
      <header className="cognitive-game-header">
        <button type="button" onClick={() => navigate("/")}>
          ← MENÚ
        </button>
        <span>COGNITION // ENTRENAMIENTO 10</span>
      </header>
      {phase === "setup" && (
        <section className="cognitive-game-setup">
          <div className="cognitive-game-intro">
            <img src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span>FUNCIÓN EJECUTIVA // CONTROL INHIBITORIO</span>
            <h1>INHIBICIÓN</h1>
            <p>
              Presiona RESPONDER cuando veas el círculo verde. Si aparece la X
              roja, no toques nada.
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
            <div className="cognitive-trial gng-trial-enter" key={index}>
              <span>
                NUEVA SEÑAL · RONDA {index + 1} / {trials.length}
              </span>
              <p className="cognitive-instruction">
                CÍRCULO VERDE = TOCA · X ROJA = NO TOQUES NADA
              </p>
              <div
                key={index}
                className={`gng-stimulus ${trials[index]?.go ? "is-go" : "is-stop"}`}
              >
                {trials[index]?.go ? "●" : "✕"}
              </div>
              <strong>
                {trials[index]?.go ? "TOCA RESPONDER" : "NO TOQUES NADA"}
              </strong>
              <div className="cognitive-actions">
                <button type="button" onClick={() => answer(true)}>
                  RESPONDER
                </button>
              </div>
            </div>
          )}
          {phase === "result" && result && (
            <div className="cognitive-result">
              <span>SESIÓN COMPLETA</span>
              <h2>
                {result.score === 100
                  ? "CONTROL CONFIRMADO"
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
