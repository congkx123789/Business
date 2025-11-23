---
alwaysApply: true
---

# ⌨️ Keyboard Shortcuts Design Specification

## 🎯 Purpose

This document defines the complete keyboard shortcuts system for the desktop web app. Keyboard shortcuts are a **core retention feature** for power users, enabling them to maintain "flow state" when reading hundreds of chapters without breaking their reading rhythm.

## 📋 Design Principles

1. **Power User Focus**: Designed for users who read extensively and need efficient navigation
2. **Core Retention Feature**: Keyboard shortcuts are not just a convenience - they are a **core retention feature** that allows users to maintain "flow state" when reading hundreds of chapters without breaking their reading rhythm
3. **Industry Standards**: Based on common e-book reader conventions (Qidian/QQ Reading style) and web standards
4. **Context-Aware**: Shortcuts behave differently based on current mode (page-turn vs scroll, reader vs library)
5. **Discoverable**: All shortcuts accessible via help menu (press `?` or `Ctrl+/`)
6. **Customizable**: Users can remap shortcuts (stored in user preferences, synced across devices)

## 📊 Proposed Shortcut Design Table

This section presents the complete keyboard shortcuts design based on industry standards from e-book readers (Qidian/QQ Reading style) and common web conventions. All shortcuts are designed to maintain "flow state" for power users reading hundreds of chapters.

### Design Rationale

- **Page-Turn Mode**: Uses arrow keys and spacebar (standard e-book reader convention)
- **Scroll Mode**: Uses Vim-style navigation (J/K) for paragraph scrolling, standard Page Up/Down for page scrolling
- **Interface Navigation**: Single-letter shortcuts (C, B, T) for quick access (e-book reader standard)
- **Tab Navigation**: Browser-style shortcuts (Ctrl+Tab) for multi-window mode
- **Accessibility**: Standard web shortcuts (Ctrl+F for search, R for TTS)

## ⌨️ Complete Shortcut Reference

### 📖 Reading Navigation (Page-Turn Mode)

| Action | Primary Key | Secondary Key | Notes |
|--------|------------|---------------|-------|
| Next Page | `→` (Right Arrow) | `Spacebar` | Standard page navigation (based on industry standards) |
| Previous Page | `←` (Left Arrow) | - | Standard page navigation (based on industry standards) |

### 📜 Reading Navigation (Scroll Mode)

| Action | Primary Key | Secondary Key | Notes |
|--------|------------|---------------|-------|
| Scroll Down (One Paragraph) | `J` | `↓` (Down Arrow) | Vim-style navigation (based on web conventions) |
| Scroll Up (One Paragraph) | `K` | `↑` (Up Arrow) | Vim-style navigation (based on web conventions) |
| Scroll Down (One Page) | `Page Down` | - | Standard page scroll |
| Scroll Up (One Page) | `Page Up` | - | Standard page scroll |

### 🎛️ Interface Navigation

| Action | Primary Key | Secondary Key | Notes |
|--------|------------|---------------|-------|
| Open/Close Table of Contents | `C` | `Alt+C` | Toggle TOC sidebar (based on e-book reader standards) |
| Add/Remove Bookmark | `B` | `Ctrl+D` | Toggle bookmark for current chapter (based on e-book reader standards) |
| Open Reading Settings | `T` | `Alt+T` | Font, background, spacing settings (based on e-book reader standards) |
| Return to Library | `Esc` | - | Close reader, return to library (based on web conventions) |
| Close Menu/Dialog | `Escape` | - | Close any open modal/dialog (based on web conventions) |

### 🔄 Tab Navigation (Multi-Window Mode)

| Action | Primary Key | Secondary Key | Notes |
|--------|------------|---------------|-------|
| Next Tab | `Ctrl+Tab` | - | Switch to next open story tab (based on browser conventions) |
| Previous Tab | `Ctrl+Shift+Tab` | - | Switch to previous story tab (based on browser conventions) |
| Close Current Tab | `Ctrl+W` | - | Close current story tab (based on browser conventions) |
| New Tab | `Ctrl+T` | - | Open new story tab (from library) (based on browser conventions) |

### ♿ Accessibility Features

| Action | Primary Key | Secondary Key | Notes |
|--------|------------|---------------|-------|
| Play/Pause TTS | `R` | `Alt+R` | Text-to-speech control (based on e-book reader standards) |
| Search in Book | `Ctrl+F` | `F3` | Find text within current chapter (standard web search) |
| Find Next | `F3` | `Enter` | Find next occurrence (standard web search) |
| Find Previous | `Shift+F3` | `Shift+Enter` | Find previous occurrence (standard web search) |

### 🔍 Global Shortcuts

| Action | Primary Key | Secondary Key | Notes |
|--------|------------|---------------|-------|
| Command Palette | `Ctrl+K` | `Ctrl+P` | Universal search/command interface |
| Show Shortcuts Help | `?` | `Ctrl+/` | Display keyboard shortcuts reference |
| Toggle Fullscreen | `F11` | - | Toggle fullscreen reading mode |
| Toggle Dark Mode | `Ctrl+Shift+D` | - | Switch between light/dark theme |

## 📋 Quick Reference Card

> **💡 Tip**: Press `?` or `Ctrl+/` anytime to see all available shortcuts in context.

### 📖 Reading Navigation

**Page-Turn Mode:**
| Action | Key |
|--------|-----|
| Next Page | `→` or `Spacebar` |
| Previous Page | `←` |

**Scroll Mode:**
| Action | Key |
|--------|-----|
| Scroll Down (Paragraph) | `J` or `↓` |
| Scroll Up (Paragraph) | `K` or `↑` |
| Scroll Down (Page) | `Page Down` |
| Scroll Up (Page) | `Page Up` |

### 🎛️ Interface

| Action | Key |
|--------|-----|
| Toggle Table of Contents | `C` |
| Toggle Bookmark | `B` |
| Reading Settings | `T` |
| Return to Library | `Esc` |
| Close Menu/Dialog | `Escape` |

### 🔄 Tabs

| Action | Key |
|--------|-----|
| Next Tab | `Ctrl+Tab` |
| Previous Tab | `Ctrl+Shift+Tab` |
| Close Tab | `Ctrl+W` |
| New Tab | `Ctrl+T` |

### ♿ Accessibility

| Action | Key |
|--------|-----|
| Play/Pause TTS | `R` |
| Search in Book | `Ctrl+F` |
| Find Next | `F3` |
| Find Previous | `Shift+F3` |

### 🌐 Global

| Action | Key |
|--------|-----|
| Command Palette | `Ctrl+K` |
| Show Help | `?` or `Ctrl+/` |
| Toggle Fullscreen | `F11` |
| Toggle Dark Mode | `Ctrl+Shift+D` |

---

## 🔄 Backend Integration

### API Endpoints (via Gateway)

All keyboard shortcut customizations are stored and synced via the following endpoints:

- **GET `/api/desktop/keyboard-shortcuts`**: Returns user's custom keyboard shortcuts
  - Calls users-service via gRPC: `GetKeyboardShortcuts(userId)`
  - Returns: `{ shortcuts: ShortcutMapping[] }`
  
- **PUT `/api/desktop/keyboard-shortcuts`**: Updates user's custom keyboard shortcuts
  - Validates DTO: `UpdateKeyboardShortcutsDto` (from 7-shared)
  - Calls users-service via gRPC: `UpdateKeyboardShortcuts(userId, shortcuts)`
  - Emits WebSocket event: `keyboard-shortcuts.updated` for real-time sync

### Data Model (users-service)

```typescript
interface KeyboardShortcuts {
  userId: string;
  shortcuts: ShortcutMapping[];
  lastUpdated: Date;
  deviceId: string; // For conflict resolution
}

interface ShortcutMapping {
  actionId: string; // e.g., "next-page", "toggle-bookmark"
  primaryKey: string; // e.g., "ArrowRight", "Space"
  secondaryKey?: string; // Optional alternative
  modifiers?: string[]; // e.g., ["ctrl"], ["ctrl", "shift"]
}
```

### Sync Strategy

- **Default Shortcuts**: Defined in frontend `shortcut-config.ts` (not stored in backend)
- **Custom Shortcuts**: Stored in `DesktopPreferences` table in users-service
- **Sync Flow**: 
  1. User remaps shortcut in UI
  2. Frontend calls `PUT /api/desktop/keyboard-shortcuts`
  3. Backend saves to database
  4. Backend emits WebSocket event
  5. Other devices receive event and update local shortcuts
- **Conflict Resolution**: Last-write-wins (most recent update wins)

## 🏗️ Implementation Structure

### 📁 File Organization

```
3-web/
└── src/
    ├── lib/
    │   └── desktop/
    │       └── shortcuts/
    │           ├── shortcut-registry.ts          # Central registry of all shortcuts
    │           ├── shortcut-handler.ts           # Execution logic for shortcuts
    │           ├── shortcut-config.ts            # Default configuration & key mappings
    │           ├── shortcut-context.ts            # Context detection (reader vs library)
    │           └── shortcut-validator.ts        # Validates shortcut combinations
    │
    ├── components/
    │   └── desktop/
    │       └── shortcuts/
    │           ├── ShortcutProvider.tsx          # Global shortcut context provider
    │           ├── CommandPalette.tsx            # Ctrl+K command palette UI
    │           ├── ShortcutIndicator.tsx         # Visual indicator when shortcut is available
    │           ├── ShortcutHelpDialog.tsx         # Help dialog (press ?)
    │           └── ShortcutSettings.tsx          # User customization UI
    │
    ├── hooks/
    │   └── desktop/
    │       └── useKeyboardShortcuts.ts           # Main hook for registering shortcuts
    │
    └── store/
        └── desktop/
            └── keyboard-shortcuts-store.ts       # Zustand store for shortcut state
```

### 🔧 Core Components

#### 1. Shortcut Registry (`shortcut-registry.ts`)

**Purpose**: Central registry that maps keyboard combinations to actions.

**Key Features**:
- Registers all shortcuts with metadata (action, key combo, context, description)
- Supports multiple contexts (reader, library, global)
- Handles key combination parsing (`Ctrl+K`, `Alt+C`, etc.)
- Validates shortcut conflicts

**Example Structure**:
```typescript
interface ShortcutDefinition {
  id: string;
  action: string;
  keys: string[]; // ['ctrl', 'k']
  context: 'global' | 'reader' | 'library';
  description: string;
  handler: () => void;
  enabled: boolean;
}
```

#### 2. Shortcut Handler (`shortcut-handler.ts`)

**Purpose**: Executes shortcut actions based on current context.

**Key Features**:
- Context-aware execution (only active shortcuts in current context)
- Prevents default browser behavior when needed
- Handles modifier keys (Ctrl, Alt, Shift)
- Supports key sequences (e.g., `g` then `g` for "go to top")

#### 3. Shortcut Provider (`ShortcutProvider.tsx`)

**Purpose**: React context provider that wraps the app and handles global keyboard events.

**Key Features**:
- Uses `react-hotkeys-hook` for keyboard event handling
- Manages shortcut state (enabled/disabled)
- Handles context switching (reader → library)
- Provides shortcut customization API

#### 4. Command Palette (`CommandPalette.tsx`)

**Purpose**: Universal command interface (Ctrl+K) for quick actions.

**Key Features**:
- Fuzzy search through all available commands
- Shows keyboard shortcuts for each command
- Supports command execution
- Recent commands history

#### 5. Shortcut Help Dialog (`ShortcutHelpDialog.tsx`)

**Purpose**: Displays all available shortcuts (triggered by `?` or `Ctrl+/`).

**Key Features**:
- Grouped by category (Reading, Navigation, etc.)
- Shows current key bindings
- Allows customization inline
- Searchable/filterable

## 🎨 User Experience Considerations

### Context-Aware Behavior

- **Reader Mode**: Reading shortcuts active (arrow keys, J/K, etc.)
- **Library Mode**: Library shortcuts active (navigation, search)
- **Global**: Always active shortcuts (Ctrl+K, F11, etc.)

### Visual Feedback

- **Shortcut Indicator**: Shows available shortcuts in current context
- **Toast Notifications**: Confirms action when shortcut is used
- **Command Palette**: Visual feedback for command execution

### Customization

- Users can remap any shortcut to their personal preferences
- Custom shortcuts saved to user preferences (via users-service `UpdateKeyboardShortcuts()`)
- Shortcuts synced across devices (via `SyncDesktopPreferences()`)
- Import/export shortcut configurations (JSON format)
- Reset to defaults option
- Shortcut conflict detection (warns user if remapping creates conflicts)

## 🔒 Security & DRM Considerations

### Paid Content Protection

For paid chapters, certain shortcuts are **disabled** to prevent content theft:
- `Ctrl+C` (Copy) - Disabled
- `Ctrl+A` (Select All) - Disabled
- `Ctrl+S` (Save) - Disabled
- `Print Screen` - Attempted blocking (FLAG_SECURE equivalent)

**Implementation**:
- Check chapter purchase status before enabling shortcuts
- Use CSS `user-select: none` for paid content
- Event.preventDefault() for disabled shortcuts
- Show message: "Copying disabled for purchased content"

## 🧪 Testing Requirements

### Unit Tests
- Shortcut registration and lookup
- Context switching logic
- Key combination parsing
- Conflict detection

### Integration Tests
- Shortcut execution in different contexts
- Customization persistence
- Command palette functionality

### E2E Tests (Playwright)
- All shortcuts work in reader mode
- All shortcuts work in library mode
- Context switching doesn't break shortcuts
- Customization saves correctly

## 📝 Implementation Checklist

- [ ] Create `shortcut-registry.ts` with all shortcuts from table
- [ ] Create `shortcut-handler.ts` with execution logic
- [ ] Create `ShortcutProvider.tsx` context provider
- [ ] Create `CommandPalette.tsx` (Ctrl+K)
- [ ] Create `ShortcutHelpDialog.tsx` (press ?)
- [ ] Create `useKeyboardShortcuts.ts` hook
- [ ] Create `keyboard-shortcuts-store.ts` Zustand store
- [ ] Integrate with reader components
- [ ] Integrate with library components
- [ ] Add DRM protection for paid content
- [ ] Add customization UI
- [ ] Add visual feedback (indicators, toasts)
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Update user preferences API (users-service) to store custom shortcuts
- [ ] Implement backend sync for keyboard shortcuts (via `SyncDesktopPreferences()`)
- [ ] Add WebSocket event for real-time shortcut sync (`keyboard-shortcuts.updated`)
- [ ] Test shortcut customization persistence across devices

## 🔗 Related Documentation

- [Web Client Structure](./13-3-web.md) - Main web client documentation
- [Reader Components](./13-3-web.md#reader-components) - Reader interface details
- [Desktop Features](./13-3-web.md#desktop-specific-features) - Desktop-specific features

---

**Last Updated**: 2024
**Status**: Design Specification - Ready for Implementation

