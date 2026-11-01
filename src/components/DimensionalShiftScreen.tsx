import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dimensional-shift.css";
import { assetUrl } from "../utils/assets";

const levels = [
  {
    id: "shift-3",
    name: "INICIO",
    description: "3 rondas · activación",
    trials: 3,
  },
  {
    id: "shift-5",
    name: "EXPLORACIÓN",
    description: "5 rondas · cambio inicial",
    trials: 5,
  },
  {
    id: "shift-8",
    name: "ENFOQUE",
    description: "8 rondas · flexibilidad activa",
    trials: 8,
  },
  {
    id: "shift-13",
    name: "PRECISIÓN",
    description: "13 rondas · reglas variables",
    trials: 13,
  },
  {
    id: "shift-21",
    name: "DOMINIO",
    description: "21 rondas · cambio avanzado",
    trials: 21,
  },
] as const;

const colors = [
  { id: "red", name: "ROJO", hex: "#ff5f6d" },
  { id: "blue", name: "AZUL", hex: "#55b9ff" },
] as const;
const shapes = ["CÍRCULO", "CUADRADO"] as const;
type Rule = "color" | "shape";
type ColorId = (typeof colors)[number]["id"];
type Shape = (typeof shapes)[number];
type TrainingLevel = (typeof levels)[number];
type Phase = "setup" | "countdown" | "trial" | "result";
type Trial = { rule: Rule; color: ColorId; shape: Shape };
type Response = { correct: boolean; reactionMs: number };

const PERFECT_RUNS_REQUIRED = 25;
const PROGRESS_KEY = "cognition-dimensional-shift-progress";
const SCORES_KEY = "cognition-dimensional-shift-scores";

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function createTrials(length: number): Trial[] {
  let previousRule: Rule = Math.random() > 0.5 ? "color" : "shape";
  return Array.from({ length }, (_, index) => {
    const rule: Rule =
      index === 0
        ? previousRule
        : Math.random() < 0.38
          ? previousRule === "color"
            ? "shape"
            : "color"
          : previousRule;
    previousRule = rule;
    return {
      rule,
      color: colors[Math.floor(Math.random() * colors.length)].id,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  });
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

export function DimensionalShiftScreen() {
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

  const answer = (value: string) => {
    if (phase !== "trial" || !trials[trialIndex]) return;
    const trial = trials[trialIndex];
    const expected = trial.rule === "color" ? trial.color : trial.shape;
    const response = {
      correct: value === expected,
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
        trials,
        responses: nextResponses,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100)));
    } catch {
      /* restricted storage */
    }
  };

  const trial = trials[trialIndex];
  const activeColor = colors.find((color) => color.id === trial?.color);

  return (
    <main className="dimensional-shift-screen">
      {phase === "setup" && (
        <section
          className="dimensional-shift-setup"
          aria-label="Configuración de Dimensional Shift"
        >
          <header className="dimensional-shift-header">
            <button type="button" onClick={() => navigate("/")}>
              ← MENÚ
            </button>
            <span>COGNITION // ENTRENAMIENTO 05</span>
          </header>
          <div className="dimensional-shift-intro">
            <img src={assetUrl("assets/cognition-brain-logo.png")} alt="Cognition" />
            <span>FUNCIÓN EJECUTIVA // CAMBIO DE REGLA</span>
            <h1>CAMBIO DE REGLA</h1>
            <p>Cambia la regla. Clasifica el estímulo. Mantén el control.</p>
          </div>
          <div className="dimensional-shift-levels">
            {levels.map((level, index) => (
              <button
                className="dimensional-shift-level"
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
          className="dimensional-shift-session"
          aria-label="Sesión Dimensional Shift"
        >
          {phase === "countdown" && (
            <div className="dimensional-shift-countdown" key={countdown}>
              {countdown}
            </div>
          )}
          {phase === "trial" && trial && (
            <div className="dimensional-shift-trial">
              <div className="dimensional-shift-status">
                ROUND {trialIndex + 1} / {trials.length}
              </div>
              <div className="shift-rule">
                REGLA ACTUAL:{" "}
                <b>{trial.rule === "color" ? "COLOR" : "FORMA"}</b>
              </div>
              <div
                className={`shift-stimulus ${trial.shape === "CÍRCULO" ? "is-circle" : "is-square"}`}
                style={{ background: activeColor?.hex }}
                aria-label="Estímulo"
              />
              <p>CLASIFICA SEGÚN LA REGLA</p>
              <div className="dimensional-shift-actions">
                {(trial.rule === "color"
                  ? colors.map((color) => ({
                      value: color.id,
                      label: color.name,
                      color: color.hex,
                    }))
                  : shapes.map((shape) => ({
                      value: shape,
                      label: shape,
                      color: "#b0f554",
                    }))
                ).map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    style={
                      { "--option-color": option.color } as React.CSSProperties
                    }
                    onClick={() => answer(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {phase === "result" && result && (
            <div className="dimensional-shift-result">
              <span>SESSION COMPLETE</span>
              <h2>
                {result.score === 100
                  ? "CAMBIO CONFIRMADO"
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
