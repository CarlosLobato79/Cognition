import { useEffect, useState } from "react";
import { animate } from "animejs";
import { useNavigate } from "react-router-dom";
import "../styles/cognitive-games.css";

const levels = [
  { id: "search-3", name: "RECLUTA", trials: 3 },
  { id: "search-5", name: "RASTREADOR", trials: 5 },
  { id: "search-8", name: "OPERADOR", trials: 8 },
  { id: "search-13", name: "VANGUARDIA", trials: 13 },
  { id: "search-21", name: "CENTINELA", trials: 21 },
] as const;
type Level = (typeof levels)[number];
type Phase = "setup" | "countdown" | "trial" | "result";
type Item = {
  targetShape: string;
  distractorShape: string;
  target: boolean;
  targetCell: number;
};
type Speed = "lento" | "normal" | "rapido";
type Mode = "practica" | "evaluacion";
const SHAPES = ["●", "■", "▲", "◆"];
const PERFECT = 25;
const PROGRESS = "cognition-visual-search-progress";
const SCORES = "cognition-visual-search-scores";
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
function makeTrial(): Item {
  const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const distractors = SHAPES.filter((shape) => shape !== targetShape);
  const distractorShape =
    distractors[Math.floor(Math.random() * distractors.length)];
  const target = Math.random() > 0.25;
  return {
    targetShape,
    distractorShape,
    target,
    targetCell: Math.floor(Math.random() * 16),
  };
}

export function VisualSearchScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<Level>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [mode, setMode] = useState<Mode>("practica");
  const [revealed, setRevealed] = useState(false);
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
    if (phase !== "trial" || mode === "practica" || !revealed) return;
    const duration = speed === "lento" ? 1800 : speed === "rapido" ? 700 : 1200;
    const timer = window.setTimeout(() => {
      if (index < items.length - 1) {
        setRevealed(false);
        setIndex((current) => current + 1);
      } else finish(correct + (items[index]?.target ? 0 : 1));
    }, duration);
    return () => window.clearTimeout(timer);
  }, [phase, index, items, speed, mode, revealed]);
  useEffect(() => {
    if (!revealed) return;
    const cells = document.querySelectorAll(".visual-search-reveal-stage span");
    const animation = animate(cells, {
      opacity: [0, 1],
      scale: [0.35, 1],
      rotate: [90, 0],
      delay: (_element, cellIndex) => (cellIndex ?? 0) * 38,
      duration: 460,
      ease: "outBack",
    });
    return () => {
      animation.pause();
    };
  }, [revealed, index]);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = phase === "setup" ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [phase]);
  const start = (nextLevel: Level) => {
    setLevel(nextLevel);
    setItems(Array.from({ length: nextLevel.trials }, makeTrial));
    setIndex(0);
    setRevealed(false);
    setCorrect(0);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };
  const finish = (totalCorrect: number) => {
    const perfect = totalCorrect === items.length;
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
      score: Math.round((totalCorrect / items.length) * 100),
      correct: totalCorrect,
      total: items.length,
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
        items,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES, JSON.stringify(list.slice(-100)));
    } catch {
      /* restricted */
    }
  };
  const answer = (found: boolean) => {
    if (phase !== "trial" || !items[index] || !revealed) return;
    const right = found === items[index].target;
    const next = correct + (right ? 1 : 0);
    setCorrect(next);
    if (index < items.length - 1) {
      setRevealed(false);
      setIndex((current) => current + 1);
    } else finish(next);
  };
  return (
    <main className="cognitive-game-screen">
      <header className="cognitive-game-header">
        <button type="button" onClick={() => navigate("/")}>
          ← MENÚ
        </button>
        <span>COGNITION // ENTRENAMIENTO 12</span>
      </header>
      {phase === "setup" && (
        <section className="cognitive-game-setup">
          <div className="cognitive-game-intro">
            <img src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span>ATENCIÓN // BÚSQUEDA VISUAL</span>
            <h1>BÚSQUEDA VISUAL</h1>
            <p>
              Busca la figura objetivo entre figuras distractoras. Responde si
              aparece o no aparece.
            </p>
          </div>
          <div className="cognitive-game-options">
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
            <div className="cognitive-speed-picker">
              <span>MODO DE ENTRENAMIENTO</span>
              <div>
                {(["practica", "evaluacion"] as Mode[]).map((option) => (
                  <button
                    className={mode === option ? "is-active" : ""}
                    type="button"
                    key={option}
                    onClick={() => setMode(option)}
                  >
                    {option === "practica"
                      ? "PRÁCTICA · SIN TIEMPO"
                      : "EVALUACIÓN · CON TIEMPO"}
                  </button>
                ))}
              </div>
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
            <div className="cognitive-trial" key={index}>
              <span>
                NUEVA BÚSQUEDA · RONDA {index + 1} / {items.length}
              </span>
              <strong className="visual-search-target">
                BUSCA: {items[index]?.targetShape}
              </strong>
              {!revealed ? (
                <>
                  <div className="search-field is-covered">
                    {Array.from({ length: 16 }, (_, cell) => (
                      <span key={cell}>?</span>
                    ))}
                  </div>
                  <strong className="visual-search-ready">
                    PRESIONA PARA BUSCAR
                  </strong>
                  <button
                    className="visual-search-reveal"
                    type="button"
                    onClick={() => setRevealed(true)}
                  >
                    BUSCAR AHORA
                  </button>
                </>
              ) : (
                <>
                  <div className="search-field visual-search-reveal-stage">
                    {Array.from({ length: 16 }, (_, cell) => {
                      const isTargetCell =
                        items[index]?.target &&
                        cell === items[index]?.targetCell;
                      return (
                        <span
                          className={isTargetCell ? "is-target" : ""}
                          key={cell}
                        >
                          {isTargetCell
                            ? items[index]?.targetShape
                            : items[index]?.distractorShape}
                        </span>
                      );
                    })}
                  </div>
                  <strong className="visual-search-ready">
                    RESPONDE AHORA: ¿APARECE {items[index]?.targetShape}?
                  </strong>
                  <div className="cognitive-actions">
                    <button type="button" onClick={() => answer(true)}>
                      SÍ, APARECE
                    </button>
                    <button type="button" onClick={() => answer(false)}>
                      NO, NO APARECE
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {phase === "result" && result && (
            <div className="cognitive-result">
              <span>SESIÓN COMPLETA</span>
              <h2>
                {result.score === 100
                  ? "ATENCIÓN CONFIRMADA"
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
