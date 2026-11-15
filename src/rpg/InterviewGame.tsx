import { useCallback, useEffect, useRef, useState } from 'react';
import type { Artifact } from '../data/artifacts';
import { CATEGORY_LABEL, interviewsFor, type Question } from './interviews';
import { recordInterview } from './catalog';
import { Portrait } from './Portrait';
import { InterviewScene } from './InterviewScene';
import { isSoundOn, primeBlip, resumeBlip, setSoundOn } from './blip';
import { useTypewriter } from './useTypewriter';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

type Phase = 'intro' | 'asking' | 'answering' | 'silent' | 'entry';

interface InterviewGameProps {
  artifact: Artifact;
  reduced: boolean;
  onClose: () => void;
  onCatalog: () => void;
}

export function InterviewGame({ artifact, reduced, onClose, onCatalog }: InterviewGameProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const interview = interviewsFor(lang)[artifact.id];
  const rootRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('intro');
  const [line, setLine] = useState(0);
  const [signal, setSignal] = useState(interview.signal);
  const [asked, setAsked] = useState<string[]>([]);
  const [fragmentIds, setFragmentIds] = useState<string[]>([]);
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
            ? t.asking
            : t.linkOver;

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
    recordInterview(artifact.id, fragmentIds, asked.length);
  }, [phase, artifact.id, fragmentIds, asked.length]);

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
    if (question.fragment) setFragmentIds((previous) => [...previous, question.id]);
    setPhase('answering');
  };

  const reconnect = () => {
    setPhase('intro');
    setLine(0);
    setSignal(interview.signal);
    setAsked([]);
    setFragmentIds([]);
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
      aria-label={t.interviewAria(interview.speaker)}
      tabIndex={-1}
      ref={rootRef}
    >
      <header className="game-bar">
        <div>
          <p className="game-kicker">{t.interviewKicker(signal)}</p>
          <h2 className="game-title">{interview.speaker}</h2>
          <p className="interview-subtitle">{interview.subtitle}</p>
        </div>

        <div className="interview-actions">
          <div className="pips" role="img" aria-label={t.pipsAria(signal)}>
            {Array.from({ length: interview.signal }).map((_, i) => (
              <span key={i} className={i < signal ? 'is-on' : ''} />
            ))}
          </div>
          <button
            type="button"
            className="ghost-button sound-toggle"
            aria-pressed={sound}
            aria-label={sound ? t.soundAriaOn : t.soundAriaOff}
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundOn(next);
            }}
          >
            <span className="sound-toggle-label">{t.soundWord}</span>{' '}
            <span className="sound-toggle-short">{t.soundShort}</span>{' '}
            {sound ? t.soundOnState : t.soundOffState}
          </button>
          <button type="button" className="ghost-button" onClick={onClose}>
            {t.backToMuseum}
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
            {phase === 'asking' ? t.you : interview.speaker}
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
                      <span className="choice-cat">{CATEGORY_LABEL[lang][question.category]}</span>
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
                {t.entryCount(
                  asked.length,
                  interview.questions.length,
                  fragmentIds.length,
                  interview.questions.filter((q) => q.fragment).length,
                )}
              </p>

              {fragmentIds.length > 0 ? (
                <ul className="entry-fragments">
                  {fragmentIds.map((id) => (
                    <li key={id}>
                      {interview.questions.find((q) => q.id === id)?.fragment?.text ?? id}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="entry-empty">{t.entryEmpty}</p>
              )}

              <div className="entry-actions">
                <button type="button" className="game-cta" onClick={reconnect}>
                  {t.reconnect}
                </button>
                <button type="button" className="ghost-button" onClick={onCatalog}>
                  {t.viewCatalog}
                </button>
                <button type="button" className="ghost-button" onClick={onClose}>
                  {t.backToMuseum}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {phase !== 'entry' && (
        <p className="interview-hint" aria-hidden="true">
          {phase === 'asking' ? t.hintAsking : t.hintContinue}
        </p>
      )}
    </div>
  );
}
