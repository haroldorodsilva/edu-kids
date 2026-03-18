import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import { stories } from '../../shared/data/stories';
import { getCustomStories } from '../../shared/data/customStories';
import { getSessionStats } from '../../shared/utils/sessionStats';
import type { SessionStats } from '../../shared/utils/sessionStats';

const GAME_LABELS: Record<string, string> = {
  fill: '✏️ Completar',
  write: '✍️ Escrever',
  quiz: '🖼️ Quiz',
  firstletter: '🔤 Letra Inicial',
  syllable: '🔊 Sílabas',
  memory: '🧠 Memória',
  buildsentence: '📝 Montar Frase',
  storyplayer: '📖 História',
};

export default function Dashboard() {
  const [stats, setStats] = useState<SessionStats>(() => getSessionStats());

  useEffect(() => {
    const id = setInterval(() => setStats(getSessionStats()), 2000);
    return () => clearInterval(id);
  }, []);

  const customCount = getCustomStories().length;
  const totalGamesPlayed = Object.values(stats.gamesPlayed).reduce((s, v) => s + v, 0);
  const accuracy = stats.totalAttempts > 0
    ? Math.round(((stats.totalAttempts - stats.totalErrors) / stats.totalAttempts) * 100)
    : null;

  const topErrorWords = Object.entries(stats.wordStats)
    .filter(([, ws]) => ws.errors > 0)
    .sort(([, a], [, b]) => b.errors - a.errors)
    .slice(0, 5);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Dashboard</h2>

      {/* Banco de dados */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Palavras no banco', value: String(words.length), icon: '📚' },
          { label: 'Histórias', value: String(stories.length + customCount), icon: '📖' },
          { label: 'Jogos disponíveis', value: '8', icon: '🎮' },
          { label: 'Histórias criadas', value: String(customCount), icon: '✨' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 shadow text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-purple-700">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Sessão atual */}
      <h3 className="font-bold text-gray-700 mb-3">🕐 Sessão atual</h3>
      {totalGamesPlayed === 0 ? (
        <div className="bg-blue-50 rounded-2xl p-4 text-center text-blue-600 text-sm mb-4">
          Nenhum jogo jogado ainda nesta sessão.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow text-center">
            <div className="text-2xl font-bold text-green-600">{totalGamesPlayed}</div>
            <div className="text-xs text-gray-500">Jogos jogados</div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</div>
            <div className="text-xs text-gray-500">Palavras tentadas</div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow text-center">
            <div className="text-2xl font-bold" style={{ color: accuracy !== null && accuracy >= 70 ? '#4CAF50' : '#FF9800' }}>
              {accuracy !== null ? `${accuracy}%` : '—'}
            </div>
            <div className="text-xs text-gray-500">Precisão</div>
          </div>
        </div>
      )}

      {/* Jogos jogados detalhado */}
      {totalGamesPlayed > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow mb-4">
          <h4 className="font-bold text-gray-600 text-sm mb-2">Jogos nesta sessão</h4>
          <div className="space-y-1">
            {Object.entries(stats.gamesPlayed).map(([game, count]) => (
              <div key={game} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{GAME_LABELS[game] ?? game}</span>
                <span className="font-bold text-purple-700">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top palavras com erros */}
      {topErrorWords.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow mb-4">
          <h4 className="font-bold text-gray-600 text-sm mb-2">⚠️ Palavras com mais erros</h4>
          <div className="space-y-2">
            {topErrorWords.map(([word, ws]) => {
              const errorRate = Math.round((ws.errors / (ws.attempts * (word.length || 1))) * 100);
              return (
                <div key={word} className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 w-20 text-sm">{word}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${Math.min(errorRate, 100)}%`, backgroundColor: errorRate > 50 ? '#F44336' : '#FF9800' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{ws.errors} erro{ws.errors !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-400 text-center">
        Dados da sessão são resetados ao fechar o navegador.
      </div>
    </div>
  );
}
