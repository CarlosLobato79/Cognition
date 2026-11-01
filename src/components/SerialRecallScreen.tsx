import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import '../styles/serial-recall.css'

const silhouettes = [
  { name: 'Perro', image: '/assets/animals/perro.png' },
  { name: 'Gato', image: '/assets/animals/gato.png' },
  { name: 'León', image: '/assets/animals/leon.png' },
  { name: 'Tigre', image: '/assets/animals/tigre.png' },
  { name: 'Elefante', image: '/assets/animals/elefante.png' },
]

type SerialRecallScreenProps = {
  onBack: () => void
}

export function SerialRecallScreen({ onBack }: SerialRecallScreenProps) {
  const [sequence, setSequence] = useState(() => silhouettes.slice(0, 3))
  const sequenceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const shuffled = [...silhouettes].sort(() => Math.random() - 0.5)
      setSequence(shuffled.slice(0, 3))
    }, 2200)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!sequenceRef.current) return

    const transition = animate(sequenceRef.current.querySelectorAll('.preview-silhouette'), {
      opacity: [0, 1],
      scale: [0.86, 1],
      delay: (_element, index) => (index ?? 0) * 90,
      duration: 520,
      ease: 'outCubic',
    })

    return () => {
      transition.pause()
    }
  }, [sequence])

  return (
    <main className="serial-recall-screen">
      <header className="training-header">
        <button className="back-button" type="button" onClick={onBack}>
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
            <span className="preview-index">0{index + 1}</span>
            <img src={silhouette.image} alt="" />
          </div>
        ))}
      </section>
    </main>
  )
}
