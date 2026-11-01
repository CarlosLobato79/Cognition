import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/spatial-grid.css";

const levels = [
  {
    id: "spatial-3",
    name: "INICIO",
    description: "3 posiciones · activación",
    length: 3,
    grid: 3,
  },
  {
    id: "spatial-5",
    name: "EXPLORACIÓN",
    description: "5 posiciones · enfoque inicial",
    length: 5,
    grid: 3,
  },
  {
    id: "spatial-8",
    name: "ENFOQUE",
    description: "8 posiciones · memoria activa",
    length: 8,
    grid: 4,
  },
  {
    id: "spatial-13",
    name: "PRECISIÓN",
    description: "13 posiciones · control avanzado",
    length: 13,
    grid: 5,
  },
  {
    id: "spatial-21",
    name: "DOMINIO",
    description: "21 posiciones · intensidad máxima",
    length: 21,
    grid: 5,
  },
] as const;

type TrainingLevel = (typeof levels)[number];
type Phase = "setup" | "countdown" | "show" | "select" | "result";
type Result = {
  score: number;
  correct: number;
  total: number;
  perfectRuns: number;
  gamePercent: number;
};

const PERFECT_RUNS_REQUIRED = 25;
const PROGRESS_KEY = "cognition-spatial-grid-progress";
const SCORES_KEY = "cognition-spatial-grid-scores";

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function gameProgress(progress: Record<string, number>) {
  const total = levels.length * PERFECT_RUNS_REQUIRED;
  const completed = levels.reduce(
    (sum, level) =>
      sum + Math.min(progress[level.id] ?? 0, PERFECT_RUNS_REQUIRED),
    0,
  );
  return Math.round((completed / total) * 100);
}

function createSequence(length: number, grid: number) {
  const total = grid * grid;
  const sequence: number[] = [];
  while (sequence.length < length) {
    const next = Math.floor(Math.random() * total);
    if (!sequence.includes(next)) sequence.push(next);
  }
  return sequence;
}

export function SpatialGridScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [sequence, setSequence] = useState<number[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setSequenceIndex(0);
          setPhase("show");
          return 0;
        }
        return current - 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "show") return;
    const timer = window.setTimeout(() => {
      if (sequenceIndex >= sequence.length - 1) {
        setUserSequence([]);
        setPhase("select");
      } else {
        setSequenceIndex((current) => current + 1);
      }
    }, 520);
    return () => window.clearTimeout(timer);
  }, [phase, sequenceIndex, sequence.length]);

  useEffect(() => {
    if (phase !== "setup") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  const finish = (correct: number) => {
    const perfect = correct === sequence.length;
    const nextProgress = { ...progress };
    if (perfect)
      nextProgress[activeLevel.id] = Math.min(
        PERFECT_RUNS_REQUIRED,
        (nextProgress[activeLevel.id] ?? 0) + 1,
      );
    setProgress(nextProgress);
    if (perfect) {
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
      } catch {
        /* restricted storage */
      }
    }
    const resultData = {
      score: Math.round((correct / sequence.length) * 100),
      correct,
      total: sequence.length,
      perfectRuns: nextProgress[activeLevel.id] ?? 0,
      gamePercent: gameProgress(nextProgress),
    };
    setResult(resultData);
    setPhase("result");
    try {
      const stored = JSON.parse(localStorage.getItem(SCORES_KEY) ?? "[]");
      const scores = Array.isArray(stored) ? stored : [];
      scores.push({
        ...resultData,
        level: activeLevel.id,
        sequence,
        userSequence,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100)));
    } catch {
      /* restricted storage */
    }
  };

  const startTraining = (level: TrainingLevel) => {
    setActiveLevel(level);
    setSequence(createSequence(level.length, level.grid));
    setSequenceIndex(0);
    setUserSequence([]);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };

  const selectCell = (cell: number) => {
    if (phase !== "select" || userSequence.includes(cell)) return;
    const nextUserSequence = [...userSequence, cell];
    setUserSequence(nextUserSequence);
    const position = nextUserSequence.length - 1;
    if (cell !== sequence[position]) finish(position);
    else if (nextUserSequence.length === sequence.length)
      finish(sequence.length);
  };

  return (
    <main className="spatial-grid-screen">
      {phase === "setup" && (
        <section
          className="spatial-grid-setup"
          aria-label="Configuración de Spatial Grid"
        >
          <header className="spatial-grid-header">
            <button
              className="spatial-grid-back"
              type="button"
              onClick={() => navigate("/")}
            >
              ← MENÚ
            </button>
            <span>COGNITION // ENTRENAMIENTO 04</span>
          </header>
          <div className="spatial-grid-intro">
            <img src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span>MEMORIA DE TRABAJO // CONTROL VISUOESPACIAL</span>
            <h1>MEMORIA ESPACIAL</h1>
            <p>Observa la secuencia. Repite cada posición en el mismo orden.</p>
          </div>
          <div className="spatial-grid-levels">
            {levels.map((level, index) => (
              <button
                className="spatial-grid-level"
                type="button"
                key={level.id}
                onClick={() => startTraining(level)}
              >
                <small>0{index + 1}</small>
                <strong>{level.length}</strong>
                <span>
                  <b>{level.name}</b>
                  {level.description}
                </span>
                <em>
                  {progress[level.id] ?? 0}/{PERFECT_RUNS_REQUIRED} PERFECTAS
                </em>
              </button>
            ))}
          </div>
        </section>
      )}

      {phase !== "setup" && (
        <section
          className="spatial-grid-session"
          aria-label="Sesión Spatial Grid"
        >
          {phase === "countdown" && (
            <div className="spatial-grid-countdown" key={countdown}>
              {countdown}
            </div>
          )}
          {phase === "show" && (
            <div className="spatial-grid-playback">
              <div className="spatial-grid-status">
                MEMORIZA {sequenceIndex + 1} / {sequence.length}
              </div>
              <div
                className="spatial-grid-board"
                style={
                  { "--grid-size": activeLevel.grid } as React.CSSProperties
                }
              >
                {Array.from(
                  { length: activeLevel.grid * activeLevel.grid },
                  (_, index) => (
                    <span
                      className={
                        index === sequence[sequenceIndex] ? "is-lit" : ""
                      }
                      key={index}
                    />
                  ),
                )}
              </div>
              <p>OBSERVA LA POSICIÓN ILUMINADA</p>
            </div>
          )}
          {phase === "select" && (
            <div className="spatial-grid-playback">
              <div className="spatial-grid-status">
                REPEAT {userSequence.length + 1} / {sequence.length}
              </div>
              <div
                className="spatial-grid-board"
                style={
                  { "--grid-size": activeLevel.grid } as React.CSSProperties
                }
              >
                {Array.from(
                  { length: activeLevel.grid * activeLevel.grid },
                  (_, index) => (
                    <button
                      type="button"
                      className={
                        userSequence.includes(index) ? "is-selected" : ""
                      }
                      onClick={() => selectCell(index)}
                      key={index}
                      aria-label={`Posición ${index + 1}`}
                    />
                  ),
                )}
              </div>
              <p>REPITE LA SECUENCIA EN ORDEN</p>
            </div>
          )}
          {phase === "result" && result && (
            <div className="spatial-grid-result">
              <span>SESIÓN COMPLETA</span>
              <h2>
                {result.score === 100
                  ? "SECUENCIA CONFIRMADA"
                  : "SESIÓN FINALIZADA"}
              </h2>
              <strong>
                {result.score}
                <small>%</small>
              </strong>
              <p>
                {result.correct} de {result.total} posiciones correctas
              </p>
              <em>
                NIVEL: {result.perfectRuns}/{PERFECT_RUNS_REQUIRED} PERFECTAS ·
                JUEGO: {result.gamePercent}%
              </em>
              <div>
                <button
                  type="button"
                  onClick={() => startTraining(activeLevel)}
                >
                  NUEVA SESIÓN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("setup");
                    setResult(null);
                  }}
                >
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
