import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { trackImageUpload, trackImageClear } from '../utils/analytics';

interface ImageUploadProps {
  onImageLoad: (image: HTMLImageElement, file: File) => void;
  onClear: () => void;
  currentImage: string | null;
  isLoading?: boolean;
}

export default function ImageUpload({ onImageLoad, onClear, currentImage, isLoading = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    trackImageUpload();
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setIsUploading(false);
        onImageLoad(img, file);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert('Failed to load image. Please try another file.');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  if (currentImage && !isUploading && !isLoading) {
    return (
      <div className="relative mx-auto pb-8 w-full max-w-md">
        <div className="relative mx-auto rounded-lg overflow-hidden border border-neutral-200 bg-white aspect-square">
          <img
            src={currentImage}
            alt="Uploaded"
            className="w-full mx-auto h-full object-contain"
          />
          <button
            onClick={() => {
              trackImageClear();
              onClear();
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg border border-neutral-200 transition-all shadow-sm hover:shadow"
          >
            <X className="w-4 h-4 text-neutral-700" />
          </button>
        </div>
      </div>
    );
  }

  const showLoader = isUploading || isLoading;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative w-full max-w-md aspect-square border-2 border-dashed rounded-lg cursor-pointer
        transition-all mx-auto duration-200 ease-in-out
        flex flex-col items-center justify-center
        ${showLoader ? 'cursor-wait pointer-events-none' : ''}
        ${isDragging && !showLoader
          ? 'border-neutral-800 bg-neutral-50'
          : 'border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={showLoader}
      />
      {showLoader ? (
        <div className="flex flex-col items-center justify-center px-6">
          <div className="mb-4 p-4 rounded-lg bg-neutral-100">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          </div>
          <p className="text-base font-medium text-neutral-800 mb-1">
            Uploading image...
          </p>
          <p className="text-sm text-neutral-500">
            Please wait
          </p>
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center px-6">
            <div className={`
            mb-4 p-4 rounded-lg transition-colors
            ${isDragging ? 'bg-neutral-200' : 'bg-neutral-100'}
          `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-neutral-800' : 'text-neutral-600'}`} />
            </div>
            <p className="text-base font-medium text-neutral-800 mb-1">
              {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-neutral-500">
              PNG, JPG, WebP or GIF (max. 10MB)
            </p>
          </div>
      )}
    </div>
  );
}
