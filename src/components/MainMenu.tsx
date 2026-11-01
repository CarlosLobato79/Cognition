import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import '../styles/main-menu.css'

const modules = [
  { id: '01', name: 'Perro', image: '/assets/animals/perro.png' },
  { id: '02', name: 'Gato', image: '/assets/animals/gato.png' },
  { id: '03', name: 'León', image: '/assets/animals/leon.png' },
  { id: '04', name: 'Tigre', image: '/assets/animals/tigre.png' },
  { id: '05', name: 'Elefante', image: '/assets/animals/elefante.png' },
]

export function MainMenu() {
  const menuRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cards = menuRef.current?.querySelectorAll('.module-card')
    if (!cards?.length) return

    const entrance = animate(cards, {
      opacity: [0, 1],
      translateY: [28, 0],
      delay: (_el, index) => (index ?? 0) * 90,
      duration: 680,
      ease: 'outCubic',
    })

    return () => {
      entrance.pause()
    }
  }, [])

  return (
    <main ref={menuRef} className="main-menu" aria-label="Módulos de Cognition">
      <div className="menu-grid" aria-hidden="true" />
      <header className="menu-header">
        <div className="menu-brand">
          <img src="/assets/cognition-brain-logo.png" alt="" />
          <span>COGNITIVE READINESS SYSTEM</span>
        </div>
        <h1>COGNITION</h1>
      </header>

      <section className="module-rail" aria-label="Módulos de entrenamiento">
        {modules.map((module) => (
          <button className="module-card" key={module.id} type="button" aria-label={`Módulo ${module.id}: ${module.name}`}>
            <span className="module-card-number">{module.id}</span>
            <img src={module.image} alt="" />
          </button>
        ))}
      </section>
    </main>
  )
}
