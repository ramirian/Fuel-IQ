import React, { useState } from 'react';
import { TopNav, Avatar, Toggle, SettingsRow } from '../components/Shared';

export default function SettingsScreen({
  profile,
  notificationPrefs = { milestones: true },
  onNotificationPrefsChange = () => {},
  onEditProfile,
  onClearHistory,
}) {
  const [preRun,   setPreRun]   = useState(true);
  const [postRun,  setPostRun]  = useState(true);
  const [dailyTip, setDailyTip] = useState(false);
  const milestoneAlerts = notificationPrefs.milestones !== false;

  const allergyList = profile.allergiesAll
    ? profile.allergiesAll.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  function handleClear() {
    if (window.confirm('Clear all run history? This cannot be undone.')) {
      onClearHistory();
    }
  }

  async function handleMilestoneAlerts() {
    const nextOn = !milestoneAlerts;
    const nextPrefs = { ...notificationPrefs, milestones: nextOn };
    if (
      nextOn &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'default'
    ) {
      const permission = await window.Notification.requestPermission();
      nextPrefs.milestones = permission === 'granted';
    }
    onNotificationPrefsChange(nextPrefs);
  }

  function milestoneSub() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'In-app celebrations will still appear';
    }
    if (window.Notification.permission === 'granted') {
      return 'Browser alerts when you hit 10, 25, 50, 75, and 100 miles';
    }
    if (window.Notification.permission === 'denied') {
      return 'Browser permission is blocked; in-app celebrations still show';
    }
    return 'Enable browser alerts for 10, 25, 50, 75, and 100 miles';
  }

  return (
    <div>
      <TopNav right="Settings" />
      <div className="screen-body">
        <div className="pp">

          {/* Profile summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <Avatar profile={profile} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: 'var(--g4)' }}>{profile.goal || '—'}</div>
              {allergyList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {allergyList.map(a => (
                    <span key={a} className="tag tag-orange">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button className="btn-outline" style={{ marginBottom: 24 }} onClick={onEditProfile}>
            Edit Profile
          </button>

          {/* Allergies summary */}
          {allergyList.length > 0 && (
            <div className="allergy-warning" style={{ marginBottom: 20 }}>
              🛡️ Your AI coach will never recommend: {profile.allergiesAll}.
              <br />Update anytime in Edit Profile.
            </div>
          )}

          {/* Notifications */}
          <div className="section-title mb16">Notifications</div>

          <SettingsRow
            title="Pre-run reminders"
            sub="Remind you to fuel up before runs"
            right={<Toggle on={preRun} onToggle={() => setPreRun(v => !v)} />}
          />
          <SettingsRow
            title="Post-run journal reminder"
            sub="Prompt to log your recovery meal"
            right={<Toggle on={postRun} onToggle={() => setPostRun(v => !v)} />}
          />
          <SettingsRow
            title="Daily fuel tips"
            sub="Short nutrition tips from FuelIQ"
            right={<Toggle on={dailyTip} onToggle={() => setDailyTip(v => !v)} />}
          />
          <SettingsRow
            title="Mileage milestones"
            sub={milestoneSub()}
            right={<Toggle on={milestoneAlerts} onToggle={handleMilestoneAlerts} />}
          />

          <div className="divider" />

          {/* App section */}
          <div className="section-title mb16">App</div>

          <SettingsRow
            title="Units"
            sub="Miles · lbs · °F"
            right={<span style={{ fontSize: 12, color: 'var(--g3)' }}>→</span>}
          />

          <SettingsRow
            title="Profile"
            sub={`${profile.name} · ${profile.age || '?'} yrs · ${profile.weight || '?'} lbs`}
            right={
              <button className="btn-ghost" onClick={onEditProfile}>Edit</button>
            }
          />

          <div style={{ borderBottom: 'none', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="settings-row-title">Clear all history</div>
              <div className="settings-row-sub">Remove all runs and journals</div>
            </div>
            <button className="btn-ghost" onClick={handleClear}>Clear</button>
          </div>

          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g3)', fontSize: 12 }}>
            FuelIQ v2.0 · AI-powered fueling coach ❤️
          </div>
        </div>
      </div>
    </div>
  );
}
