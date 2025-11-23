---
alwaysApply: true
---

# 📖 Hướng dẫn Sử dụng Documentation này

## 🎯 Công dụng của File này

File này là **bản thiết kế chi tiết (blueprint)** cho package `4-desktop` - Electron Desktop App. Nó mô tả:

1. **Cấu trúc thư mục (Folder Structure):** Tất cả các file và folder cần tạo trong Electron project
2. **Electron Architecture:** Main Process vs Renderer Process
3. **Native Features:** File system, system tray, auto-updater, etc.
4. **Integration với 3-web:** Cách wrap Next.js app trong Electron
5. **Development Steps:** Lộ trình triển khai từng feature

## 🏗️ Cấu trúc Tổng Hệ thống

```
Monorepo Structure:
├── 1-gateway/          # API Gateway
├── 2-services/         # Microservices
├── 3-web/              # Next.js Web App (← 4-desktop wraps this)
├── 4-desktop/          # ← BẠN ĐANG Ở ĐÂY: Electron Desktop App
├── 5-mobile-ios/       # iOS Native App
├── 6-mobile-android/   # Android Native App
└── 7-shared/           # Shared Types, DTOs
```

**Luồng hoạt động:**
```
Electron App
├── Main Process (Node.js)
│   ├── main.ts              # Entry point
│   ├── window-manager.ts     # BrowserWindow management
│   └── native-features.ts   # File system, notifications
│
└── Renderer Process (Web)
    └── Loads 3-web app      # Next.js app runs here
        └── All features from 3-web are available
```

## 📚 Cách Đọc Documentation này

### 1. **Hiểu Electron Architecture:**
   - **Main Process:** Node.js code, quản lý windows, native features
   - **Renderer Process:** Web code (3-web app), UI rendering
   - **IPC (Inter-Process Communication):** Giao tiếp giữa Main và Renderer

### 2. **Đọc theo thứ tự:**
   - **Package Info:** Hiểu strategy (wraps 3-web)
   - **Source Code Structure:** Xem folder structure
   - **Native Features:** Các tính năng desktop-specific
   - **Development Steps:** Làm theo từng bước

## 🔨 Workflow: Từ Documentation → Code

### Ví dụ: Implement Native File Dialog

**Bước 1: Đọc Native Features (dòng 47-57)**
```
Native Features:
├── File system access    # Native file dialogs
```

**Bước 2: Tìm Implementation (dòng 25-31)**
```
├── native-features.ts    # Native OS features (file system)
```

**Bước 3: Xem Development Steps (dòng 123-179)**
```
3. Native Features Implementation:
   - File System: Implement native-features.ts
     * Native file dialogs (save/open)
```

**Bước 4: Implement:**
1. Tạo `src/main/native-features.ts`
2. Implement file dialog handlers
3. Expose qua IPC
4. Call từ renderer process (3-web app)

## 💡 Best Practices khi Code

### 1. **IPC Communication:**
```typescript
// Main Process (main.ts)
import { ipcMain, dialog } from 'electron'

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  return result
})

// Renderer Process (3-web app)
const result = await window.electronAPI.showSaveDialog()
```

### 2. **Preload Script (Security):**
```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog')
})
```

### 3. **Load 3-web App:**
```typescript
// main.ts
const win = new BrowserWindow({
  width: 1200,
  height: 800
})

// Development: Load from localhost
win.loadURL('http://localhost:3000')

// Production: Load from built files
win.loadFile('path/to/3-web/dist/index.html')
```

## 🔗 Liên kết Quan trọng

- **3-web App:** [13-3-web.md](./13-3-web.md) - App được wrap
- **Electron Docs:** https://www.electronjs.org/docs
- **Backend Services:** [Services Documentation](../services/04-2-services-overview.md)

## ⚠️ Lưu Ý Quan trọng

1. **Wraps 3-web:** Tất cả features từ 3-web đều available, chỉ thêm native features
2. **Security:** Luôn dùng `contextBridge` trong preload, không expose Node.js APIs trực tiếp
3. **IPC:** Main process và Renderer process không share memory, phải dùng IPC

---

├── 📦 4-desktop/                       # 💻 ELECTRON DESKTOP APP
    │   │
    │   ├── 📋 Package Info
    │   │   ├── **Goal:** Wrap the `3-web` app, add native features (offline, file system)
    │   │   ├── **Key Tech:** 
    │   │   │   - `electron` (desktop framework)
    │   │   │   - `electron-builder` (packaging .exe, .dmg, .AppImage)
    │   │   │   - `electron-store` (local storage)
    │   │   │   - `electron-updater` (automatic updates)
    │   │   │   - `electron-context-menu` (native context menus)
    │   │   │   - `electron-window-state` (window state management)
    │   │   │   - `@electron/remote` (if needed for remote modules)
    │   │   └── **Deployment:** Windows (.exe), macOS (.dmg), Linux (.AppImage)
    │   │
    │   ├── 📁 Source Code Structure
    │   │   └── src/
    │   │       ├── 📁 main/                    # Main Process (Node.js)
    │   │       │   ├── main.ts                 # Electron main process entry
    │   │       │   ├── window-manager.ts        # BrowserWindow management (multi-window, state persistence)
    │   │       │   ├── menu-manager.ts          # Application menu (File, Edit, View, Window, Help)
    │   │       │   ├── native-features.ts       # Native OS features (file system, notifications)
    │   │       │   ├── ipc-handlers.ts          # IPC handlers (communication with renderer)
    │   │       │   ├── auto-updater.ts          # Auto-update functionality (electron-updater)
    │   │       │   ├── system-tray.ts           # System tray integration
    │   │       │   ├── global-shortcuts.ts      # Global keyboard shortcuts
    │   │       │   ├── file-handlers.ts         # File associations & protocol handlers
    │   │       │   └── preload.ts               # Preload script (contextBridge, secure IPC)
    │   │       │
    │   │       ├── 📁 renderer/                 # Renderer Process (Web)
    │   │       │   ├── index.html               # Loads 3-web app
    │   │       │   └── electron-bridge.ts       # Bridge to Electron APIs (exposed via preload)
    │   │       │
    │   │       └── 📁 shared/                   # Shared Types
    │   │           ├── types.ts                 # IPC message types
    │   │           ├── constants.ts              # Shared constants
    │   │           └── electron-api.d.ts        # TypeScript definitions for Electron APIs
    │   │
    │   │   **Implementation Notes (Nov 17, 2025)**
    │   │   - `main/main.ts` now enforces a single-instance lock, sets the Windows AppUserModelID, wires protocol/file handlers, and delegates BrowserWindow creation to `window-manager.ts`.
    │   │   - `window-manager.ts` persists bounds/maximized state via `electron-window-state`, lazy-loads the `3-web` app (dev URL vs. packaged HTML), and centralizes icon/preload wiring.
    │   │   - `ipc-handlers.ts` exposes structured channels for app updates plus window controls (minimize/maximize/restore/close) that align with `CHANNELS` in `shared/constants.ts`.
    │   │   - `preload.ts` exports a typed `window.electronAPI` bridge (with a temporary alias to `window.storySphere`) that now covers updates, window controls, file dialogs/read-write, native notifications, external-open events, and shortcut subscriptions defined in `shared/electron-api.d.ts`.
    │   │   - `native-features.ts` handles file dialogs, disk read/write flows, and native notifications so renderer code can export/import receipts, annotations, etc. securely via IPC.
    │   │   - `global-shortcuts.ts` registers desktop-level accelerators (Cmd/Ctrl+Shift+F, media keys) and dispatches them through the shortcuts channels.
    │   │   - `file-handlers.ts` keeps the app registered as the `novel://` protocol handler, listens for `.novel`/`.storysphere` files or URLs opened from the OS, and forwards them to the renderer once a BrowserWindow is ready (with queuing for early events).
    │   │   - `menu-manager.ts` wires the full File/Edit/View/Window/Help application menu; the Help submenu links out to the desktop docs, Feature Sync Map, support portal, and exposes a manual update check hook that calls through `auto-updater`.
    │   │   - `system-tray.ts` adds quick actions (show/hide, Focus Mode toggle via the shortcuts channel, manual update checks, quit) so readers can reach common StorySphere commands without surfacing the main window.
    │   │
    │   ├── 📁 Configuration Files
    │   │   ├── package.json
    │   │   ├── electron-builder.yml             # Build configuration
    │   │   └── tsconfig.json
    │   │
    │   └── 📁 Native Features (Electron-Specific)
    │       ├── Offline mode                    # Service worker integration (from 3-web)
    │       ├── File system access              # Native file dialogs, direct file access (export/import)
    │       ├── System tray                     # Minimize to tray, quick actions (show/hide, focus toggle, manual updates)
    │       ├── Auto-updater                    # Automatic app updates (electron-updater)
    │       ├── Native menus                    # Application menu (File, Edit, View, Window, Help)
    │       ├── Global shortcuts                # System-wide keyboard shortcuts (even when minimized)
    │       ├── Window management               # Multi-window, state persistence, restoration
    │       ├── Native notifications            # OS-level notifications with actions
    │       ├── File associations               # Open .novel files, protocol handlers (novel://)
    │       └── Deep OS integration             # Recent documents, dock/taskbar integration
    │
    │   ├── 📋 Key Features
    │   │   │
    │   │   ├── **Wraps 3-web App (Inherits ALL Features):**
    │   │   │   - Loads `3-web` app in Electron BrowserWindow
    │   │   │   - **ALL features from 3-web are available:**
    │   │   │     * Discovery & Engagement (Storefront, Rankings, Browse by Genre)
    │   │   │     * Recommendations (Personalized, Similar Stories, Trending)
    │   │   │     * **⭐ Monetization Features (Wallet, Paywall, Purchase, Subscriptions, Privilege):** ⭐
    │   │   │       - **Virtual Currency (Wallet):** Wallet balance, top-up, transaction history
    │   │   │       - **Paywall System:** Chapter access checking, free chapters indicator
    │   │   │       - **Payment Processing:** Chapter purchases, bulk purchases, receipts
    │   │   │       - **Subscriptions:** Membership plans, subscription management, VIP levels
    │   │   │       - **Privilege Model:** Advanced chapters, privilege purchase, monthly reset
    │   │   │       - **Desktop Enhancements:**
    │   │   │         * Native payment dialogs (better UX than web dialogs)
    │   │   │         * Receipt storage in local file system
    │   │   │         * Offline purchase queue (sync when online)
    │   │   │         * System tray notifications for purchase confirmations
    │   │   │     * **⭐ Community Interactions (Paragraph Comments, Chapter Comments, Reviews, Forums, Polls, Quizzes):** 🎯 **KILLER FEATURE - Duanping**
    │   │   │       - **Paragraph Comments (Duanping):** Real-time bubble indicators, author interactions, WebSocket updates
    │   │   │       - **Chapter Comments:** Threaded discussions at end of chapter
    │   │   │       - **Reviews & Forums:** Book reviews and discussion forums
    │   │   │       - **Polls & Quizzes:** Platform engagement tools
    │   │   │       - **Fan Economy:** Tipping, Monthly Votes, Fan Rankings, Author-Fan interactions
    │   │   │     * Social Features (Feed, Groups, Follow)
    │   │   │     * **Library & Bookshelf Management (Enhanced - Cross-device sync):**
    │   │   │       - **Synchronization (CRITICAL - Rule #8):** All data syncs seamlessly across web, mobile (iOS/Android), desktop
    │   │   │       - **Sync scope:** Library items, bookshelves, wishlist, reading progress, bookmarks, annotations, reading preferences
    │   │   │       - **Real-time sync:** WebSocket events provide real-time updates from other devices
    │   │   │       - **Reading Preferences Sync (CRITICAL):** Background mode, font size, reading mode, brightness sync across all devices
    │   │   │       - **User expects same state on ALL devices** - sync is MANDATORY
    │   │   │     * **Reader Interface (Scroll/Page mode, TTS, Dictionary, Annotations, DRM - Cross-device sync):**
    │   │   │       - **Reading Preferences Sync (CRITICAL):** 
    │   │   │         * Background mode (white/black/sepia/eye-protection/custom) syncs across devices
    │   │   │         * Font size (12-24px) syncs across devices
    │   │   │         * Font family (serif/sans-serif/monospace) syncs across devices
    │   │   │         * Reading mode (scroll/page) syncs across devices
    │   │   │         * Brightness (0-100) syncs across devices
    │   │   │         * All preferences sync via `ReadingPreferencesRepository` in 3-web
    │   │   │         * User expects same reading experience on all devices - sync is MANDATORY
    │   │   │     * **Desktop-Specific Features from 3-web:**
    │   │   │       - PWA Support (offline-capable, installable)
    │   │   │       - Keyboard Shortcuts (Ctrl+K search, arrow keys, etc.)
    │   │   │       - Multi-Window/Tabbed Interface (Qidian-style)
    │   │   │       - Split-View Reading (Chapter Comparison)
    │   │   │       - Text Width Management (Focus Mode)
    │   │   │       - Bulk Operations
    │   │   │       - Advanced Search/Filter
    │   │   │       - Export/Import (via web APIs)
    │   │   │       - Rich Text Editing (Advanced annotations)
    │   │   │       - Customizable Layout (Resizable panels)
    │   │   │   - Inherits PWA capabilities from 3-web
    │   │   │
    │   │   ├── **Native Desktop Features (Electron-Specific):**
    │   │   │   - **Enhanced File System Access:** 
    │   │   │     * Native file dialogs (better UX than web file picker)
    │   │   │     * Direct file system access (no browser restrictions)
    │   │   │     * Export/import library, annotations, reading progress with native dialogs
    │   │   │     * Save files to user-specified locations
    │   │   │   - **System Tray:** 
    │   │   │     * Minimize to tray (keep app running in background)
    │   │   │     * Background notifications (new chapters, comments, etc.)
    │   │   │     * Quick access menu from system tray
    │   │   │   - **Auto-Updater:** 
    │   │   │     * Automatic app updates (electron-updater)
    │   │   │     * Update notifications
    │   │   │     * Background update downloads
    │   │   │   - **Native Menus:** 
    │   │   │     * Application menu (File, Edit, View, Window, Help)
    │   │   │     * Native keyboard shortcuts (Cmd/Ctrl+S, Cmd/Ctrl+Q, etc.)
    │   │   │     * Platform-specific menu items (macOS vs Windows)
    │   │   │   - **Global Shortcuts:** 
    │   │   │     * System-wide keyboard shortcuts (work even when app is minimized)
    │   │   │     * Media keys support (play/pause for TTS)
    │   │   │     * Custom global shortcuts (user-configurable)
    │   │   │   - **Window Management:** 
    │   │   │     * Multi-window support (open multiple instances)
    │   │   │     * Window state persistence (position, size, maximized state)
    │   │   │     * Window restoration on app restart
    │   │   │     * Full-screen mode
    │   │   │   - **Native Notifications:**
    │   │   │     * OS-level notifications (better than web notifications)
    │   │   │     * Notification actions (reply, mark as read, etc.)
    │   │   │   - **Deep OS Integration:**
    │   │   │     * File associations (open .novel files)
    │   │   │     * Protocol handlers (novel:// links)
    │   │   │     * Recent documents (macOS/Windows)
    │   │   │
    │   │   └── **Deployment:**
    │   │       - Windows: `.exe` installer (electron-builder)
    │   │       - macOS: `.dmg` disk image (code signing required)
    │   │       - Linux: `.AppImage` (portable) or `.deb`/`.rpm` packages
    │   │
    │   📝 **Development Steps:**
    │   │       1.  **Setup Electron App:**
    │   │           - Configure `main.ts` to create a `BrowserWindow`
    │   │           - Load the `3-web` app (e.g., `win.loadURL('http://localhost:3000')` in dev, `file://` in production)
    │   │           - Use `preload.ts` and `contextBridge.exposeInMainWorld` for secure IPC communication
    │   │       2.  **IPC Communication:**
    │   │           - Create `ipc-handlers.ts` to handle IPC messages from renderer
    │   │           - Expose Electron APIs via `preload.ts` (file system, notifications, etc.)
    │   │           - Create TypeScript definitions for exposed APIs (`electron-api.d.ts`)
    │   │       3.  **Native Features Implementation:**
    │   │           - **File System:** Implement `native-features.ts` for file system access
    │   │             * Native file dialogs (save/open)
    │   │             * Direct file read/write (no browser restrictions)
    │   │             * Export/import library, annotations, reading progress
    │   │           - **System Tray:** Implement `system-tray.ts`
    │   │             * Create system tray icon
    │   │             * Minimize to tray functionality
    │   │             * Background notifications
    │   │             * Quick access menu
    │   │           - **Auto-Updater:** Implement `auto-updater.ts` using `electron-updater`
    │   │             * Check for updates on startup
    │   │             * Download updates in background
    │   │             * Notify user when update is ready
    │   │           - **Native Menus:** Implement `menu-manager.ts`
    │   │             * Create application menu (File, Edit, View, Window, Help)
    │   │             * Platform-specific menus (macOS vs Windows)
    │   │             * Native keyboard shortcuts (Cmd/Ctrl+S, etc.)
    │   │           - **Global Shortcuts:** Implement `global-shortcuts.ts`
    │   │             * Register system-wide keyboard shortcuts
    │   │             * Media keys support (play/pause for TTS)
    │   │             * User-configurable shortcuts
    │   │           - **File Handlers:** Implement `file-handlers.ts`
    │   │             * Register file associations (.novel files)
    │   │             * Protocol handlers (novel:// links)
    │   │             * Recent documents (macOS/Windows)
    │   │       4.  **Window Management:**
    │   │           - Implement `window-manager.ts` using `electron-window-state`
    │   │           - Save/restore window state (position, size, maximized state)
    │   │           - Multi-window support (open multiple instances)
    │   │           - Window restoration on app restart
    │   │           - Full-screen mode support
    │   │       5.  **Integration with 3-web:**
    │   │           - Create `renderer/electron-bridge.ts` to expose Electron APIs to 3-web
    │   │           - Enhance 3-web's export/import to use native file dialogs
    │   │           - Integrate system tray notifications with 3-web's notification system
    │   │           - Enhance keyboard shortcuts with global shortcuts
    │   │           - **⭐ Monetization Integration:** ⭐
    │   │             * **Native Payment Dialogs:**
    │   │               - Use Electron's native dialog for payment confirmations
    │   │               - Better UX than web dialogs (OS-native look and feel)
    │   │               - Secure payment processing via IPC
    │   │             * **Receipt Storage:**
    │   │               - Save purchase receipts to local file system
    │   │               - Export receipts as PDF/JSON
    │   │               - Receipt history accessible offline
    │   │             * **Offline Purchase Queue:**
    │   │               - Queue purchases when offline
    │   │               - Auto-sync when connection restored
    │   │               - Show queue status in system tray
    │   │             * **System Tray Notifications:**
    │   │               - Purchase confirmations
    │   │               - Low balance alerts
    │   │               - Subscription renewal reminders
    │   │               - VIP level upgrade notifications
    │   │           - **Community Interactions Integration:** 🎯 **KILLER FEATURE - Duanping**
    │   │             * **Paragraph Comments (Duanping):** Automatically available from 3-web
    │   │               - Comment bubbles overlay on paragraphs in Reader
    │   │               - Real-time updates via WebSocket (inherited from 3-web)
    │   │               - Click bubble to open comment panel
    │   │               - Quick reactions, author interactions
    │   │               - Desktop enhancements: Native notifications for new comments (author replied, comment liked)
    │   │               - System tray quick access to comment notifications
    │   │               - Multi-window support: Open comment panel in separate window
    │   │             * **Chapter Comments, Reviews, Forums:** All available from 3-web
    │   │             * **Fan Economy:** Tipping, Votes, Rankings, Author-Fan interactions (inherited from 3-web)
    │   │             * **Desktop-Specific Enhancements:**
    │   │               - Native notifications for comment events (author replied, comment liked)
    │   │               - System tray quick access to comment notifications
    │   │               - Keyboard shortcuts for comment actions (if needed)
    │   │               - Multi-window support: Open comment panel in separate window for side-by-side reading
    │   │       6.  **Build Configuration:**
    │   │           - Configure `electron-builder.yml` for packaging
    │   │           - Setup code signing for macOS/Windows
    │   │           - Configure auto-updater endpoints
    │   │           - Setup file associations and protocol handlers in build config
    │   │       7.  **Testing:**
    │   │           - Test all native features on Windows, macOS, Linux
    │   │           - Test auto-updater functionality
    │   │           - Test file associations and protocol handlers
    │   │           - Test system tray and background notifications
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
