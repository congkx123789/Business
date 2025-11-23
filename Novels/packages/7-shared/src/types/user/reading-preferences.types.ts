// Reading Preferences types

export interface ReadingPreferences {
  userId: string;
  
  // Text Customization (1.1 - Enhanced)
  fontSize: number; // 12-24, default: 16
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'monospace' | 'custom';
  customFontUrl?: string; // URL to uploaded custom font (OTF/TTF)
  customFontName?: string; // Name of custom font for display
  customFontData?: string; // Base64 encoded font data (for offline use)
  lineHeight: number; // 1.0-2.5, default: 1.5
  letterSpacing: number; // -0.5 to 2.0, default: 0
  paragraphSpacing: number; // 0-2.0, default: 1.0
  wordSpacing: number; // 0-2.0, default: 0
  textAlign: 'left' | 'center' | 'justify';
  
  // Background & Theme Modes (1.2 - Enhanced with Blue Light Filtering)
  backgroundColor: 'white' | 'black' | 'sepia' | 'eye-protection' | 'custom';
  textColor?: string; // Optional override (hex color)
  customBackgroundColor?: string; // Hex color for 'custom' mode
  brightness: number; // 0-100, default: 100
  
  // Blue Light Filtering (1.2 - Adaptive Eye Protection)
  blueLightFilterEnabled: boolean; // default: false
  blueLightFilterStrength: number; // 0-100, default: 50
  blueLightFilterAdaptive: boolean; // default: true
  blueLightFilterSchedule?: {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  
  // Reading Mode (1.3 - Scroll vs Page Turn)
  readingMode: 'scroll' | 'page';
  pageTurnAnimation: boolean; // default: true
  pageTurnDirection: 'horizontal' | 'vertical'; // default: 'horizontal'
  scrollBehavior: 'smooth' | 'instant' | 'auto'; // default: 'smooth'
  
  // Multi-Format Support (1.4 - Format Preferences)
  preferredFormats: string[]; // ['epub', 'pdf', 'mobi', 'fb2', 'docx', 'txt', 'cbr', 'cbz']
  formatProcessing: {
    pdf?: {
      autoCropMargins: boolean; // default: true
      autoGenerateTOC: boolean; // default: true
    };
    docx?: {
      autoGenerateTOC: boolean; // default: true
    };
    archive?: {
      readFromZip: boolean; // default: true
      readFromRar: boolean; // default: true
    };
  };
  
  // UI Controls Behavior
  autoHideControls: boolean; // default: true
  controlsTimeout: number; // milliseconds, default: 3000
  tapToToggleControls: boolean; // default: true
  
  // Advanced Settings
  marginHorizontal: number; // 0-100, default: 20
  marginVertical: number; // 0-100, default: 20
  
  // Sync & Persistence
  syncAcrossDevices: boolean; // default: true
  createdAt: Date;
  updatedAt: Date;
}

