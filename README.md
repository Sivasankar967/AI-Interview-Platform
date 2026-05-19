# 🤖 InterviewAI: Next-Gen Technical Assessment Platform

An immersive, premium, and state-of-the-art AI-driven technical interviewing platform that recreates real-world coding and architectural assessment experiences. Featuring an intelligent AI avatar interviewer named **Aria**, fully integrated assessment workspaces, real-time speech interaction, a robust proctoring shield, and comprehensive post-interview performance profiling.

---

## 🌟 Real & Functional Features

The platform is fully active and features complete interactive logic across the entire interview lifecycle:

### 1. 🎤 Intelligent AI Interviewer (Aria)
* **Expressive SVG Facial Engine**: Aria dynamically changes facial vector paths and states depending on what she is doing:
  * `Idle`: Regular blinking eyes and a gentle smile.
  * `Thinking`: Half-closed focused eyes, neutral straight mouth, and a rotating amber spinner.
  * `Speaking`: Interactive mouth path (open mouth/closed line transition) with concentric pulsing rings and a bottom 7-bar audio visualizer.
  * `Listening`: Wide eyes, inner pupil spark, a green pulsing ring, and a bobbing microphone overlay.
* **Fail-safe Speech & Fallback Simulation**: Integrates the Web Speech API (SpeechSynthesis & SpeechRecognition). If browser audio or autoplay permissions block text-to-speech, a 1.5-second fail-safe timer automatically triggers a typewriter typing and speaking simulation, ensuring the interview flow never hangs.
* **Typewriter Effect**: Clean, skip-free typewriter method rendering questions dynamically at 20ms per character.

### 2. 🔀 Adaptive Interview Flow & Scoring
* **AI Follow-up Question Injection**: When answers contain critical keywords matching the question criteria, Aria dynamically injects adaptive, specialized follow-up questions directly into the upcoming question stream for a custom, deep-dive evaluation.
* **Keyword Matching Scoring Engine**: Automatically analyzes answers in real-time by matching technical keywords and generating organic, weighted scores for each question.
* **Timed Auto-Submission**: Tracks active question timers in real-time. If the time limit expires, the system automatically saves the draft, submits the response, and moves to the next question to ensure no progress is lost.
* **Session Persistence**: Candidate credentials, microphone/speaker mute flags, and comprehensive results history are automatically persisted and managed through `localStorage`.

### 3. 🖥️ Interactive Multi-tab Assessment Workspaces
* **Text Answer with Voice Sync**: Features a responsive writing pad with a custom voice recorder. Spoken transcripts are smoothly appended to the manual keyboard-typed text, avoiding duplicates. Renders high-fidelity blinking equalizer meters and dynamic overlay cues showing speech recognition activity.
* **Monaco Code Editor**: Powered by `@monaco-editor/react` with full syntax highlighting, autocomplete, and support for JavaScript, TypeScript, Python, and Java.
* **Local Code Compilation & Test Case Engine**: Features physical client-side code verification tests! Runs custom evaluation suites for key algorithm challenges (e.g. debouncing closures, token-bucket rate limiters, moving average buffers) and spits out detailed compilation logs.
* **Interactive Canvas Whiteboard**: Drawing space featuring responsive brush parameters, customizable brushes, touch-responsiveness (mobile/tablet ready), and quick clear buttons.

### 4. 📹 Proctoring Camera & Security Shield
* **Active Web Camera Capturing**: Displays local live streams using `navigator.mediaDevices.getUserMedia` with smooth error-fallback overlays and camera on/off toggles.
* **Simulated AI Face Detection**: Rendered with high-tech HUD overlays including blinking tracking brackets, a green "Face Detected" active sensor, and simulated metrics logs detailing eye contact levels, engagement indexes, pose stability, and pitch/yaw/roll telemetry.
* **Proctoring Violation Monitor**: Tracks browser tab changes and window blurring. If a candidate leaves the active interview page, an anti-cheat proctoring warning modal triggers, increments the violation counter, and alerts the user of potential disqualification.
* **Question Timer HUD Bar**: Places a color-morphing progress bar along the top edge of the camera viewport that flashes rose when time is critically low, ensuring countdown visibility in closed dashboard states.

### 5. 📊 Premium Performance Results & Profiling
* **Custom SVG Radar Chart**: Stagger-animated multi-dimensional polygon highlighting strengths and growth opportunities in categories like **Technical**, **Communication**, **Problem Solving**, **Code Quality**, and **System Design**.
* **Radial Score Gauges**: Animated percentage gauges summarize the technical, analytical, communication, and overall outcome of the interview, incrementing from zero on mount.
* **Achievement Grade Badge**: Renders letter grades (`S`, `A`, `B`, `C`, `D`) inside dynamic achievement cards with pulsing visual elements based on calculated overall scores.
* **Dynamic PNG Screenshot Generation**: Uses `html2canvas` to capture a beautifully formatted hidden card template (with name, role, overall score, letter grade, and verified watermark) and initiates a download as a PNG file.
* **Interactive Timeline**: Detailed dialog transcript timeline listing overall response logs and status checks.

### 6. ⌨️ Interactivity & Keyboard Shortcuts
* **Global Access Modal**: Toggle keybindings directly through global action handlers.
* **Interactivity Controls**: Renders a dedicated shortcuts cue. Supports key triggers outside active input fields:
  * `?`: Toggle accessibility shortcuts modal.
  * `M`: Toggle Microphone mute.
  * `C`: Toggle Camera feed on/off.
  * `V`: Switch active workspace tab to the Text Answer tab.
  * `ESC`: Pause interview session (opens the Pause overlay).
  * `SPACE`: Submit/Skip current question.

---

## 🛠️ Tech Stack & Dependencies

* **Framework**: React 19 + TypeScript + Vite 8
* **Styling**: Tailwind CSS v4.0 + Custom HSL Glassmorphic CSS tokens
* **Code Editor**: `@monaco-editor/react`
* **Icons**: `lucide-react`
* **Speech Integration**: Web Speech API (SpeechSynthesis & SpeechRecognition)
* **Visualizations**: Animated Custom SVG Engine (Radar Charts, Waveforms, Gauges)
* **Report Utility**: `html2canvas`

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone the repository
```bash
git clone https://github.com/Sivasankar967/AI-Interview-Platform.git
cd AI-Interview-Platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the local development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```text
AI-Interview-Platform/
├── src/
│   ├── assets/              # Icons, SVG assets, and static media
│   ├── components/          # Reusable UI Blocks (Aria, Whiteboard, Monaco, Charts)
│   │   ├── AIInterviewer.tsx       # AI Conversation controller & speech logic
│   │   ├── AvatarAria.tsx          # SVG animated vector expressions & waveform
│   │   ├── CandidateCamera.tsx     # Webcam visual block, Face detection HUD & timer Progress bar
│   │   ├── CandidatePanel.tsx      # Multi-tab workspace controller & speech sync
│   │   ├── CodeEditor.tsx          # Monaco wrapper & client-side test execution engine
│   │   ├── RadarChart.tsx          # SVG animated skill topology radar visualization
│   │   ├── ResultsDashboard.tsx    # Confetti canvas, radial score gauges & PNG generator
│   │   └── Whiteboard.tsx          # HTML5 Canvas whiteboard drawing engine
│   ├── context/             # Interview state provider, timers, scoring & follow-ups
│   ├── data/                # Mock responses, questions database, and feedback templates
│   ├── hooks/               # Custom hooks for SpeechSynthesis and Recognition
│   ├── index.css            # Custom glassmorphic styles & variables
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Vite environment types
├── vercel.json              # Deploy configuration for Vercel
├── package.json             # NPM package scripts & configuration
└── tsconfig.json            # TypeScript configuration
```

---

## ⌨️ Keyboard Shortcuts Reference

| Action | Shortcut | Usage |
| :--- | :--- | :--- |
| **Shortcuts List** | `?` | Toggle keybind overlay modal |
| **Pause / Resume** | `ESC` | Pause session, timer, and camera |
| **Mute Mic** | `M` | Toggle candidate voice capture |
| **Toggle Camera** | `C` | Turn local camera stream on/off |
| **Text Tab** | `V` | Instantly switch workspace tab to Text Answer |
| **Submit Answer** | `SPACE` | Submits/Skips current question |

---

Developed with ❤️ as a Next-Gen Technical Assessment Platform.
