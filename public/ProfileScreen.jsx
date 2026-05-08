import React, { useState } from 'react';
import { ChipGroup, Logo } from '../components/Shared';
import { saveProfile } from '../utils/storage';

const GOALS = ['5K', '10K', 'Half Marathon', 'Full Marathon', 'Ultra', 'General Fitness'];
const DIETS = ['No restrictions', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low FODMAP'];
const ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Gluten / Wheat', 'Dairy / Lactose',
  'Eggs', 'Soy', 'Shellfish', 'Fish', 'FODMAPs', 'Fructose', 'Caffeine',
];
const STOMACHS = ['Iron stomach', 'Mild sensitivity', 'Moderate sensitivity', 'High sensitivity'];

export default function ProfileScreen({ existing, onSave }) {
  const [name, setName]         = useState(existing?.name || '');
  const [age, setAge]           = useState(existing?.age || '');
  const [gender, setGender]     = useState(existing?.gender || '');
  const [weight, setWeight]     = useState(existing?.weight || '');
  const [height, setHeight]     = useState(existing?.height || '');
  const [goal, setGoal]         = useState(existing?.goal || '');
  const [diets, setDiets]       = useState(existing?.diets || []);
  const [allergies, setAllergies] = useState(existing?.allergies || []);
  const [otherAllergy, setOtherAllergy] = useState(existing?.otherAllergy || '');
  const [stomach, setStomach]   = useState(existing?.stomach || '');
  const [foods, setFoods]       = useState(existing?.foods || '');
  const [photo, setPhoto]       = useState(existing?.photo || null);
  const [error, setError]       = useState('');

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    const allAllergies = [
      ...allergies,
      ...(otherAllergy.trim() ? [otherAllergy.trim()] : []),
    ];
    const profile = {
      name: name.trim(), age, gender, weight, height,
      goal, diets, allergies, otherAllergy,
      allergiesAll: allAllergies.join(', '),
      stomach, foods, photo,
    };
    saveProfile(profile);
    onSave(profile);
  }

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh' }}>
      {/* Nav */}
      <div className="top-nav">
        <Logo />
        <span style={{ fontSize: 13, color: 'var(--g4)' }}>Profile Setup</span>
      </div>

      <div className="screen-body">
        <div className="pp">
          <div className="mb20">
            <div className="section-title mb8">Your Profile</div>
            <p className="text-muted">Help us personalize every fuel plan.</p>
          </div>

          {/* Photo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <label className="photo-upload-btn" style={{ cursor: 'pointer' }}>
              {photo
                ? <img src={photo} alt="profile" />
                : (
                  <>
                    <svg width="22" height="22" fill="none" stroke="var(--g3)" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span style={{ fontSize: 9, color: 'var(--g3)', marginTop: 2 }}>ADD</span>
                  </>
                )
              }
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
            <div>
              <span className="label">Profile Photo</span>
              <p style={{ fontSize: 12, color: 'var(--g4)' }}>Tap to upload</p>
            </div>
          </div>

          {/* Name */}
          <div className="form-row">
            <span className="label">Name *</span>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" />
          </div>

          {/* Age + Gender */}
          <div className="form-grid-2">
            <div>
              <span className="label">Age</span>
              <input className="input" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="28" />
            </div>
            <div>
              <span className="label">Gender</span>
              <select className="input" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option>
                <option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Weight + Height */}
          <div className="form-grid-2">
            <div>
              <span className="label">Weight (lbs)</span>
              <input className="input" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="155" />
            </div>
            <div>
              <span className="label">Height</span>
              <input className="input" value={height} onChange={e => setHeight(e.target.value)} placeholder='5&apos;10"' />
            </div>
          </div>

          {/* Goal */}
          <div className="form-row">
            <span className="label">Running Goal</span>
            <ChipGroup options={GOALS} selected={goal} onChange={setGoal} />
          </div>

          {/* Dietary Prefs */}
          <div className="form-row">
            <span className="label">Dietary Preferences</span>
            <ChipGroup options={DIETS} selected={diets} onChange={setDiets} multi />
          </div>

          {/* Allergies */}
          <div className="form-row">
            <span className="label label-orange">🚨 Allergies &amp; Intolerances</span>
            <p style={{ fontSize: 12, color: 'var(--g4)', marginBottom: 8 }}>
              Select all that apply — the AI will <strong>never</strong> recommend these foods.
            </p>
            <div style={{ background: 'var(--orange-lt)', border: '1px solid #ffd0a0', borderRadius: 'var(--radsm)', padding: '12px 14px', marginBottom: 10 }}>
              <ChipGroup options={ALLERGIES} selected={allergies} onChange={setAllergies} multi allergyStyle />
            </div>
            <span className="label" style={{ marginTop: 8 }}>Other allergies / intolerances</span>
            <input
              className="input"
              value={otherAllergy}
              onChange={e => setOtherAllergy(e.target.value)}
              placeholder="e.g. sesame, corn syrup, specific foods..."
            />
            {allergies.length > 0 && (
              <div className="allergy-warning" style={{ marginTop: 8 }}>
                🛡️ Flagged: {allergies.join(', ')}{otherAllergy ? `, ${otherAllergy}` : ''}
                <br />These will be excluded from all recommendations.
              </div>
            )}
          </div>

          {/* Stomach sensitivity */}
          <div className="form-row">
            <span className="label">Stomach Sensitivity</span>
            <ChipGroup options={STOMACHS} selected={stomach} onChange={setStomach} />
          </div>

          {/* Favorite foods */}
          <div className="form-row">
            <span className="label">Favorite Pre-Run Foods</span>
            <input
              className="input"
              value={foods}
              onChange={e => setFoods(e.target.value)}
              placeholder="e.g. banana, toast with PB, oatmeal..."
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button className="btn-red" onClick={handleSave}>
            Save Profile →
          </button>
          <div style={{ height: 30 }} />
        </div>
      </div>
    </div>
  );
}
