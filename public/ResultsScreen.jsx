import React, { useState, useEffect } from 'react';
import { FuelCard, FuelRow, LoadingDots } from '../components/Shared';
import { generateFuelPlan, buildFallbackPlan } from '../utils/storage';

function valueFor(slot, keys) {
  for (const key of keys) {
    const value = slot?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function PriorityCallout({ slot }) {
  const priority = valueFor(slot, ['priority', 'importance']);
  const reason = valueFor(slot, ['priority_reason', 'essential_reason']);
  if (!priority && !reason) return null;
  const tone = String(priority || '').toLowerCase().replace(/[^a-z]/g, '') || 'recommended';
  return (
    <div className="priority-callout">
      {priority && <span className={`priority-pill ${tone}`}>{priority}</span>}
      {reason && <span>{reason}</span>}
    </div>
  );
}

function MacroPills({ slot }) {
  const metrics = [
    { label: 'Carbs', value: valueFor(slot, ['carbs_g', 'carbs']) },
    { label: 'Protein', value: valueFor(slot, ['protein_g', 'protein']) },
    { label: 'Calories', value: valueFor(slot, ['calories_kcal', 'calories']) },
  ].filter(m => m.value !== '');
  if (!metrics.length) return null;
  return (
    <div className="macro-grid">
      {metrics.map(m => (
        <div className="macro-chip" key={m.label}>
          <span>{m.label}</span>
          <strong>{m.value}</strong>
        </div>
      ))}
    </div>
  );
}

function NutritionDetails({ slot }) {
  return (
    <>
      <PriorityCallout slot={slot} />
      <FuelRow label="Exact Portion" value={slot?.portion} />
      <MacroPills slot={slot} />
    </>
  );
}

export default function ResultsScreen({ runData, profile, history, onSave, onPlanAnother }) {
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPlan(null);
    setSaved(false);
    generateFuelPlan(runData, profile, history)
      .then(p => { if (!cancelled) { setPlan(p); setLoading(false); } })
      .catch(() => { if (!cancelled) { setPlan(buildFallbackPlan(profile, runData)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [runData]); // eslint-disable-line

  function handleSave() {
    onSave(plan);
    setSaved(true);
  }

  return (
    <div>
      <div className="result-header">
        <h2>YOUR FUEL PLAN</h2>
        <div className="run-pill">
          {[`${runData.dist} mi`, runData.dur, runData.runType, runData.intensity, runData.runSetting].filter(Boolean).join(' · ')}
        </div>
        {profile.allergiesAll && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
            🛡️ Allergen-safe for: {profile.allergiesAll}
          </div>
        )}
      </div>

      <div className="screen-body">
        <div className="pp">
          {loading && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--g4)', marginBottom: 4 }}>
                Building your personalized plan…
              </p>
              <LoadingDots />
              {history.filter(h => h.journal).length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--g3)' }}>
                  Analyzing your past {history.filter(h => h.journal).length} journal entries to fine-tune recommendations…
                </p>
              )}
            </div>
          )}

          {plan && (
            <>
              {plan.priority_summary && (
                <div className="priority-summary">
                  <span>Timing priorities</span>
                  {plan.priority_summary}
                </div>
              )}

              <FuelCard title="2 Hours Before" badge="2 HR" defaultOpen>
                <NutritionDetails slot={plan.slot_2h} />
                <FuelRow label="What to Eat"  value={plan.slot_2h?.eat} />
                <FuelRow label="What to Drink" value={plan.slot_2h?.drink} />
                <FuelRow label="Examples"      value={plan.slot_2h?.examples} />
                {plan.slot_2h?.why && <div className="fuel-why">🔥 {plan.slot_2h.why}</div>}
              </FuelCard>

              <FuelCard title="1 Hour Before" badge="1 HR">
                <NutritionDetails slot={plan.slot_1h} />
                <FuelRow label="What to Eat"  value={plan.slot_1h?.eat} />
                <FuelRow label="What to Drink" value={plan.slot_1h?.drink} />
                <FuelRow label="Examples"      value={plan.slot_1h?.examples} />
                {plan.slot_1h?.why && <div className="fuel-why">🔥 {plan.slot_1h.why}</div>}
              </FuelCard>

              <FuelCard title="30 Minutes Before" badge="30 MIN">
                <NutritionDetails slot={plan.slot_30} />
                <FuelRow label="What to Eat"  value={plan.slot_30?.eat} />
                <FuelRow label="What to Drink" value={plan.slot_30?.drink} />
                <FuelRow label="Examples"      value={plan.slot_30?.examples} />
                {plan.slot_30?.why && <div className="fuel-why">🔥 {plan.slot_30.why}</div>}
              </FuelCard>

              <FuelCard title="During the Run" badge="DURING">
                <NutritionDetails slot={plan.slot_during} />
                <FuelRow label="What to Take"  value={plan.slot_during?.eat} />
                <FuelRow label="What to Drink" value={plan.slot_during?.drink} />
                <FuelRow label="Carbs / Hour"  value={plan.slot_during?.carbs_per_hour} />
                <FuelRow label="Gel Timing"    value={plan.slot_during?.gel_timing} />
                <FuelRow label="Electrolytes"  value={plan.slot_during?.electrolytes} />
                <FuelRow label="Examples"      value={plan.slot_during?.examples} />
                {plan.slot_during?.why && <div className="fuel-why">⚡ {plan.slot_during.why}</div>}
              </FuelCard>

              <FuelCard title="After the Run" badge="RECOVERY">
                <NutritionDetails slot={plan.slot_after} />
                <FuelRow label="What to Eat"  value={plan.slot_after?.eat} />
                <FuelRow label="What to Drink" value={plan.slot_after?.drink} />
                <FuelRow label="Examples"      value={plan.slot_after?.examples} />
                {plan.slot_after?.why && <div className="fuel-why">🔥 {plan.slot_after.why}</div>}
              </FuelCard>

              <FuelCard title="Electrolytes & Hydration" badge="HYDRATION">
                <PriorityCallout slot={plan.slot_hydration} />
                <FuelRow label="Before Run"   value={plan.slot_hydration?.before} />
                <FuelRow label="During Run"   value={plan.slot_hydration?.during} />
                <FuelRow label="After Run"    value={plan.slot_hydration?.after} />
                <FuelRow label="Electrolytes" value={plan.slot_hydration?.electrolyte_tips} />
                {plan.slot_hydration?.why && <div className="fuel-why">💧 {plan.slot_hydration.why}</div>}
              </FuelCard>

              <button
                className="btn-red"
                onClick={handleSave}
                disabled={saved}
                style={{ marginTop: 8 }}
              >
                {saved ? '✓ Plan Saved! Go Log Your Journal →' : '✓ Save This Plan'}
              </button>
              <button className="btn-outline" onClick={onPlanAnother}>
                ← Plan Another Run
              </button>
            </>
          )}
          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
}
