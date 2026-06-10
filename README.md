# Briefsmith

**Forge better briefs. Build better software.**

Briefsmith is a single-page tool that guides developers through writing high-quality prompts for agentic AI coding tools like Claude Code. It teaches prompt structure through a five-step guided form, scores the result in real time, and produces a complete, copyable prompt.

## Usage

Open `index.html` directly in any modern browser. No server, no build step, no dependencies.

```
open index.html
```

## Structure

```
briefsmith/
├── index.html        shell, two-column layout
├── css/
│   └── style.css     all styles
├── js/
│   ├── data.js       step definitions, tips, hints, placeholder text
│   ├── state.js      single state object, updateField()
│   ├── render.js     reads state, updates all DOM
│   ├── score.js      prompt quality scoring
│   ├── steps.js      step navigation logic
│   ├── storage.js    localStorage save/load with silent fallback
│   └── main.js       init, event wiring
└── README.md
```

## Design principles

- **data.js and state.js are never merged.** Step content is config. User input is state. Editing a lesson tip never touches application logic.
- **render() never modifies state.** It reads state and data.js, then writes DOM. Pure output.
- **All state lives in state.js.** No other file stores or mutates state directly.
- **No crashes on missing permissions.** localStorage unavailable → silent in-memory fallback. Clipboard denied → inline error message, no alert().
