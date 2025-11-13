import { logEvent, Analytics } from 'firebase/analytics';
import { analytics } from '../config/firebase';

// Helper function to log events safely
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics as Analytics, eventName, eventParams);
      console.log('Analytics log:');
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

export const trackGradientShuffle = () => {
  trackEvent('gradient_shuffle');
};

export const trackGradientSelect = (gradientId: string, gradientName: string) => {
  trackEvent('gradient_select', { gradient_id: gradientId, gradient_name: gradientName });
};

export const trackGradientCopy = (gradientId: string, format: 'css' | 'tailwind' | 'scss' | 'json' | 'swift' | 'flutter' | 'kotlin' | 'direct') => {
  trackEvent('gradient_copy', { gradient_id: gradientId, format });
};

export const trackGradientFormatChange = (format: 'css' | 'tailwind' | 'scss' | 'json' | 'swift' | 'flutter' | 'kotlin') => {
  trackEvent('gradient_format_change', { format });
};

export const trackColorVariationCopy = (baseColor: string, variationType: string) => {
  trackEvent('color_variation_copy', { base_color: baseColor, variation_type: variationType });
};

