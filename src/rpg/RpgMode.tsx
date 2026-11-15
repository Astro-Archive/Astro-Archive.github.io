import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ArtifactModel } from '../scene/ArtifactModel';
import { ARTIFACTS } from '../data/artifacts';
import { EAGLE_MISSION } from './missions';
import { answerQuiz, applyEffect, initialProgress } from './state';

interface RpgModeProps {
  onClose: () => void;
}

export function RpgMode({ onClose }: RpgModeProps) {
  const mission = EAGLE_MISSION;
  const artifact = useMemo(() => ARTIFACTS.find((item) => item.id === mission.artifactId)!, [mission.artifactId]);
  const [progress, setProgress] = useState(() => initialProgress(mission));
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const node = mission.dialogue[progress.nodeId];
  const complete = progress.quizPassed;
  const choose = (next: string, effect?: Parameters<typeof applyEffect>[1]) => {
    setProgress((current) => ({ ...applyEffect({ ...current, nodeId: next }, effect) }));
    setQuizAnswer(null);
  };
  const reset = () => {
    setProgress(initialProgress(mission));
    setQuizAnswer(null);
  };

  return (
    <div className="rpg" role="dialog" aria-modal="true" aria-label={`Misión RPG: ${mission.title}`}>
      <div className="rpg-scene" aria-hidden="true">
        <Canvas camera={{ position: [4, 3.2, 8], fov: 42 }} dpr={[1, 1.5]}>
          <color attach="background" args={[artifact.palette.bottom]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 8, 5]} intensity={2} color="#fff4e2" />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color={artifact.palette.ground} roughness={1} />
          </mesh>
          <ArtifactModel url={artifact.model} fit={artifact.fit} yaw={artifact.yaw} reduced />
        </Canvas>
      </div>

      <header className="rpg-header">
        <div>
          <p className="game-kicker">Modo misión · {artifact.name}</p>
          <h2 className="game-title">{mission.title}</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>Volver al museo</button>
      </header>

      <aside className="rpg-quests">
        <span className="play-tag">Misión</span>
        <p>{mission.intro}</p>
        <ul>
          {mission.objectives.map((objective) => (
            <li key={objective.id} className={progress.completed.includes(objective.id) || (objective.id === 'answer-quiz' && complete) ? 'is-done' : ''}>
              <span aria-hidden="true">{progress.completed.includes(objective.id) || (objective.id === 'answer-quiz' && complete) ? '✓' : '○'}</span>
              <div><strong>{objective.label}</strong><small>{objective.detail}</small></div>
            </li>
          ))}
        </ul>
      </aside>

      <section className="rpg-dialogue" aria-live="polite">
        <div className="rpg-speaker">
          <span className="rpg-avatar" aria-hidden="true">{mission.character.avatar}</span>
          <div><strong>{node.speaker}</strong><small>{node.role}</small></div>
        </div>
        <p className="rpg-text">{node.text}</p>

        {node.id === 'quiz' && progress.quizReady && !complete ? (
          <div className="rpg-quiz">
            <p className="rpg-quiz-prompt">{mission.quiz.prompt}</p>
            {mission.quiz.options.map((option, index) => (
              <button
                type="button"
                className={`rpg-choice ${quizAnswer === index ? (index === mission.quiz.answer ? 'is-correct' : 'is-wrong') : ''}`}
                key={option}
                onClick={() => {
                  setQuizAnswer(index);
                  if (index === mission.quiz.answer) setProgress((current) => answerQuiz(current, true));
                }}
              >
                {option}
              </button>
            ))}
            {quizAnswer !== null && <p className="rpg-feedback">{quizAnswer === mission.quiz.answer ? mission.quiz.explanation : 'Todavía no. Revisa las dos pistas y prueba otra vez.'}</p>}
          </div>
        ) : complete ? (
          <div className="rpg-complete">
            <p><strong>Insignia desbloqueada:</strong> {mission.badge}</p>
            <p>La historia sigue siendo real aunque el personaje sea provisional. Más adelante podremos sustituirlo por el personaje definitivo.</p>
            <button type="button" className="game-cta" onClick={reset}>Jugar de nuevo</button>
          </div>
        ) : (
          <div className="rpg-choices">
            {node.choices?.map((choice) => (
              <button type="button" className="rpg-choice" key={choice.id} onClick={() => choose(choice.next, choice.effect)}>
                {choice.label}
              </button>
            ))}
            {node.next && <button type="button" className="rpg-choice" onClick={() => choose(node.next!)}>Continuar</button>}
          </div>
        )}
      </section>
    </div>
  );
}
