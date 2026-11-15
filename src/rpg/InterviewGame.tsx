import { useCallback, useEffect, useRef, useState } from 'react';
import type { Artifact } from '../data/artifacts';
import { CATEGORY_LABEL, INTERVIEWS, type Question } from './interviews';
import { recordInterview } from './catalog';
import { Portrait } from './Portrait';
import { InterviewScene } from './InterviewScene';
import { isSoundOn, primeBlip, resumeBlip, setSoundOn } from './blip';
import { useTypewriter } from './useTypewriter';

type Phase = 'intro' | 'asking' | 'answering' | 'silent' | 'entry';

interface InterviewGameProps {
  artifact: Artifact;
  reduced: boolean;
  onClose: () => void;
  onCatalog: () => void;
}

export function InterviewGame({ artifact, reduced, onClose, onCatalog }: InterviewGameProps) {
  const interview = INTERVIEWS[artifact.id];
  const rootRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('intro');
  const [line, setLine] = useState(0);
  const [signal, setSignal] = useState(interview.signal);
  const [asked, setAsked] = useState<string[]>([]);
  const [fragments, setFragments] = useState<string[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [lastAnswer, setLastAnswer] = useState('');
  const [sound, setSound] = useState(() => isSoundOn());

  const text =
    phase === 'intro'
      ? interview.intro[Math.min(line, interview.intro.length - 1)]
      : phase === 'answering'
        ? lastAnswer
        : phase === 'silent'
          ? interview.silence
          : phase === 'asking'
            ? '¿Qué le preguntas? Cada pregunta gasta una unidad de señal.'
            : 'Se acabó el enlace.';

  const { shown, done, skip } = useTypewriter(text);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // El MP3 se decodifica al abrir; el primer clic o tecla dentro de la
  // entrevista desbloquea el audio si el navegador lo dejó suspendido.
  useEffect(() => {
    primeBlip();
    const unlock = () => resumeBlip();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'entry') return;
    recordInterview(artifact.id, fragments, asked.length);
  }, [phase, artifact.id, fragments, asked.length]);

  const advance = useCallback(() => {
    if (!done) {
      skip();
      return;
    }
    if (phase === 'intro') {
      if (line + 1 < interview.intro.length) setLine(line + 1);
      else setPhase('asking');
      return;
    }
    if (phase === 'answering') {
      setCurrent(null);
      setPhase(signal === 0 ? 'silent' : 'asking');
      return;
    }
    if (phase === 'silent') {
      setPhase('entry');
    }
  }, [done, skip, phase, line, interview.intro.length, signal]);

  const ask = (question: Question) => {
    if (phase !== 'asking' || signal <= 0) return;
    setCurrent(question);
    setLastAnswer(question.answer);
    setAsked((previous) => [...previous, question.id]);
    setSignal((value) => value - 1);
    if (question.fragment) setFragments((previous) => [...previous, question.fragment!.text]);
    setPhase('answering');
  };

  const reconnect = () => {
    setPhase('intro');
    setLine(0);
    setSignal(interview.signal);
    setAsked([]);
    setFragments([]);
    setCurrent(null);
    setLastAnswer('');
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        if (phase === 'asking' || phase === 'entry') return;
        event.preventDefault();
        advance();
      }
      if (phase === 'asking' && /^[1-7]$/.test(event.key)) {
        const available = interview.questions.filter((q) => !asked.includes(q.id));
        const picked = available[Number(event.key) - 1];
        if (picked) ask(picked);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const available = interview.questions.filter((q) => !asked.includes(q.id));
  const alive = signal > 0 || phase === 'asking' || phase === 'intro';
  const speaking = phase === 'intro' || phase === 'answering';

  return (
    <div
      className="game interview"
      role="dialog"
      aria-modal="true"
      aria-label={`Entrevista con ${interview.speaker}`}
      tabIndex={-1}
      ref={rootRef}
    >
      <header className="game-bar">
        <div>
          <p className="game-kicker">Entrevista · señal {signal}/4</p>
          <h2 className="game-title">{interview.speaker}</h2>
          <p className="interview-subtitle">{interview.subtitle}</p>
        </div>

        <div className="interview-actions">
          <div className="pips" role="img" aria-label={`${signal} de 4 unidades de señal`}>
            {Array.from({ length: interview.signal }).map((_, i) => (
              <span key={i} className={i < signal ? 'is-on' : ''} />
            ))}
          </div>
          <button
            type="button"
            className="ghost-button sound-toggle"
            aria-pressed={sound}
            aria-label={`Sonido de escritura ${sound ? 'activado' : 'desactivado'}`}
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundOn(next);
            }}
          >
            <span className="sound-toggle-label">Sonido</span>{' '}
            {sound ? 'on' : 'off'}
          </button>
          <button type="button" className="ghost-button" onClick={onClose}>
            Volver al museo
          </button>
        </div>
      </header>

      <div className={`interview-scene ${alive ? '' : 'is-dead'}`}>
        <InterviewScene artifact={artifact} alive={alive} speaking={speaking} reduced={reduced} />
      </div>

      <section
        className="interview-box"
        onClick={phase === 'asking' || phase === 'entry' ? undefined : advance}
        aria-live="polite"
      >
        <Portrait id={artifact.id} name={interview.speaker} speaking={speaking} />

        <div className="interview-content">
          <p className="interview-speaker">
            {phase === 'asking' ? 'Tú' : interview.speaker}
          </p>
          <p className="interview-line">
            {shown}
            {!done && <span className="caret" aria-hidden="true" />}
          </p>

          {phase === 'asking' && (
            <ul className="choices">
              {available.map((question, index) => (
                <li key={question.id}>
                  <button type="button" className="choice" onClick={() => ask(question)}>
                    <span className="choice-key">{index + 1}</span>
                    <span className="choice-body">
                      <span className="choice-cat">{CATEGORY_LABEL[question.category]}</span>
                      <span className="choice-label">{question.label}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {phase === 'entry' && (
            <div className="entry">
              <p className="entry-title">{interview.entryTitle}</p>
              <p className="entry-count">
                Preguntaste {asked.length} de {interview.questions.length}. Recuperaste{' '}
                {fragments.length} de{' '}
                {interview.questions.filter((q) => q.fragment).length} fragmentos.
              </p>

              {fragments.length > 0 ? (
                <ul className="entry-fragments">
                  {fragments.map((fragment) => (
                    <li key={fragment}>{fragment}</li>
                  ))}
                </ul>
              ) : (
                <p className="entry-empty">
                  No alcanzaste a recuperar nada. Lo que no se pregunta, se pierde.
                </p>
              )}

              <div className="entry-actions">
                <button type="button" className="game-cta" onClick={reconnect}>
                  Volver a conectar
                </button>
                <button type="button" className="ghost-button" onClick={onCatalog}>
                  Ver catálogo
                </button>
                <button type="button" className="ghost-button" onClick={onClose}>
                  Volver al museo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {phase !== 'entry' && (
        <p className="interview-hint" aria-hidden="true">
          {phase === 'asking' ? 'Elige una pregunta · teclas 1-7' : 'Clic o Espacio para continuar'}
        </p>
      )}
    </div>
  );
}
