import { Person, Group, Expense } from '../types';

const STORAGE_KEY = 'splitsmart_data';

interface SavedData {
  people: Person[];
  groups: Group[];
  expenses: Expense[];
}

export const saveData = (people: Person[], groups: Group[], expenses: Expense[]) => {
  const data: SavedData = { people, groups, expenses };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadData = (): SavedData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { people: [], groups: [], expenses: [] };
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to parse saved data:', error);
    return { people: [], groups: [], expenses: [] };
  }
};
export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
