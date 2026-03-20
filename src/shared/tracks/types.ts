/** Faixas etárias suportadas */
export type AgeGroup = '3-4' | '5-6' | '7-8' | '9-10';

/** Tipos de jogo disponíveis para atividades de trilha */
export type TrackGameType =
  | 'syllable' | 'quiz' | 'fill' | 'memory' | 'write'
  | 'firstletter' | 'buildsentence' | 'story' | 'matchgame'
  | 'vowelgame' | 'silfamilia' | 'ditado';

/** Configuração de uma atividade dentro de uma lição */
export interface TrackActivity {
  id: string;
  gameType: TrackGameType;
  /** IDs de palavras do banco (words.ts) para jogos de palavra */
  wordIds: string[];
  /** IDs de frases (sentences.ts) para BuildSentence */
  sentenceIds?: string[];
  /** ID de história para StoryPlayer */
  storyId?: string;
  /** Modo da história */
  storyMode?: 'typing' | 'dictation';
  /** ID de MatchGame para atividades de contagem/matemática */
  matchGameId?: string;
  /** Número de rodadas */
  rounds?: number;
}

/** Uma lição dentro de uma unidade */
export interface TrackLesson {
  id: string;
  title: string;
  emoji: string;
  activities: TrackActivity[];
}

/** Uma unidade temática dentro de uma trilha */
export interface TrackUnit {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bg: string;
  lessons: TrackLesson[];
}

/** Uma trilha completa associada a uma faixa etária */
export interface Track {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  emoji: string;
  color: string;
  units: TrackUnit[];
  /** true para trilhas de exemplo embutidas */
  builtin: boolean;
  /** Versão do schema para migrações futuras */
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Resultado de uma lição completada */
export interface TrackLessonResult {
  stars: number;
  xp: number;
  completedAt: string;
  errors: number;
}

/** Progresso do usuário em uma trilha */
export interface TrackProgress {
  id: string;
  trackId: string;
  ageGroup: AgeGroup;
  completedLessons: Record<string, TrackLessonResult>;
  totalXP: number;
  lastPlayedAt: string;
  /** Versão do schema para migrações futuras */
  version: number;
}

/** Estado de rotação de jogos por lição */
export interface RotationHistory {
  /** Chave: lessonId, Valor: últimos N tipos de jogo jogados */
  [lessonId: string]: string[];
}
