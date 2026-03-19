import type { AgeGroup, RotationHistory, Track, TrackLessonResult, TrackProgress } from './types';
import { BUILTIN_TRACKS } from './builtinTracks';

const TRACKS_KEY = 'digiletras_tracks_custom';
const PROGRESS_KEY_PREFIX = 'digiletras_tracks_progress_';
const ROTATION_KEY = 'digiletras_tracks_rotation';
const AGE_KEY = 'digiletras_selected_age';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readCustomTracks(): Track[] {
  try {
    const raw = localStorage.getItem(TRACKS_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[trackStore] dados corrompidos em', TRACKS_KEY, '— retornando array vazio');
      return [];
    }
    return parsed as Track[];
  } catch (err) {
    console.warn('[trackStore] erro ao ler', TRACKS_KEY, err);
    return [];
  }
}

function writeCustomTracks(tracks: Track[]): void {
  localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks));
}

// ---------------------------------------------------------------------------
// CRUD — Trilhas
// ---------------------------------------------------------------------------

/** Retorna todas as trilhas (builtin + custom). */
export function getAllTracks(): Track[] {
  return [...BUILTIN_TRACKS, ...readCustomTracks()];
}

/** Retorna trilhas filtradas por faixa etária. */
export function getTracksByAge(age: AgeGroup): Track[] {
  return getAllTracks().filter((t) => t.ageGroup === age);
}

/** Retorna uma trilha por ID (busca em builtin e custom). */
export function getTrackById(id: string): Track | undefined {
  return getAllTracks().find((t) => t.id === id);
}

/** Salva uma trilha customizada (cria ou atualiza). */
export function saveTrack(track: Track): void {
  const custom = readCustomTracks();
  const idx = custom.findIndex((t) => t.id === track.id);
  if (idx >= 0) {
    custom[idx] = track;
  } else {
    custom.push(track);
  }
  writeCustomTracks(custom);
}

/** Exclui uma trilha customizada por ID. Trilhas builtin não podem ser excluídas. */
export function deleteTrack(id: string): void {
  const custom = readCustomTracks();
  writeCustomTracks(custom.filter((t) => t.id !== id));
}

// ---------------------------------------------------------------------------
// Faixa etária selecionada
// ---------------------------------------------------------------------------

/** Retorna a faixa etária selecionada (ou null). */
export function getSelectedAge(): AgeGroup | null {
  const raw = localStorage.getItem(AGE_KEY);
  if (raw === '3-4' || raw === '5-6' || raw === '7-8') return raw;
  return null;
}

/** Salva a faixa etária selecionada. */
export function setSelectedAge(age: AgeGroup): void {
  localStorage.setItem(AGE_KEY, age);
}

// ---------------------------------------------------------------------------
// Progresso por faixa etária
// ---------------------------------------------------------------------------

function progressKey(age: AgeGroup): string {
  return `${PROGRESS_KEY_PREFIX}${age}`;
}

function readProgress(age: AgeGroup): TrackProgress[] {
  try {
    const raw = localStorage.getItem(progressKey(age));
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[trackStore] dados corrompidos em', progressKey(age), '— retornando array vazio');
      return [];
    }
    return parsed as TrackProgress[];
  } catch (err) {
    console.warn('[trackStore] erro ao ler', progressKey(age), err);
    return [];
  }
}

function writeProgress(age: AgeGroup, progress: TrackProgress[]): void {
  localStorage.setItem(progressKey(age), JSON.stringify(progress));
}

/** Retorna o progresso de uma faixa etária. */
export function getTrackProgress(age: AgeGroup): TrackProgress[] {
  return readProgress(age);
}

/** Salva resultado de uma lição. Cria TrackProgress se não existir para a trilha. */
export function saveTrackLessonResult(
  trackId: string,
  lessonId: string,
  result: TrackLessonResult,
): void {
  // Determine the age group from the track
  const track = getTrackById(trackId);
  if (!track) {
    console.warn('[trackStore] trilha não encontrada:', trackId);
    return;
  }

  const age = track.ageGroup;
  const progressList = readProgress(age);

  let entry = progressList.find((p) => p.trackId === trackId);
  if (!entry) {
    entry = {
      id: `progress-${trackId}`,
      trackId,
      ageGroup: age,
      completedLessons: {},
      totalXP: 0,
      lastPlayedAt: new Date().toISOString(),
      version: 1,
    };
    progressList.push(entry);
  }

  entry.completedLessons[lessonId] = result;
  entry.totalXP = Object.values(entry.completedLessons).reduce((sum, r) => sum + r.xp, 0);
  entry.lastPlayedAt = new Date().toISOString();

  writeProgress(age, progressList);
}

// ---------------------------------------------------------------------------
// Rotação de jogos
// ---------------------------------------------------------------------------

/** Retorna o histórico de rotação de jogos por lição. */
export function getRotationHistory(): RotationHistory {
  try {
    const raw = localStorage.getItem(ROTATION_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('[trackStore] dados corrompidos em', ROTATION_KEY, '— retornando objeto vazio');
      return {};
    }
    return parsed as RotationHistory;
  } catch (err) {
    console.warn('[trackStore] erro ao ler', ROTATION_KEY, err);
    return {};
  }
}

/** Registra um tipo de jogo jogado para uma lição no histórico de rotação. */
export function recordRotation(lessonId: string, gameType: string): void {
  const history = getRotationHistory();
  const recent = history[lessonId] ?? [];
  recent.push(gameType);
  history[lessonId] = recent;
  localStorage.setItem(ROTATION_KEY, JSON.stringify(history));
}

// ---------------------------------------------------------------------------
// Exportação / Importação
// ---------------------------------------------------------------------------

const AGE_GROUPS: AgeGroup[] = ['3-4', '5-6', '7-8'];

/** Exporta todos os dados (trilhas custom + progresso de todas as faixas + rotação) como JSON. */
export function exportAllData(): string {
  const data = {
    customTracks: readCustomTracks(),
    progress: Object.fromEntries(
      AGE_GROUPS.map((age) => [age, readProgress(age)]),
    ),
    rotationHistory: getRotationHistory(),
  };
  return JSON.stringify(data);
}

/** Importa dados de JSON, com validação. Substitui dados existentes. */
export function importData(json: string): { success: boolean; error?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: 'JSON inválido' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'Formato inválido: esperado objeto' };
  }

  const obj = parsed as Record<string, unknown>;

  // Validate customTracks
  if (!Array.isArray(obj.customTracks)) {
    return { success: false, error: 'Campo "customTracks" ausente ou inválido' };
  }

  // Validate progress
  if (typeof obj.progress !== 'object' || obj.progress === null || Array.isArray(obj.progress)) {
    return { success: false, error: 'Campo "progress" ausente ou inválido' };
  }
  const progress = obj.progress as Record<string, unknown>;
  for (const age of AGE_GROUPS) {
    if (age in progress && !Array.isArray(progress[age])) {
      return { success: false, error: `Progresso para faixa "${age}" inválido` };
    }
  }

  // Validate rotationHistory
  if (typeof obj.rotationHistory !== 'object' || obj.rotationHistory === null || Array.isArray(obj.rotationHistory)) {
    return { success: false, error: 'Campo "rotationHistory" ausente ou inválido' };
  }

  // All validations passed — replace existing data
  writeCustomTracks(obj.customTracks as Track[]);

  for (const age of AGE_GROUPS) {
    const ageProgress = progress[age];
    if (Array.isArray(ageProgress)) {
      writeProgress(age, ageProgress as TrackProgress[]);
    } else {
      writeProgress(age, []);
    }
  }

  localStorage.setItem(ROTATION_KEY, JSON.stringify(obj.rotationHistory));

  return { success: true };
}
