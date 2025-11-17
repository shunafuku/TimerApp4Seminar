# CLAUDE.md - AI Assistant Guide for TimerApp4Seminar

## Project Overview

**TimerApp4Seminar** is a count-up timer application designed for seminars at Osaka Electro-Communication University (大阪電気通信大学). This is a single-page application (SPA) built with vanilla JavaScript, HTML, and CSS without any frameworks or build systems.

### Key Information
- **Language**: Japanese (UI and documentation)
- **License**: MIT
- **Deployment**: GitHub Pages at `https://shunafuku.github.io/TimerApp4Seminar`
- **Architecture**: Pure vanilla JavaScript, no dependencies or build process
- **Target Users**: Seminar instructors and students

## Repository Structure

```
TimerApp4Seminar/
├── index.html          # Main HTML structure and inline configuration
├── main.js             # Core application logic (~440 lines)
├── style.css           # Material Design 3 monochrome styling (~1040 lines)
├── README.md           # Japanese documentation
└── LICENSE             # MIT License
```

### File Responsibilities

**index.html** (198 lines)
- HTML structure and semantic markup
- Inline configuration constants (AUDIO_CONFIG, TIMER_CONFIG, DISPLAY_CONFIG)
- State initialization (timerState, UI state)
- DOM element references
- App initialization call

**main.js** (443 lines)
- Timer logic and state management
- Audio synthesis for bell sounds
- URL parameter parsing
- Event handlers
- DOM manipulation and display updates

**style.css** (1042 lines)
- Material Design 3 monochrome color system
- Responsive design (breakpoints at 480px, 768px, 1280px)
- Animations and transitions
- Component styling

## Core Features

### 1. Count-Up Timer
- Displays time in MM:SS format
- Start, pause, reset functionality
- 1-second tick interval
- Maximum: 99,999,999 seconds

### 2. Multi-Stage Warning System
- Configurable 1-10 warning stages
- Each stage plays bell sound N times (stage 1 = 1 bell, stage 2 = 2 bells, etc.)
- Visual feedback when warnings are triggered
- Bell icon display: 🔔 (repeated or with ×count notation)

### 3. Lap Time Recording
- Records current time when LAP button pressed
- Displays in reverse chronological order (newest first)
- Collapsible lap section
- Clear all laps functionality

### 4. URL Parameter Configuration
Supports sharing timer configurations via URL:
- `bell_count`: Number of warning stages (1-10)
- `w1, w2, ..., w10`: Warning times in seconds

Example: `?bell_count=3&w1=600&w2=900&w3=1200`

### 5. Audio Synthesis
- Uses Web Audio API for bell sounds
- Dual oscillator (880Hz + 1320Hz sine waves)
- 500ms duration per bell
- 380ms interval between bells
- Safari compatibility handling

## Architecture & Code Organization

### State Management

The application uses a simple object-based state management pattern:

```javascript
let timerState = {
  seconds: 0,              // Current time in seconds
  isRunning: false,        // Timer running state
  intervalId: null,        // setInterval reference
  bellsTriggered: [],      // Array tracking which bells have sounded
  laps: [],                // Lap times array
  warningCount: 3,         // Number of warning stages (1-10)
  warningValues: [720, 900, 1500]  // Warning times in seconds
};
```

### Configuration Constants

Three main configuration objects defined in index.html:

**AUDIO_CONFIG**: Bell sound parameters
- BELL_DURATION: 0.5s
- BASE_FREQUENCY: 880Hz
- HARMONIC_FREQUENCY: 1320Hz
- BELL_INTERVAL: 380ms
- BELL_ICON: '🔔'

**TIMER_CONFIG**: Timer behavior
- DEFAULT_WARNING_COUNT: 3
- DEFAULT_WARNING_VALUES: [720, 900, 1500] (12m, 15m, 25m)
- MIN_WARNING_COUNT: 1
- MAX_WARNING_COUNT: 10
- MAX_SECONDS: 99999999
- TICK_INTERVAL: 1000ms

**DISPLAY_CONFIG**: UI formatting
- TIME_UNIT_MINUTE: 'm'
- TIME_UNIT_SECOND: 's'

### DOM Caching Pattern

DOM elements are cached in the `DOM` object via `initializeDOMElements()`:

```javascript
const DOM = {
  timerDisplay, startBtn, pauseBtn, resetBtn, lapBtn,
  toggleLapBtn, lapSection, clearLapsBtn, lapList,
  settingsDisplayContent, warningInputsContainer,
  increaseCountBtn, decreaseCountBtn, currentCountSpan,
  toggleSettingsBtn, settingsInputContent, toggleIcon,
  lapEmptyMessage
};
```

### Key Functions

**Timer Operations** (main.js:117-160)
- `tick()`: Increments time, updates display, checks bells
- `startTimer()`: Starts interval, updates UI state
- `pauseTimer()`: Stops interval, enables editing
- `resetTimer()`: Clears state, returns to 00:00

**Audio** (main.js:1-42)
- `playBell()`: Single bell sound with Web Audio API
- `playBells(count)`: Plays multiple bells with intervals

**Display Updates** (main.js:76-100)
- `updateDisplay()`: Updates timer and warning highlights
- `updateWarningHighlights()`: Adds 'active' class to reached warnings

**Dynamic UI Generation** (main.js:211-286)
- `generateWarningDisplays()`: Creates warning indicator elements
- `generateWarningInputs()`: Creates editable warning time inputs

**URL Parameters** (main.js:376-411)
- `parseURLParameters()`: Reads and validates URL params
- `parseBellCount()`: Parses bell_count parameter
- `parseWarningValues()`: Parses w1-w10 parameters

## Development Conventions

### 1. Code Style
- Use function declarations (not arrow functions for main functions)
- Camel case for variables and functions
- Constants in SCREAMING_SNAKE_CASE
- No semicolons required but consistently used
- 2-space indentation

### 2. State Management Rules
- All state modifications go through `timerState` object
- UI state (lapSectionExpanded, settingsVisible) kept separate
- No global pollution beyond necessary variables
- AudioContext lazy initialization via `getAudioContext()`

### 3. UI Update Pattern
```javascript
// 1. Update state
timerState.property = newValue;

// 2. Update display
updateDisplay();

// 3. Update related UI elements
updateRelatedElements();
```

### 4. Event Handling
- Event listeners attached in `attachEventListeners()` (main.js:363-374)
- No inline event handlers in HTML
- Event listeners for dynamic elements added during creation

### 5. Validation
- Always validate URL parameters (main.js:413-424)
- Check bounds for warning count (1-10)
- Check bounds for seconds (0-99999999)
- Use helper functions: `isValidBellCount()`, `isValidSeconds()`

### 6. Accessibility Considerations
- Button title attributes for tooltips
- Semantic HTML structure
- Sufficient color contrast (MD3 monochrome)
- Keyboard navigation support

## Styling System

### Material Design 3 Monochrome Theme

The app uses MD3 color tokens defined in CSS custom properties:

```css
--md3-primary: #ffffff
--md3-on-primary: #000000
--md3-surface: #1e1e1e
--md3-surface-dim: #121212
--md3-surface-bright: #2a2a2a
--md3-on-surface: #ffffff
--md3-on-surface-variant: #b0bec5
--md3-outline: #606060
```

### Responsive Breakpoints

1. **Mobile**: < 480px
   - Smaller timer (120px font)
   - Compact buttons (44px)
   - Reduced padding

2. **Tablet**: 480px - 768px
   - Medium timer (140px font)
   - Standard buttons (48px)

3. **Desktop**: 768px - 1280px
   - Large timer (200px font)
   - Full buttons (50px)

4. **Large Desktop**: > 1280px
   - Extra large timer (240px font)
   - Expanded lap section (200px height)

### Animation Patterns

- **Transitions**: 0.2s - 0.3s ease-out for interactions
- **Hover effects**: scale(1.05) - scale(1.1)
- **Active states**: Highlights with background color changes
- **Fade animations**: opacity + translateY for smooth appearance

## Common Development Tasks

### Adding a New Feature

1. Identify affected files (usually main.js for logic, style.css for styling)
2. Update state object if needed (timerState or UI state)
3. Add configuration constants if applicable
4. Implement core logic in main.js
5. Update DOM generation if dynamic elements needed
6. Add event listeners in `attachEventListeners()`
7. Update styling in style.css with MD3 tokens
8. Test responsive behavior at all breakpoints
9. Update README.md (in Japanese)

### Modifying Warning System

Key functions to modify:
- `checkBells()` (main.js:102-115): Detection logic
- `playBells()` (main.js:35-42): Audio behavior
- `generateWarningDisplays()` (main.js:211-224): Visual indicators
- `generateWarningInputs()` (main.js:242-255): Settings inputs

### Changing Styling

- Use existing MD3 color tokens from `:root`
- Follow monochrome color scheme
- Test all breakpoints (480px, 768px, 1280px)
- Maintain 12px border radius for consistency
- Keep transitions at 0.2s ease-out

### URL Parameter Handling

Pattern in `parseWarningValues()` (main.js:393-411):
1. Get parameter from URLSearchParams
2. Parse and validate value
3. Use fallback if invalid
4. Update state
5. Trigger UI regeneration

## Testing Checklist

When making changes, verify:

- [ ] Timer starts, pauses, and resets correctly
- [ ] Warning bells trigger at correct times
- [ ] Warning bells play correct number of times
- [ ] Lap recording works (adds to list, newest first)
- [ ] Clear laps removes all entries
- [ ] URL parameters parse correctly
- [ ] Invalid URL params use defaults
- [ ] All buttons enable/disable appropriately
- [ ] Responsive design at 480px, 768px, 1280px
- [ ] Warning inputs disable when timer running
- [ ] Count buttons disable when timer running
- [ ] Active state highlights work correctly
- [ ] Audio plays in Safari (AudioContext resume)
- [ ] Settings collapse/expand smoothly
- [ ] Lap section collapse/expand smoothly

## Known Patterns & Idioms

### Dynamic Element Creation
```javascript
const element = document.createElement('div');
element.className = 'class-name';
element.innerHTML = `<template>`;
container.appendChild(element);
```

### Input Event Handling
```javascript
input.addEventListener('input', () => {
  timerState.values[index] = parseInt(input.value) || 0;
  updateDisplayValues();
});
```

### Conditional Class Application
```javascript
element.classList.toggle('active', condition);
element.classList.add('active');
element.classList.remove('active');
```

### Time Formatting
```javascript
// MM:SS format
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

// Display format (12s, 5m, 5m 30s)
if (seconds < 60) return `${seconds}s`;
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;
if (remainingSeconds === 0) return `${minutes}m`;
return `${minutes}m ${remainingSeconds}s`;
```

## Git Workflow

- **Main branch**: For stable releases
- **Feature branches**: Use `claude/` prefix for AI-assisted work
- **Commit messages**: Descriptive, follow existing style
- **No build step**: Direct commit of source files

## Important Notes for AI Assistants

1. **Language**: All user-facing text must be in Japanese
2. **No Dependencies**: Do not add npm packages or build tools
3. **Browser Compatibility**: Support modern browsers, Safari requires special handling
4. **State Integrity**: Always update timerState before UI
5. **No Frameworks**: Keep vanilla JavaScript pattern
6. **Material Design**: Stick to MD3 monochrome tokens
7. **Mobile-First**: Test mobile layouts thoroughly
8. **URL Sharing**: Maintain URL parameter compatibility
9. **Audio Context**: Remember Safari suspended state handling
10. **Validation**: Always validate user input and URL params

## Resources

- **Live Site**: https://shunafuku.github.io/TimerApp4Seminar
- **Repository**: https://github.com/shunafuku/TimerApp4Seminar
- **Material Design 3**: https://m3.material.io/
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## Quick Reference

### Key File Locations
- Timer logic: main.js:117-160
- Audio synthesis: main.js:1-42
- URL parsing: main.js:376-424
- UI generation: main.js:211-298
- Event listeners: main.js:363-374
- App initialization: main.js:427-442
- Configuration: index.html:12-94
- MD3 colors: style.css:1-56
- Responsive breakpoints: style.css:498-761, 980-1041

### State Management
- Timer state: main.js (timerState object)
- UI state: main.js (lapSectionExpanded, settingsVisible)
- DOM cache: index.html (DOM object initialized in initializeDOMElements)

### Critical Functions
- `initializeApp()`: App bootstrap (main.js:427)
- `tick()`: Timer increment (main.js:117)
- `checkBells()`: Warning detection (main.js:102)
- `parseURLParameters()`: Configuration loading (main.js:376)

---

**Last Updated**: 2025-11-17
**Version**: Current state of repository
