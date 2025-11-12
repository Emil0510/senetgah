import { ExtractedColor } from '../utils/colorExtractor';

interface LogoProps {
  colors?: ExtractedColor[];
}

export default function Logo({ colors }: LogoProps) {
  // Default colors if no colors are provided
  const defaultColors = [
    { hex: '#171717' }, // neutral-900
    { hex: '#a3a3a3' }, // neutral-400
    { hex: '#525252' }, // neutral-600
    { hex: '#e5e5e5' }  // neutral-200
  ];

  // Use extracted colors if available, otherwise use defaults
  const logoColors = colors && colors.length >= 4
    ? colors.slice(0, 4).map(c => c.hex)
    : defaultColors.map(c => c.hex);

  // Use the darkest color for text, or default to neutral-900
  const textColor = colors && colors.length > 0
    ? colors[0].hex // Use the first (most prominent) color
    : '#171717';

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
          <div
            className="rounded-tl-md transition-colors duration-300"
            style={{ backgroundColor: logoColors[0] }}
          ></div>
          <div
            className="rounded-tr-md transition-colors duration-300"
            style={{ backgroundColor: logoColors[1] }}
          ></div>
          <div
            className="rounded-bl-md transition-colors duration-300"
            style={{ backgroundColor: logoColors[2] }}
          ></div>
          <div
            className="rounded-br-md transition-colors duration-300"
            style={{ backgroundColor: logoColors[3] }}
          ></div>
        </div>
      </div>
      <div>
        <h1
          className="text-xl font-semibold tracking-tight transition-colors duration-300"
          style={{ color: textColor }}
        >
          Senetgah
        </h1>
      </div>
    </div>
  );
}
