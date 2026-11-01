import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/stroop-protocol.css";

const levels = [
  {
    id: "stroop-3",
    name: "INICIO",
    description: "3 rondas · activación",
    trials: 3,
  },
  {
    id: "stroop-5",
    name: "EXPLORACIÓN",
    description: "5 rondas · enfoque inicial",
    trials: 5,
  },
  {
    id: "stroop-8",
    name: "ENFOQUE",
    description: "8 rondas · control activo",
    trials: 8,
  },
  {
    id: "stroop-13",
    name: "PRECISIÓN",
    description: "13 rondas · ritmo táctico",
    trials: 13,
  },
  {
    id: "stroop-21",
    name: "DOMINIO",
    description: "21 rondas · intensidad avanzada",
    trials: 21,
  },
] as const;

const colors = [
  { id: "red", name: "ROJO", hex: "#ff5f6d" },
  { id: "blue", name: "AZUL", hex: "#55b9ff" },
  { id: "green", name: "VERDE", hex: "#b0f554" },
  { id: "yellow", name: "AMARILLO", hex: "#ffd166" },
] as const;

type TrainingLevel = (typeof levels)[number];
type ColorId = (typeof colors)[number]["id"];
type Phase = "setup" | "countdown" | "trial" | "result";
type Trial = { word: ColorId; ink: ColorId };
type Response = { correct: boolean; reactionMs: number };

const PERFECT_RUNS_REQUIRED = 25;
const PROGRESS_KEY = "cognition-stroop-protocol-progress";
const SCORES_KEY = "cognition-stroop-protocol-scores";

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function createTrial(): Trial {
  const word = colors[Math.floor(Math.random() * colors.length)].id;
  let ink = colors[Math.floor(Math.random() * colors.length)].id;
  if (Math.random() < 0.7) {
    const different = colors.filter((color) => color.id !== word);
    ink = different[Math.floor(Math.random() * different.length)].id;
  }
  return { word, ink };
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

export function StroopProtocolScreen() {
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
    setTrials(Array.from({ length: level.trials }, createTrial));
    setResponses([]);
    setTrialIndex(0);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };

  const answer = (colorId: ColorId) => {
    if (phase !== "trial" || !trials[trialIndex]) return;
    const trial = trials[trialIndex];
    const response = {
      correct: colorId === trial.ink,
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
    <main className="stroop-protocol-screen">
      {phase === "setup" && (
        <section
          className="stroop-protocol-setup"
          aria-label="Configuración de Stroop Protocol"
        >
          <header className="stroop-protocol-header">
            <button
              className="stroop-protocol-back"
              type="button"
              onClick={() => navigate("/")}
            >
              ← MENÚ
            </button>
            <span>COGNITION // ENTRENAMIENTO 03</span>
          </header>
          <div className="stroop-protocol-intro">
            <img src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span>FUNCIÓN EJECUTIVA // CONTROL INHIBITORIO</span>
            <h1>CONTROL DE COLORES</h1>
            <p>Ignora la palabra. Responde según el color de la tinta.</p>
          </div>
          <div className="stroop-protocol-levels">
            {levels.map((level, index) => (
              <button
                className="stroop-protocol-level"
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
          className="stroop-protocol-session"
          aria-label="Sesión Stroop Protocol"
        >
          {phase === "countdown" && (
            <div className="stroop-protocol-countdown" key={countdown}>
              {countdown}
            </div>
          )}

          {phase === "trial" && trials[trialIndex] && (
            <div className="stroop-protocol-trial">
              <div className="stroop-protocol-status">
                RONDA {trialIndex + 1} / {trials.length}
              </div>
              <div
                className="stroop-word"
                style={{
                  color: colors.find(
                    (color) => color.id === trials[trialIndex].ink,
                  )?.hex,
                }}
              >
                {
                  colors.find((color) => color.id === trials[trialIndex].word)
                    ?.name
                }
              </div>
              <p>RESPONDE SEGÚN EL COLOR DE LA TINTA</p>
              <div className="stroop-protocol-actions">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    style={
                      { "--option-color": color.hex } as React.CSSProperties
                    }
                    onClick={() => answer(color.id)}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "result" && result && (
            <div className="stroop-protocol-result">
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
