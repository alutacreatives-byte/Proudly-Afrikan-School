import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Camera, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { extractTextFromFile } from '../../quiz/utils/pdfExtractor';
import { CameraCaptureModal } from '../../study/components/CameraCaptureModal';

interface SourceMaterialUploadProps {
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  currentFileName?: string;
  onTextExtracted?: (text: string, name?: string) => void;
  onContentExtracted?: (text: string, name?: string) => void;
  onClear?: () => void;
  accentColor?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  sourceText = '',
  onSourceTextChange,
  currentFileName,
  onTextExtracted,
  onContentExtracted,
  onClear,
  accentColor = '#D92B8A',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(currentFileName || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFileName = fileName || currentFileName;

  const processFile = async (file: File) => {
    setIsUploading(true);
    setFileName(file.name);

    try {
      const { text } = await extractTextFromFile(file);
      if (onSourceTextChange) onSourceTextChange(text);
      if (onTextExtracted) onTextExtracted(text, file.name);
      if (onContentExtracted) onContentExtracted(text, file.name);
    } catch (err) {
      console.error('Failed to read file', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handlePhotoCaptured = async (photoBlob: Blob, photoDataUrl: string, capturedFileName: string) => {
    setIsCameraOpen(false);
    setIsUploading(true);
    setFileName(capturedFileName);

    try {
      const file = new File([photoBlob], capturedFileName, { type: 'image/jpeg' });
      const { text } = await extractTextFromFile(file);
      const finalText = text && text.trim().length > 0 ? text : `[Photographed Notes: ${capturedFileName}]`;
      if (onSourceTextChange) onSourceTextChange(finalText);
      if (onTextExtracted) onTextExtracted(finalText, capturedFileName);
      if (onContentExtracted) onContentExtracted(finalText, capturedFileName);
    } catch (err) {
      console.warn('OCR extraction fallback:', err);
      const fallbackText = `[Photographed Notes: ${capturedFileName}]`;
      if (onSourceTextChange) onSourceTextChange(fallbackText);
      if (onTextExtracted) onTextExtracted(fallbackText, capturedFileName);
      if (onContentExtracted) onContentExtracted(fallbackText, capturedFileName);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = () => {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onSourceTextChange) onSourceTextChange('');
    if (onTextExtracted) onTextExtracted('', '');
    if (onContentExtracted) onContentExtracted('', '');
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      {/* Label above */}
      <span className="font-mono text-[11px] sm:text-xs font-bold text-stone-700 tracking-wider block uppercase">
        OPTIONAL SOURCE MATERIAL (PDF / DOC / CAMERA)
      </span>

      {/* Main Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative bg-[#FAF8F5] border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-[#D92B8A] bg-pink-50/40 shadow-md scale-[1.01]'
            : 'border-stone-200/90 shadow-xs hover:border-stone-300'
        }`}
      >
        {/* Top Upload Circle Icon */}
        <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-stone-100/80 flex items-center justify-center mx-auto mb-3.5">
          <Upload className="w-5 h-5" style={{ color: accentColor || '#D92B8A' }} />
        </div>

        {/* Title */}
        <h3 className="font-display font-black text-base sm:text-lg text-[#161616] uppercase tracking-tight mb-1">
          {isUploading ? 'READING FILE...' : 'DRAG & DROP PDF OR TEXT FILE'}
        </h3>

        {/* Subtitle */}
        <p className="font-mono text-xs sm:text-sm text-stone-500 mb-5">
          Supports PDF, DOC, DOCX, TXT (Up to 25 pages)
        </p>

        {/* Active File Loaded Indicator */}
        {activeFileName && (
          <div className="inline-flex items-center gap-2 mb-5 font-mono text-xs font-semibold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/90 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[320px]">{activeFileName}</span>
            <button
              type="button"
              onClick={handleClearFile}
              className="ml-1 text-stone-400 hover:text-stone-700 p-0.5 rounded-full transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#18181B] hover:bg-black text-white font-mono font-bold text-xs px-6 py-3 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {isUploading ? 'PROCESSING...' : 'BROWSE FILES'}
          </button>

          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            disabled={isUploading}
            style={{ backgroundColor: accentColor || '#D92B8A' }}
            className="text-white hover:opacity-90 font-mono font-bold text-xs px-6 py-3 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>CAPTURE IT (CAMERA)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.doc,.docx,image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </div>

        {/* Optional Paste Text Accordion Toggle */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={() => setShowPasteArea(!showPasteArea)}
            className="text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{showPasteArea ? 'Hide Direct Text Paste' : 'Or Paste Raw Text Notes'}</span>
            {showPasteArea ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-stone-400 text-[11px]">
            {sourceText.length > 0 ? `${sourceText.length} chars grounded` : 'No text grounded'}
          </span>
        </div>

        {/* Expandable Text Area */}
        {showPasteArea && (
          <div className="mt-3 text-left">
            <textarea
              value={sourceText}
              onChange={(e) => onSourceTextChange && onSourceTextChange(e.target.value)}
              placeholder="Paste text notes, syllabus content, or exam directives directly..."
              rows={3}
              className="w-full p-3 bg-white border border-stone-200 rounded-2xl font-sans text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D92B8A] transition-all resize-y"
            />
          </div>
        )}
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};
