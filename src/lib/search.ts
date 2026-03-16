import Fuse from 'fuse.js';
import namesData from '@/data/names.json';

export type Category = string;

export interface AllahName {
  id: number;
  name: string;
  arabic: string;
  categories: Category[];
  meaningBlocks: string[];
  dua: string;
  meaning: string;
}

const names: AllahName[] = namesData as AllahName[];

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'meaning', weight: 0.3 },
    { name: 'categories', weight: 0.2 },
    { name: 'dua', weight: 0.05 },
    { name: 'meaningBlocks', weight: 0.05 },
  ],
  threshold: 0.3,
  includeScore: true,
};

export const fuse = new Fuse(names, fuseOptions);

export function searchNames(query: string): AllahName[] {
  if (!query.trim()) {
    return names;
  }
  const results = fuse.search(query);
  return results.map(result => result.item);
}

export function getAllNames(): AllahName[] {
  return names;
}

export function getNamesByCategory(category: string): AllahName[] {
  return names.filter(name => name.categories.includes(category));
}

export function getAllCategories(): Category[] {
  const categories = new Set<string>();
  names.forEach(name => {
    name.categories.forEach(cat => categories.add(cat));
  });
  return Array.from(categories).sort();
}

export function getNameById(id: number): AllahName | undefined {
  return names.find(name => name.id === id);
}
