import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { ExtractedColor } from '../utils/colorExtractor';
import {
  exportToCSS,
  exportToTailwind,
  exportToSCSS,
  exportToJSON,
  exportToSwift,
  exportToFlutter,
  exportToKotlin,
  copyToClipboard
} from '../utils/exportFormats';
import { trackExportFormatChange, trackExportCopy } from '../utils/analytics';

interface ExportPanelProps {
  colors: ExtractedColor[];
}

type ExportFormat = 'css' | 'tailwind' | 'scss' | 'json' | 'swift' | 'flutter' | 'kotlin';

export default function ExportPanel({ colors }: ExportPanelProps) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('css');
  const [copied, setCopied] = useState(false);

  const formats: { id: ExportFormat; label: string }[] = [
    { id: 'css', label: 'CSS' },
    { id: 'tailwind', label: 'Tailwind' },
    { id: 'scss', label: 'SCSS' },
    { id: 'json', label: 'JSON' },
    { id: 'swift', label: 'Swift' },
    { id: 'flutter', label: 'Flutter' },
    { id: 'kotlin', label: 'Kotlin' }
  ];

  const getExportContent = (): string => {
    switch (activeFormat) {
      case 'css':
        return exportToCSS(colors);
      case 'tailwind':
        return exportToTailwind(colors);
      case 'scss':
        return exportToSCSS(colors);
      case 'json':
        return exportToJSON(colors);
      case 'swift':
        return exportToSwift(colors);
      case 'flutter':
        return exportToFlutter(colors);
      case 'kotlin':
        return exportToKotlin(colors);
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    const content = getExportContent();
    const success = await copyToClipboard(content);
    if (success) {
      trackExportCopy(activeFormat);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="border-b border-neutral-200">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-sm font-semibold text-neutral-900">Export Palette</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="flex border-t border-neutral-100">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => {
                trackExportFormatChange(format.id);
                setActiveFormat(format.id);
              }}
              className={`
                flex-1 px-4 py-2.5 text-sm font-medium transition-colors
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
      </div>

      <div className="p-4">
        <pre className="bg-neutral-50 rounded-lg p-4 text-xs font-mono text-neutral-800 overflow-x-auto border border-neutral-200">
          {getExportContent()}
        </pre>
      </div>
    </div>
  );
}
