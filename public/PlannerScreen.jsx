import React, { useState } from 'react';
import { ChipGroup } from '../components/Shared';

const RUN_TYPES  = ['Easy', 'Long Run', 'Speed', 'Intervals', 'Tempo', 'Race', 'Recovery'];
const INTENSITIES = ['Low', 'Moderate', 'High'];
const RUN_SETTINGS = ['Outdoor', 'Treadmill', 'Indoor Track'];
const WEATHERS   = ['Cool (under 60°F)', 'Mild (60–70°F)', 'Warm (70–80°F)', 'Hot (80°F+)', 'Humid'];
const SWEATS     = ['Low', 'Normal', 'Heavy'];

export default function PlannerScreen({ onGenerate }) {
  const [dist, setDist]           = useState('');
  const [durHours, setDurHours]   = useState('');
  const [durMinutes, setDurMinutes] = useState('');
  const [runType, setRunType]     = useState('');
  const [intensity, setIntensity] = useState('');
  const [runSetting, setRunSetting] = useState('Outdoor');
  const [time, setTime]           = useState('07:00');
  const [weather, setWeather]     = useState('Mild (60–70°F)');
  const [sweat, setSweat]         = useState('');
  const [error, setError]         = useState('');

  function formatDuration() {
    const hours = Number(durHours) || 0;
    const minutes = Number(durMinutes) || 0;
    return [
      hours ? `${hours} hr${hours === 1 ? '' : 's'}` : '',
      minutes ? `${minutes} min` : '',
    ].filter(Boolean).join(' ');
  }

  function handleGenerate() {
    if (!dist) { setError('Please enter the run distance.'); return; }
    if (!runType) { setError('Please select a run type.'); return; }
    if (!intensity) { setError('Please select an intensity.'); return; }
    if (Number(durMinutes) > 59) { setError('Minutes should be between 0 and 59.'); return; }
    setError('');
    onGenerate({
      dist,
      dur: formatDuration(),
      durHours,
      durMinutes,
      runType,
      intensity,
      runSetting,
      time,
      weather,
      sweat,
    });
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">RUN PLANNER</div>
        <p>Tell us about today's workout</p>
      </div>

      <div className="screen-body">
        <div className="pp">

          <div className="form-row">
            <div>
              <span className="label">Distance (miles) *</span>
              <input
                className="input" type="number" step="0.1"
                value={dist} onChange={e => setDist(e.target.value)}
                placeholder="6.2"
              />
            </div>
          </div>

          <div className="form-row">
            <span className="label">Est. Duration</span>
            <div className="duration-grid">
              <div>
                <input
                  className="input" type="number" min="0" step="1"
                  value={durHours} onChange={e => setDurHours(e.target.value)}
                  placeholder="0"
                />
                <span className="input-caption">Hours</span>
              </div>
              <div>
                <input
                  className="input" type="number" min="0" max="59" step="1"
                  value={durMinutes} onChange={e => setDurMinutes(e.target.value)}
                  placeholder="55"
                />
                <span className="input-caption">Minutes</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <span className="label">Run Type *</span>
            <ChipGroup options={RUN_TYPES} selected={runType} onChange={setRunType} />
          </div>

          <div className="form-row">
            <span className="label">Intensity *</span>
            <ChipGroup options={INTENSITIES} selected={intensity} onChange={setIntensity} />
          </div>

          <div className="form-row">
            <span className="label">Run Setting</span>
            <ChipGroup options={RUN_SETTINGS} selected={runSetting} onChange={setRunSetting} />
          </div>

          <div className="form-grid-2">
            <div>
              <span className="label">Start Time</span>
              <input
                className="input" type="time"
                value={time} onChange={e => setTime(e.target.value)}
              />
            </div>
            <div>
              <span className="label">Weather</span>
              <select className="input" value={weather} onChange={e => setWeather(e.target.value)}>
                {WEATHERS.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <span className="label">Sweat Level</span>
            <ChipGroup options={SWEATS} selected={sweat} onChange={setSweat} />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button className="btn-red" onClick={handleGenerate}>
            Generate Fuel Plan ⚡
          </button>
          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
}
