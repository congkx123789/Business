// Desktop Preferences types

export interface DesktopPreferences {
  userId: string;
  
  // Tab State
  tabState: TabState;
  
  // Layout Presets
  layoutPresets: LayoutPreset[];
  activeLayoutPreset?: string;
  
  // Focus Mode
  focusMode: FocusMode;
  
  // Split View State
  splitViewState?: SplitViewState;
  
  // Keyboard Shortcuts
  keyboardShortcuts: KeyboardShortcuts;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TabState {
  openTabs: Tab[];
  activeTabId?: string;
  tabGroups: TabGroup[];
}

export interface Tab {
  id: string;
  type: 'story' | 'chapter' | 'library' | 'search' | 'settings';
  title: string;
  url?: string;
  storyId?: string;
  chapterId?: string;
  position: number;
  isPinned: boolean;
}

export interface TabGroup {
  id: string;
  name: string;
  tabIds: string[];
  color?: string;
}

export interface LayoutPreset {
  id: string;
  name: string;
  layout: {
    sidebarWidth: number;
    sidebarPosition: 'left' | 'right';
    readerWidth: number;
    readerPosition: 'center' | 'left' | 'right';
  };
}

export interface FocusMode {
  enabled: boolean;
  maxWidth: number; // pixels, default: 800
  alignment: 'left' | 'center' | 'right';
  readingLineGuide: boolean; // default: false
}

export interface SplitViewState {
  leftChapterId?: string;
  rightChapterId?: string;
  splitPosition: number; // 0-100, default: 50
  splitDirection: 'horizontal' | 'vertical';
}

export interface KeyboardShortcuts {
  [key: string]: string; // shortcut -> action mapping
}

