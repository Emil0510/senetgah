import { Copy, Check, Shuffle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Gradient } from '../utils/gradientGenerator';
import { exportGradientToCSS, exportGradientToTailwind, generateShuffledGradients } from '../utils/gradientGenerator';
import { copyToClipboard } from '../utils/exportFormats';
import { ExtractedColor } from '../utils/colorExtractor';
import { useMobile } from '../hooks/useMobile';

interface GradientPanelProps {
  gradients: Gradient[];
  colors: ExtractedColor[];
}

type ExportFormat = 'css' | 'tailwind';

export default function GradientPanel({ gradients: initialGradients, colors }: GradientPanelProps) {
  const isMobile = useMobile();
  const [gradients, setGradients] = useState<Gradient[]>(initialGradients);
  const [selectedGradient, setSelectedGradient] = useState<Gradient | null>(
    initialGradients.length > 0 ? initialGradients[0] : null
  );
  const [copied, setCopied] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('css');
  const [isShuffled, setIsShuffled] = useState(false);

  // Update gradients when initialGradients change
  useEffect(() => {
    setGradients(initialGradients);
    if (initialGradients.length > 0) {
      setSelectedGradient(initialGradients[0]);
    }
    setIsShuffled(false);
  }, [initialGradients]);

  const handleShuffle = () => {
    const shuffledGradients = generateShuffledGradients(colors);
    setGradients(shuffledGradients);
    setIsShuffled(true);
    if (shuffledGradients.length > 0) {
      setSelectedGradient(shuffledGradients[0]);
    }
  };

  if (gradients.length === 0) return null;

  const formats: { id: ExportFormat; label: string }[] = [
    { id: 'css', label: 'CSS' },
    { id: 'tailwind', label: 'Tailwind' }
  ];

  const getExportContent = (): string => {
    if (!selectedGradient) return '';
    
    switch (activeFormat) {
      case 'css':
        return exportGradientToCSS(selectedGradient, 'gradient');
      case 'tailwind':
        return exportGradientToTailwind(selectedGradient);
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    const content = getExportContent();
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGradientCopy = async (gradient: Gradient) => {
    const css = `background: ${gradient.css};`;
    const success = await copyToClipboard(css);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="border-b border-neutral-200">
        <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} ${isMobile ? 'gap-3' : 'justify-between'} ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-neutral-900`}>Gradient Generator</h3>
            {isShuffled && (
              <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-neutral-500 bg-neutral-100 px-2 py-1 rounded`}>
                Shuffled
              </span>
            )}
          </div>
          <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
            <button
              onClick={handleShuffle}
              className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'} ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors`}
              title="Shuffle colors for each gradient theory"
            >
              <Shuffle className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              {!isMobile && 'Shuffle'}
            </button>
            {selectedGradient && (
              <button
                onClick={handleCopy}
                className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'} ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors`}
              >
                {copied ? (
                  <>
                    <Check className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                    {!isMobile && 'Copied!'}
                  </>
                ) : (
                  <>
                    <Copy className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                    {!isMobile && 'Copy Code'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {selectedGradient && (
          <div className="flex border-t border-neutral-100">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setActiveFormat(format.id)}
                className={`
                  flex-1 ${isMobile ? 'px-2 py-2' : 'px-4 py-2.5'} ${isMobile ? 'text-xs' : 'text-sm'} font-medium transition-colors
                  ${activeFormat === format.id
                    ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }
                `}
              >
                {format.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`${isMobile ? 'p-3' : 'p-6'} ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        {/* Gradient Preview Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} ${isMobile ? 'gap-2' : 'gap-4'}`}>
          {gradients.map((gradient) => (
            <div
              key={gradient.id}
              className={`
                group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all
                ${selectedGradient?.id === gradient.id
                  ? 'border-neutral-900 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-400'
                }
              `}
              onClick={() => setSelectedGradient(gradient)}
            >
              <div
                className={`${isMobile ? 'h-24' : 'h-32'} w-full relative ${gradient.animated ? gradient.animationClass : ''} ${gradient.grainy ? 'grainy-gradient' : ''}`}
                style={{ 
                  background: gradient.css,
                  backgroundSize: gradient.animated ? '200% 200%' : undefined
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGradientCopy(gradient);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-md shadow-sm hover:bg-white"
                  title="Copy CSS"
                >
                  <Copy className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-neutral-700`} />
                </button>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 bg-black/60 text-white ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <p className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium`}>{gradient.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Gradient Details */}
        {selectedGradient && (
          <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <div>
              <h4 className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-neutral-600 uppercase tracking-wide ${isMobile ? 'mb-1.5' : 'mb-2'}`}>
                Selected Gradient
              </h4>
              <div
                className={`${isMobile ? 'h-20' : 'h-24'} w-full rounded-lg border border-neutral-200 relative ${selectedGradient.animated ? selectedGradient.animationClass : ''} ${selectedGradient.grainy ? 'grainy-gradient' : ''}`}
                style={{ 
                  background: selectedGradient.css,
                  backgroundSize: selectedGradient.animated ? '200% 200%' : undefined
                }}
              />
            </div>

            <div>
              <h4 className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-neutral-600 uppercase tracking-wide ${isMobile ? 'mb-1.5' : 'mb-2'}`}>
                Code Preview
              </h4>
              <pre className={`bg-neutral-50 rounded-lg ${isMobile ? 'p-2' : 'p-4'} ${isMobile ? 'text-xs' : 'text-xs'} font-mono text-neutral-800 overflow-x-auto border border-neutral-200`}>
                {getExportContent()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

