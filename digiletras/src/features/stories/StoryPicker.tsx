import { useState } from 'react';
import { stories } from '../../shared/data/stories';
import { getCustomStories } from '../../shared/data/customStories';

interface Props {
  onSelect: (storyId: string, mode: 'typing' | 'dictation') => void;
  onBack: () => void;
}

const diffLabel = (d: number) => d === 1 ? '⭐' : d === 2 ? '⭐⭐' : '⭐⭐⭐';

export default function StoryPicker({ onSelect, onBack }: Props) {
  const [allStories] = useState(() => [...stories, ...getCustomStories()]);

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-blue-700 text-2xl font-bold">←</button>
        <h1 className="text-2xl font-bold text-blue-800">📖 Histórias</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
        {allStories.map(story => (
          <div key={story.id} className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{story.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{story.title}</h3>
                <span className="text-sm text-gray-500">{diffLabel(story.difficulty)}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 italic">"{story.sentences[0]}"</p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelect(story.id, 'typing')}
                className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold text-sm"
              >
                ⌨️ Digitar
              </button>
              <button
                onClick={() => onSelect(story.id, 'dictation')}
                className="flex-1 py-2 rounded-xl bg-purple-500 text-white font-bold text-sm"
              >
                🎧 Ditado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
