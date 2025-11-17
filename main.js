// ベル音を鳴らす関数
async function playBell() {
  const audioCtx = getAudioContext();

  // Safari対応: AudioContextをレジューム
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = AUDIO_CONFIG.BASE_FREQUENCY;

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = AUDIO_CONFIG.HARMONIC_FREQUENCY;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + AUDIO_CONFIG.BELL_DURATION
  );

  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc2.start();
  osc.stop(audioCtx.currentTime + AUDIO_CONFIG.BELL_DURATION);
  osc2.stop(audioCtx.currentTime + AUDIO_CONFIG.BELL_DURATION);
}

// 複数回ベル音を鳴らす関数（間隔最小化）
async function playBells(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(async () => {
      await playBell();
    }, i * AUDIO_CONFIG.BELL_INTERVAL);
  }
}

// Format time as MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Format time for display (s/m format)
function formatTimeForDisplay(seconds) {
  if (seconds < 60) {
    return `${seconds}${DISPLAY_CONFIG.TIME_UNIT_SECOND}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}${DISPLAY_CONFIG.TIME_UNIT_MINUTE}`;
  }

  return `${minutes}${DISPLAY_CONFIG.TIME_UNIT_MINUTE} ${remainingSeconds}${DISPLAY_CONFIG.TIME_UNIT_SECOND}`;
}

// Bell display formatting
function getBellDisplayRepeated(count) {
  return AUDIO_CONFIG.BELL_ICON.repeat(count);
}

function getBellDisplayWithCount(count) {
  return `${AUDIO_CONFIG.BELL_ICON}×${count}`;
}

// Update timer display
function updateDisplay() {
  DOM.timerDisplay.textContent = formatTime(timerState.seconds);
  updateWarningHighlights();
}

// Update warning highlights
function updateWarningHighlights() {
  const displayItems = document.querySelectorAll('.setting-display-item');
  const inputContainers = document.querySelectorAll('.warning-input');

  displayItems.forEach((item) => item.classList.remove('active'));
  inputContainers.forEach((container) => container.classList.remove('active'));

  for (let i = 0; i < timerState.warningCount; i++) {
    const warningValue = timerState.warningValues[i] || 0;
    const isWarningReached =
      timerState.seconds >= warningValue && warningValue > 0;

    if (isWarningReached) {
      displayItems[i]?.classList.add('active');
      inputContainers[i]?.classList.add('active');
    }
  }
}

// Check and trigger bells
function checkBells() {
  for (let i = 0; i < timerState.warningCount; i++) {
    const warningValue = timerState.warningValues[i] || 0;
    if (
      !timerState.bellsTriggered[i] &&
      timerState.seconds >= warningValue &&
      warningValue > 0
    ) {
      timerState.bellsTriggered[i] = true;
      playBells(i + 1);
    }
  }
}

// Timer tick
function tick() {
  timerState.seconds++;
  updateDisplay();
  checkBells();
}

// Start timer
function startTimer() {
  if (!timerState.isRunning) {
    timerState.isRunning = true;
    timerState.intervalId = setInterval(tick, TIMER_CONFIG.TICK_INTERVAL);
    DOM.startBtn.disabled = true;
    DOM.pauseBtn.disabled = false;
    disableWarningInputs();
    DOM.increaseCountBtn.disabled = true;
    DOM.decreaseCountBtn.disabled = true;
  }
}

// Pause timer
function pauseTimer() {
  if (timerState.isRunning) {
    timerState.isRunning = false;
    clearInterval(timerState.intervalId);
    DOM.startBtn.disabled = false;
    DOM.pauseBtn.disabled = true;
    updateCountButtons();
  }
}

// Reset timer
function resetTimer() {
  timerState.isRunning = false;
  clearInterval(timerState.intervalId);
  timerState.seconds = 0;
  timerState.bellsTriggered = new Array(timerState.warningCount).fill(false);
  timerState.laps = [];
  updateDisplay();
  updateLapDisplay();
  DOM.startBtn.disabled = false;
  DOM.pauseBtn.disabled = true;
  enableWarningInputs();
}

// Record lap time
function recordLap() {
  timerState.laps.unshift(timerState.seconds);
  updateLapDisplay();
}

// Clear all laps
function clearLaps() {
  timerState.laps = [];
  updateLapDisplay();
}

// Update lap display
function updateLapDisplay() {
  if (timerState.laps.length === 0) {
    const lapEmptyElement = document.getElementById('lapEmptyMessage');
    const emptyMessage =
      lapEmptyElement?.textContent || 'ラップボタンを押すと記録が表示されます';
    DOM.lapList.innerHTML = `<div class="lap-empty">${emptyMessage}</div>`;
    return;
  }

  DOM.lapList.innerHTML = timerState.laps
    .map((lapTime, index) => {
      const lapNumber = timerState.laps.length - index;
      return `
        <div class="lap-item">
          <div class="lap-number">ラップ ${lapNumber}</div>
          <div class="lap-time">${formatTime(lapTime)}</div>
        </div>
      `;
    })
    .join('');
}

// Toggle lap section visibility
function toggleLapSection() {
  lapSectionExpanded = !lapSectionExpanded;
  DOM.lapSection.classList.toggle('expanded', lapSectionExpanded);
}

// Toggle settings input visibility
function toggleSettings() {
  settingsVisible = !settingsVisible;
  DOM.settingsInputContent.classList.toggle('hidden', !settingsVisible);
  DOM.toggleIcon.classList.toggle('rotated', !settingsVisible);
  DOM.toggleSettingsBtn.classList.toggle('inactive', !settingsVisible);
}

// Generate warning displays
function generateWarningDisplays() {
  if (!DOM.settingsDisplayContent) {
    console.error('settingsDisplayContent element not found');
    return;
  }

  DOM.settingsDisplayContent.innerHTML = '';

  for (let i = 0; i < timerState.warningCount; i++) {
    const displayItem = createWarningDisplayItem(i);
    DOM.settingsDisplayContent.appendChild(displayItem);
  }
}

function createWarningDisplayItem(index) {
  const warningClass = `warning${index + 1}`;
  const bellDisplay = getBellDisplayRepeated(index + 1);
  const timeValue = formatTimeForDisplay(timerState.warningValues[index] || 0);

  const displayItem = document.createElement('div');
  displayItem.className = `setting-display-item ${warningClass}`;
  displayItem.innerHTML = `
    <span class="setting-display-label">
      <span id="display-warning${index + 1}">${bellDisplay}: ${timeValue}</span>
    </span>
  `;

  return displayItem;
}

// Generate warning inputs
function generateWarningInputs() {
  if (!DOM.warningInputsContainer) {
    console.error('warningInputsContainer element not found');
    return;
  }

  DOM.warningInputsContainer.innerHTML = '';

  for (let i = 0; i < timerState.warningCount; i++) {
    const inputElement = createWarningInputElement(i);
    DOM.warningInputsContainer.appendChild(inputElement);
  }
}

function createWarningInputElement(index) {
  const warningClass = `warning${index + 1}`;
  const warningValue = timerState.warningValues[index] || (index + 1) * 60;
  const disabledAttr = timerState.isRunning ? 'disabled' : '';

  const inputDiv = document.createElement('div');
  inputDiv.className = `warning-input ${warningClass}`;
  inputDiv.id = `warning${index + 1}-container`;
  inputDiv.innerHTML = `
    <label>${getBellDisplayWithCount(index + 1)}</label>
    <input
      type="number"
      id="warning${index + 1}"
      value="${warningValue}"
      min="0"
      max="99999999"
      placeholder="秒数"
      ${disabledAttr}
    >
    <span>秒</span>
  `;

  const input = inputDiv.querySelector('input');
  input.addEventListener('input', () => {
    timerState.warningValues[index] = parseInt(input.value) || 0;
    updateDisplayValues();
  });

  return inputDiv;
}

// Update display values
function updateDisplayValues() {
  for (let i = 0; i < timerState.warningCount; i++) {
    const displayElement = document.getElementById(`display-warning${i + 1}`);
    if (displayElement) {
      const bellDisplay = getBellDisplayRepeated(i + 1);
      const timeValue = formatTimeForDisplay(timerState.warningValues[i] || 0);
      displayElement.textContent = `${bellDisplay}: ${timeValue}`;
    }
  }
}

// Update count buttons state
function updateCountButtons() {
  const canDecrease = timerState.warningCount > TIMER_CONFIG.MIN_WARNING_COUNT;
  const canIncrease = timerState.warningCount < TIMER_CONFIG.MAX_WARNING_COUNT;

  DOM.decreaseCountBtn.disabled = !canDecrease || timerState.isRunning;
  DOM.increaseCountBtn.disabled = !canIncrease || timerState.isRunning;
}

// Increase warning count
function increaseWarningCount() {
  if (
    timerState.warningCount < TIMER_CONFIG.MAX_WARNING_COUNT &&
    !timerState.isRunning
  ) {
    modifyWarningCount(1);
  }
}

// Decrease warning count
function decreaseWarningCount() {
  if (
    timerState.warningCount > TIMER_CONFIG.MIN_WARNING_COUNT &&
    !timerState.isRunning
  ) {
    modifyWarningCount(-1);
  }
}

function modifyWarningCount(delta) {
  timerState.warningCount += delta;

  if (delta > 0) {
    const newValue = timerState.warningCount * 60;
    timerState.warningValues.push(newValue);
    timerState.bellsTriggered.push(false);
  } else {
    timerState.warningValues.pop();
    timerState.bellsTriggered.pop();
  }

  DOM.currentCountSpan.textContent = timerState.warningCount;
  generateWarningDisplays();
  generateWarningInputs();
  updateCountButtons();
}

// Enable/disable warning inputs
function disableWarningInputs() {
  setWarningInputsDisabled(true);
}

function enableWarningInputs() {
  setWarningInputsDisabled(false);
}

function setWarningInputsDisabled(disabled) {
  for (let i = 1; i <= timerState.warningCount; i++) {
    const input = document.getElementById(`warning${i}`);
    if (input) input.disabled = disabled;
  }
}

// Event listeners
function attachEventListeners() {
  DOM.startBtn.addEventListener('click', startTimer);
  DOM.pauseBtn.addEventListener('click', pauseTimer);
  DOM.resetBtn.addEventListener('click', resetTimer);
  DOM.lapBtn.addEventListener('click', recordLap);
  DOM.toggleLapBtn.addEventListener('click', toggleLapSection);
  DOM.clearLapsBtn.addEventListener('click', clearLaps);
  DOM.toggleSettingsBtn.addEventListener('click', toggleSettings);
  DOM.increaseCountBtn.addEventListener('click', increaseWarningCount);
  DOM.decreaseCountBtn.addEventListener('click', decreaseWarningCount);
}

// Parse URL parameters and set initial values
function parseURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  parseBellCount(urlParams);
  parseWarningValues(urlParams);
}

function parseBellCount(urlParams) {
  const bellCountParam = urlParams.get('bell_count');
  if (bellCountParam !== null) {
    const bellCount = parseInt(bellCountParam);
    if (isValidBellCount(bellCount)) {
      timerState.warningCount = bellCount;
    }
  }
}

function parseWarningValues(urlParams) {
  const newWarningValues = [];

  for (let i = 1; i <= timerState.warningCount; i++) {
    const wParam = urlParams.get(`w${i}`);
    const value = wParam !== null ? parseInt(wParam) : null;
    const isValid = value !== null && isValidSeconds(value);

    const warningValue = isValid
      ? value
      : timerState.warningValues[i - 1] || i * 300;

    newWarningValues.push(warningValue);
  }

  if (newWarningValues.length > 0) {
    timerState.warningValues = newWarningValues;
  }
}

// Validation helpers
function isValidBellCount(count) {
  return (
    !isNaN(count) &&
    count >= TIMER_CONFIG.MIN_WARNING_COUNT &&
    count <= TIMER_CONFIG.MAX_WARNING_COUNT
  );
}

function isValidSeconds(seconds) {
  return !isNaN(seconds) && seconds >= 0 && seconds <= TIMER_CONFIG.MAX_SECONDS;
}

// Initialize displays
function initializeApp() {
  try {
    initializeDOMElements();
    parseURLParameters();
    timerState.bellsTriggered = new Array(timerState.warningCount).fill(false);
    DOM.currentCountSpan.textContent = timerState.warningCount;
    generateWarningDisplays();
    generateWarningInputs();
    updateDisplay();
    updateLapDisplay();
    updateCountButtons();
    attachEventListeners();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}
