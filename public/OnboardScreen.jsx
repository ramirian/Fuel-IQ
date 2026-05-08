import React from 'react';

export default function OnboardScreen({ onStart, onReturning }) {
  return (
    <div className="onboard-screen">
      <div className="onboard-hero">
        <div className="onboard-big-logo">
          FUEL<span style={{ color: 'var(--red)' }}>IQ</span>
        </div>
        <div className="onboard-stripe" />
        <p className="onboard-tagline">
          Your personal running fueling coach.<br />
          Eat smart. Run strong. Learn from every run.
        </p>
      </div>

      <div className="onboard-sheet">
        <h2>Fuel smarter<br />after every run.</h2>
        <p>
          AI-powered nutrition plans that learn from how you feel,
          what you eat, and what works for your body — then adapt automatically.
        </p>
        <button className="btn-red" onClick={onStart}>
          Get Started →
        </button>
        <button className="btn-outline" onClick={onReturning}>
          I already have a profile
        </button>
      </div>
    </div>
  );
}
