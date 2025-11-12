import { ExtractedColor } from './colorExtractor';

export const exportToCSS = (colors: ExtractedColor[]): string => {
  const variables = colors
    .map((color, index) => `  --color-${index + 1}: ${color.hex};`)
    .join('\n');

  return `:root {\n${variables}\n}`;
};

export const exportToTailwind = (colors: ExtractedColor[]): string => {
  const colorObj = colors
    .map((color, index) => `    'brand-${index + 1}': '${color.hex}',`)
    .join('\n');

  return `colors: {\n${colorObj}\n}`;
};

export const exportToSCSS = (colors: ExtractedColor[]): string => {
  return colors
    .map((color, index) => `$color-${index + 1}: ${color.hex};`)
    .join('\n');
};

export const exportToJSON = (colors: ExtractedColor[]): string => {
  const hexArray = colors.map(color => color.hex);
  return JSON.stringify(hexArray, null, 2);
};

export const exportToSwift = (colors: ExtractedColor[]): string => {
  return colors
    .map((color, index) => {
      const hex = color.hex.replace('#', '');
      return `let color${index + 1} = UIColor(hex: "${hex}")`;
    })
    .join('\n');
};

export const exportToFlutter = (colors: ExtractedColor[]): string => {
  return colors
    .map((color, index) => {
      const hex = color.hex.replace('#', '');
      return `static const Color color${index + 1} = Color(0xFF${hex.toUpperCase()});`;
    })
    .join('\n');
};

export const exportToKotlin = (colors: ExtractedColor[]): string => {
  return colors
    .map((color, index) => {
      const hex = color.hex.replace('#', '').toUpperCase();
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `val color${index + 1} = Color(0xFF${hex}) // RGB(${r}, ${g}, ${b})`;
    })
    .join('\n');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
