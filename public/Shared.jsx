import React from 'react';

// ─── LOGO ────────────────────────────────────────────────────────────
export function Logo() {
  return <span className="logo">FUEL<span className="logo-red">IQ</span></span>;
}

// ─── TOP NAV ─────────────────────────────────────────────────────────
export function TopNav({ right }) {
  return (
    <div className="top-nav">
      <Logo />
      {right && <span style={{ fontSize: 14, fontWeight: 600 }}>{right}</span>}
    </div>
  );
}

// ─── LOADING DOTS ─────────────────────────────────────────────────────
export function LoadingDots() {
  return (
    <div className="loading-dots">
      <div className="loading-dot" />
      <div className="loading-dot" />
      <div className="loading-dot" />
    </div>
  );
}

// ─── CHIP GROUP ───────────────────────────────────────────────────────
export function ChipGroup({ options, selected, onChange, multi = false, allergyStyle = false }) {
  const toggle = (val) => {
    if (multi) {
      const next = selected.includes(val)
        ? selected.filter(s => s !== val)
        : [...selected, val];
      onChange(next);
    } else {
      onChange(selected === val ? '' : val);
    }
  };
  return (
    <div className="chip-group">
      {options.map(opt => {
        const isOn = multi ? selected.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            className={`chip${allergyStyle ? ' allergy-chip' : ''}${isOn ? ' selected' : ''}`}
            onClick={() => toggle(opt)}
            type="button"
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── FEEL BUTTON GRID ─────────────────────────────────────────────────
export function FeelGrid({ type, value, onChange, options }) {
  return (
    <div className="feel-grid">
      {options.map((opt, i) => (
        <button
          key={i}
          className={`feel-btn${value === opt.val ? ' selected' : ''}`}
          onClick={() => onChange(opt.val)}
          type="button"
        >
          <span className="feel-icon">{opt.icon}</span>
          <span className="feel-label">{opt.label}</span>
          <span className="feel-sub">{opt.sub}</span>
        </button>
      ))}
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────
export function Avatar({ profile, size = 'lg' }) {
  const cls = size === 'sm' ? 'avatar-sm' : 'avatar';
  const initials = (profile?.name || '?')[0].toUpperCase();
  return (
    <div className={cls}>
      {profile?.photo
        ? <img src={profile.photo} alt="profile" />
        : initials}
    </div>
  );
}

// ─── TOGGLE BUTTON ────────────────────────────────────────────────────
export function Toggle({ on, onToggle }) {
  return (
    <button
      className={`toggle${on ? ' on' : ''}`}
      onClick={onToggle}
      type="button"
      aria-label="toggle"
    />
  );
}

// ─── SETTINGS ROW ─────────────────────────────────────────────────────
export function SettingsRow({ title, sub, right }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-title">{title}</div>
        {sub && <div className="settings-row-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'dashboard', label: 'Home',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'planner', label: 'Plan',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: 'journal', label: 'Journal',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'history', label: 'History',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'settings', label: 'Settings',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export function TabBar({ active, onNavigate }) {
  return (
    <div className="tab-bar">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab-btn${active === t.id ? ' active' : ''}`}
          onClick={() => onNavigate(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── FUEL CARD (collapsible) ──────────────────────────────────────────
export function FuelCard({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="fuel-card">
      <div className="fuel-card-header" onClick={() => setOpen(o => !o)}>
        <h3>{title}</h3>
        <span className="fuel-card-badge">{badge}</span>
        <svg
          width="16" height="16" fill="none"
          stroke="var(--g3)" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && <div className="fuel-card-body">{children}</div>}
    </div>
  );
}

export function FuelRow({ label, value }) {
  if (!value) return null;
  return (
    <>
      <div className="fuel-item-label">{label}</div>
      <div className="fuel-item-value">{value}</div>
    </>
  );
}
