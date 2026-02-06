
export const SUBJECTS = [
  'Indian Polity (Laxmikanth)',
  'History (NCERT + TN)',
  'Geography',
  'Economy',
  'Science & Environment',
  'Current Affairs',
  'Aptitude (Unit X)',
  'Tamil Society',
  'Unit 8/9 (TN Admin)',
  'Others'
];

export const TNPSC_SYLLABUS = [
  { id: 'u1', name: 'General Science', weight: 15 },
  { id: 'u2', name: 'Current Events', weight: 20 },
  { id: 'u3', name: 'Geography', weight: 10 },
  { id: 'u4', name: 'History & Culture', weight: 15 },
  { id: 'u5', name: 'Indian Polity', weight: 25 },
  { id: 'u6', name: 'Indian Economy', weight: 15 },
  { id: 'u7', name: 'National Movement', weight: 15 },
  { id: 'u8', name: 'Tamil Heritage', weight: 40 },
  { id: 'u9', name: 'TN Admin', weight: 30 },
  { id: 'u10', name: 'Aptitude & Mental Ability', weight: 25 },
];

export const INITIAL_APP_STATE: any = {
  currentDayNumber: 1,
  streak: 0,
  logs: [],
  progressLogs: [],
  currentAffairs: [],
  // Initialize mistakeEntries as an empty array
  mistakeEntries: [],
  completedTopics: {},
  syllabusProgress: {
    'u1': 0, 'u2': 0, 'u3': 0, 'u4': 0, 'u5': 0,
    'u6': 0, 'u7': 0, 'u8': 0, 'u9': 0, 'u10': 0,
  },
};
