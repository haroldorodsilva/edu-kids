import { useState } from 'react';
import { Trophy, Star, ChevronRight } from 'lucide-react';
import { curriculum } from '../../shared/progression/curriculum';
import { words } from '../../shared/data/words';
import { sentences } from '../../shared/data/sentences';
import { beep } from '../../shared/utils/audio';
import { useProgress } from '../../shared/progression/useProgress';
import type { LessonResult } from '../../shared/progression/types';
import Syllable from '../games/Syllable';
import Quiz from '../games/Quiz';
import Fill from '../games/Fill';
import Memory from '../games/Memory';
import Write from '../games/Write';
import FirstLetter from '../games/FirstLetter';
import BuildSentence from '../games/BuildSentence';
import StoryPlayer from '../stories/StoryPlayer';

interface Props {
  unitId: string;
  lessonId: string;
  onComplete: () => void;
  onBack: () => void;
}

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

export default function LessonRunner({ unitId, lessonId, onComplete, onBack }: Props) {
  const unit = curriculum.find(u => u.id === unitId)!;
  const lesson = unit.lessons.find(l => l.id === lessonId)!;
  const { completeLesson } = useProgress();

  const [activityIdx, setActivityIdx] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [lessonDone, setLessonDone] = useState(false);
  const [stars, setStars] = useState(0);

  const activity = lesson.activities[activityIdx];
  const totalActivities = lesson.activities.length;

  function handleActivityComplete(errors: number) {
    const newErrors = totalErrors + errors;
    setTotalErrors(newErrors);

    if (activityIdx + 1 >= totalActivities) {
      // Lesson done
      const s = calcStars(newErrors, totalActivities);
      setStars(s);
      const result: LessonResult = {
        stars: s,
        xp: s * 30,
        completedAt: new Date().toISOString(),
      };
      completeLesson(lessonId, result);
      setLessonDone(true);
      beep('yay');
    } else {
      setActivityIdx(i => i + 1);
    }
  }

  if (lessonDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ background: `linear-gradient(135deg, ${unit.color} 0%, ${unit.bg} 100%)` }}>
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-pop">
          <div className="text-7xl mb-4"><Trophy size={64} className="mx-auto" color={unit.color} /></div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: unit.color }}>{lesson.title}</h2>
          <p className="text-gray-500 mb-4">Lição concluída!</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <span key={s} style={{ fontSize: 40, opacity: s <= stars ? 1 : 0.2 }}><Star size={40} fill={s <= stars ? '#FFD700' : 'transparent'} color={s <= stars ? '#FFD700' : '#ccc'} /></span>
            ))}
          </div>
          <p className="text-gray-600 mb-6">+{stars * 30} XP</p>
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl font-bold text-xl text-white"
            style={{ backgroundColor: unit.color }}
          >
            Continuar <ChevronRight size={18} className="inline align-middle" />
          </button>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  // Get word subset for this activity
  const wordPool = words.filter(w => activity.wordIds.includes(w.id));
  const sentencePool = activity.sentenceIds
    ? sentences.filter(s => activity.sentenceIds!.includes(s.id))
    : undefined;

  // onBack for games: go back to path
  const gameBack = () => onBack();
  // onComplete for games: advance to next activity
  const gameComplete = (errors: number) => handleActivityComplete(errors);

  return (
    <div>
      <ActivityProgress current={activityIdx} total={totalActivities} unitColor={unit.color} />
      <div style={{ paddingTop: 40 }}>
        {activity.gameType === 'syllable' && (
          <Syllable
            onBack={gameBack}
            wordPool={wordPool}
            rounds={activity.rounds}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'quiz' && (
          <Quiz
            onBack={gameBack}
            wordPool={wordPool}
            rounds={activity.rounds}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'fill' && (
          <Fill
            onBack={gameBack}
            wordPool={wordPool}
            rounds={activity.rounds}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'memory' && (
          <Memory
            onBack={gameBack}
            wordPool={wordPool}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'write' && (
          <Write
            onBack={gameBack}
            wordPool={wordPool}
            rounds={activity.rounds}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'firstletter' && (
          <FirstLetter
            onBack={gameBack}
            wordPool={wordPool}
            rounds={activity.rounds}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'buildsentence' && (
          <BuildSentence
            onBack={gameBack}
            sentencePool={sentencePool}
            rounds={activity.rounds}
            onComplete={gameComplete}
          />
        )}
        {activity.gameType === 'story' && activity.storyId && (
          <StoryPlayer
            storyId={activity.storyId}
            mode={activity.storyMode || 'typing'}
            onBack={gameBack}
            onComplete={gameComplete}
          />
        )}
      </div>
    </div>
  );
}
