import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/middle-vector.css";
import { assetUrl } from "../utils/assets";

const levels = [
  {
    id: "vector-3",
    name: "INICIO",
    description: "3 rondas · activación",
    trials: 3,
  },
  {
    id: "vector-5",
    name: "EXPLORACIÓN",
    description: "5 rondas · enfoque inicial",
    trials: 5,
  },
  {
    id: "vector-8",
    name: "ENFOQUE",
    description: "8 rondas · memoria activa",
    trials: 8,
  },
  {
    id: "vector-13",
    name: "PRECISIÓN",
    description: "13 rondas · ritmo táctico",
    trials: 13,
  },
  {
    id: "vector-21",
    name: "DOMINIO",
    description: "21 rondas · intensidad avanzada",
    trials: 21,
  },
] as const;

type TrainingLevel = (typeof levels)[number];

const PERFECT_RUNS_REQUIRED = 25;
const PROGRESS_KEY = "cognition-middle-vector-progress";
const SCORES_KEY = "cognition-middle-vector-scores";

type Direction = "left" | "right";
type Phase = "setup" | "countdown" | "trial" | "result";
type Trial = { middle: Direction; flank: Direction };
type Response = { correct: boolean; reactionMs: number };

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function createTrial(): Trial {
  const middle: Direction = Math.random() > 0.5 ? "left" : "right";
  const flank =
    Math.random() > 0.5 ? middle : middle === "left" ? "right" : "left";
  return { middle, flank };
}

function createTrials(count: number) {
  return Array.from({ length: count }, createTrial);
}

function directionSymbol(direction: Direction) {
  return direction === "left" ? "←" : "→";
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

export function MiddleVectorScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [trialStartedAt, setTrialStartedAt] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    perfectRuns: number;
    gamePercent: number;
  } | null>(null);

  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTrialIndex(0);
          setTrialStartedAt(Date.now());
          setPhase("trial");
          return 0;
        }
        return current - 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "setup") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  const startTraining = (level: TrainingLevel) => {
    setActiveLevel(level);
    setTrials(createTrials(level.trials));
    setResponses([]);
    setTrialIndex(0);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };

  const answer = (direction: Direction) => {
    if (phase !== "trial" || !trials[trialIndex]) return;
    const trial = trials[trialIndex];
    const response = {
      correct: direction === trial.middle,
      reactionMs: Date.now() - trialStartedAt,
    };
    const nextResponses = [...responses, response];
    setResponses(nextResponses);

    if (trialIndex < trials.length - 1) {
      setTrialIndex((current) => current + 1);
      setTrialStartedAt(Date.now());
      return;
    }

    const correct = nextResponses.filter((item) => item.correct).length;
    const perfect = correct === trials.length;
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
      score: Math.round((correct / trials.length) * 100),
      correct,
      total: trials.length,
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
        responses: nextResponses,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100)));
    } catch {
      /* restricted storage */
    }
  };

  return (
    <main className="middle-vector-screen">
      {phase === "setup" && (
        <section
          className="middle-vector-setup"
          aria-label="Configuración de Middle Vector"
        >
          <header className="middle-vector-header">
            <button
              className="middle-vector-back"
              type="button"
              onClick={() => navigate("/")}
            >
              ← MENÚ
            </button>
            <span>COGNITION // ENTRENAMIENTO 02</span>
          </header>
          <div className="middle-vector-intro">
            <img src={assetUrl("assets/cognition-brain-logo.png")} alt="Cognition" />
            <span>ATENCIÓN // CONTROL INHIBITORIO</span>
            <h1>ATENCIÓN CENTRAL</h1>
            <p>
              Enfócate en el centro. Ignora los distractores. Responde tan
              rápido como puedas.
            </p>
          </div>
          <div className="middle-vector-levels">
            {levels.map((level, index) => (
              <button
                className="middle-vector-level"
                type="button"
                key={level.id}
                onClick={() => startTraining(level)}
              >
                <small>0{index + 1}</small>
                <strong>{level.trials}</strong>
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
          className="middle-vector-session"
          aria-label="Sesión Middle Vector"
        >
          {phase === "countdown" && (
            <div className="middle-vector-countdown" key={countdown}>
              {countdown}
            </div>
          )}

          {phase === "trial" && trials[trialIndex] && (
            <div className="middle-vector-trial">
              <div className="middle-vector-status">
                RONDA {trialIndex + 1} / {trials.length}
              </div>
              <div className="arrow-row" aria-label="Estímulo central">
                {Array.from({ length: 5 }, (_, index) => (
                  <span className={index === 2 ? "is-middle" : ""} key={index}>
                    {directionSymbol(
                      index === 2
                        ? trials[trialIndex].middle
                        : trials[trialIndex].flank,
                    )}
                  </span>
                ))}
              </div>
              <p>RESPONDE SEGÚN LA FLECHA CENTRAL</p>
              <div className="middle-vector-actions">
                <button
                  type="button"
                  onClick={() => answer("left")}
                  aria-label="Flecha izquierda"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => answer("right")}
                  aria-label="Flecha derecha"
                >
                  →
                </button>
              </div>
            </div>
          )}

          {phase === "result" && result && (
            <div className="middle-vector-result">
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
