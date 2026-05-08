import React, { useState } from 'react';
import { TopNav } from '../components/Shared';
import { feelLabel, feelEmoji } from '../utils/storage';

function HistCard({ run, idx, onJournal }) {
  const [open, setOpen] = useState(false);
  const j = run.journal;

  return (
    <div className="hist-card">
      <div className="hist-header" onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--g3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {run.date}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, margin: '4px 0' }}>
            {run.runType || 'Run'} — {run.dist} mi
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {run.intensity && <span className="tag tag-red">{run.intensity}</span>}
            {run.weather   && <span className="tag">{run.weather}</span>}
            {j
              ? <span className="tag tag-green">📝 Journal logged</span>
              : <span style={{ fontSize: 11, color: 'var(--g3)' }}>No journal</span>
            }
          </div>
        </div>
        <svg
          width="16" height="16" fill="none" stroke="var(--g3)" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: 4 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div className="hist-body">
          {j ? (
            <>
              {/* Feel scores */}
              <div className="feel-score-grid">
                {['performance', 'stomach', 'energy'].map(type => (
                  <div key={type} className="feel-score-box">
                    <span className="feel-score-emoji">{feelEmoji(type, j[type]) || '—'}</span>
                    <span className="feel-score-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span className="feel-score-val">{feelLabel(type, j[type])}</span>
                  </div>
                ))}
                <div className="feel-score-box">
                  <span className="feel-score-emoji">{feelEmoji('hydration', j.hydration_feel) || '—'}</span>
                  <span className="feel-score-name">Hydration</span>
                  <span className="feel-score-val">{feelLabel('hydration', j.hydration_feel)}</span>
                </div>
              </div>

              {/* Food log */}
              {j.ateImm && (
                <div style={{ marginBottom: 8 }}>
                  <div className="label">Ate within 30 min</div>
                  <div style={{ fontSize: 13 }}>{j.ateImm}</div>
                </div>
              )}
              {j.ateMeal && (
                <div style={{ marginBottom: 8 }}>
                  <div className="label">Recovery meal</div>
                  <div style={{ fontSize: 13 }}>{j.ateMeal}</div>
                </div>
              )}
              {j.hydration && (
                <div style={{ marginBottom: 8 }}>
                  <div className="label">Hydration</div>
                  <div style={{ fontSize: 13 }}>{j.hydration}</div>
                </div>
              )}
              {j.notes && (
                <div style={{ marginBottom: 8 }}>
                  <div className="label">Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--g4)' }}>{j.notes}</div>
                </div>
              )}

              {/* AI feedback snapshot */}
              {run.aiFeedback && (
                <div className="ai-insight" style={{ marginTop: 8 }}>
                  <div className="ai-badge">AI COACH</div>
                  <div style={{ fontSize: 13, color: '#5a2020', fontWeight: 600, marginBottom: 6 }}>
                    "{run.aiFeedback.headline}"
                  </div>
                  <div style={{ fontSize: 12, color: '#5a2020', lineHeight: 1.5 }}>
                    Next tip: {run.aiFeedback.next_run_tip}
                  </div>
                </div>
              )}

              <button className="btn-outline" style={{ marginTop: 10 }} onClick={() => onJournal(idx)}>
                Edit Journal
              </button>
            </>
          ) : (
            <button className="btn-red" onClick={() => onJournal(idx)}>
              📝 Log Post-Run Journal
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryScreen({ history, onOpenJournal }) {
  return (
    <div>
      <TopNav right="History" />
      <div className="screen-body">
        <div className="pp">
          <div className="section-title mb16">Run History</div>
          {history.length === 0
            ? <div className="empty-state">No history yet. Save a fuel plan to get started!</div>
            : history.slice().reverse().map((r, i) => (
              <HistCard
                key={i}
                run={r}
                idx={history.length - 1 - i}
                onJournal={onOpenJournal}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}
