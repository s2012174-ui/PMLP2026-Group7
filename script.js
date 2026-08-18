const streetData = {
  '5th Avenue': { aqi: 68, pm25: 32, pm10: 48, no2: 26 },
  'Central Park West': { aqi: 52, pm25: 24, pm10: 35, no2: 19 },
  'Main Street': { aqi: 101, pm25: 58, pm10: 71, no2: 42 },
  'Riverside Blvd': { aqi: 44, pm25: 18, pm10: 28, no2: 15 }
};

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

function getAqiStatus(aqi) {
  if (aqi <= 50) {
    return { label: 'Good', className: 'good' };
  }
  if (aqi <= 100) {
    return { label: 'Moderate', className: 'moderate' };
  }
  return { label: 'Unhealthy', className: 'unhealthy' };
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

function updateAirQuality() {
  const selectedStreet = streetSelect.value;
  const data = streetData[selectedStreet];
  const status = getAqiStatus(data.aqi);

  aqiValue.textContent = data.aqi;
  aqiStatus.textContent = status.label;
  aqiStatus.className = `status-badge ${status.className}`;
  pm25Value.textContent = data.pm25;
  pm10Value.textContent = data.pm10;
  no2Value.textContent = data.no2;

  pm25Bar.style.width = `${Math.min(100, (data.pm25 / 80) * 100)}%`;
  pm10Bar.style.width = `${Math.min(100, (data.pm10 / 100) * 100)}%`;
  no2Bar.style.width = `${Math.min(100, (data.no2 / 50) * 100)}%`;

  const overallScore = Math.max(40, 100 - data.aqi + 20);
  heroScore.textContent = Math.round(overallScore);
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

function attachEvents() {
  streetSelect.addEventListener('change', updateAirQuality);

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

function init() {
  initTheme();
  initFontSize();
  attachEvents();
  renderAuthState();
  updateAirQuality();
  calculateCarbonFootprint();
  renderHistory();
  renderDropoffs();
  updateMaterialGuide();
  scheduleActiveNavUpdate();
}

init();
