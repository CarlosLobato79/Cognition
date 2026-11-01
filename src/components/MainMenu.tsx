import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import '../styles/main-menu.css'

const modules = [
  { id: '01', name: 'Sequence Core' },
  { id: '02', name: 'Neural Grid' },
  { id: '03', name: 'Echo Span' },
  { id: '04', name: 'Focus Vector' },
  { id: '05', name: 'Cortex Lock' },
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
            <span className="module-card-footer">
              <span className="module-card-status">PROXIMAMENTE</span>
              <span className="module-card-name">{module.name}</span>
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}
