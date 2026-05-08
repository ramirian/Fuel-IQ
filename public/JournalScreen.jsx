import React, { useState, useEffect } from 'react';
import { FeelGrid, LoadingDots } from '../components/Shared';
import { createRunId, getJournalFeedback, feelLabel } from '../utils/storage';

const RUN_TYPES = ['General Run', 'Easy', 'Long Run', 'Speed', 'Intervals', 'Tempo', 'Race', 'Recovery'];

const FEEL_OPTIONS = {
  performance: [
    { val: 1, icon: '😩', label: 'Struggled',     sub: 'Felt depleted' },
    { val: 2, icon: '😐', label: 'Got Through It', sub: 'Average run' },
    { val: 3, icon: '😊', label: 'Felt Good',      sub: 'Solid energy' },
    { val: 4, icon: '🔥', label: 'Crushed It',     sub: 'Peak performance' },
  ],
  stomach: [
    { val: 1, icon: '🤢', label: 'GI Issues',      sub: 'Nausea / cramps' },
    { val: 2, icon: '😬', label: 'Uncomfortable',  sub: 'Some discomfort' },
    { val: 3, icon: '😌', label: 'Fine',            sub: 'No issues' },
    { val: 4, icon: '✅', label: 'Perfect',         sub: 'Zero discomfort' },
  ],
  energy: [
    { val: 1, icon: '🪫', label: 'Bonked',     sub: 'Hit the wall' },
    { val: 2, icon: '⚡', label: 'Faded',      sub: 'Dropped mid-run' },
    { val: 3, icon: '🔋', label: 'Steady',     sub: 'Consistent' },
    { val: 4, icon: '🚀', label: 'Strong',     sub: 'Fueled all the way' },
  ],
  hydration: [
    { val: 1, icon: '🥵',   label: 'Dehydrated',   sub: 'Very thirsty' },
    { val: 2, icon: '😮‍💨', label: 'Slightly Low',  sub: 'Should have drunk more' },
    { val: 3, icon: '💧',   label: 'Good',          sub: 'Well hydrated' },
    { val: 4, icon: '🌊',   label: 'Optimal',       sub: 'Perfect balance' },
  ],
};

export default function JournalScreen({ targetIdx, history, profile, onSave, onBack }) {
  const [linkedIdx, setLinkedIdx] = useState(targetIdx ?? '');
  const normalizedLinkedIdx = linkedIdx === '' ? null : Number(linkedIdx);
  const runData = normalizedLinkedIdx !== null ? history[normalizedLinkedIdx] : null;
  const existing = runData?.journal || null;

  const [ateImm,    setAteImm]    = useState(existing?.ateImm    || '');
  const [ateMeal,   setAteMeal]   = useState(existing?.ateMeal   || '');
  const [hydration, setHydration] = useState(existing?.hydration || '');
  const [notes,     setNotes]     = useState(existing?.notes     || '');
  const [perf,      setPerf]      = useState(existing?.performance || 0);
  const [stomach,   setStomach]   = useState(existing?.stomach    || 0);
  const [energy,    setEnergy]    = useState(existing?.energy     || 0);
  const [hydFeel,   setHydFeel]   = useState(existing?.hydration_feel || 0);
  const [feedback,  setFeedback]  = useState(existing ? (runData?.aiFeedback || null) : null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState(!!existing);
  const [manualDist, setManualDist] = useState('');
  const [manualRunType, setManualRunType] = useState('General Run');
  const [manualRunId] = useState(() => createRunId());

  useEffect(() => {
    setLinkedIdx(targetIdx ?? '');
  }, [targetIdx]);

  useEffect(() => {
    const j = runData?.journal || null;
    setAteImm(j?.ateImm || '');
    setAteMeal(j?.ateMeal || '');
    setHydration(j?.hydration || '');
    setNotes(j?.notes || '');
    setPerf(j?.performance || 0);
    setStomach(j?.stomach || 0);
    setEnergy(j?.energy || 0);
    setHydFeel(j?.hydration_feel || 0);
    setFeedback(j ? (runData?.aiFeedback || null) : null);
    setSubmitted(!!j);
    setError('');
  }, [normalizedLinkedIdx]); // eslint-disable-line

  async function handleSubmit() {
    if (!runData && !manualDist) { setError('Link a saved run or enter how many miles you ran.'); return; }
    if (!ateImm && !ateMeal) { setError('Please log at least one post-run meal.'); return; }
    setError('');
    setLoading(true);

    const journalRun = runData || {
      id: manualRunId,
      runType: manualRunType || 'General Run',
      dist: manualDist,
      date: new Date().toLocaleDateString(),
    };

    const journalData = {
      ateImm, ateMeal, hydration, notes,
      performance: perf,
      stomach,
      energy,
      hydration_feel: hydFeel,
      date: new Date().toLocaleDateString(),
    };

    onSave(journalData, null, normalizedLinkedIdx, journalRun); // save immediately without feedback

    try {
      const fb = await getJournalFeedback(journalData, journalRun, profile, history);
      setFeedback(fb);
      onSave(journalData, fb, normalizedLinkedIdx, journalRun);  // save again with feedback
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div>
      <div className="page-header" style={{ background: '#111' }}>
        <div className="page-title">POST-RUN JOURNAL</div>
        <p>Document what you ate and how you felt</p>
      </div>

      <div className="screen-body">
        <div className="pp">

          {/* Run link */}
          {history.length > 0 && (
            <div className="card journal-link-card">
              <span className="label">Link this journal to a run</span>
              <select
                className="input"
                value={linkedIdx}
                onChange={e => setLinkedIdx(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">Enter a run manually</option>
                {history.map((run, idx) => (
                  <option key={idx} value={idx}>
                    {run.date} · {run.runType || 'Run'} · {run.dist} mi{run.journal ? ' · journal logged' : ''}
                  </option>
                ))}
              </select>
              <p className="journal-link-help">
                Pick a saved fuel plan so the journal attaches to the right run.
              </p>
            </div>
          )}

          {/* Run info */}
          {runData && (
            <div className="card" style={{ background: 'var(--g1)', border: 'none', marginBottom: 20 }}>
              <div className="label">Logging for</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {runData.runType} · {runData.dist} miles
              </div>
              <div style={{ fontSize: 13, color: 'var(--g4)' }}>
                {[runData.date, runData.dur, runData.runSetting, runData.weather].filter(Boolean).join(' · ')}
              </div>
            </div>
          )}

          {!runData && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="label">Run details</div>
              <div className="form-grid-2" style={{ marginBottom: 0 }}>
                <div>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={manualDist}
                    onChange={e => setManualDist(e.target.value)}
                    placeholder="Miles"
                  />
                </div>
                <div>
                  <select
                    className="input"
                    value={manualRunType}
                    onChange={e => setManualRunType(e.target.value)}
                  >
                    {RUN_TYPES.map(type => <option key={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── FOOD LOG ── */}
          <div className="section-title mb16">What did you eat?</div>

          <div className="form-row">
            <span className="label">Immediate Recovery (within 30 min)</span>
            <textarea
              className="input"
              value={ateImm}
              onChange={e => setAteImm(e.target.value)}
              placeholder="e.g. chocolate milk, banana, protein shake, energy bar..."
            />
          </div>

          <div className="form-row">
            <span className="label">Full Recovery Meal (1–2 hrs after)</span>
            <textarea
              className="input"
              value={ateMeal}
              onChange={e => setAteMeal(e.target.value)}
              placeholder="e.g. grilled chicken + rice + salad, pasta bolognese, salmon + sweet potato..."
            />
          </div>

          <div className="form-row">
            <span className="label">Hydration After Run</span>
            <input
              className="input"
              value={hydration}
              onChange={e => setHydration(e.target.value)}
              placeholder="e.g. 32 oz water, 1 electrolyte drink, coconut water..."
            />
          </div>

          <div className="divider" />

          {/* ── FEEL RATINGS ── */}
          <div className="section-title mb16">How did you feel?</div>

          <div className="form-row">
            <span className="label">Overall Performance</span>
            <FeelGrid
              type="performance" value={perf}
              onChange={setPerf} options={FEEL_OPTIONS.performance}
            />
          </div>

          <div className="form-row">
            <span className="label">Stomach Comfort During Run</span>
            <FeelGrid
              type="stomach" value={stomach}
              onChange={setStomach} options={FEEL_OPTIONS.stomach}
            />
          </div>

          <div className="form-row">
            <span className="label">Energy Levels</span>
            <FeelGrid
              type="energy" value={energy}
              onChange={setEnergy} options={FEEL_OPTIONS.energy}
            />
          </div>

          <div className="form-row">
            <span className="label">Hydration During Run</span>
            <FeelGrid
              type="hydration" value={hydFeel}
              onChange={setHydFeel} options={FEEL_OPTIONS.hydration}
            />
          </div>

          <div className="form-row">
            <span className="label">Additional Notes</span>
            <textarea
              className="input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Side stitch? Food that sat heavy? What worked well? Anything the AI should know..."
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          {!submitted && (
            <button className="btn-red" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Getting AI Feedback…' : 'Get AI Feedback & Save Journal ⚡'}
            </button>
          )}

          {loading && <LoadingDots />}

          {/* ── AI FEEDBACK ── */}
          {feedback && (
            <div className="ai-insight" style={{ marginTop: 16 }}>
              <div className="ai-badge">AI COACH FEEDBACK</div>
              <div className="ai-headline">"{feedback.headline}"</div>

              <div className="ai-section-label">✅ What's working</div>
              <div className="ai-text">{feedback.whats_working}</div>

              <div className="ai-section-label">⚠️ Needs attention</div>
              <div className="ai-text">{feedback.needs_improvement}</div>

              <div className="ai-section-label">🎯 Next run tip</div>
              <div className="ai-text">{feedback.next_run_tip}</div>

              {feedback.allergy_check && feedback.allergy_check !== 'All clear' && (
                <div className="allergy-warning" style={{ marginTop: 10 }}>
                  🚨 Allergy note: {feedback.allergy_check}
                </div>
              )}
            </div>
          )}

          {submitted && (
            <button className="btn-outline" onClick={onBack} style={{ marginTop: 8 }}>
              ← Back to Dashboard
            </button>
          )}

          <div style={{ height: 30 }} />
        </div>
      </div>
    </div>
  );
}
