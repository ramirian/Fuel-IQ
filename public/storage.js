// ─── LOCAL STORAGE ─────────────────────────────────────────────────
const PROFILE_KEY = 'fueliq_profile_v2';
const HISTORY_KEY = 'fueliq_history_v2';
const MILESTONE_KEY = 'fueliq_seen_milestones_v2';
const NOTIFICATION_PREF_KEY = 'fueliq_notification_prefs_v2';

export const MILESTONE_MILES = [10, 25, 50, 75, 100];

export function createRunId() {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function runMiles(run) {
  const n = Number.parseFloat(run?.dist);
  return Number.isFinite(n) ? n : 0;
}

export function loggedMiles(history) {
  return history
    .filter(run => run.journal)
    .reduce((sum, run) => sum + runMiles(run), 0);
}

export function formatMiles(miles) {
  const rounded = Math.round(miles * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function nextMilestone(totalMiles) {
  return MILESTONE_MILES.find(m => totalMiles < m) || null;
}

export function crossedMilestones(prevMiles, nextMiles, seen = []) {
  return MILESTONE_MILES.filter(m => prevMiles < m && nextMiles >= m && !seen.includes(m));
}

export function loadSeenMilestones() {
  try { return JSON.parse(localStorage.getItem(MILESTONE_KEY) || '[]'); }
  catch { return []; }
}

export function saveSeenMilestones(milestones) {
  localStorage.setItem(MILESTONE_KEY, JSON.stringify([...new Set(milestones)]));
}

export function loadNotificationPrefs() {
  try {
    return { milestones: true, ...JSON.parse(localStorage.getItem(NOTIFICATION_PREF_KEY) || '{}') };
  } catch {
    return { milestones: true };
  }
}

export function saveNotificationPrefs(prefs) {
  localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(prefs));
}

// ─── FEEL LABELS ────────────────────────────────────────────────────
export const FEEL_LABELS = {
  performance: { 1: 'Struggled', 2: 'Got Through', 3: 'Felt Good', 4: 'Crushed It' },
  stomach:     { 1: 'GI Issues', 2: 'Uncomfortable', 3: 'Fine', 4: 'Perfect' },
  energy:      { 1: 'Bonked', 2: 'Faded', 3: 'Steady', 4: 'Strong' },
  hydration:   { 1: 'Dehydrated', 2: 'Slightly Low', 3: 'Good', 4: 'Optimal' },
};

export const FEEL_EMOJIS = {
  performance: { 1: '😩', 2: '😐', 3: '😊', 4: '🔥' },
  stomach:     { 1: '🤢', 2: '😬', 3: '😌', 4: '✅' },
  energy:      { 1: '🪫', 2: '⚡', 3: '🔋', 4: '🚀' },
  hydration:   { 1: '🥵', 2: '😮‍💨', 3: '💧', 4: '🌊' },
};

export function feelLabel(type, val) {
  return (FEEL_LABELS[type] && FEEL_LABELS[type][val]) || '—';
}

export function feelEmoji(type, val) {
  return (FEEL_EMOJIS[type] && FEEL_EMOJIS[type][val]) || '—';
}

// ─── BUILD HISTORY CONTEXT FOR AI ──────────────────────────────────
export function buildHistoryContext(history) {
  const journaled = history.filter(h => h.journal);
  if (!journaled.length) return 'No past journal data yet.';
  return journaled.slice(-6).map(r =>
    `Run: ${r.runType || 'Run'} ${r.dist}mi | ` +
    `Performance: ${feelLabel('performance', r.journal.performance)} | ` +
    `Stomach: ${feelLabel('stomach', r.journal.stomach)} | ` +
    `Energy: ${feelLabel('energy', r.journal.energy)} | ` +
    `Hydration: ${feelLabel('hydration', r.journal.hydration)} | ` +
    `Ate (30min): ${r.journal.ateImm || 'not logged'} | ` +
    `Meal: ${r.journal.ateMeal || 'not logged'} | ` +
    `Notes: ${r.journal.notes || 'none'}`
  ).join('\n');
}

// ─── ANTHROPIC API ──────────────────────────────────────────────────
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_PROXY_URL = '/api/anthropic';
const MODEL   = 'claude-sonnet-4-20250514';
const REQUEST_TIMEOUT_MS = 10000;

function clientApiKey() {
  return (
    globalThis.FUELIQ_ANTHROPIC_KEY ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_ANTHROPIC_KEY) ||
    ''
  );
}

function fallbackJournalFeedback() {
  return {
    headline: 'Journal saved! Your coach is learning from this run.',
    whats_working: 'Great job documenting your post-run nutrition. Consistency with journaling is what separates good runners from great ones.',
    needs_improvement: 'Keep logging your meals and feelings after every run so the AI can identify patterns and fine-tune your fuel plans.',
    next_run_tip: 'Aim to eat within 30 minutes post-run to maximize glycogen replenishment.',
    allergy_check: 'All clear',
  };
}

async function callClaude(prompt, maxTokens = 1800) {
  const apiKey = clientApiKey();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const res = await fetch(apiKey ? API_URL : API_PROXY_URL, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseJSON(text) {
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// ─── GENERATE FUEL PLAN ─────────────────────────────────────────────
export async function generateFuelPlan(runData, profile, history) {
  const allergyList = profile.allergiesAll || (Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies);
  const dietList = Array.isArray(profile.diets) ? profile.diets.join(', ') : profile.diet;
  const allergies = allergyList
    ? `CRITICAL — NEVER recommend these allergens: ${allergyList}. Non-negotiable for safety.`
    : 'No known allergies.';
  const histCtx = buildHistoryContext(history);

  const prompt = `You are FuelIQ, an expert running nutrition coach. Generate a personalized fueling plan.

Runner Profile:
- Name: ${profile.name || 'Runner'}, Age: ${profile.age || 'unknown'}, Weight: ${profile.weight || 'unknown'} lbs
- Goal: ${profile.goal || 'general fitness'}
- Dietary preferences: ${dietList || 'none'}
- ALLERGIES: ${allergies}
- Stomach sensitivity: ${profile.stomach || 'moderate'}
- Favorite pre-run foods: ${profile.foods || 'general'}

Past Journal Data (use this to adjust recommendations):
${histCtx}

Today's Run:
- Distance: ${runData.dist} miles, Duration: ${runData.dur || 'estimated'}
- Type: ${runData.runType}, Intensity: ${runData.intensity}
- Setting: ${runData.runSetting || 'Outdoor'}
- Start time: ${runData.time}, Weather: ${runData.weather}, Sweat: ${runData.sweat || 'normal'}

Respond ONLY with valid JSON (absolutely no markdown, no backticks, no extra text):
{
  "priority_summary": "One sentence naming the most essential fueling windows for this exact run and why.",
  "slot_2h":       {"priority":"Essential","priority_reason":"...","portion":"...","eat":"...","drink":"...","carbs_g":"...","protein_g":"...","calories_kcal":"...","why":"...","examples":"..."},
  "slot_1h":       {"priority":"Recommended","priority_reason":"...","portion":"...","eat":"...","drink":"...","carbs_g":"...","protein_g":"...","calories_kcal":"...","why":"...","examples":"..."},
  "slot_30":       {"priority":"Optional","priority_reason":"...","portion":"...","eat":"...","drink":"...","carbs_g":"...","protein_g":"...","calories_kcal":"...","why":"...","examples":"..."},
  "slot_during":   {"priority":"Essential","priority_reason":"...","portion":"...","eat":"...","drink":"...","carbs_g":"...","carbs_per_hour":"...","protein_g":"...","calories_kcal":"...","gel_timing":"...","electrolytes":"...","why":"...","examples":"..."},
  "slot_after":    {"priority":"Essential","priority_reason":"...","portion":"...","eat":"...","drink":"...","carbs_g":"...","protein_g":"...","calories_kcal":"...","why":"...","examples":"..."},
  "slot_hydration":{"priority":"Recommended","priority_reason":"...","before":"...","during":"...","after":"...","electrolyte_tips":"...","why":"..."}
}

Rules:
1. Strictly avoid ALL listed allergens.
2. If past data shows GI issues or energy crashes, proactively adjust.
3. Give exact food quantities by grams or household measure plus grams; do not write vague amounts like "some", "a handful", or macro ranges.
4. Give exact estimated carbs, protein, and calories for each eating window. Use realistic nutrition estimates.
5. Mark timing windows as Essential, Recommended, or Optional based on this run's distance, duration, type, intensity, weather, and setting.
6. Keep each field concise (1-2 sentences).`;

  try {
    const text = await callClaude(prompt, 2200);
    return parseJSON(text);
  }
  catch { return buildFallbackPlan(profile, runData); }
}

// ─── JOURNAL AI FEEDBACK ─────────────────────────────────────────────
export async function getJournalFeedback(journalData, runData, profile, history) {
  const histCtx = buildHistoryContext(history);
  const allergies = profile.allergiesAll || (Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies) || 'none';
  const dietList = Array.isArray(profile.diets) ? profile.diets.join(', ') : profile.diet;

  const prompt = `You are FuelIQ, an expert running nutrition coach. Analyze this runner's post-run journal and give personalized, actionable feedback.

Runner Profile:
- Name: ${profile.name || 'Runner'}, Weight: ${profile.weight || 'unknown'} lbs
- Allergies: ${allergies}
- Stomach sensitivity: ${profile.stomach || 'moderate'}
- Dietary preferences: ${dietList || 'none'}

Run: ${runData ? `${runData.runType} · ${runData.dist} miles · ${runData.weather || ''}` : 'General run'}

What they ate after:
- Within 30 min: ${journalData.ateImm || 'nothing logged'}
- Full recovery meal: ${journalData.ateMeal || 'nothing logged'}
- Hydration: ${journalData.hydration || 'not specified'}

How they felt (1=worst, 4=best):
- Performance: ${feelLabel('performance', journalData.performance)} (${journalData.performance}/4)
- Stomach: ${feelLabel('stomach', journalData.stomach)} (${journalData.stomach}/4)
- Energy: ${feelLabel('energy', journalData.energy)} (${journalData.energy}/4)
- Hydration: ${feelLabel('hydration', journalData.hydration)} (${journalData.hydration}/4)
- Notes: ${journalData.notes || 'none'}

Past patterns:
${histCtx}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "headline":       "One powerful coaching insight sentence",
  "whats_working":  "What they did well — 2-3 sentences, specific and encouraging",
  "needs_improvement": "What to change and exactly why — 2-3 sentences, actionable",
  "next_run_tip":   "ONE specific change to make next run",
  "allergy_check":  "Note any potential allergen concerns in what they ate, or write: All clear"
}`;

  try {
    const text = await callClaude(prompt, 800);
    return parseJSON(text);
  }
  catch { return fallbackJournalFeedback(); }
}

// ─── FALLBACK PLAN ───────────────────────────────────────────────────
function num(value) {
  const n = Number(value);
  if (Number.isFinite(n)) return n;
  const match = String(value || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function durationMinutes(runData = {}) {
  const hours = num(runData.durHours);
  const minutes = num(runData.durMinutes);
  if (hours || minutes) return (hours * 60) + minutes;

  const dur = String(runData.dur || '').toLowerCase();
  const hrMatch = dur.match(/(\d+(\.\d+)?)\s*h/);
  const minMatch = dur.match(/(\d+)\s*m/);
  return (hrMatch ? Number(hrMatch[1]) * 60 : 0) + (minMatch ? Number(minMatch[1]) : 0);
}

function runContext(runData = {}) {
  const miles = num(runData.dist);
  const minutes = durationMinutes(runData);
  const type = String(runData.runType || '').toLowerCase();
  const intensity = String(runData.intensity || '').toLowerCase();
  const weather = String(runData.weather || '').toLowerCase();
  const setting = String(runData.runSetting || '').toLowerCase();
  const hard = intensity === 'high' || ['speed', 'intervals', 'tempo', 'race'].some(t => type.includes(t));
  const long = miles >= 8 || minutes >= 75 || type.includes('long') || type.includes('race');
  const medium = miles >= 5 || minutes >= 50;
  const hot = weather.includes('hot') || weather.includes('humid');
  const indoor = setting.includes('treadmill') || setting.includes('indoor');
  return { miles, minutes, hard, long, medium, hot, indoor };
}

function priority(label, reason) {
  return { priority: label, priority_reason: reason };
}

export function buildFallbackPlan(profile, runData = {}) {
  const allergyText = profile?.allergiesAll || (Array.isArray(profile?.allergies) ? profile.allergies.join(', ') : profile?.allergies || '');
  const dietText = (Array.isArray(profile?.diets) ? profile.diets.join(', ') : profile?.diet || '').toLowerCase();
  const a = allergyText.toLowerCase();
  const noGluten = a.includes('gluten') || a.includes('wheat') || dietText.includes('gluten');
  const noDairy  = a.includes('dairy') || a.includes('lactose') || dietText.includes('dairy') || dietText.includes('vegan');
  const noPeanut = a.includes('peanut');
  const noTreeNut = a.includes('tree nut') || a.includes('almond') || a.includes('cashew') || a.includes('walnut');
  const noSoy = a.includes('soy');
  const plantBased = noDairy || dietText.includes('vegan') || dietText.includes('vegetarian');
  const spread = (noPeanut || noTreeNut) ? 'sunflower seed butter' : 'peanut butter';
  const toast = noGluten ? '2 plain rice cakes (18g)' : '1 slice white toast (32g)';
  const recoveryProtein = plantBased
    ? (noSoy ? 'pea protein isolate (35g powder)' : 'firm tofu (150g)')
    : 'chicken breast (120g)';
  const ctx = runContext(runData);
  const duringHours = Math.max(ctx.minutes ? ctx.minutes / 60 : (ctx.miles ? ctx.miles / 6 : 0), 1);
  const carbsPerHour = ctx.long ? (ctx.hard ? 60 : 45) : (ctx.medium && ctx.hard ? 30 : 0);
  const targetDuringCarbs = Math.round(carbsPerHour * duringHours);
  const gelCount = carbsPerHour ? Math.max(1, Math.ceil(targetDuringCarbs / 23)) : 0;
  const duringCarbs = gelCount * 23;
  const actualCarbsPerHour = Math.round(duringCarbs / duringHours);
  const sodium = ctx.hot ? 600 : (ctx.indoor ? 500 : 350);
  const longOrHard = ctx.long || ctx.hard;
  const mediumOrHard = ctx.medium || ctx.hard;

  const twoHourPriority = longOrHard
    ? priority('Essential', 'This is the anchor meal for a longer or harder run, so it should carry most of the carb load.')
    : priority('Recommended', 'Useful if you have not eaten recently, but a shorter easy run can still go well with a lighter snack.');
  const oneHourPriority = mediumOrHard
    ? priority('Recommended', 'This tops off blood glucose without adding much stomach volume.')
    : priority('Optional', 'Keep this small or skip it if your last meal was within 3 hours.');
  const thirtyPriority = ctx.hard
    ? priority('Essential', 'High-intensity work benefits from quick carbs right before you start.')
    : (ctx.long ? priority('Recommended', 'A small quick-carb top-off helps protect energy later in the run.') : priority('Optional', 'For a short easy run, use this only if you feel hungry at the start.'));
  const duringPriority = ctx.long
    ? priority('Essential', 'This run is long enough that in-run carbs will protect pace, focus, and stomach comfort.')
    : (ctx.medium && ctx.hard ? priority('Recommended', 'Take carbs if the effort pushes past 50-60 minutes.') : priority('Optional', 'No planned calories needed unless the run goes longer than expected.'));
  const afterPriority = longOrHard
    ? priority('Essential', 'Recovery carbs plus protein matter more after harder or longer work.')
    : priority('Recommended', 'A normal recovery meal is enough, but protein still helps adaptation.');
  const hydrationPriority = ctx.hot || ctx.long || ctx.indoor
    ? priority('Essential', 'Fluid and sodium matter more with heat, indoor sweat rate, or longer duration.')
    : priority('Recommended', 'Keep hydration steady, but you do not need an aggressive electrolyte plan.');

  return {
    priority_summary: ctx.long
      ? 'Most essential today: 2 hours before, during the run, and recovery because this session needs stored fuel plus steady in-run carbs.'
      : (ctx.hard
        ? 'Most essential today: 30 minutes before and recovery because hard efforts need fast carbs up front and protein afterward.'
        : 'Most essential today: keep the 2-hour meal and recovery meal sensible; the 1-hour, 30-minute, and during-run fuel are optional if this stays easy.'),
    slot_2h: {
      ...twoHourPriority,
      portion: noGluten
        ? `Cooked white rice (220g) + 1 medium banana (118g) + honey (21g) + ${spread} (16g)`
        : `Cooked oats from 60g dry oats + 1 medium banana (118g) + honey (21g) + ${spread} (16g)`,
      eat: noGluten
        ? `Rice bowl with banana, honey, and ${spread}.`
        : `Oatmeal with banana, honey, and ${spread}.`,
      drink: '16 oz water',
      carbs_g: noGluten ? '92g' : '88g',
      protein_g: noGluten ? '9g' : '15g',
      calories_kcal: noGluten ? '520 kcal' : '535 kcal',
      why: 'This gives you a precise carb base with enough digestion time before the run.',
      examples: noGluten ? 'White rice + banana + honey, rice cakes + jam + banana' : 'Oats + banana + honey, toast + jam + banana',
    },
    slot_1h: {
      ...oneHourPriority,
      portion: `${toast} + jam (20g) + half banana (58g)`,
      eat: `${toast} with jam and half a banana.`,
      drink: '8 oz water',
      carbs_g: noGluten ? '36g' : '39g',
      protein_g: noGluten ? '1g' : '3g',
      calories_kcal: noGluten ? '150 kcal' : '175 kcal',
      why: 'A low-fiber carb top-off is easier to digest than adding more fat or protein this close to the run.',
      examples: noGluten ? 'Rice cakes + jam, banana, applesauce pouch' : 'Toast + jam, banana, applesauce pouch',
    },
    slot_30: {
      ...thirtyPriority,
      portion: ctx.hard || ctx.long ? '1 energy gel (32g packet)' : '1 Medjool date (24g)',
      eat: ctx.hard || ctx.long ? 'Take 1 gel right before warmup or 10 minutes before the start.' : 'Eat 1 Medjool date only if you feel under-fueled.',
      drink: '8 oz water',
      carbs_g: ctx.hard || ctx.long ? '23g' : '18g',
      protein_g: '0g',
      calories_kcal: ctx.hard || ctx.long ? '100 kcal' : '66 kcal',
      why: 'This is quick sugar with minimal digestion load.',
      examples: 'Maurten Gel 100, GU Energy Gel, 1 Medjool date, applesauce pouch',
    },
    slot_during: {
      ...duringPriority,
      portion: carbsPerHour ? `${gelCount} gels total, each 32g packet with about 23g carbs` : '0g planned fuel; carry 1 gel (32g packet) as backup',
      eat: carbsPerHour ? `Take ${gelCount} gels across the run.` : 'Skip planned calories unless the run extends past 60 minutes.',
      drink: carbsPerHour ? '5 oz water every 20 minutes' : 'Sip water to thirst',
      carbs_g: carbsPerHour ? `${duringCarbs}g total` : '0g planned',
      carbs_per_hour: carbsPerHour ? `${actualCarbsPerHour}g/hour average` : '0g/hour planned',
      protein_g: '0g',
      calories_kcal: carbsPerHour ? `${duringCarbs * 4} kcal total` : '0 kcal planned',
      gel_timing: carbsPerHour ? `Start at minute 30, then every ${ctx.hard ? 25 : 35} minutes.` : 'Only use the backup gel if you feel energy dropping.',
      electrolytes: `${sodium}mg sodium per hour${ctx.hot || ctx.indoor ? ' because sweat loss is likely higher' : ''}.`,
      why: carbsPerHour ? 'Keeping carbs steady prevents the late-run fade and is easier on the stomach than a large dose at once.' : 'Short easy runs do not need in-run calories when pre-run fuel is adequate.',
      examples: 'Maurten Gel 100, GU Energy Gel, Precision Fuel PF 30, SIS Go Isotonic',
    },
    slot_after: {
      ...afterPriority,
      portion: plantBased
        ? `Cooked rice (250g) + ${recoveryProtein} + banana (118g) + olive oil (5g)`
        : 'Cooked rice (250g) + chicken breast (120g) + banana (118g) + olive oil (5g)',
      eat: plantBased ? `Rice bowl with ${noSoy ? 'pea protein on the side' : 'tofu'} and a banana on the side.` : 'Rice bowl with chicken and a banana on the side.',
      drink: noDairy ? '20 oz water with electrolytes' : '16 oz low-fat chocolate milk plus 8 oz water',
      carbs_g: plantBased ? '92g' : '88g',
      protein_g: plantBased ? '31g' : '42g',
      calories_kcal: plantBased ? '680 kcal' : '700 kcal',
      why: 'This hits a clear carb-and-protein recovery target without guessing portions.',
      examples: plantBased ? (noSoy ? 'Rice + pea protein shake, potatoes + beans, smoothie with pea protein + banana' : 'Rice + tofu, smoothie with plant protein + banana, potatoes + tempeh') : 'Rice + chicken, Greek yogurt + granola, eggs + toast',
    },
    slot_hydration: {
      ...hydrationPriority,
      before: '16 oz water 2 hours before; 8 oz water 20-30 minutes before.',
      during: carbsPerHour ? `5 oz every 20 minutes with ${sodium}mg sodium per hour.` : `Water to thirst; add ${sodium}mg sodium if sweating heavily.`,
      after: 'Drink 22 oz fluid in the first hour after finishing.',
      electrolyte_tips: ctx.hot || ctx.indoor
        ? 'Use an electrolyte mix because indoor, treadmill, hot, or humid running often increases sweat rate.'
        : 'Electrolytes are helpful but not mandatory unless you are a salty or heavy sweater.',
      why: 'Matching fluid and sodium to the session keeps the food plan absorbable.',
    },
  };
}
