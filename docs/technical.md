# Technical Documentation

## Building the Plugin

To create a new version of the plugin:

```bash
npm run build
```

This will compile the TypeScript source code and generate the necessary files (`main.js`, `styles.css`) that Obsidian needs to run the plugin.

## Technical Overview

Quizium is built using:

- **TypeScript** - Main plugin logic and type safety
- **React** - User interface components and state management
- **Obsidian Plugin API** - Integration with Obsidian's core functionality

The plugin scans your vault for specially formatted questions in notes tagged with monitored hashtags. It extracts flashcards and quiz questions, tracks difficulty ratings and spaced repetition schedules, and provides an interactive interface for studying.

## Architecture

### Main Components

- **FlashcardService** - Parses notes and manages question data
- **QuiziumModalView** - React-based UI for flashcards and quizzes
- **SpacedRepetitionService** - Handles spaced repetition logic and scheduling
- **DataManagementService** - Manages data operations like resetting ratings and loading history
- **Settings management** - Configuration for topics and spaced repetition intervals

### View Components

The UI is organized into logical view components:

- **Core Views** (`views/core/`):
  - `MenuView.tsx` - Main navigation menu
  - `ModalButtonsView.tsx` - Modal action buttons
  - `TopicBreakdownView.tsx` - Topic statistics display

- **Flashcard Views** (`views/flashcards/`):
  - `FlashcardView.tsx` - Individual flashcard display and interaction
  - `TopicSelectionView.tsx` - Topic and difficulty selection

- **Quiz Views** (`views/quizzes/`):
  - `QuizView.tsx` - Quiz results and statistics
  - `QuizSessionView.tsx` - Active quiz session interface
  - `QuizHistoryView.tsx` - Historical quiz results

- **Spaced Repetition Views** (`views/spaced-repetition/`):
  - `SpacedRepetitionView.tsx` - Spaced repetition interface and statistics

### Services

- **SpacedRepetitionService** - Calculates which cards are due for review based on difficulty ratings and time intervals
- **DataManagementService** - Handles data operations like resetting flashcard ratings and managing quiz history

## Development

### Commands

- `npm run dev` - Start development mode with file watching
- `npm run build` - Build for production
- `npm install` - Install dependencies

### Code Structure

The codebase follows these principles:

- **Separation of Concerns** - Business logic separated from UI components
- **Service Layer** - Core functionality abstracted into service classes
- **Component Composition** - UI broken down into reusable, focused components
- **Type Safety** - Comprehensive TypeScript typing throughout

### Documentation Standards

All functions include JSDoc comments with:
- Purpose and functionality description
- Parameter types and descriptions
- Return type information
- Usage examples where applicable

## Installation

Copy `main.js`, `styles.css`, and `manifest.json` to your vault's `.obsidian/plugins/quizium/` folder.

## File Structure

```
obsidian-quizium/
├── main.tsx                 # Plugin entry point
├── QuiziumModalView.tsx     # Main modal component
├── FlashcardService.ts      # Core flashcard parsing and management
├── AppContext.tsx           # React context for Obsidian app
├── services/                # Business logic services
│   ├── SpacedRepetitionService.ts
│   └── DataManagementService.ts
├── views/                   # UI components organized by feature
│   ├── core/               # Main modal components
│   ├── flashcards/         # Flashcard-related views
│   ├── quizzes/            # Quiz-related views
│   ├── spaced-repetition/  # Spaced repetition views
│   └── types.ts            # Shared type definitions
└── docs/                   # Documentation
    └── technical.md        # This file
```
