import React from 'react';
import { Avatar } from '../components/Shared';
import { formatMiles, loggedMiles, MILESTONE_MILES, nextMilestone } from '../utils/storage';

export default function DashboardScreen({ profile, history, onNavigate, onOpenJournal }) {
  const journaledCount = history.filter(h => h.journal).length;
  const recent = history.slice().reverse().slice(0, 3);
  const totalMiles = loggedMiles(history);
  const upcomingMilestone = nextMilestone(totalMiles);
  const previousMilestone = MILESTONE_MILES.filter(m => totalMiles >= m).pop() || 0;
  const progressTarget = upcomingMilestone || MILESTONE_MILES[MILESTONE_MILES.length - 1];
  const progressRange = Math.max(progressTarget - previousMilestone, 1);
  const milestoneProgress = upcomingMilestone
    ? Math.min(100, Math.max(0, ((totalMiles - previousMilestone) / progressRange) * 100))
    : 100;

  return (
    <div>
      {/* Black header */}
      <div className="dash-banner">
        <div className="dash-greeting">Good day, coach.</div>
        <div className="dash-name">
          Hey, <span style={{ color: 'var(--red)' }}>{profile.name}</span>! 💪
        </div>
      </div>

      <div className="dash-stat-row">
        <div className="dash-stat">
          <div className="dash-stat-val">{formatMiles(totalMiles)}</div>
          <div className="dash-stat-label">Miles Ran</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-val">{history.length}</div>
          <div className="dash-stat-label">Runs Saved</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-val">{journaledCount}</div>
          <div className="dash-stat-label">Journals Filed</div>
        </div>
      </div>

      <div className="pp">
        {/* Profile strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'var(--g1)', borderRadius: 'var(--rad)' }}>
          <Avatar profile={profile} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: 'var(--g4)' }}>{profile.goal || 'Runner'}</div>
            {profile.allergiesAll && (
              <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 3 }}>
                🚨 Allergies on file
              </div>
            )}
          </div>
        </div>

        <div className="mileage-card">
          <div className="mileage-topline">
            <span>🏁 Mileage Quest</span>
            <strong>{formatMiles(totalMiles)} mi</strong>
          </div>
          {upcomingMilestone ? (
            <>
              <div className="mileage-copy">
                Next celebration at {upcomingMilestone} miles. Only {formatMiles(Math.max(upcomingMilestone - totalMiles, 0))} mi to go.
              </div>
              <div className="mileage-progress">
                <div style={{ width: `${milestoneProgress}%` }} />
              </div>
            </>
          ) : (
            <div className="mileage-copy">
              100 mile club unlocked. Keep the streak spicy.
            </div>
          )}
        </div>

        {/* CTA cards */}
        <div className="cta-card red" onClick={() => onNavigate('planner')}>
          <h3>🏃 Plan Your Fuel</h3>
          <p>Enter your run and get a personalized AI nutrition plan.</p>
        </div>

        <div className="cta-card dark" onClick={() => onOpenJournal(null)}>
          <h3>📝 Log Post-Run Journal</h3>
          <p>Document what you ate, how you felt, and let the AI learn.</p>
        </div>

        {/* Recent runs */}
        <div className="section-title" style={{ margin: '16px 0 10px' }}>Recent Runs</div>

        {recent.length === 0
          ? <div className="empty-state">No runs yet — plan your first fuel! 🏃</div>
          : recent.map((r, i) => (
            <div
              key={i}
              className="run-card"
              onClick={() => onOpenJournal(history.length - 1 - i)}
            >
              <div className="run-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {r.runType || 'Run'} — {r.dist} mi
                </div>
                <div style={{ fontSize: 12, color: 'var(--g4)' }}>
                  {r.date}
                  {r.journal ? ' · ✅ Journal logged' : ' · 📝 Tap to log journal'}
                </div>
              </div>
              <div className="run-dist">{r.dist} mi</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
