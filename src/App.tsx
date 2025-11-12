import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ColorSwatch from './components/ColorSwatch';
import ColorVariations from './components/ColorVariations';
import GradientPanel from './components/GradientPanel';
import ExportPanel from './components/ExportPanel';
import Toast from './components/Toast';
import Logo from './components/Logo';
import { Plus, Minus } from 'lucide-react';
import { useMobile } from './hooks/useMobile';
import {
  ExtractedColor,
  extractColorsFromImage,
  generateColorVariations,
  ColorVariations as ColorVariationsType
} from './utils/colorExtractor';
import { generateGradients } from './utils/gradientGenerator';
import { copyToClipboard } from './utils/exportFormats';
import {
  trackColorCountDecrease,
  trackColorCountIncrease,
  trackColorSelect,
  trackColorCopy
} from './utils/analytics';

function App() {
  const isMobile = useMobile();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [colorVariations, setColorVariations] = useState<ColorVariationsType | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [colorCount, setColorCount] = useState(6);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [copiedColorIndex, setCopiedColorIndex] = useState<number | null>(null);

  // Generate gradients from the color palette
  const gradients = colors.length > 0 ? generateGradients(colors) : [];

  const handleImageLoad = async (image: HTMLImageElement, file: File) => {
    setIsExtracting(true);
    setImageUrl(image.src);
    setImageFile(file);

    try {
      const extractedColors = await extractColorsFromImage(image, colorCount);
      setColors(extractedColors);
      if (extractedColors.length > 0) {
        setSelectedColorIndex(0);
        setColorVariations(generateColorVariations(extractedColors[0].hex));
      }
    } catch (error) {
      console.error('Error extracting colors:', error);
      showToastMessage('Failed to extract colors. Please try another image.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClear = () => {
    setImageUrl(null);
    setImageFile(null);
    setColors([]);
    setSelectedColorIndex(null);
    setColorVariations(null);
  };

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
    setColorVariations(generateColorVariations(colors[index].hex));
    trackColorSelect(colors[index].hex, index);
  };

  const handleColorCopy = async (hex: string, index?: number, source: 'swatch' | 'variation' = 'swatch') => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToastMessage(`Copied ${hex.toUpperCase()}`);
      trackColorCopy(hex, source);
      if (index !== undefined) {
        setCopiedColorIndex(index);
        setTimeout(() => setCopiedColorIndex(null), 1000);
      }
    }
  };

  const handleColorCountChange = async (newCount: number) => {
    setColorCount(newCount);
    if (imageUrl && imageFile) {
      setIsExtracting(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const extractedColors = await extractColorsFromImage(img, newCount);
          setColors(extractedColors);
          if (extractedColors.length > 0 && selectedColorIndex !== null) {
            const newIndex = Math.min(selectedColorIndex, extractedColors.length - 1);
            setSelectedColorIndex(newIndex);
            setColorVariations(generateColorVariations(extractedColors[newIndex].hex));
          }
        } catch (error) {
          console.error('Error re-extracting colors:', error);
        } finally {
          setIsExtracting(false);
        }
      };
      img.src = imageUrl;
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const getImageInfo = () => {
    if (!imageFile) return null;
    const sizeInMB = (imageFile.size / (1024 * 1024)).toFixed(2);
    return `${imageFile.name} · ${sizeInMB} MB`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'} ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`text-center ${isMobile ? 'mb-4 pb-4' : 'mb-8 pb-6'} ${isMobile ? 'px-2' : 'px-4'}`}>
          <Logo colors={colors.length > 0 ? colors : undefined} />
          <p className={`mt-3 ${isMobile ? 'text-xs' : 'text-sm'} text-neutral-600 max-w-2xl mx-auto`}>
            Extract beautiful color palettes from any image
          </p>
        </div>

        <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          <div className={`transition-all duration-300 ${colors.length > 0 ? (isMobile ? 'mb-4' : 'mb-6') : 'mb-0'}`}>
            <ImageUpload
              onImageLoad={handleImageLoad}
              onClear={handleClear}
              currentImage={imageUrl}
              isLoading={isExtracting}
            />
            {imageFile && (
              <p className={`mt-2 ${isMobile ? 'text-xs' : 'text-xs'} text-neutral-500`}>
                {getImageInfo()}
              </p>
            )}
          </div>

          {isExtracting && (
            <div className={`bg-white rounded-lg border border-neutral-200 ${isMobile ? 'p-6' : 'p-8'} text-center`}>
              <div className={`inline-block ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin`}></div>
              <p className={`${isMobile ? 'mt-3' : 'mt-4'} ${isMobile ? 'text-xs' : 'text-sm'} text-neutral-600`}>Extracting colors...</p>
            </div>
          )}

          {!isExtracting && colors.length > 0 && (
            <>
              <div className={`bg-white rounded-lg border border-neutral-200 ${isMobile ? 'p-4' : 'p-6'} transition-all duration-300`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} ${isMobile ? 'gap-3' : 'justify-between'} ${isMobile ? 'mb-4' : 'mb-6'}`}>
                  <h2 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-neutral-900 transition-all duration-300`}>
                    Extracted Palette ({colors.length} colors)
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (colorCount > 3) {
                          const newCount = colorCount - 1;
                          trackColorCountDecrease(newCount);
                          handleColorCountChange(newCount);
                        }
                      }}
                      disabled={colorCount <= 3}
                      className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease color count"
                    >
                      <Minus className="w-4 h-4 text-neutral-600" />
                    </button>
                    <span className="text-sm font-medium text-neutral-900 w-8 text-center">{colorCount}</span>
                    <button
                      onClick={() => {
                        if (colorCount < 12) {
                          const newCount = colorCount + 1;
                          trackColorCountIncrease(newCount);
                          handleColorCountChange(newCount);
                        }
                      }}
                      disabled={colorCount >= 12}
                      className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase color count"
                    >
                      <Plus className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                </div>

                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'} ${isMobile ? 'gap-2' : 'gap-4'} transition-all duration-300`}>
                  {colors.map((color, index) => (
                    <div
                      key={`${color.hex}-${index}`}
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <ColorSwatch
                        color={color}
                        isSelected={selectedColorIndex === index}
                        onClick={() => handleColorSelect(index)}
                        onCopy={() => handleColorCopy(color.hex, index)}
                        showCopied={copiedColorIndex === index}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedColorIndex !== null && colorVariations && (
                <ColorVariations
                  baseColor={colors[selectedColorIndex].hex}
                  variations={colorVariations}
                  onCopy={(color) => handleColorCopy(color, undefined, 'variation')}
                />
              )}

              {gradients.length > 0 && (
                <GradientPanel gradients={gradients} colors={colors} />
              )}

              <ExportPanel colors={colors} />
            </>
          )}
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default App;
