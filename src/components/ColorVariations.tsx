import { ColorVariations as ColorVariationsType } from '../utils/colorExtractor';
import { Copy } from 'lucide-react';

interface ColorVariationsProps {
  baseColor: string;
  variations: ColorVariationsType;
  onCopy: (color: string) => void;
}

export default function ColorVariations({ baseColor, variations, onCopy }: ColorVariationsProps) {
  const VariationRow = ({ title, colors }: { title: string; colors: string[] }) => (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-neutral-600 uppercase tracking-wide">{title}</h4>
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => onCopy(color)}
            className="flex-1 group relative rounded overflow-hidden border border-neutral-200 hover:border-neutral-400 transition-all"
            title={color}
          >
            <div
              className="h-12 w-full"
              style={{ backgroundColor: color }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Copy className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Color Variations</h3>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-lg border border-neutral-200"
            style={{ backgroundColor: baseColor }}
          />
          <div>
            <div className="text-sm font-mono font-medium text-neutral-900">
              {baseColor.toUpperCase()}
            </div>
            <div className="text-xs text-neutral-500">Base Color</div>
          </div>
        </div>
      </div>

      <VariationRow title="Tints (+ White)" colors={variations.tints} />
      <VariationRow title="Shades (+ Black)" colors={variations.shades} />
      <VariationRow title="Tones (- Saturation)" colors={variations.tones} />
    </div>
  );
}
