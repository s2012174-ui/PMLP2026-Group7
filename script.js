const AQHI_DATA_URL = 'https://dashboard.data.gov.hk/api/aqhi-individual?format=json';
const POLLUTANT_DATA_URL = 'https://www.aqhi.gov.hk/epd/ddata/html/out/24pc_Eng.xml';
const DEFAULT_AQHI_STATION = 'Central';

const fallbackStationData = [
  { station: 'Central', aqhi: 3, health_risk: 'Low' },
  { station: 'Central/Western', aqhi: 3, health_risk: 'Low' },
  { station: 'Causeway Bay', aqhi: 3, health_risk: 'Low' },
  { station: 'Eastern', aqhi: 4, health_risk: 'Moderate' },
  { station: 'Kwai Chung', aqhi: 3, health_risk: 'Low' },
  { station: 'Mong Kok', aqhi: 4, health_risk: 'Moderate' },
  { station: 'Sha Tin', aqhi: 3, health_risk: 'Low' },
  { station: 'Tseung Kwan O', aqhi: 2, health_risk: 'Low' }
];

const fallbackPollutantData = {
  Central: { pm25: 23.2, pm10: 29.3, no2: 32.6 },
  'Central/Western': { pm25: 23.2, pm10: 29.3, no2: 32.6 },
  'Causeway Bay': { pm25: 18.4, pm10: 25.1, no2: 22.0 },
  Eastern: { pm25: 27.5, pm10: 33.8, no2: 30.1 },
  'Kwai Chung': { pm25: 24.7, pm10: 38.2, no2: 29.9 },
  'Mong Kok': { pm25: 26.5, pm10: 31.8, no2: 27.4 },
  'Sha Tin': { pm25: 22.8, pm10: 26.7, no2: 24.6 },
  'Tseung Kwan O': { pm25: 19.5, pm10: 23.1, no2: 18.9 }
};

let airQualityStationCache = [...fallbackStationData];

const materialGuide = {
  'Plastic #1': 'Rinse PET containers and place in the clear plastic stream. Avoid lids and labels if local rules require separating them.',
  'Plastic #2': 'Clean HDPE bottles and jugs. Caps can usually go in the same bin, but all residues should be removed first.',
  'Glass': 'Empty bottles and jars before dropping off. Remove lids and place glass separately from paper and metals.',
  'Batteries': 'Use a sealed battery collection container. Never place loose alkaline or lithium batteries in regular recycling bins.',
  'E-Waste': 'Bring old chargers, cables, and electronics to an approved e-waste kiosk. Keep devices intact when possible.',
  'Paper': 'Flatten cardboard and keep paper dry. Remove plastic sleeves and food contamination before recycling.'
};

const dropOffs = [
  { name: 'GreenLoop Station', distance: '0.4 mi', type: 'Mixed recycling', materials: ['Plastic #1', 'Paper', 'Glass'] },
  { name: 'East Yard Hub', distance: '0.9 mi', type: 'E-waste + batteries', materials: ['E-Waste', 'Batteries'] },
  { name: 'Bloom Block Center', distance: '1.1 mi', type: 'Compost & plastics', materials: ['Plastic #2', 'Paper'] },
  { name: 'Civic Reuse Depot', distance: '1.6 mi', type: 'Glass + metal', materials: ['Glass', 'Plastic #1'] }
];

const DEFAULT_USERNAME = 'Test1234';
const DEFAULT_PASSWORD = '123456578';
const AUTH_STORAGE_KEY = 'ecopulseAuthState';
const SIGNUP_STORAGE_KEY = 'ecopulseDemoCredentials';
const STORAGE_KEY = 'ecopulse-daily-totals';
const THEME_STORAGE_KEY = 'ecopulseTheme';
const FONT_SIZE_STORAGE_KEY = 'ecopulseFontSize';
const WASTE_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/azyOS7fIG/';

let wasteModel = null;

const streetSelect = document.getElementById('streetSelect');
const aqiValue = document.getElementById('aqiValue');
const aqiStatus = document.getElementById('aqiStatus');
const pm25Value = document.getElementById('pm25Value');
const pm10Value = document.getElementById('pm10Value');
const no2Value = document.getElementById('no2Value');
const pm25Bar = document.getElementById('pm25Bar');
const pm10Bar = document.getElementById('pm10Bar');
const no2Bar = document.getElementById('no2Bar');
const heroScore = document.getElementById('heroScore');
const airParticleCanvas = document.getElementById('air-particle-canvas');
let airParticles = [];
let airParticleAnimationId = null;

const commuteRange = document.getElementById('commuteRange');
const energyRange = document.getElementById('energyRange');
const meatRange = document.getElementById('meatRange');
const commuteValue = document.getElementById('commuteValue');
const energyValue = document.getElementById('energyValue');
const meatValue = document.getElementById('meatValue');
const carbonResult = document.getElementById('carbonResult');
const goalFill = document.getElementById('goalFill');
const goalLabel = document.getElementById('goalLabel');
const currentCarbonTotal = document.getElementById('currentCarbonTotal');
const historyBars = document.getElementById('historyBars');
const saveTodayBtn = document.getElementById('saveTodayBtn');

const dropoffList = document.getElementById('dropoffList');
const materialSelect = document.getElementById('materialSelect');
const materialInfo = document.getElementById('materialInfo');
const binSearch = document.getElementById('binSearch');

const scanModal = document.getElementById('scanModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const scanItemBtn = document.getElementById('scanItemBtn');
const scanActionBtn = document.getElementById('scanActionBtn');
const scanResultText = document.getElementById('scanResultText');

const authModal = document.getElementById('authModal');
const authError = document.getElementById('authError');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.querySelector('[data-tab="login"]');
const signupTab = document.querySelector('[data-tab="signup"]');
const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');
const signupUsernameInput = document.getElementById('signupUsername');
const signupPasswordInput = document.getElementById('signupPassword');
const fillDemoCredentialsBtn = document.getElementById('fillDemoCredentialsBtn');
const loginPromptBtn = document.getElementById('loginPromptBtn');
const headerDemoFillBtn = document.getElementById('headerDemoFillBtn');
const resetAppBtn = document.getElementById('resetAppBtn');
const userState = document.getElementById('userState');
const welcomeText = document.getElementById('welcomeText');
const logoutBtn = document.getElementById('logoutBtn');
const sidebarUserName = document.getElementById('sidebarUserName');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const fontSizeSelector = document.getElementById('fontSizeSelector');
const authNotice = document.getElementById('authNotice');
const authNoticeText = document.getElementById('authNoticeText');
const authNoticeClose = document.getElementById('authNoticeClose');
const wasteImageInput = document.getElementById('wasteImageInput');
const wastePreview = document.getElementById('wastePreview');
const wastePreviewPlaceholder = document.getElementById('wastePreviewPlaceholder');
const wasteManualSelect = document.getElementById('wasteManualSelect');
const wasteStatus = document.getElementById('wasteStatus');
const wasteGuidance = document.getElementById('wasteGuidance');

function normalizeStationName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function getAqiStatus(aqi, healthRisk) {
  const normalizedHealthRisk = typeof healthRisk === 'string' ? healthRisk.trim() : '';
  if (normalizedHealthRisk) {
    return { label: normalizedHealthRisk, className: getAqiBadgeClass(aqi) };
  }

  if (aqi <= 3) {
    return { label: 'Low', className: getAqiBadgeClass(aqi) };
  }
  if (aqi <= 6) {
    return { label: 'Moderate', className: getAqiBadgeClass(aqi) };
  }
  if (aqi <= 9) {
    return { label: 'High', className: getAqiBadgeClass(aqi) };
  }
  return { label: 'Serious', className: getAqiBadgeClass(aqi) };
}

function getAqiBadgeClass(aqi) {
  if (aqi <= 3) return 'bg-emerald-500 text-white';
  if (aqi <= 6) return 'bg-amber-500 text-white';
  if (aqi <= 9) return 'bg-rose-500 text-white';
  return 'bg-purple-600 text-white';
}

function getFallbackStationInfo(stationName) {
  const normalized = normalizeStationName(stationName);
  return airQualityStationCache.find((station) => normalizeStationName(station.station) === normalized)
    || fallbackStationData.find((station) => normalizeStationName(station.station) === normalized)
    || fallbackStationData[0];
}

function getFallbackPollutantData(stationName) {
  const normalized = normalizeStationName(stationName);
  return Object.entries(fallbackPollutantData).find(([name]) => normalizeStationName(name) === normalized)?.[1]
    || fallbackPollutantData[DEFAULT_AQHI_STATION];
}

async function fetchAQHIStationData() {
  try {
    const response = await fetch(AQHI_DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`AQHI request failed with status ${response.status}`);
    }

    const stations = await response.json();
    const values = Array.isArray(stations) ? stations : [];

    const sanitized = values
      .map((station) => ({
        station: String(station.station || station.name || 'Unknown').trim(),
        aqhi: Number(station.aqhi) || 0,
        health_risk: String(station.health_risk || station.healthRisk || 'Low').trim()
      }))
      .filter((station) => station.station && station.station !== 'Unknown');

    if (!sanitized.length) {
      throw new Error('No AQHI stations returned by the API');
    }

    return sanitized;
  } catch (error) {
    console.warn('Live AQHI request failed, using fallback station data.', error);
    return [...fallbackStationData];
  }
}

async function fetchPollutantData(stationName) {
  try {
    const response = await fetch(POLLUTANT_DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Pollutant feed request failed with status ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'application/xml');
    const entries = Array.from(xml.querySelectorAll('PollutantConcentration')) || [];

    const normalizedStation = normalizeStationName(stationName || DEFAULT_AQHI_STATION);
    const selectedEntry = entries.find((entry) => {
      const stationNode = entry.querySelector('StationName');
      const stationValue = stationNode ? stationNode.textContent : '';
      return normalizeStationName(stationValue) === normalizedStation;
    }) || entries[entries.length - 1];

    if (!selectedEntry) {
      throw new Error('No pollutant data available for the selected station');
    }

    const pm25 = Number.parseFloat(selectedEntry.querySelector('PM2\.5')?.textContent || selectedEntry.querySelector('PM2_5')?.textContent || '0');
    const pm10 = Number.parseFloat(selectedEntry.querySelector('PM10')?.textContent || '0');
    const no2 = Number.parseFloat(selectedEntry.querySelector('NO2')?.textContent || '0');

    if (!Number.isFinite(pm25) || !Number.isFinite(pm10) || !Number.isFinite(no2)) {
      throw new Error('Pollutant values were missing or invalid');
    }

    return { pm25, pm10, no2 };
  } catch (error) {
    console.warn('Live pollutant data unavailable, using realistic fallback values.', error);
    return getFallbackPollutantData(stationName);
  }
}

function populateStationOptions(stations) {
  if (!streetSelect) return;

  const uniqueStations = Array.from(new Map(
    stations.map((station) => [normalizeStationName(station.station), station])
  ).values());

  streetSelect.innerHTML = uniqueStations
    .map((station) => `<option value="${station.station}">${station.station}</option>`)
    .join('');

  const preferredStation = uniqueStations.find((station) => normalizeStationName(station.station) === normalizeStationName(DEFAULT_AQHI_STATION))
    || uniqueStations[0];

  if (preferredStation) {
    streetSelect.value = preferredStation.station;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parsePollutantValue(value) {
  const parsed = Number.parseFloat(String(value || '0').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildAirParticles() {
  if (!airParticleCanvas) return;

  const canvas = airParticleCanvas;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width || 320);
  const height = Math.max(1, rect.height || 240);

  const pm25ValueNumber = parsePollutantValue(pm25Value?.textContent || '0');
  const pm10ValueNumber = parsePollutantValue(pm10Value?.textContent || '0');
  const pm25Count = clamp(Math.floor(pm25ValueNumber / 5), 2, 10);
  const pm10Count = clamp(Math.floor(pm10ValueNumber / 10), 1, 6);

  airParticles = [];

  for (let i = 0; i < pm25Count; i += 1) {
    airParticles.push({
      type: 'pm25',
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 14 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.7,
      label: 'PM2.5'
    });
  }

  for (let i = 0; i < pm10Count; i += 1) {
    airParticles.push({
      type: 'pm10',
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 28 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.6,
      label: 'PM10'
    });
  }
}

function renderAirParticles() {
  if (!airParticleCanvas) return;

  const canvas = airParticleCanvas;
  const context = canvas.getContext('2d');
  if (!context) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width || 320);
  const height = Math.max(1, rect.height || 240);
  const ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  buildAirParticles();

  const draw = () => {
    context.clearRect(0, 0, width, height);

    const glow = context.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.7);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
    glow.addColorStop(0.5, 'rgba(14, 165, 233, 0.10)');
    glow.addColorStop(1, 'rgba(17, 24, 39, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    for (const particle of airParticles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < particle.radius || particle.x > width - particle.radius) {
        particle.vx *= -1;
        particle.x = clamp(particle.x, particle.radius, width - particle.radius);
      }

      if (particle.y < particle.radius || particle.y > height - particle.radius) {
        particle.vy *= -1;
        particle.y = clamp(particle.y, particle.radius, height - particle.radius);
      }

      context.beginPath();
      context.fillStyle = particle.type === 'pm25' ? '#FACC15' : '#EF4444';
      context.shadowBlur = particle.type === 'pm25' ? 18 : 24;
      context.shadowColor = particle.type === 'pm25' ? 'rgba(250, 204, 21, 0.8)' : 'rgba(239, 68, 68, 0.8)';
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();

      context.shadowBlur = 0;
      context.fillStyle = '#111827';
      context.font = 'bold 10px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(particle.label, particle.x, particle.y + 1);
    }

    airParticleAnimationId = window.requestAnimationFrame(draw);
  };

  if (airParticleAnimationId) {
    window.cancelAnimationFrame(airParticleAnimationId);
  }

  draw();
}

function applyAirQualityData(stationData, pollutantData) {
  const safeStation = stationData && stationData.station ? stationData.station : DEFAULT_AQHI_STATION;
  const safeAqhi = Number.isFinite(Number(stationData?.aqhi)) ? Number(stationData.aqhi) : 3;
  const healthRisk = stationData?.health_risk || getAqiStatus(safeAqhi).label;
  const status = getAqiStatus(safeAqhi, healthRisk);
  const safePollutants = pollutantData || { pm25: 23.2, pm10: 29.3, no2: 32.6 };

  if (streetSelect) {
    streetSelect.value = safeStation;
  }

  aqiValue.textContent = safeAqhi;
  aqiStatus.textContent = status.label;
  aqiStatus.className = `status-badge ${status.className}`;
  pm25Value.textContent = `${safePollutants.pm25.toFixed(1)} µg/m³`;
  pm10Value.textContent = `${safePollutants.pm10.toFixed(1)} µg/m³`;
  no2Value.textContent = `${safePollutants.no2.toFixed(1)} µg/m³`;

  pm25Bar.style.width = `${Math.min(100, (safePollutants.pm25 / 80) * 100)}%`;
  pm10Bar.style.width = `${Math.min(100, (safePollutants.pm10 / 100) * 100)}%`;
  no2Bar.style.width = `${Math.min(100, (safePollutants.no2 / 50) * 100)}%`;

  heroScore.textContent = safeAqhi;

  const scoreBadge = document.querySelector('#dashboardOverview .col-span-3 .rounded-full');
  if (scoreBadge) {
    scoreBadge.className = `rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`;
    scoreBadge.textContent = status.label;
  }

  renderAirParticles();
}

function getAuthState() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
    return {
      isLoggedIn: !!stored.isLoggedIn,
      currentUser: stored.currentUser || null
    };
  } catch (error) {
    return { isLoggedIn: false, currentUser: null };
  }
}

function saveAuthState(state) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function getStoredSignupCredentials() {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNUP_STORAGE_KEY) || 'null');
    return stored && typeof stored === 'object' ? stored : null;
  } catch (error) {
    return null;
  }
}

function saveStoredSignupCredentials(username, password) {
  localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify({ username, password }));
}

function setAuthError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
}

function clearAuthError() {
  authError.textContent = '';
  authError.classList.add('hidden');
}

function switchAuthTab(tabName) {
  const isLogin = tabName === 'login';
  loginTab.classList.toggle('active', isLogin);
  signupTab.classList.toggle('active', !isLogin);
  loginForm.classList.toggle('active', isLogin);
  signupForm.classList.toggle('active', !isLogin);
  clearAuthError();
}

function updateAuthUI() {
  const { isLoggedIn, currentUser } = getAuthState();

  if (userState) {
    userState.classList.toggle('hidden', !isLoggedIn);
    userState.classList.toggle('flex', isLoggedIn);
  }

  if (loginPromptBtn) {
    loginPromptBtn.classList.toggle('hidden', isLoggedIn);
  }

  if (isLoggedIn) {
    if (welcomeText) welcomeText.textContent = `Welcome, ${currentUser}`;
    if (sidebarUserName) sidebarUserName.textContent = currentUser;
    if (authModal) authModal.classList.add('hidden');
  } else {
    if (sidebarUserName) sidebarUserName.textContent = 'Guest';
    if (welcomeText) welcomeText.textContent = 'Welcome, Guest';
    if (loginPromptBtn) loginPromptBtn.classList.remove('hidden');
    if (authModal) authModal.classList.add('hidden');
  }
}

function renderAuthState() {
  updateAuthUI();
}

function credentialsMatch(username, password) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (trimmedUsername === DEFAULT_USERNAME && trimmedPassword === DEFAULT_PASSWORD) {
    return true;
  }

  const stored = getStoredSignupCredentials();
  return !!stored && stored.username === trimmedUsername && stored.password === trimmedPassword;
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password || !credentialsMatch(username, password)) {
    setAuthError('Invalid username or password');
    return;
  }

  clearAuthError();
  saveAuthState({ isLoggedIn: true, currentUser: username });
  renderAuthState();
  loginForm.reset();
}

function handleSignUpSubmit(event) {
  event.preventDefault();

  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value.trim();

  if (!username || !password) {
    setAuthError('Please enter a username and password');
    return;
  }

  if (username.length < 4) {
    setAuthError('Username must be at least 4 characters');
    return;
  }

  if (password.length < 6) {
    setAuthError('Password must be at least 6 characters');
    return;
  }

  saveStoredSignupCredentials(username, password);
  saveAuthState({ isLoggedIn: true, currentUser: username });
  renderAuthState();
  signupForm.reset();
}

function fillDemoCredentials() {
  loginUsernameInput.value = DEFAULT_USERNAME;
  loginPasswordInput.value = DEFAULT_PASSWORD;
  clearAuthError();
}

function resetApp() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(SIGNUP_STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  loginForm.reset();
  signupForm.reset();
  renderAuthState();
  renderHistory();
}

function logoutUser() {
  saveAuthState({ isLoggedIn: false, currentUser: null });
  renderAuthState();
}

function showAuthNotice(message = 'Please log in to save your changes.') {
  if (!authNotice || !authNoticeText) return;
  authNoticeText.textContent = message;
  authNotice.classList.remove('hidden');
  clearTimeout(showAuthNotice.timeoutId);
  showAuthNotice.timeoutId = setTimeout(() => {
    authNotice.classList.add('hidden');
  }, 2600);
}

function requireLoginForAction(actionLabel = 'save your changes') {
  const { isLoggedIn } = getAuthState();
  if (isLoggedIn) return true;

  showAuthNotice(`Please log in to ${actionLabel}.`);
  if (authModal) {
    authModal.classList.remove('hidden');
    switchAuthTab('login');
  }
  return false;
}

async function updateAirQuality() {
  if (!streetSelect) return;

  const selectedStation = streetSelect.value || DEFAULT_AQHI_STATION;
  airQualityStationCache = await fetchAQHIStationData();
  populateStationOptions(airQualityStationCache);

  const stationData = getFallbackStationInfo(selectedStation);
  const liveStation = airQualityStationCache.find((station) => normalizeStationName(station.station) === normalizeStationName(selectedStation))
    || stationData;

  const pollutantData = await fetchPollutantData(liveStation.station);
  applyAirQualityData(liveStation, pollutantData);
}

function calculateCarbonFootprint() {
  const commute = Number(commuteRange.value);
  const energy = Number(energyRange.value);
  const meat = Number(meatRange.value);

  const estimate = (commute * 0.17) + (energy * 0.22) + (meat * 0.93);
  const rounded = estimate.toFixed(1);

  commuteValue.textContent = `${commute} km`;
  energyValue.textContent = `${energy} kWh`;
  meatValue.textContent = `${meat} meals`;
  carbonResult.textContent = rounded;
  currentCarbonTotal.textContent = `${rounded} kg`;

  const goalLimit = 12;
  const fill = Math.min(100, (estimate / goalLimit) * 100);
  goalFill.style.width = `${fill}%`;
  goalLabel.textContent = `Target: ${goalLimit}kg`;

  return Number(rounded);
}

function getSavedTotals() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
}

function saveTotals(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function generateSampleHistory() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totals = [7.2, 5.8, 8.4, 6.5, 9.1, 7.8, 6.2];
  return days.map((day, index) => ({ day, total: totals[index] }));
}

function renderHistory() {
  const entries = getSavedTotals();
  const data = entries.length ? entries : generateSampleHistory();

  const maxValue = Math.max(...data.map((entry) => Number(entry.total || 0)), 10);

  historyBars.innerHTML = data
    .map(
      (entry) => `
        <div class="flex flex-1 flex-col items-center justify-end gap-2">
          <div class="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-emerald-500 to-emerald-400" style="height: ${(Number(entry.total) / maxValue) * 100}%"></div>
          <small class="text-[10px] font-medium text-slate-500">${entry.day}</small>
        </div>
      `
    )
    .join('');
}

function saveTodayFootprint() {
  if (!requireLoginForAction('save your progress')) return;

  const total = calculateCarbonFootprint();
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: 'short' });

  const existing = getSavedTotals();
  const updated = [...existing, { day, total }].slice(-7);
  saveTotals(updated);
  renderHistory();
}

function renderDropoffs(query = '') {
  const normalized = query.trim().toLowerCase();
  const filtered = dropOffs.filter((dropoff) => {
    const haystack = `${dropoff.name} ${dropoff.type} ${dropoff.materials.join(' ')}`.toLowerCase();
    return haystack.includes(normalized);
  });

  dropoffList.innerHTML = filtered
    .map(
      (dropoff) => `
        <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-white">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">${dropoff.name}</span>
            <span class="text-xs font-medium text-slate-500">${dropoff.distance}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>${dropoff.type}</span>
            <span>Open now</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            ${dropoff.materials.map((material) => `<span class="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">${material}</span>`).join('')}
          </div>
        </article>
      `
    )
    .join('');
}

function updateMaterialGuide() {
  const selected = materialSelect.value;
  const text = materialGuide[selected];
  materialInfo.innerHTML = `
    <h5 class="mb-2 text-sm font-semibold text-white">${selected}</h5>
    <p class="text-sm leading-6 text-slate-200">${text}</p>
  `;
}

function openScanModal() {
  scanModal.classList.remove('hidden');
  scanResultText.textContent = 'Plastic bottle';
}

function closeScanModal() {
  scanModal.classList.add('hidden');
}

let navUpdateFrame = null;

function updateActiveNav() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navButtons = Array.from(document.querySelectorAll('.nav-btn'));

  const viewportTop = 0;
  const visibleSections = sections
    .map((section) => {
      const rect = section.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, viewportTop);
      const visibleRatio = Math.max(0, visibleHeight) / Math.max(section.offsetHeight, 1);
      const topDistance = Math.abs(rect.top);

      return { id: section.id, visibleRatio, topDistance };
    })
    .filter((item) => item.visibleRatio > 0)
    .sort((a, b) => {
      if (b.visibleRatio !== a.visibleRatio) {
        return b.visibleRatio - a.visibleRatio;
      }
      return a.topDistance - b.topDistance;
    });

  const activeId = visibleSections.length ? visibleSections[0].id : 'dashboardOverview';

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === activeId);
  });
}

function scheduleActiveNavUpdate() {
  if (navUpdateFrame) {
    cancelAnimationFrame(navUpdateFrame);
  }

  navUpdateFrame = requestAnimationFrame(() => {
    navUpdateFrame = null;
    updateActiveNav();
  });
}

function getWasteGuidanceText(selectedClass) {
  const matched = {
    'Plastic Bottle': 'Blue Bin (Plastics) — Rinse, crush, and leave cap on.',
    'Aluminium Can': 'Yellow Bin (Metals) — Empty liquids; 100% infinitely recyclable.',
    Paper: 'Blue Bin (Paper) — Keep dry and unflattened.',
    Battery: 'Hazardous Waste / E-Waste Drop-off — Never put in standard recycling.'
  };

  return matched[selectedClass] || 'Blue Bin (Plastics) — Rinse, crush, and leave cap on.';
}

function updateWasteGuidance(selectedClass) {
  if (!wasteGuidance) return;
  wasteGuidance.textContent = getWasteGuidanceText(selectedClass);
}

function setWasteStatus(message) {
  if (!wasteStatus) return;
  wasteStatus.textContent = message;
}

async function loadWasteModel() {
  if (wasteModel) {
    return wasteModel;
  }

  if (!window.tf || !window.tmImage) {
    throw new Error('TensorFlow libraries are not available yet.');
  }

  wasteModel = await tmImage.load(WASTE_MODEL_URL + 'model.json', WASTE_MODEL_URL + 'metadata.json');
  return wasteModel;
}

function normalizeWasteClassName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapWastePrediction(name) {
  const normalized = normalizeWasteClassName(name);

  if (normalized.includes('plastic')) return 'Plastic Bottle';
  if (normalized.includes('aluminum') || normalized.includes('aluminium') || normalized.includes('can')) return 'Aluminium Can';
  if (normalized.includes('paper')) return 'Paper';
  if (normalized.includes('battery')) return 'Battery';

  return 'Paper';
}

async function handleWasteImageUpload(event) {
  const file = event.target?.files?.[0];
  if (!file || !wastePreview || !wasteManualSelect) return;

  const objectUrl = URL.createObjectURL(file);
  wastePreview.src = objectUrl;
  wastePreview.classList.remove('hidden');
  wastePreviewPlaceholder.classList.add('hidden');

  try {
    const model = await loadWasteModel();
    const img = document.createElement('img');
    img.src = objectUrl;
    img.crossOrigin = 'anonymous';
    await img.decode();

    const prediction = await model.predict(img);
    const sortedPredictions = Array.isArray(prediction)
      ? [...prediction].sort((a, b) => Number(b.probability || 0) - Number(a.probability || 0))
      : [];
    const topPrediction = sortedPredictions[0] || null;
    const predictedClass = mapWastePrediction(topPrediction?.className || 'Paper');
    const confidence = Number(topPrediction?.probability || 0);

    if (!topPrediction || confidence <= 0 || confidence < 0.6) {
      setWasteStatus('AI confidence is too low for this item. Please verify the material manually.');
      return;
    }

    wasteManualSelect.value = predictedClass;
    updateWasteGuidance(predictedClass);
    setWasteStatus(`AI identified ${predictedClass} (${(confidence * 100).toFixed(0)}% confidence).`);
  } catch (error) {
    console.warn('Waste model classification failed:', error);
    setWasteStatus('AI model unavailable. Please select the material manually.');
  }
}

function initializeWasteScanner() {
  if (!wasteManualSelect || !wasteGuidance) return;

  wasteManualSelect.value = 'Paper';
  updateWasteGuidance('Paper');
  setWasteStatus('Awaiting image analysis');

  if (wasteImageInput) {
    wasteImageInput.addEventListener('change', handleWasteImageUpload);
  }

  if (wasteManualSelect) {
    wasteManualSelect.addEventListener('change', (event) => {
      const selectedClass = event.target.value;
      updateWasteGuidance(selectedClass);
      setWasteStatus(`Manual override selected: ${selectedClass}`);
    });
  }

  loadWasteModel().catch((error) => {
    console.warn('Waste model load failed on init:', error);
  });
}

function attachEvents() {
  if (streetSelect) {
    streetSelect.addEventListener('change', async () => {
      const selectedStation = streetSelect.value || DEFAULT_AQHI_STATION;
      const liveStation = airQualityStationCache.find((station) => normalizeStationName(station.station) === normalizeStationName(selectedStation))
        || getFallbackStationInfo(selectedStation);
      const pollutantData = await fetchPollutantData(liveStation.station);
      applyAirQualityData(liveStation, pollutantData);
    });
  }

  if (airParticleCanvas) {
    window.addEventListener('resize', renderAirParticles);
  }

  [commuteRange, energyRange, meatRange].forEach((slider) => {
    slider.addEventListener('input', calculateCarbonFootprint);
  });

  saveTodayBtn.addEventListener('click', saveTodayFootprint);
  binSearch.addEventListener('input', (event) => renderDropoffs(event.target.value));
  materialSelect.addEventListener('change', updateMaterialGuide);
  scanItemBtn.addEventListener('click', openScanModal);
  closeModalBtn.addEventListener('click', closeScanModal);
  scanActionBtn.addEventListener('click', () => {
    const item = 'Plastic bottle';
    scanResultText.textContent = item;
    materialSelect.value = 'Plastic #1';
    updateMaterialGuide();
  });

  scanModal.addEventListener('click', (event) => {
    if (event.target === scanModal) closeScanModal();
  });

  loginTab.addEventListener('click', () => switchAuthTab('login'));
  signupTab.addEventListener('click', () => switchAuthTab('signup'));
  loginForm.addEventListener('submit', handleLoginSubmit);
  signupForm.addEventListener('submit', handleSignUpSubmit);
  fillDemoCredentialsBtn.addEventListener('click', fillDemoCredentials);
  headerDemoFillBtn.addEventListener('click', fillDemoCredentials);
  resetAppBtn.addEventListener('click', () => {
    if (!requireLoginForAction('reset the app')) return;
    resetApp();
  });
  loginPromptBtn.addEventListener('click', () => {
    switchAuthTab('login');
    if (authModal) authModal.classList.remove('hidden');
  });
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (!requireLoginForAction('change the theme')) return;
      handleThemeToggle();
    });
  }

  document.querySelectorAll('.font-size-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (!requireLoginForAction('change the font size')) return;
      handleFontSizeChange(button.dataset.fontSize);
    });
  });

  if (authNoticeClose) {
    authNoticeClose.addEventListener('click', () => authNotice.classList.add('hidden'));
  }

  const resetAppBtnFooter = document.getElementById('resetAppBtnFooter');
  if (resetAppBtnFooter) {
    resetAppBtnFooter.addEventListener('click', () => {
      if (!requireLoginForAction('clear your saved data')) return;
      resetApp();
    });
  }

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (target) {
        document.querySelectorAll('.nav-btn').forEach((nav) => nav.classList.remove('active'));
        button.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('scroll', scheduleActiveNavUpdate, { passive: true });
  window.addEventListener('resize', scheduleActiveNavUpdate);
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const nextTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', nextTheme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }
}

function initFontSize() {
  const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY) || 'normal';
  const sizeMap = {
    normal: '100%',
    medium: '112.5%',
    large: '125%'
  };

  document.documentElement.style.fontSize = sizeMap[stored] || '100%';

  document.querySelectorAll('.font-size-btn').forEach((button) => {
    const active = button.dataset.fontSize === stored;
    button.classList.toggle('bg-emerald-100', active);
    button.classList.toggle('text-emerald-700', active);
    button.classList.toggle('text-slate-600', !active);
  });
}

function handleThemeToggle() {
  const isDark = document.documentElement.classList.contains('dark');
  const nextTheme = isDark ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', nextTheme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }
}

function handleFontSizeChange(size) {
  const normalized = ['normal', 'medium', 'large'].includes(size) ? size : 'normal';
  const sizeMap = {
    normal: '100%',
    medium: '112.5%',
    large: '125%'
  };

  document.documentElement.style.fontSize = sizeMap[normalized];
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, normalized);

  document.querySelectorAll('.font-size-btn').forEach((button) => {
    const active = button.dataset.fontSize === normalized;
    button.classList.toggle('bg-emerald-100', active);
    button.classList.toggle('text-emerald-700', active);
    button.classList.toggle('text-slate-600', !active);
  });
}

async function init() {
  initTheme();
  initFontSize();
  attachEvents();
  renderAuthState();
  initializeWasteScanner();
  airQualityStationCache = await fetchAQHIStationData();
  populateStationOptions(airQualityStationCache);
  const initialStation = streetSelect ? streetSelect.value || DEFAULT_AQHI_STATION : DEFAULT_AQHI_STATION;
  const initialRecord = getFallbackStationInfo(initialStation);
  const initialPollutants = await fetchPollutantData(initialRecord.station);
  applyAirQualityData(initialRecord, initialPollutants);
  calculateCarbonFootprint();
  renderHistory();
  renderDropoffs();
  updateMaterialGuide();
  scheduleActiveNavUpdate();
}

init();
