export type DialogueEffect =
  | { type: 'complete-objective'; objectiveId: string }
  | { type: 'unlock-objective'; objectiveId: string }
  | { type: 'set-quiz-ready' };

export interface DialogueChoice {
  id: string;
  label: string;
  next: string;
  effect?: DialogueEffect;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  role: string;
  text: string;
  choices?: DialogueChoice[];
  next?: string;
}

export interface QuestObjective {
  id: string;
  label: string;
  detail: string;
  unlocks?: string;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface RpgMission {
  id: string;
  artifactId: string;
  title: string;
  intro: string;
  character: { name: string; role: string; avatar: string };
  objectives: QuestObjective[];
  dialogue: Record<string, DialogueNode>;
  quiz: QuizQuestion;
  badge: string;
}

export interface RpgProgress {
  nodeId: string;
  completed: string[];
  quizReady: boolean;
  quizPassed: boolean;
}
