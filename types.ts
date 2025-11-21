
// Centralized type definitions to prevent circular dependencies.

export interface FormState {
  prompt: string;
  coreTheme: string;
  story: string;
  keyEmotions: string;
  imagery: string;
  selectedGenre: string[];
  selectedMood: string[];
  selectedTempo: string[];
  selectedVocal: string;
  selectedInstruments: string[];
  inspiredBySong: string;
  inspiredByArtist: string;
  maleRole: string;
  femaleRole: string;
  songStructure: string[];
  sunoAiMode: 'auto' | 'manual';
  weirdness: number;
  styleInfluence: number;
  selectedModel: string;
  excludedWords: string;
  watermark: string;
}

export type ActiveTab = 'idea' | 'style' | 'advanced';

export interface HistoryItem {
    id: number;
    songData: string;
    createdAt: string;
    title: string;
    style: string;
    inputs: FormState;
}

export interface Preset {
    id: string;
    name: string;
    settings: Partial<FormState>;
}
