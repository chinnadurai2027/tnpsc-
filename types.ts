
export enum StudyStatus {
  DONE = 'DONE',
  PARTIAL = 'PARTIAL',
  MISSED = 'MISSED',
  PENDING = 'PENDING'
}

export enum Difficulty {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  HARD = 'HARD'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Stored locally for the gate
  lastLogin: string;
}

export interface StudySlot {
  id: string;
  subject: string;
  topic: string;
  timeEstimate: number; // in minutes
  outputExpected: string;
  status: StudyStatus;
  timeTaken?: number;
  difficulty?: Difficulty;
  confusions?: string;
}

export interface ProgressEntry {
  id: string;
  subject: string;
  topic: string;
  notes: string;
  date: string;
}

export interface MistakeEntry {
  id: string;
  date: string;
  subject: string;
  topic: string;
  questionRef: string;
  whyIChoseIt: string;
  correctConcept: string;
  fixStrategy: string;
}

export interface CurrentAffairsEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'TN' | 'National' | 'International';
  tag: 'Prelims' | 'Mains' | 'Both';
}

export interface DailyLog {
  date: string;
  dayNumber: number;
  availableTime: number;
  constraints: string;
  slots: StudySlot[];
  mcqStats?: {
    total: number;
    correct: number;
    wrong: number;
  };
  verdict?: 'Strong' | 'Average' | 'Poor';
  correction?: string;
  isCompleted: boolean;
}

export interface AppState {
  user: User | null;
  currentDayNumber: number;
  streak: number;
  logs: DailyLog[];
  progressLogs: ProgressEntry[];
  mistakeEntries: MistakeEntry[];
  completedTopics: Record<string, number>;
  syllabusProgress: Record<string, number>;
}
