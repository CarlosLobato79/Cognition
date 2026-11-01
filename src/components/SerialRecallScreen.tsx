import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useNavigate } from 'react-router-dom'
import '../styles/serial-recall.css'

const silhouettes = [
  { name: 'Perro', image: '/assets/animals/perro.png' },
  { name: 'Gato', image: '/assets/animals/gato.png' },
  { name: 'León', image: '/assets/animals/leon.png' },
  { name: 'Tigre', image: '/assets/animals/tigre.png' },
  { name: 'Elefante', image: '/assets/animals/elefante.png' },
]

export function SerialRecallScreen() {
  const navigate = useNavigate()
  const [sequence, setSequence] = useState(() => silhouettes.slice(0, 3))
  const sequenceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const shuffled = [...silhouettes].sort(() => Math.random() - 0.5)
      setSequence(shuffled.slice(0, 3))
    }, 4200)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!sequenceRef.current) return

    const transition = animate(sequenceRef.current.querySelectorAll('.preview-silhouette'), {
      opacity: [0, 1],
      scale: [0.98, 1],
      delay: (_element, index) => (index ?? 0) * 220,
      duration: 1600,
      ease: 'inOutSine',
    })

    return () => {
      transition.pause()
    }
  }, [sequence])

  return (
    <main className="serial-recall-screen">
      <header className="training-header">
        <button className="back-button" type="button" onClick={() => navigate('/')}>
          ← MENU
        </button>
        <span className="training-code">COGNITION // TRAINING 01</span>
      </header>

      <section className="training-intro">
        <span className="training-kicker">WORKING MEMORY</span>
        <h1>IMMEDIATE SERIAL RECALL</h1>
        <p>Memorize the sequence. Reproduce it in the exact order.</p>
      </section>

      <section ref={sequenceRef} className="preview-sequence" aria-label="Vista previa de la secuencia">
        {sequence.map((silhouette, index) => (
          <div className="preview-silhouette" key={`${silhouette.name}-${index}`}>
            <img src={silhouette.image} alt="" />
          </div>
        ))}
      </section>

      <section className="training-info" aria-label="Información psicológica del ejercicio">
        <div className="training-definition">
          <span className="training-info-kicker">DEFINICIÓN PSICOLÓGICA</span>
          <p>
            El recuerdo serial inmediato evalúa la capacidad de mantener una secuencia breve en la memoria de trabajo y reproducirla en el orden exacto en que fue presentada.
          </p>
        </div>
        <div className="training-features">
          <span className="training-info-kicker">ENTRENA</span>
          <ul>
            <li>Retención visual temporal</li>
            <li>Asociación imagen-nombre</li>
            <li>Recuerdo del orden serial</li>
            <li>Atención sostenida</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
