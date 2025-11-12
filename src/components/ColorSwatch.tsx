import { Check } from 'lucide-react';
import { ExtractedColor } from '../utils/colorExtractor';
import { useState, useEffect } from 'react';

interface ColorSwatchProps {
  color: ExtractedColor;
  isSelected: boolean;
  onClick: () => void;
  onCopy: () => void;
  showCopied: boolean;
}

export default function ColorSwatch({ color, isSelected, onClick, onCopy, showCopied }: ColorSwatchProps) {
  const [localCopied, setLocalCopied] = useState(false);

  useEffect(() => {
    if (showCopied) {
      setLocalCopied(true);
      const timer = setTimeout(() => setLocalCopied(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  const isDark = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
  };

  const textColor = isDark(color.hex) ? 'text-white' : 'text-neutral-900';
  const borderColor = isSelected ? 'ring-2 ring-neutral-800 ring-offset-2' : 'border border-neutral-200';

  return (
    <div
      className={`
        relative rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        ${borderColor}
      `}
      onClick={onClick}
    >
      <div
        className="w-full h-32 flex items-end p-4"
        style={{ backgroundColor: color.hex }}
      >
        <div className={`${textColor} transition-opacity ${localCopied ? 'opacity-100' : 'opacity-0'}`}>
          <Check className="w-5 h-5" />
        </div>
      </div>
      <div
        className="bg-white p-3 border-t border-neutral-100"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono font-medium text-neutral-900">
            {color.hex.toUpperCase()}
          </span>
          <span className="text-xs text-neutral-500">
            {color.percentage}%
          </span>
        </div>
        <div className="flex gap-2 text-xs text-neutral-600">
          <span>RGB({color.rgb.join(', ')})</span>
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          HSL({color.hsl[0]}°, {color.hsl[1]}%, {color.hsl[2]}%)
        </div>
      </div>
    </div>
  );
}
