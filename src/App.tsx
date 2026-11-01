import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { MainMenu } from './components/MainMenu'
import { SerialRecallScreen } from './components/SerialRecallScreen'
import './styles/splash.css'

export function App() {
  const [isBooted, setIsBooted] = useState(false)
  const [activeScreen, setActiveScreen] = useState<'menu' | 'serial-recall'>('menu')
  const splashRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const logoIntro = animate(logoRef.current!, {
      opacity: [0, 1],
      scale: [0.78, 1],
      duration: 1200,
      ease: 'outExpo',
    })

    const wordmarkIntro = animate(wordmarkRef.current!, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 800,
      delay: 360,
      ease: 'outCubic',
    })

    const statusIntro = animate(statusRef.current!, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 600,
      delay: 760,
      ease: 'outCubic',
    })

    const pulse = animate('.logo-aura', {
      opacity: [0.15, 0.42, 0.15],
      scale: [0.92, 1.08, 0.92],
      duration: 2400,
      ease: 'inOutSine',
      loop: true,
    })

    const timer = window.setTimeout(() => {
      animate(splashRef.current!, {
        opacity: [1, 0],
        duration: 850,
        ease: 'inOutQuad',
        onComplete: () => setIsBooted(true),
      })
    }, 3900)

    return () => {
      window.clearTimeout(timer)
      logoIntro.pause()
      wordmarkIntro.pause()
      statusIntro.pause()
      pulse.pause()
    }
  }, [])

  return (
    <main className="app-shell">
      {!isBooted && (
        <section ref={splashRef} className="splash-screen" aria-label="Cargando Cognition">
          <div className="splash-grid" aria-hidden="true" />
          <div className="splash-content">
            <div ref={logoRef} className="logo-lockup">
              <div className="logo-aura" aria-hidden="true" />
              <img className="brain-image-logo" src="/assets/cognition-brain-logo.png" alt="Cognition" />
            </div>
            <h1 ref={wordmarkRef}>COGNITION</h1>
            <p ref={statusRef} className="boot-status">
              <span className="status-dot" />
              INITIALIZING COGNITIVE SYSTEM
            </p>
          </div>
          <p className="build-label">COGNITION // BUILD 0.1</p>
        </section>
      )}

      {isBooted && activeScreen === 'menu' && <MainMenu onSelectModule={setActiveScreen} />}
      {isBooted && activeScreen === 'serial-recall' && <SerialRecallScreen onBack={() => setActiveScreen('menu')} />}
    </main>
  )
}
