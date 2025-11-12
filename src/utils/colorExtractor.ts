import ColorThief from 'colorthief';
import chroma from 'chroma-js';

export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  percentage: number;
}

export interface ColorVariations {
  tints: string[];
  shades: string[];
  tones: string[];
}

const colorThief = new ColorThief();

export const extractColorsFromImage = async (
  imageElement: HTMLImageElement,
  colorCount: number = 6
): Promise<ExtractedColor[]> => {
  try {
    const palette = colorThief.getPalette(imageElement, colorCount);

    const totalPixels = imageElement.width * imageElement.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const colorCounts = palette.map(color => {
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const distance = Math.sqrt(
          Math.pow(r - color[0], 2) +
          Math.pow(g - color[1], 2) +
          Math.pow(b - color[2], 2)
        );

        if (distance < 50) {
          count++;
        }
      }
      return count;
    });

    const totalCounted = colorCounts.reduce((sum, count) => sum + count, 0);

    return palette.map((color, index) => {
      const chromaColor = chroma(color);
      return {
        hex: chromaColor.hex(),
        rgb: color as [number, number, number],
        hsl: chromaColor.hsl().map(v => Math.round(v)) as [number, number, number],
        percentage: Math.round((colorCounts[index] / totalCounted) * 100)
      };
    }).sort((a, b) => b.percentage - a.percentage);
  } catch (error) {
    console.error('Error extracting colors:', error);
    throw error;
  }
};

export const generateColorVariations = (hexColor: string): ColorVariations => {
  const baseColor = chroma(hexColor);

  const tints = Array.from({ length: 5 }, (_, i) => {
    const amount = (i + 1) * 0.15;
    return chroma.mix(baseColor, 'white', amount).hex();
  });

  const shades = Array.from({ length: 5 }, (_, i) => {
    const amount = (i + 1) * 0.15;
    return chroma.mix(baseColor, 'black', amount).hex();
  });

  const tones = Array.from({ length: 5 }, (_, i) => {
    const currentColor = chroma(hexColor);
    const [h, s, l] = currentColor.hsl();
    const newSaturation = Math.max(0, Math.min(1, s - (i + 1) * 0.15));
    return chroma.hsl(h, newSaturation, l).hex();
  });

  return { tints, shades, tones };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return chroma(r, g, b).hex();
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const color = chroma(hex);
  return color.rgb() as [number, number, number];
};

export const hexToHsl = (hex: string): [number, number, number] => {
  const color = chroma(hex);
  const hsl = color.hsl();
  return [
    Math.round(hsl[0] || 0),
    Math.round(hsl[1] * 100),
    Math.round(hsl[2] * 100)
  ];
};
