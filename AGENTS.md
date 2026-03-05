# AGENTS.md

## Project Overview
This is a Vue 3 + TypeScript drawing application built with Leafer UI, providing a canvas-based drawing editor with shape tools (rectangle, circle, line), undo/redo functionality, and history management.

## Build & Development Commands

### Core Commands
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Type-check and build for production
- `pnpm preview` - Preview production build
- `pnpm build-only` - Build without type-checking (faster)

### Code Quality
- `pnpm lint` - Run all linters (oxlint + eslint) with auto-fix
- `pnpm lint:oxlint` - Run oxlint with auto-fix
- `pnpm lint:eslint` - Run eslint with auto-fix and caching
- `pnpm format` - Format code with oxfmt

### Type Checking
- `pnpm type-check` - Run TypeScript type checking with vue-tsc

## Architecture & Code Structure

### Directory Structure
```
src/
├── App.vue                    # Main application component
├── editor/                   # Core editor functionality
│   ├── editor.ts             # Main Editor class
│   ├── history.ts           # Undo/redo history management
│   ├── graph/               # Drawing tools
│   │   ├── base.ts          # Abstract base class for graphs
│   │   ├── rect.ts          # Rectangle tool
│   │   ├── circle.ts        # Circle tool
│   │   ├── line.ts          # Line tool
│   │   └── index.ts         # Graph manager
│   ├── action.ts            # [Empty - to be implemented]
│   └── index.ts             # Editor initialization
├── main.ts                  # Application entry point
└── style.scss              # Global styles
```

### Key Components
- **Editor**: Main orchestrator managing app, history, and graph tools
  - `deleteSelected()`: Deletes all selected elements from the canvas
  - `undo()`: Reverts the last action
  - `redo()`: Reapplies the last undone action
  - `canUndo`: Property indicating if undo is available
  - `canRedo`: Property indicating if redo is available
- **History**: Manages undo/redo stack with Leafer UI tree state
- **Graph**: Abstract base class for drawing tools
- **GraphRect/GraphCircle/GraphLine**: Specific drawing tool implementations

## Code Style Guidelines

### TypeScript & Vue
- Use TypeScript strict mode with `noUncheckedIndexedAccess: true`
- Vue 3 Composition API with `<script setup lang="ts">`
- Import Vue APIs from 'vue' (e.g., `ref`, `onMounted`, `useTemplateRef`)
- Leafer UI imports from 'leafer-ui' and '@leafer-in/editor'

### Import Organization
1. **Built-in Node.js modules** (e.g., `path`, `url`)
2. **Third-party libraries** (e.g., `vue`, `leafer-ui`)
3. **Local imports** (use `@/*` alias for src/ directory)

```typescript
// Good import structure
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Editor from '@/editor/editor'
import { GraphBase } from '@/editor/graph/base'
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `GraphRect`, `History`)
- **Methods**: camelCase (e.g., `createGraph`, `save`)
- **Properties**: camelCase (e.g., `isDrawing`, `currentGraph`)
- **Static properties**: Use `static name = 'identifier'` consistently
- **Variables**: camelCase (e.g., `startPoint`, `undoStack`)

### Error Handling
- **Null safety**: Use optional chaining (`?.`) and null checks where appropriate
- **Type guards**: Validate object existence before accessing properties
- **Event handling**: Ensure proper cleanup in `destroy()` methods
- **History management**: Check `isRendering` flag before applying state changes

### Code Patterns

#### Abstract Base Class Pattern
```typescript
export abstract class GraphBase {
  protected abstract createGraph(point: IPointData): IUI
  protected abstract updateGraph(item: IUI, endPoint: IPointData): void
  
  // Common functionality
  init() { /* event binding */ }
  destroy() { /* event unbinding */ }
}
```

#### Event Management
- Always bind/unbound event handlers consistently
- Use bound methods for proper `this` context
- Clean up all event listeners in `destroy()`

#### History Pattern
- Track state changes in undo/redo stacks
- Use `isRendering` flag to prevent recursive state changes
- Save state after user interactions complete

### Formatting & Style
- **Indentation**: 2 spaces ( enforced by .editorconfig )
- **Quotes**: Single quotes for strings
- **Semicolons**: No semicolons (oxfmt configuration)
- **Line length**: Maximum 100 characters ( .editorconfig )
- **Line endings**: LF (Unix-style)

### Testing
- No test framework currently configured
- Test files should be placed in `src/**/__tests__/*` directories
- Consider adding vitest or jest for future testing

### Performance Considerations
- Leafer UI handles canvas rendering efficiently
- Use proper event binding/unbinding to prevent memory leaks
- History management should be optimized for large canvas states

### Dependencies
- **Core**: Vue 3, TypeScript, Vite
- **UI**: Leafer UI, @leafer-in/editor, @leafer-in/viewport
- **Tools**: oxlint, oxfmt, eslint for code quality
- **Build**: vite-plugin-vue-devtools for development

### Configuration Files
- `.oxlintrc.json`: Oxlint configuration for linting rules
- `.oxfmtrc.json`: Oxfmt configuration (no semicolons, single quotes)
- `.editorconfig`: Editor-independent formatting rules
- `tsconfig.app.json`: TypeScript configuration with DOM types
- `eslint.config.ts`: ESLint with Vue and TypeScript support

### Development Notes
- This project uses pnpm as the package manager
- Node.js version: ^20.19.0 || >=22.12.0
- Vue DevTools plugin is configured for development debugging
- No Cursor or Copilot rules found - follow general guidelines above