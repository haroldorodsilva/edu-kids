import { createHashRouter, RouterProvider, useNavigate, useLocation, useParams } from 'react-router-dom';
import Syllable from './features/games/Syllable';
import Quiz from './features/games/Quiz';
import Fill from './features/games/Fill';
import Memory from './features/games/Memory';
import Write from './features/games/Write';
import FirstLetter from './features/games/FirstLetter';
import BuildSentence from './features/games/BuildSentence';
import MatchGame from './features/games/MatchGame';
import Coloring from './features/games/Coloring';
import StoryPicker from './features/stories/StoryPicker';
import StoryPlayer from './features/stories/StoryPlayer';
import InteractiveStoryPicker from './features/stories/InteractiveStoryPicker';
import InteractiveStoryPlayer from './features/stories/InteractiveStoryPlayer';
import AdminPanel from './features/admin/AdminPanel';
import PathScreen from './features/path/PathScreen';
import FreePlayScreen from './features/freeplay/FreePlayScreen';
import LessonRunner from './features/lesson/LessonRunner';
import type { Word } from './shared/data/words';

// ── Route state type for free-play games ────────────────────────────────────
interface GameState { wordPool?: Word[]; rounds?: number }

// ── Free-play game wrappers (connect router → game props) ────────────────────

function SyllableRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <Syllable wordPool={state?.wordPool} rounds={state?.rounds} onBack={() => nav('/freeplay')} />;
}
function QuizRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <Quiz wordPool={state?.wordPool} rounds={state?.rounds} onBack={() => nav('/freeplay')} />;
}
function FillRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <Fill wordPool={state?.wordPool} rounds={state?.rounds} onBack={() => nav('/freeplay')} />;
}
function MemoryRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <Memory wordPool={state?.wordPool} onBack={() => nav('/freeplay')} />;
}
function WriteRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <Write wordPool={state?.wordPool} rounds={state?.rounds} onBack={() => nav('/freeplay')} />;
}
function FirstLetterRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <FirstLetter wordPool={state?.wordPool} rounds={state?.rounds} onBack={() => nav('/freeplay')} />;
}
function BuildSentenceRoute() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: GameState | null };
  return <BuildSentence rounds={state?.rounds} onBack={() => nav('/freeplay')} />;
}
function MatchGameRoute() {
  const nav = useNavigate();
  return <MatchGame onBack={() => nav('/freeplay')} />;
}
function ColoringRoute() {
  const nav = useNavigate();
  return <Coloring onBack={() => nav('/freeplay')} />;
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
function InteractiveStoryPickerRoute() {
  const nav = useNavigate();
  return (
    <InteractiveStoryPicker
      onSelect={(id) => nav(`/interactive/${id}`)}
      onBack={() => nav('/freeplay')}
    />
  );
}
function InteractiveStoryPlayerRoute() {
  const nav = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  if (!storyId) return null;
  return (
    <InteractiveStoryPlayer
      storyId={storyId}
      onBack={() => nav('/freeplay/interactive')}
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

// ── Router definition ────────────────────────────────────────────────────────

const router = createHashRouter([
  { path: '/',                           element: <PathRoute /> },
  { path: '/freeplay',                   element: <FreePlayRoute /> },
  { path: '/freeplay/syllable',          element: <SyllableRoute /> },
  { path: '/freeplay/quiz',              element: <QuizRoute /> },
  { path: '/freeplay/fill',              element: <FillRoute /> },
  { path: '/freeplay/memory',            element: <MemoryRoute /> },
  { path: '/freeplay/write',             element: <WriteRoute /> },
  { path: '/freeplay/firstletter',       element: <FirstLetterRoute /> },
  { path: '/freeplay/buildsentence',     element: <BuildSentenceRoute /> },
  { path: '/freeplay/matchgame',         element: <MatchGameRoute /> },
  { path: '/freeplay/coloring',          element: <ColoringRoute /> },
  { path: '/freeplay/storypicker',       element: <StoryPickerRoute /> },
  { path: '/freeplay/interactive',       element: <InteractiveStoryPickerRoute /> },
  { path: '/interactive/:storyId',       element: <InteractiveStoryPlayerRoute /> },
  { path: '/stories/:storyId/:mode',     element: <StoryPlayerRoute /> },
  { path: '/lesson/:unitId/:lessonId',   element: <LessonRoute /> },
  { path: '/admin',                      element: <AdminRoute /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
