import { BookOpen, Gamepad2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Track } from '../../tracks/types';

const GAME_LABELS: Record<string, string> = {
  quiz:          'Quiz',
  memory:        'Memória',
  syllable:      'Sílabas',
  fill:          'Completar',
  write:         'Escrever',
  firstletter:   'Letra Inicial',
  buildsentence: 'Montar Frase',
  story:         'História',
  matchgame:     'Ligar / Contar',
};

export default function TrackPreviewPanel({ track }: { track: Track }) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set([track.units[0]?.id]));

  const totalLessons = track.units.reduce((s, u) => s + u.lessons.length, 0);
  const totalActivities = track.units.reduce(
    (s, u) => s + u.lessons.reduce((ls, l) => ls + l.activities.length, 0), 0,
  );

  function toggleUnit(id: string) {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* Track header card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px', borderRadius: 18, marginBottom: 20,
        background: `linear-gradient(135deg, ${track.color}, ${track.color}bb)`,
        color: '#fff',
      }}>
        <span style={{ fontSize: 44, lineHeight: 1 }}>{track.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{track.name || 'Sem nome'}</div>
          <div style={{ fontSize: 12, opacity: 0.88, display: 'flex', gap: 12 }}>
            <span>{track.units.length} unidade{track.units.length !== 1 ? 's' : ''}</span>
            <span>{totalLessons} lições</span>
            <span>{totalActivities} atividades</span>
            {track.builtin && <span style={{ fontWeight: 700, opacity: 1, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '1px 8px' }}>padrão</span>}
          </div>
        </div>
      </div>

      {/* Units */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {track.units.map((unit, ui) => {
          const expanded = expandedUnits.has(unit.id);
          const lessonCount = unit.lessons.length;
          return (
            <div key={unit.id} style={{
              borderRadius: 14,
              border: `1.5px solid ${unit.color}44`,
              background: 'var(--color-surface)',
              overflow: 'hidden',
            }}>
              {/* Unit header */}
              <button
                onClick={() => toggleUnit(unit.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${unit.color}20`, color: unit.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {unit.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text)' }}>
                    Unidade {ui + 1} — {unit.title || 'Sem título'}
                  </div>
                  {unit.subtitle && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 1 }}>{unit.subtitle}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: `${unit.color}18`, color: unit.color,
                    borderRadius: 999, padding: '2px 8px',
                  }}>
                    {lessonCount} lição{lessonCount !== 1 ? 'ões' : ''}
                  </span>
                  {expanded ? <ChevronDown size={16} color="var(--color-text-2)" /> : <ChevronRight size={16} color="var(--color-text-2)" />}
                </div>
              </button>

              {/* Lessons */}
              {expanded && (
                <div style={{ borderTop: `1px solid ${unit.color}22`, padding: '8px 14px 14px' }}>
                  {unit.lessons.map((lesson, li) => (
                    <div key={lesson.id} style={{
                      marginBottom: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{lesson.emoji}</span>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>
                          Lição {li + 1}{lesson.title ? ` — ${lesson.title}` : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', color: 'var(--color-text-2)' }}>
                          <BookOpen size={12} />
                          <span style={{ fontSize: 11 }}>{lesson.activities.length} ativ.</span>
                        </div>
                      </div>

                      {/* Activities */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {lesson.activities.map((act) => (
                          <div key={act.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 999,
                            background: '#6C5CE715', border: '1.5px solid #6C5CE730',
                            fontSize: 11, fontWeight: 700, color: '#6C5CE7',
                          }}>
                            <Gamepad2 size={10} />
                            {GAME_LABELS[act.gameType] ?? act.gameType}
                            {act.wordIds.length > 0 && (
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                background: '#6C5CE730', borderRadius: 999, padding: '1px 5px',
                                marginLeft: 2,
                              }}>
                                {act.wordIds.length}p
                              </span>
                            )}
                          </div>
                        ))}
                        {lesson.activities.length === 0 && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>Sem atividades</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {unit.lessons.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-2)', padding: '8px 0' }}>
                      Nenhuma lição nesta unidade.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
