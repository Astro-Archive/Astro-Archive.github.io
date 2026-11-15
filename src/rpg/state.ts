import type { DialogueEffect, RpgMission, RpgProgress } from './types';

export function initialProgress(mission: RpgMission): RpgProgress {
  return { nodeId: 'start', completed: [], quizReady: false, quizPassed: false };
}

export function applyEffect(progress: RpgProgress, effect?: DialogueEffect): RpgProgress {
  if (!effect) return progress;
  if (effect.type === 'complete-objective' && !progress.completed.includes(effect.objectiveId)) {
    return { ...progress, completed: [...progress.completed, effect.objectiveId] };
  }
  if (effect.type === 'set-quiz-ready') return { ...progress, quizReady: true };
  return progress;
}

export function answerQuiz(progress: RpgProgress, correct: boolean): RpgProgress {
  return correct ? { ...progress, quizPassed: true, quizReady: true } : progress;
}
