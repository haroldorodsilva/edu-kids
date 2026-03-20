/* eslint-disable react-refresh/only-export-components */
import { createHashRouter, RouterProvider, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Route } from 'lucide-react';
import Syllable from './features/games/Syllable';
import Quiz from './features/games/Quiz';
import Fill from './features/games/Fill';
import Memory from './features/games/Memory';
import Write from './features/games/Write';
import FirstLetter from './features/games/FirstLetter';
import BuildSentence from './features/games/BuildSentence';
import MatchGame from './features/games/MatchGame';
import VowelGame from './features/games/VowelGame';
import SyllableFamily from './features/games/SyllableFamily';
import DictationGame from './features/games/DictationGame';
import SyllableFill from './features/games/SyllableFill';
import StoryPicker from './features/stories/StoryPicker';
import StoryPlayer from './features/stories/StoryPlayer';
import AdminPanel from './features/admin/AdminPanel';
import PathScreen from './features/path/PathScreen';
import FreePlayScreen from './features/freeplay/FreePlayScreen';
import LessonRunner from './features/lesson/LessonRunner';
import AgeSelectorScreen from './features/tracks/AgeSelectorScreen';
import TrackPathScreen from './features/tracks/TrackPathScreen';
import TrackLessonRunner from './features/tracks/TrackLessonRunner';
import TrackEditor from './features/admin/TrackEditor';
import ScreenHeader from './shared/components/layout/ScreenHeader';
import type { Word } from './shared/data/words';
import type { GameComponentProps } from './shared/types';

// ── Route state type for free-play games ────────────────────────────────────
interface GameState { wordPool?: Word[]; rounds?: number }

// ── Generic GameRoute config & component ─────────────────────────────────────

/** Configuration for a game route entry */
export interface GameRouteConfig {
  /** Game identifier used in the URL path: /freeplay/:id */
  id: string;
  /** The game component to render */
  component: React.ComponentType<GameComponentProps>;
  /** If true, don't pass wordPool from navigation state (e.g. BuildSentence, MatchGame) */
  noWordPool?: boolean;
}

/** All free-play game routes in a single config array */
export const GAME_ROUTES: GameRouteConfig[] = [
  { id: 'syllable',      component: Syllable },
  { id: 'quiz',          component: Quiz },
  { id: 'fill',          component: Fill },
  { id: 'memory',        component: Memory },
  { id: 'write',         component: Write },
  { id: 'firstletter',   component: FirstLetter },
  { id: 'buildsentence', component: BuildSentence, noWordPool: true },
  { id: 'matchgame',     component: MatchGame,     noWordPool: true },
  // Novos jogos
  { id: 'vowelgame',     component: VowelGame },
  { id: 'silfamilia',    component: SyllableFamily, noWordPool: true },
  { id: 'ditado',        component: DictationGame },
  { id: 'silfill',       component: SyllableFill,   noWordPool: true },
];

/** Generic component that connects React Router → any Game Component via config */
export function GameRoute({ config }: { config: GameRouteConfig }) {
  const nav = useNavigate();
  // as { state: ... } — useLocation().state is typed as `unknown`; we narrow it to our expected GameState shape
  const { state } = useLocation() as { state: GameState | null };
  const Component = config.component;
  return (
    <Component
      onBack={() => nav('/freeplay')}
      {...(!config.noWordPool && state?.wordPool ? { wordPool: state.wordPool } : {})}
    />
  );
}
function StoryPickerRoute() {
  const nav = useNavigate();
  return (
    <StoryPicker
      onSelect={(id, mode) => nav(`/stories/${id}/${mode}`)}
      onBack={() => nav('/freeplay')}
    />
  );
}
function StoryPlayerRoute() {
  const nav = useNavigate();
  const { storyId, mode } = useParams<{ storyId: string; mode: 'typing' | 'dictation' }>();
  if (!storyId || !mode) return null;
  return (
    <StoryPlayer
      storyId={storyId}
      mode={mode}
      onBack={() => nav('/freeplay/stories')}
    />
  );
}
function LessonRoute() {
  const nav = useNavigate();
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  if (!unitId || !lessonId) return null;
  return (
    <LessonRunner
      unitId={unitId}
      lessonId={lessonId}
      onComplete={() => nav('/')}
      onBack={() => nav('/')}
    />
  );
}
function FreePlayRoute() {
  const nav = useNavigate();
  return (
    <FreePlayScreen
      onSelect={(game, wordPool, rounds) => nav(`/freeplay/${game}`, { state: { wordPool, rounds } })}
      onBack={() => nav('/')}
      onAdmin={() => nav('/admin')}
    />
  );
}
function PathRoute() {
  const nav = useNavigate();
  return (
    <PathScreen
      onStartLesson={(unitId, lessonId) => nav(`/lesson/${unitId}/${lessonId}`)}
      onFreePlay={() => nav('/freeplay')}
    />
  );
}
function AdminRoute() {
  const nav = useNavigate();
  return <AdminPanel onBack={() => nav('/freeplay')} />;
}
function AgeSelectorRoute() {
  return <AgeSelectorScreen />;
}
function TrackPathRoute() {
  return <TrackPathScreen />;
}
function TrackLessonRoute() {
  return <TrackLessonRunner />;
}
function TrackEditorRoute() {
  const nav = useNavigate();
  const { ageGroup } = useParams<{ ageGroup: string }>();
  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
      <ScreenHeader
        title="Editar Trilhas"
        icon={<Route size={20} />}
        onBack={() => nav(`/tracks/${ageGroup || '3-4'}`)}
      />
      <TrackEditor />
    </div>
  );
}

// ── Router definition ────────────────────────────────────────────────────────

const router = createHashRouter([
  { path: '/',                           element: <AgeSelectorRoute /> },
  { path: '/path',                       element: <PathRoute /> },
  { path: '/tracks/:ageGroup',           element: <TrackPathRoute /> },
  { path: '/tracks/:ageGroup/edit',      element: <TrackEditorRoute /> },
  { path: '/tracks/:ageGroup/lesson/:trackId/:unitIdx/:lessonIdx', element: <TrackLessonRoute /> },
  { path: '/freeplay',                   element: <FreePlayRoute /> },
  ...GAME_ROUTES.map(config => ({
    path: `/freeplay/${config.id}`,
    element: <GameRoute config={config} />,
  })),
  { path: '/freeplay/storypicker',       element: <StoryPickerRoute /> },
  { path: '/stories/:storyId/:mode',     element: <StoryPlayerRoute /> },
  { path: '/lesson/:unitId/:lessonId',   element: <LessonRoute /> },
  { path: '/admin',                      element: <AdminRoute /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
