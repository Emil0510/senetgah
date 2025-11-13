import { ColorVariations as ColorVariationsType } from '../utils/colorExtractor';
import { Copy } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { trackColorVariationCopy } from '../utils/analytics';

interface ColorVariationsProps {
  baseColor: string;
  variations: ColorVariationsType;
  onCopy: (color: string) => void;
}

export default function ColorVariations({ baseColor, variations, onCopy }: ColorVariationsProps) {
  const isMobile = useMobile();

  const VariationRow = ({ title, colors }: { title: string; colors: string[] }) => {
    const variationType = title.toLowerCase().replace(/[^a-z]/g, '_');
    return (
      <div className={`${isMobile ? 'space-y-1.5' : 'space-y-2'}`}>
        <h4 className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-neutral-600 uppercase tracking-wide`}>{title}</h4>
        <div className={`flex ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => {
                trackColorVariationCopy(baseColor, variationType);
                onCopy(color);
              }}
              className="flex-1 group relative rounded overflow-hidden border border-neutral-200 hover:border-neutral-400 transition-all"
              title={color}
            >
            <div
              className={`${isMobile ? 'h-10' : 'h-12'} w-full`}
              style={{ backgroundColor: color }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Copy className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow`} />
            </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${isMobile ? 'p-4' : 'p-6'} ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      <div>
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-neutral-900 ${isMobile ? 'mb-2' : 'mb-3'}`}>Color Variations</h3>
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} ${isMobile ? 'mb-4' : 'mb-6'}`}>
          <div
            className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg border border-neutral-200`}
            style={{ backgroundColor: baseColor }}
          />
          <div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-mono font-medium text-neutral-900`}>
              {baseColor.toUpperCase()}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-neutral-500`}>Base Color</div>
          </div>
        </div>
      </div>

      <VariationRow title="Tints (+ White)" colors={variations.tints} />
      <VariationRow title="Shades (+ Black)" colors={variations.shades} />
      <VariationRow title="Tones (- Saturation)" colors={variations.tones} />
    </div>
  );
}
