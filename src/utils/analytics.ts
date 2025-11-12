import { logEvent, Analytics } from 'firebase/analytics';
import { analytics } from '../config/firebase';

// Helper function to log events safely
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics as Analytics, eventName, eventParams);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
};

// Specific event tracking functions
export const trackImageUpload = () => {
  trackEvent('image_upload');
};

export const trackImageClear = () => {
  trackEvent('image_clear');
};

export const trackColorCountDecrease = (newCount: number) => {
  trackEvent('color_count_decrease', { color_count: newCount });
};

export const trackColorCountIncrease = (newCount: number) => {
  trackEvent('color_count_increase', { color_count: newCount });
};

export const trackColorSelect = (colorHex: string, index: number) => {
  trackEvent('color_select', { color_hex: colorHex, color_index: index });
};

export const trackColorCopy = (colorHex: string, source: 'swatch' | 'variation') => {
  trackEvent('color_copy', { color_hex: colorHex, source });
};

export const trackExportFormatChange = (format: string) => {
  trackEvent('export_format_change', { format });
};

export const trackExportCopy = (format: string) => {
  trackEvent('export_copy', { format });
};

