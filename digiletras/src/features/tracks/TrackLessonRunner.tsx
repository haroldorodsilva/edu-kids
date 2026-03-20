import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrackById, saveTrackLessonResult, getRotationHistory, recordRotation } from '../../shared/tracks/trackStore';
import { selectNextGame } from '../../shared/tracks/rotation';
import { words } from '../../shared/data/words';
import { sentences } from '../../shared/data/sentences';
import { beep } from '../../shared/utils/audio';
import type { AgeGroup, TrackActivity, TrackLessonResult } from '../../shared/tracks/types';
import Syllable from '../games/Syllable';
import Quiz from '../games/Quiz';
import Fill from '../games/Fill';
import Memory from '../games/Memory';
import Write from '../games/Write';
import FirstLetter from '../games/FirstLetter';
import BuildSentence from '../games/BuildSentence';
import StoryPlayer from '../stories/StoryPlayer';
import MatchGame from '../games/MatchGame';

function calcStars(totalErrors: number, totalActivities: number): number {
  const errorRate = totalErrors / Math.max(totalActivities * 3, 1);
  if (errorRate < 0.1) return 3;
  if (errorRate < 0.3) return 2;
  return 1;
}

function ActivityProgress({ current, total, unitColor }: { current: number; total: number; unitColor: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-4 py-2" style={{ background: unitColor }}>
      <div className="flex-1 bg-white/30 rounded-full h-2">
        <div className="h-2 rounded-full bg-white transition-all duration-500" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <span className="text-white text-xs font-bold">{current}/{total}</span>
    </div>
  );
}

export default function TrackLessonRunner() {
  const navigate = useNavigate();
  const { ageGroup, trackId, unitIdx, lessonIdx } = useParams<{
    ageGroup: string; trackId: string; unitIdx: string; lessonIdx: string;
  }>();

  const age = (ageGroup as AgeGroup) || '3-4';
  const ui = Number(unitIdx) || 0;
  const li = Number(lessonIdx) || 0;

  const track = useMemo(() => getTrackById(trackId ?? ''), [trackId]);
  const unit = track?.units[ui];
  const lesson = unit?.lessons[li];

  // Apply rotation engine to vary game types for activities
  const activities: TrackActivity[] = useMemo(() => {
    if (!lesson) return [];
    const rotationHistory = getRotationHistory();
    const recentGames = rotationHistory[lesson.id] ?? [];

    return lesson.activities.map((act) => {
      // Only rotate if the activity has a generic game type that can be varied
      // For story and matchgame activities, keep the original type
      if (act.gameType === 'story' || act.gameType === 'matchgame') return act;

      const availableTypes = lesson.activities
        .filter((a) => a.gameType !== 'story' && a.gameType !== 'matchgame')
        .map((a) => a.gameType);
      const uniqueTypes = [...new Set(availableTypes)];

      if (uniqueTypes.length <= 1) return act;

      const nextType = selectNextGame(uniqueTypes, recentGames, 5);
      return { ...act, gameType: nextType as TrackActivity['gameType'] };
    });
  }, [lesson]);

  const [activityIdx, setActivityIdx] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [lessonDone, setLessonDone] = useState(false);
  const [stars, setStars] = useState(0);

  // Error guard: missing track/unit/lesson
  if (!track || !unit || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Lição não encontrada</h2>
        <button
          onClick={() => navigate(`/tracks/${age}`)}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  const activity = activities[activityIdx];
  const totalActivities = activities.length;

  function handleActivityComplete(errors: number) {
    const newErrors = totalErrors + errors;
    setTotalErrors(newErrors);

    // Record rotation for this activity's game type
    if (activity) {
      recordRotation(lesson!.id, activity.gameType);
    }

    if (activityIdx + 1 >= totalActivities) {
      // Lesson done
      const s = calcStars(newErrors, totalActivities);
      setStars(s);
      const result: TrackLessonResult = {
        stars: s,
        xp: s * 30,
        completedAt: new Date().toISOString(),
        errors: newErrors,
      };
      saveTrackLessonResult(track!.id, lesson!.id, result);
      setLessonDone(true);
      beep('yay');
    } else {
      setActivityIdx((i) => i + 1);
    }
  }

  if (lessonDone) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6"
        style={{ background: `linear-gradient(135deg, ${unit.color} 0%, ${unit.bg} 100%)` }}
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-pop">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: unit.color }}>{lesson.title}</h2>
          <p className="text-gray-500 mb-4">Lição concluída!</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <span key={s} style={{ fontSize: 40, opacity: s <= stars ? 1 : 0.2 }}>⭐</span>
            ))}
          </div>
          <p className="text-gray-600 mb-6">+{stars * 30} XP</p>
          <button
            onClick={() => navigate(`/tracks/${age}`)}
            className="w-full py-4 rounded-2xl font-bold text-xl text-white"
            style={{ backgroundColor: unit.color }}
          >
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  // Get word subset for this activity
  const wordPool = words.filter((w) => activity.wordIds.includes(w.id));
  const sentencePool = activity.sentenceIds
    ? sentences.filter((s) => activity.sentenceIds!.includes(s.id))
    : undefined;

  const gameBack = () => navigate(`/tracks/${age}`);
  const gameComplete = (errors: number) => handleActivityComplete(errors);

  return (
    <div>
      <ActivityProgress current={activityIdx} total={totalActivities} unitColor={unit.color} />
      <div style={{ paddingTop: 40 }}>
        {activity.gameType === 'syllable' && (
          <Syllable key={activityIdx} onBack={gameBack} wordPool={wordPool} rounds={activity.rounds} onComplete={gameComplete} />
        )}
        {activity.gameType === 'quiz' && (
          <Quiz key={activityIdx} onBack={gameBack} wordPool={wordPool} rounds={activity.rounds} onComplete={gameComplete} />
        )}
        {activity.gameType === 'fill' && (
          <Fill key={activityIdx} onBack={gameBack} wordPool={wordPool} rounds={activity.rounds} onComplete={gameComplete} />
        )}
        {activity.gameType === 'memory' && (
          <Memory key={activityIdx} onBack={gameBack} wordPool={wordPool} onComplete={gameComplete} />
        )}
        {activity.gameType === 'write' && (
          <Write key={activityIdx} onBack={gameBack} wordPool={wordPool} rounds={activity.rounds} onComplete={gameComplete} />
        )}
        {activity.gameType === 'firstletter' && (
          <FirstLetter key={activityIdx} onBack={gameBack} wordPool={wordPool} rounds={activity.rounds} onComplete={gameComplete} />
        )}
        {activity.gameType === 'buildsentence' && (
          <BuildSentence key={activityIdx} onBack={gameBack} sentencePool={sentencePool} rounds={activity.rounds} onComplete={gameComplete} />
        )}
        {activity.gameType === 'story' && activity.storyId && (
          <StoryPlayer
            key={activityIdx}
            storyId={activity.storyId}
            mode={activity.storyMode || 'typing'}
            onBack={gameBack}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'matchgame' && activity.matchGameId && (
          <MatchGame
            key={activityIdx}
            gameId={activity.matchGameId}
            onBack={gameBack}
            onComplete={gameComplete}
          />
        )}
      </div>
    </div>
  );
}
