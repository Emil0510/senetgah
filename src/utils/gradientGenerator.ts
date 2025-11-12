import { ExtractedColor } from './colorExtractor';
import chroma from 'chroma-js';

export interface Gradient {
  id: string;
  name: string;
  css: string;
  colors: string[];
  direction?: string;
  animated?: boolean;
  grainy?: boolean;
  animationClass?: string;
}

/**
 * Find complementary color pairs (colors opposite on color wheel)
 */
const findComplementaryPairs = (colors: ExtractedColor[]): Array<[string, string]> => {
  const pairs: Array<[string, string]> = [];
  
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const color1 = chroma(colors[i].hex);
      const color2 = chroma(colors[j].hex);
      
      const hue1 = color1.hsl()[0] || 0;
      const hue2 = color2.hsl()[0] || 0;
      
      // Check if colors are approximately complementary (opposite ± 30 degrees)
      const diff = Math.abs(Math.abs(hue1 - hue2) - 180);
      if (diff < 30 || diff > 330) {
        pairs.push([colors[i].hex, colors[j].hex]);
      }
    }
  }
  
  return pairs;
};

/**
 * Find analogous colors (colors with similar hues)
 */
const findAnalogousGroups = (colors: ExtractedColor[]): string[][] => {
  const groups: string[][] = [];
  const used = new Set<number>();
  
  colors.forEach((color, index) => {
    if (used.has(index)) return;
    
    const group = [color.hex];
    const hue = chroma(color.hex).hsl()[0] || 0;
    used.add(index);
    
    colors.forEach((otherColor, otherIndex) => {
      if (used.has(otherIndex) || index === otherIndex) return;
      
      const otherHue = chroma(otherColor.hex).hsl()[0] || 0;
      const hueDiff = Math.min(
        Math.abs(hue - otherHue),
        360 - Math.abs(hue - otherHue)
      );
      
      // Group colors within 30 degrees of hue
      if (hueDiff < 30) {
        group.push(otherColor.hex);
        used.add(otherIndex);
      }
    });
    
    if (group.length >= 2) {
      // Sort by lightness for smoother gradient
      group.sort((a, b) => {
        const lightnessA = chroma(a).hsl()[2] || 0;
        const lightnessB = chroma(b).hsl()[2] || 0;
        return lightnessA - lightnessB;
      });
      groups.push(group);
    }
  });
  
  return groups;
};

/**
 * Group colors by lightness (light to dark or dark to light)
 */
const groupByLightness = (colors: ExtractedColor[], ascending: boolean = true): string[] => {
  const sorted = [...colors].sort((a, b) => {
    const lightnessA = chroma(a.hex).hsl()[2] || 0;
    const lightnessB = chroma(b.hex).hsl()[2] || 0;
    return ascending ? lightnessA - lightnessB : lightnessB - lightnessA;
  });
  
  return sorted.map(c => c.hex);
};

/**
 * Find triadic color combinations (colors 120 degrees apart)
 */
const findTriadicGroups = (colors: ExtractedColor[]): string[][] => {
  const groups: string[][] = [];
  
  if (colors.length < 3) return groups;
  
  // Try to find groups of 3 colors that are approximately 120 degrees apart
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      for (let k = j + 1; k < colors.length; k++) {
        const hue1 = chroma(colors[i].hex).hsl()[0] || 0;
        const hue2 = chroma(colors[j].hex).hsl()[0] || 0;
        const hue3 = chroma(colors[k].hex).hsl()[0] || 0;
        
        const hues = [hue1, hue2, hue3].sort((a, b) => a - b);
        const diff1 = hues[1] - hues[0];
        const diff2 = hues[2] - hues[1];
        const diff3 = 360 - hues[2] + hues[0];
        
        // Check if differences are approximately 120 degrees (± 30)
        if (
          Math.abs(diff1 - 120) < 30 &&
          Math.abs(diff2 - 120) < 30 &&
          Math.abs(diff3 - 120) < 30
        ) {
          groups.push([colors[i].hex, colors[j].hex, colors[k].hex]);
        }
      }
    }
  }
  
  return groups;
};

/**
 * Create smooth gradient between two colors with intermediate steps
 */
const createSmoothGradient = (color1: string, color2: string, steps: number = 5): string[] => {
  const gradient: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    gradient.push(chroma.mix(color1, color2, ratio, 'rgb').hex());
  }
  return gradient;
};

/**
 * Shuffle array randomly (Fisher-Yates algorithm)
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate shuffled gradients - shuffles colors within each theory type
 * to find better gradient arrangements
 */
export const generateShuffledGradients = (colors: ExtractedColor[]): Gradient[] => {
  if (colors.length === 0) return [];

  const gradients: Gradient[] = [];

  // 1. Complementary Gradient - shuffle which complementary pair to use
  const complementaryPairs = findComplementaryPairs(colors);
  if (complementaryPairs.length > 0) {
    const shuffledPairs = shuffleArray(complementaryPairs);
    const [color1, color2] = shuffledPairs[0];
    // Also try reverse order
    const reversed = Math.random() > 0.5;
    const smoothColors = createSmoothGradient(
      reversed ? color2 : color1,
      reversed ? color1 : color2,
      8
    );
    gradients.push({
      id: 'complementary',
      name: 'Complementary',
      css: `linear-gradient(to right, ${smoothColors.join(', ')})`,
      colors: smoothColors,
      direction: 'to right'
    });

    // Animated Complementary Gradient (shuffled)
    gradients.push({
      id: 'complementary-animated',
      name: 'Animated Complementary',
      css: `linear-gradient(90deg, ${reversed ? color2 : color1}, ${reversed ? color1 : color2}, ${reversed ? color2 : color1})`,
      colors: [reversed ? color2 : color1, reversed ? color1 : color2],
      direction: '90deg',
      animated: true,
      animationClass: 'gradient-animate'
    });

    // Grainy Complementary Gradient (shuffled)
    gradients.push({
      id: 'complementary-grainy',
      name: 'Grainy Complementary',
      css: `linear-gradient(to right, ${smoothColors.join(', ')})`,
      colors: smoothColors,
      direction: 'to right',
      grainy: true
    });
  }

  // 2. Analogous Gradient - shuffle order within analogous groups
  const analogousGroups = findAnalogousGroups(colors);
  if (analogousGroups.length > 0) {
    const shuffledGroups = shuffleArray(analogousGroups);
    const group = shuffledGroups[0];
    if (group.length >= 2) {
      // Try different sorting methods randomly
      const sortMethod = Math.floor(Math.random() * 3);
      let sortedGroup: string[];
      
      if (sortMethod === 0) {
        // Sort by lightness
        sortedGroup = [...group].sort((a, b) => {
          const lightnessA = chroma(a).hsl()[2] || 0;
          const lightnessB = chroma(b).hsl()[2] || 0;
          return lightnessA - lightnessB;
        });
      } else if (sortMethod === 1) {
        // Sort by saturation
        sortedGroup = [...group].sort((a, b) => {
          const satA = chroma(a).hsl()[1] || 0;
          const satB = chroma(b).hsl()[1] || 0;
          return satB - satA;
        });
      } else {
        // Random shuffle
        sortedGroup = shuffleArray(group);
      }
      
      // Randomly reverse
      const finalGroup = Math.random() > 0.5 ? sortedGroup : [...sortedGroup].reverse();
      
      gradients.push({
        id: 'analogous',
        name: 'Analogous',
        css: `linear-gradient(to right, ${finalGroup.join(', ')})`,
        colors: finalGroup,
        direction: 'to right'
      });
    }
  }

  // 3. Light to Dark Gradient - shuffle direction
  const lightToDark = groupByLightness(colors, true);
  const darkToLight = groupByLightness(colors, false);
  if (lightToDark.length >= 2) {
    const useLightToDark = Math.random() > 0.5;
    gradients.push({
      id: 'light-dark',
      name: useLightToDark ? 'Light to Dark' : 'Dark to Light',
      css: `linear-gradient(to bottom, ${(useLightToDark ? lightToDark : darkToLight).join(', ')})`,
      colors: useLightToDark ? lightToDark : darkToLight,
      direction: 'to bottom'
    });
  }

  // 4. Triadic Gradient - shuffle which triadic group to use
  const triadicGroups = findTriadicGroups(colors);
  if (triadicGroups.length > 0) {
    const shuffledTriadic = shuffleArray(triadicGroups);
    const group = shuffledTriadic[0];
    // Shuffle order within triadic group
    const shuffledGroup = shuffleArray(group);
    gradients.push({
      id: 'triadic',
      name: 'Triadic',
      css: `linear-gradient(135deg, ${shuffledGroup.join(', ')})`,
      colors: shuffledGroup,
      direction: '135deg'
    });
  }

  // 5. Radial Gradient - shuffle which colors to use
  const shuffledColors = shuffleArray(colors);
  const topColors = shuffledColors.slice(0, Math.min(3, colors.length)).map(c => c.hex);
  if (topColors.length >= 2) {
    gradients.push({
      id: 'radial',
      name: 'Radial',
      css: `radial-gradient(circle, ${topColors.join(', ')})`,
      colors: topColors,
      direction: 'circle'
    });
  }

  // 6. Hue-sorted Rainbow - shuffle starting point
  const sortedByHue = [...colors].sort((a, b) => {
    const hueA = chroma(a.hex).hsl()[0] || 0;
    const hueB = chroma(b.hex).hsl()[0] || 0;
    return hueA - hueB;
  });
  
  const hues = sortedByHue.map(c => chroma(c.hex).hsl()[0] || 0);
  const hueRange = Math.max(...hues) - Math.min(...hues);
  if (hueRange > 30 || (hueRange < 30 && Math.max(...hues) > 330 && Math.min(...hues) < 30)) {
    // Randomly reverse
    const finalHueOrder = Math.random() > 0.5 ? sortedByHue : [...sortedByHue].reverse();
    gradients.push({
      id: 'rainbow',
      name: 'Hue Spectrum',
      css: `linear-gradient(to right, ${finalHueOrder.map(c => c.hex).join(', ')})`,
      colors: finalHueOrder.map(c => c.hex),
      direction: 'to right'
    });
  }

  // 7. Saturation-based Gradient - shuffle direction
  const sortedBySaturation = [...colors].sort((a, b) => {
    const satA = chroma(a.hex).hsl()[1] || 0;
    const satB = chroma(b.hex).hsl()[1] || 0;
    return satB - satA;
  });
  if (sortedBySaturation.length >= 2) {
    const saturationRange = chroma(sortedBySaturation[0].hex).hsl()[1] - 
                           chroma(sortedBySaturation[sortedBySaturation.length - 1].hex).hsl()[1];
    if (saturationRange > 0.2) {
      const finalSatOrder = Math.random() > 0.5 
        ? sortedBySaturation 
        : [...sortedBySaturation].reverse();
      gradients.push({
        id: 'saturation',
        name: Math.random() > 0.5 ? 'Vibrant to Muted' : 'Muted to Vibrant',
        css: `linear-gradient(to right, ${finalSatOrder.map(c => c.hex).join(', ')})`,
        colors: finalSatOrder.map(c => c.hex),
        direction: 'to right'
      });
    }
  }

  // 8. Conic Gradient - shuffle color order
  if (colors.length >= 3) {
    const distinctHues = new Set<number>();
    const conicColors: string[] = [];
    
    colors.forEach(color => {
      const hue = Math.round(chroma(color.hex).hsl()[0] || 0);
      if (!distinctHues.has(hue)) {
        distinctHues.add(hue);
        conicColors.push(color.hex);
      }
    });
    
    if (conicColors.length >= 3) {
      const shuffledConic = shuffleArray(conicColors);
      gradients.push({
        id: 'conic',
        name: 'Conic',
        css: `conic-gradient(${shuffledConic.join(', ')})`,
        colors: shuffledConic,
        direction: 'from 0deg'
      });
    }
  }

  // Fallback: If we don't have enough smart gradients, use simple 2-color gradients
  if (gradients.length < 3 && colors.length >= 2) {
    const shuffled = shuffleArray(colors);
    const top2 = shuffled.slice(0, 2).map(c => c.hex);
    const smooth2 = createSmoothGradient(top2[0], top2[1], 6);
    gradients.push({
      id: 'simple',
      name: 'Simple Blend',
      css: `linear-gradient(to right, ${smooth2.join(', ')})`,
      colors: smooth2,
      direction: 'to right'
    });
  }

  return gradients;
};

/**
 * Generate different types of gradients from a color palette
 * Uses intelligent color matching based on color theory
 */
export const generateGradients = (colors: ExtractedColor[]): Gradient[] => {
  if (colors.length === 0) return [];

  const gradients: Gradient[] = [];

  // 1. Complementary Gradient (2 complementary colors)
  const complementaryPairs = findComplementaryPairs(colors);
  if (complementaryPairs.length > 0) {
    const [color1, color2] = complementaryPairs[0];
    const smoothColors = createSmoothGradient(color1, color2, 8);
    gradients.push({
      id: 'complementary',
      name: 'Complementary',
      css: `linear-gradient(to right, ${smoothColors.join(', ')})`,
      colors: smoothColors,
      direction: 'to right'
    });

    // Animated Complementary Gradient
    gradients.push({
      id: 'complementary-animated',
      name: 'Animated Complementary',
      css: `linear-gradient(90deg, ${color1}, ${color2}, ${color1})`,
      colors: [color1, color2],
      direction: '90deg',
      animated: true,
      animationClass: 'gradient-animate'
    });

    // Grainy Complementary Gradient
    gradients.push({
      id: 'complementary-grainy',
      name: 'Grainy Complementary',
      css: `linear-gradient(to right, ${smoothColors.join(', ')})`,
      colors: smoothColors,
      direction: 'to right',
      grainy: true
    });
  }

  // 2. Analogous Gradient (similar hues)
  const analogousGroups = findAnalogousGroups(colors);
  if (analogousGroups.length > 0) {
    const group = analogousGroups[0];
    if (group.length >= 2) {
      gradients.push({
        id: 'analogous',
        name: 'Analogous',
        css: `linear-gradient(to right, ${group.join(', ')})`,
        colors: group,
        direction: 'to right'
      });
    }
  }

  // 3. Light to Dark Gradient
  const lightToDark = groupByLightness(colors, true);
  if (lightToDark.length >= 2) {
    gradients.push({
      id: 'light-dark',
      name: 'Light to Dark',
      css: `linear-gradient(to bottom, ${lightToDark.join(', ')})`,
      colors: lightToDark,
      direction: 'to bottom'
    });
  }

  // 4. Triadic Gradient (3 colors 120° apart)
  const triadicGroups = findTriadicGroups(colors);
  if (triadicGroups.length > 0) {
    const group = triadicGroups[0];
    gradients.push({
      id: 'triadic',
      name: 'Triadic',
      css: `linear-gradient(135deg, ${group.join(', ')})`,
      colors: group,
      direction: '135deg'
    });
  }

  // 5. Radial Gradient (using top 2-3 most prominent colors)
  const topColors = colors.slice(0, Math.min(3, colors.length)).map(c => c.hex);
  if (topColors.length >= 2) {
    gradients.push({
      id: 'radial',
      name: 'Radial',
      css: `radial-gradient(circle, ${topColors.join(', ')})`,
      colors: topColors,
      direction: 'circle'
    });
  }

  // 6. Hue-sorted Rainbow (only if colors span different hues)
  const sortedByHue = [...colors].sort((a, b) => {
    const hueA = chroma(a.hex).hsl()[0] || 0;
    const hueB = chroma(b.hex).hsl()[0] || 0;
    return hueA - hueB;
  });
  
  // Check if colors actually span different hues
  const hues = sortedByHue.map(c => chroma(c.hex).hsl()[0] || 0);
  const hueRange = Math.max(...hues) - Math.min(...hues);
  if (hueRange > 30 || (hueRange < 30 && Math.max(...hues) > 330 && Math.min(...hues) < 30)) {
    gradients.push({
      id: 'rainbow',
      name: 'Hue Spectrum',
      css: `linear-gradient(to right, ${sortedByHue.map(c => c.hex).join(', ')})`,
      colors: sortedByHue.map(c => c.hex),
      direction: 'to right'
    });
  }

  // 7. Saturation-based Gradient (vibrant to muted)
  const sortedBySaturation = [...colors].sort((a, b) => {
    const satA = chroma(a.hex).hsl()[1] || 0;
    const satB = chroma(b.hex).hsl()[1] || 0;
    return satB - satA;
  });
  if (sortedBySaturation.length >= 2) {
    const saturationRange = chroma(sortedBySaturation[0].hex).hsl()[1] - 
                           chroma(sortedBySaturation[sortedBySaturation.length - 1].hex).hsl()[1];
    if (saturationRange > 0.2) {
      gradients.push({
        id: 'saturation',
        name: 'Vibrant to Muted',
        css: `linear-gradient(to right, ${sortedBySaturation.map(c => c.hex).join(', ')})`,
        colors: sortedBySaturation.map(c => c.hex),
        direction: 'to right'
      });
    }
  }

  // 8. Conic Gradient (for 3+ colors with distinct hues)
  if (colors.length >= 3) {
    const distinctHues = new Set<number>();
    const conicColors: string[] = [];
    
    colors.forEach(color => {
      const hue = Math.round(chroma(color.hex).hsl()[0] || 0);
      if (!distinctHues.has(hue)) {
        distinctHues.add(hue);
        conicColors.push(color.hex);
      }
    });
    
    if (conicColors.length >= 3) {
      gradients.push({
        id: 'conic',
        name: 'Conic',
        css: `conic-gradient(${conicColors.join(', ')})`,
        colors: conicColors,
        direction: 'from 0deg'
      });
    }
  }

  // Fallback: If we don't have enough smart gradients, use simple 2-color gradients
  if (gradients.length < 3 && colors.length >= 2) {
    // Use top 2 colors by percentage
    const top2 = colors.slice(0, 2).map(c => c.hex);
    const smooth2 = createSmoothGradient(top2[0], top2[1], 6);
    gradients.push({
      id: 'simple',
      name: 'Simple Blend',
      css: `linear-gradient(to right, ${smooth2.join(', ')})`,
      colors: smooth2,
      direction: 'to right'
    });
  }

  return gradients;
};

/**
 * Generate CSS code for a gradient
 */
export const exportGradientToCSS = (gradient: Gradient, className: string = 'gradient'): string => {
  let css = `.${className} {\n  background: ${gradient.css};`;
  
  if (gradient.animated) {
    css += `\n  background-size: 200% 200%;\n  animation: gradient-animate 3s ease infinite;`;
  }
  
  if (gradient.grainy) {
    css += `\n  position: relative;`;
  }
  
  css += `\n}`;
  
  if (gradient.grainy) {
    css += `\n\n.${className}::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");\n  mix-blend-mode: overlay;\n  pointer-events: none;\n  opacity: 0.3;\n}`;
  }
  
  if (gradient.animated) {
    css += `\n\n@keyframes gradient-animate {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}`;
  }
  
  return css;
};

/**
 * Generate Tailwind CSS gradient config
 */
export const exportGradientToTailwind = (gradient: Gradient): string => {
  const direction = gradient.direction || 'to right';
  
  // For radial and conic gradients, use arbitrary values
  if (gradient.id === 'radial' || gradient.id === 'conic') {
    return `className="bg-[${gradient.css}]"`;
  }
  
  // For linear gradients, use Tailwind's gradient utilities
  const tailwindDirection = direction === 'to right' ? 'bg-gradient-to-r' :
                           direction === 'to bottom' ? 'bg-gradient-to-b' :
                           direction === '135deg' ? 'bg-gradient-to-br' :
                           'bg-gradient-to-r';
  
  // Build color stops
  const colorStops = gradient.colors.map((color, index) => {
    if (index === 0) return `from-[${color}]`;
    if (index === gradient.colors.length - 1) return `to-[${color}]`;
    return `via-[${color}]`;
  }).join(' ');
  
  return `className="${tailwindDirection} ${colorStops}"`;
};

