import { useState } from 'react';
import { ArrowLeft, BookOpen, Keyboard, Headphones, Star } from 'lucide-react';
import { stories } from '../../shared/data/stories';
import { getCustomStories } from '../../shared/data/customStories';

interface Props {
  onSelect: (storyId: string, mode: 'typing' | 'dictation') => void;
  onBack: () => void;
}

function DiffStars({ d }: { d: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: d }, (_, i) => (
        <Star key={i} size={12} className="text-amber-400" fill="currentColor" />
      ))}
    </span>
  );
}

export default function StoryPicker({ onSelect, onBack }: Props) {
  const [allStories] = useState(() => [...stories, ...getCustomStories()]);

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)' }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow transition-colors cursor-pointer"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-blue-700" />
        </button>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-800">
          <BookOpen size={24} /> Histórias
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
        {allStories.map(story => (
          <div key={story.id} className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{story.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{story.title}</h3>
                <DiffStars d={story.difficulty} />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 italic">"{story.sentences[0]}"</p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelect(story.id, 'typing')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500 text-white font-bold text-sm cursor-pointer"
              >
                <Keyboard size={14} /> Digitar
              </button>
              <button
                onClick={() => onSelect(story.id, 'dictation')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-500 text-white font-bold text-sm cursor-pointer"
              >
                <Headphones size={14} /> Ditado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
