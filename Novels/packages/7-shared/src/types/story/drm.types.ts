// DRM types (Rule #27)

export interface DRMStatus {
  chapterId: string;
  userId: string;
  isProtected: boolean;
  watermarkEnabled: boolean;
  copyProtection: CopyProtectionConfig;
}

export interface WatermarkInfo {
  userId: string;
  chapterId: string;
  encodingMethod: 'invisible' | 'visible' | 'steganography';
  watermarkData: string; // Encoded watermark
}

export interface CopyProtectionConfig {
  disableSelection: boolean;
  disableCopy: boolean;
  disablePrint: boolean;
  disableScreenshot: boolean; // Mobile only
  disableScreenRecording: boolean; // Mobile only
}

