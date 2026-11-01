import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/list-sorting.css";

const levels = [
  {
    id: "sorting-3",
    name: "INICIO",
    description: "3 elementos · activación",
    length: 3,
  },
  {
    id: "sorting-5",
    name: "EXPLORACIÓN",
    description: "5 elementos · memoria inicial",
    length: 5,
  },
  {
    id: "sorting-8",
    name: "ENFOQUE",
    description: "8 elementos · organización activa",
    length: 8,
  },
  {
    id: "sorting-13",
    name: "PRECISIÓN",
    description: "13 elementos · manipulación mental",
    length: 13,
  },
  {
    id: "sorting-21",
    name: "DOMINIO",
    description: "21 elementos · memoria avanzada",
    length: 21,
  },
] as const;

const items = [
  ["ABEJA", "INSECTO"],
  ["RANA", "ANFIBIO"],
  ["GATO", "MAMÍFERO"],
  ["PERRO", "MAMÍFERO"],
  ["ZORRO", "MAMÍFERO"],
  ["LOBO", "MAMÍFERO"],
  ["MONO", "MAMÍFERO"],
  ["PANDA", "MAMÍFERO"],
  ["KOALA", "MAMÍFERO"],
  ["PINGÜINO", "AVE"],
  ["TORTUGA", "REPTIL"],
  ["SERPIENTE", "REPTIL"],
  ["COCODRILO", "REPTIL"],
  ["CEBRA", "MAMÍFERO"],
  ["TIGRE", "MAMÍFERO"],
  ["LEÓN", "MAMÍFERO"],
  ["JIRAFA", "MAMÍFERO"],
  ["OSO", "MAMÍFERO"],
  ["ELEFANTE", "MAMÍFERO"],
  ["BALLENA", "MARINO"],
  ["ÁGUILA", "AVE"],
] as const;

type Item = { name: string; category: string; rank: number };
type TrainingLevel = (typeof levels)[number];
type Phase = "setup" | "countdown" | "show" | "select" | "result";
type Response = { correct: boolean; reactionMs: number };

const PERFECT_RUNS_REQUIRED = 25;
const PROGRESS_KEY = "cognition-list-sorting-progress";
const SCORES_KEY = "cognition-list-sorting-scores";

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function createList(length: number): Item[] {
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, length)
    .map(([name, category]) => ({
      name,
      category,
      rank: items.findIndex((item) => item[0] === name) + 1,
    }));
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

export function ListSortingScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [activeLevel, setActiveLevel] = useState<TrainingLevel>(levels[0]);
  const [progress, setProgress] =
    useState<Record<string, number>>(readProgress);
  const [list, setList] = useState<Item[]>([]);
  const [showIndex, setShowIndex] = useState(0);
  const [selected, setSelected] = useState<Item[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    perfectRuns: number;
    gamePercent: number;
  } | null>(null);

  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setInterval(
      () =>
        setCountdown((current) => {
          if (current <= 1) {
            window.clearInterval(timer);
            setShowIndex(0);
            setPhase("show");
            return 0;
          }
          return current - 1;
        }),
      700,
    );
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "show") return;
    const timer = window.setTimeout(() => {
      if (showIndex >= list.length - 1) {
        setSelected([]);
        setStartedAt(Date.now());
        setPhase("select");
      } else setShowIndex((current) => current + 1);
    }, 560);
    return () => window.clearTimeout(timer);
  }, [phase, showIndex, list.length]);

  useEffect(() => {
    if (phase !== "setup") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  const startTraining = (level: TrainingLevel) => {
    setActiveLevel(level);
    setList(createList(level.length));
    setShowIndex(0);
    setSelected([]);
    setCountdown(3);
    setResult(null);
    setPhase("countdown");
  };

  const finish = (correct: number, responses: Response[]) => {
    const perfect = correct === list.length;
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
      score: Math.round((correct / list.length) * 100),
      correct,
      total: list.length,
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
        list,
        selected,
        responses,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(-100)));
    } catch {
      /* restricted storage */
    }
  };

  const choose = (item: Item) => {
    if (
      phase !== "select" ||
      selected.some((entry) => entry.name === item.name)
    )
      return;
    const nextSelected = [...selected, item];
    setSelected(nextSelected);
    const expected = [...list].sort((a, b) => a.rank - b.rank)[
      nextSelected.length - 1
    ];
    const response = {
      correct: item.name === expected.name,
      reactionMs: Date.now() - startedAt,
    };
    const responses: Response[] = nextSelected.map((entry, index) => ({
      correct:
        entry.name === [...list].sort((a, b) => a.rank - b.rank)[index].name,
      reactionMs: response.reactionMs,
    }));
    if (!response.correct)
      finish(
        nextSelected.filter(
          (entry, index) =>
            entry.name ===
            [...list].sort((a, b) => a.rank - b.rank)[index]?.name,
        ).length,
        responses,
      );
    else if (nextSelected.length === list.length)
      finish(list.length, responses);
  };

  return (
    <main className="list-sorting-screen">
      {phase === "setup" && (
        <section
          className="list-sorting-setup"
          aria-label="Configuración de Ordenamiento Mental"
        >
          <header className="list-sorting-header">
            <button type="button" onClick={() => navigate("/")}>
              ← MENÚ
            </button>
            <span>COGNITION // ENTRENAMIENTO 07</span>
          </header>
          <div className="list-sorting-intro">
            <img src="/assets/cognition-brain-logo.png" alt="Cognition" />
            <span>MEMORIA DE TRABAJO // ORGANIZACIÓN MENTAL</span>
            <h1>ORDENAMIENTO MENTAL</h1>
            <p>Memoriza la lista y ordénala de menor a mayor.</p>
          </div>
          <div className="list-sorting-levels">
            {levels.map((level, index) => (
              <button
                className="list-sorting-level"
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
          className="list-sorting-session"
          aria-label="Sesión List Sorting"
        >
          {phase === "countdown" && (
            <div className="list-sorting-countdown" key={countdown}>
              {countdown}
            </div>
          )}
          {phase === "show" && list[showIndex] && (
            <div className="list-sorting-playback">
              <div className="list-sorting-status">
                MEMORIZE {showIndex + 1} / {list.length}
              </div>
              <div className="sorting-item">
                <strong>{list[showIndex].name}</strong>
                <span>{list[showIndex].category}</span>
              </div>
              <p>OBSERVA Y RECUERDA</p>
            </div>
          )}
          {phase === "select" && (
            <div className="list-sorting-playback">
              <div className="list-sorting-status">
                ORDER {selected.length + 1} / {list.length}
              </div>
              <p>SELECCIONA DE MENOR A MAYOR</p>
              <div className="sorting-options">
                {list.map((item) => (
                  <button
                    type="button"
                    className={
                      selected.some((entry) => entry.name === item.name)
                        ? "is-selected"
                        : ""
                    }
                    disabled={selected.some(
                      (entry) => entry.name === item.name,
                    )}
                    onClick={() => choose(item)}
                    key={item.name}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {phase === "result" && result && (
            <div className="list-sorting-result">
              <span>SESSION COMPLETE</span>
              <h2>
                {result.score === 100
                  ? "ORDEN CONFIRMADO"
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
