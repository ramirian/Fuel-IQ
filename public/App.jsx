import React, { useState, useCallback } from 'react';
import { TabBar } from './components/Shared';
import OnboardScreen   from './screens/OnboardScreen';
import ProfileScreen   from './screens/ProfileScreen';
import DashboardScreen from './screens/DashboardScreen';
import PlannerScreen   from './screens/PlannerScreen';
import ResultsScreen   from './screens/ResultsScreen';
import JournalScreen   from './screens/JournalScreen';
import HistoryScreen   from './screens/HistoryScreen';
import SettingsScreen  from './screens/SettingsScreen';
import {
  crossedMilestones,
  createRunId,
  formatMiles,
  loadHistory,
  loadNotificationPrefs,
  loadProfile,
  loadSeenMilestones,
  loggedMiles,
  saveHistory,
  saveNotificationPrefs,
  saveSeenMilestones,
} from './utils/storage';

const TABBED_SCREENS = ['dashboard', 'planner', 'results', 'journal', 'history', 'settings'];

export default function App() {
  const [profile, setProfile]         = useState(() => loadProfile());
  const [history, setHistory]         = useState(() => loadHistory());
  const [screen,  setScreen]          = useState(() => loadProfile() ? 'dashboard' : 'onboard');
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [currentRun, setCurrentRun]   = useState(null);
  const [journalIdx, setJournalIdx]   = useState(null);
  const [milestoneAlert, setMilestoneAlert] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState(() => loadNotificationPrefs());

  function showMilestoneNotification(milestone, totalMiles) {
    setMilestoneAlert({ milestone, totalMiles });
    if (
      notificationPrefs.milestones &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'granted'
    ) {
      new window.Notification('FuelIQ mileage milestone!', {
        body: `You hit ${milestone} miles. ${formatMiles(totalMiles)} total miles logged. Keep stacking those miles.`,
      });
    }
  }

  function checkMilestones(prevHistory, nextHistory) {
    const prevMiles = loggedMiles(prevHistory);
    const nextMiles = loggedMiles(nextHistory);
    const seen = loadSeenMilestones();
    const crossed = crossedMilestones(prevMiles, nextMiles, seen);
    if (!crossed.length) return;
    saveSeenMilestones([...seen, ...crossed]);
    showMilestoneNotification(crossed[crossed.length - 1], nextMiles);
  }

  function handleNotificationPrefsChange(nextPrefs) {
    setNotificationPrefs(nextPrefs);
    saveNotificationPrefs(nextPrefs);
  }

  // ─── NAVIGATION ──────────────────────────────────────────────────
  const navigate = useCallback((to) => {
    setScreen(to);
    if (['dashboard', 'planner', 'history', 'settings'].includes(to)) {
      setActiveTab(to);
    }
  }, []);

  const tabNavigate = useCallback((tab) => {
    if (tab === 'journal') {
      setJournalIdx(null);
      setScreen('journal');
      setActiveTab('journal');
    } else {
      navigate(tab);
    }
  }, [navigate]);

  // ─── PROFILE ─────────────────────────────────────────────────────
  function handleProfileSave(p) {
    setProfile(p);
    navigate('dashboard');
  }

  // ─── PLANNER → RESULTS ───────────────────────────────────────────
  function handleGenerate(runData) {
    const entry = {
      id: createRunId(),
      ...runData,
      date: new Date().toLocaleDateString(),
      journal: null,
      aiFeedback: null,
    };
    setCurrentRun(entry);
    navigate('results');
    setActiveTab('planner');
  }

  function handleSavePlan(plan) {
    if (!currentRun) return;
    const entry = { ...currentRun, plan };
    const next = [...history, entry];
    setHistory(next);
    saveHistory(next);
    setJournalIdx(next.length - 1);
  }

  // ─── JOURNAL ─────────────────────────────────────────────────────
  function openJournal(idx) {
    setJournalIdx(idx);
    setScreen('journal');
    setActiveTab('journal');
  }

  function handleJournalSave(journalData, aiFeedback, linkedIdx = null, runDetails = {}) {
    setHistory(prev => {
      const next = [...prev];
      const idxFromRunId = runDetails.id ? next.findIndex(run => run.id === runDetails.id) : -1;
      const targetIdx =
        linkedIdx !== null
          ? linkedIdx
          : (journalIdx !== null && next[journalIdx] ? journalIdx : (idxFromRunId >= 0 ? idxFromRunId : null));

      if (targetIdx !== null && next[targetIdx]) {
        next[targetIdx] = {
          ...next[targetIdx],
          journal: journalData,
          aiFeedback: aiFeedback || next[targetIdx].aiFeedback,
        };
        setJournalIdx(targetIdx);
      } else {
        next.push({
          id: runDetails.id || createRunId(),
          date: runDetails.date || new Date().toLocaleDateString(),
          runType: runDetails.runType || 'General Run',
          dist: runDetails.dist || '?',
          journal: journalData,
          aiFeedback,
        });
        setJournalIdx(next.length - 1);
      }

      checkMilestones(prev, next);
      saveHistory(next);
      return next;
    });
  }

  // ─── CLEAR HISTORY ────────────────────────────────────────────────
  function handleClearHistory() {
    setHistory([]);
    saveHistory([]);
    saveSeenMilestones([]);
    setMilestoneAlert(null);
  }

  // ─── RENDER ──────────────────────────────────────────────────────
  const showTabs = TABBED_SCREENS.includes(screen) && screen !== 'onboard' && screen !== 'setup';

  return (
    <div className="app-shell">
      {screen === 'onboard' && (
        <OnboardScreen
          onStart={() => navigate('setup')}
          onReturning={() => navigate(profile ? 'dashboard' : 'setup')}
        />
      )}

      {screen === 'setup' && (
        <ProfileScreen existing={profile} onSave={handleProfileSave} />
      )}

      {screen === 'dashboard' && profile && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="screen-body">
            <DashboardScreen
              profile={profile}
              history={history}
              milestoneAlert={milestoneAlert}
              onDismissMilestone={() => setMilestoneAlert(null)}
              onNavigate={navigate}
              onOpenJournal={openJournal}
            />
          </div>
        </div>
      )}

      {screen === 'planner' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <PlannerScreen onGenerate={handleGenerate} />
        </div>
      )}

      {screen === 'results' && currentRun && profile && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <ResultsScreen
            runData={currentRun}
            profile={profile}
            history={history}
            onSave={handleSavePlan}
            onPlanAnother={() => navigate('planner')}
          />
        </div>
      )}

      {screen === 'journal' && profile && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <JournalScreen
            targetIdx={journalIdx}
            history={history}
            profile={profile}
            onSave={handleJournalSave}
            onBack={() => navigate('dashboard')}
          />
        </div>
      )}

      {screen === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <HistoryScreen history={history} onOpenJournal={openJournal} />
        </div>
      )}

      {screen === 'settings' && profile && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <SettingsScreen
            profile={profile}
            notificationPrefs={notificationPrefs}
            onNotificationPrefsChange={handleNotificationPrefsChange}
            onEditProfile={() => navigate('setup')}
            onClearHistory={handleClearHistory}
          />
        </div>
      )}

      {showTabs && (
        <TabBar active={activeTab} onNavigate={tabNavigate} />
      )}

      {milestoneAlert && (
        <div className="milestone-toast">
          <button
            className="milestone-close"
            type="button"
            onClick={() => setMilestoneAlert(null)}
            aria-label="Dismiss milestone"
          >
            ×
          </button>
          <div className="milestone-kicker">Milestone unlocked</div>
          <div className="milestone-title">{milestoneAlert.milestone} miles logged!</div>
          <div className="milestone-copy">
            You are at {formatMiles(milestoneAlert.totalMiles)} total miles. Nice work stacking the smart-fueled runs.
          </div>
        </div>
      )}
    </div>
  );
}
