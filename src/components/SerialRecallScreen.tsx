import '../styles/serial-recall.css'

type SerialRecallScreenProps = {
  onBack: () => void
}

export function SerialRecallScreen({ onBack }: SerialRecallScreenProps) {
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

      <section className="training-placeholder" aria-label="Pantalla de entrenamiento en construcción">
        <div className="training-crosshair" aria-hidden="true" />
        <span>TRAINING MODULE READY</span>
        <strong>SEQUENCE 01</strong>
      </section>
    </main>
  )
}
