
const STORAGE_KEY = 'tnpsc_study_os_v1';

export const saveState = (state: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
