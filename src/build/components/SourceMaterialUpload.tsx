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
    <div className="space-y-2 text-left">
      {/* Label above */}
      <span className="font-mono text-[11px] sm:text-xs font-bold text-stone-600 tracking-wider block uppercase">
        OPTIONAL SOURCE MATERIAL (PDF / DOC / CAMERA)
      </span>

      {/* Main Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative bg-[#EEE7DD]/70 border border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-center transition-all shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04)] ${
          isDragging
            ? 'border-[#E62E6B] bg-pink-50/50 scale-[1.01]'
            : 'border-[#D5CCC0] hover:border-stone-400'
        }`}
      >
        {/* Top Upload Circle Icon */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF5EE] shadow-[2px_3px_8px_rgba(0,0,0,0.06),_-2px_-2px_6px_rgba(255,255,255,0.9)] border border-[#F0E6DC] flex items-center justify-center mx-auto mb-3">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#E62E6B]" />
        </div>

        {/* Title */}
        <h3 className="font-display font-black text-xs sm:text-sm text-[#1A1A1A] uppercase tracking-wide mb-1">
          {isUploading ? 'READING FILE...' : 'DRAG & DROP PDF OR TEXT FILE'}
        </h3>

        {/* Subtitle */}
        <p className="font-mono text-[11px] sm:text-xs text-stone-500 mb-4">
          Supports PDF, DOC, DOCX, TXT (Up to 25 pages)
        </p>

        {/* Active File Loaded Indicator */}
        {activeFileName && (
          <div className="inline-flex items-center gap-2 mb-4 font-mono text-xs font-semibold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
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
            className="bg-[#FAF5EE] text-[#2D2D2D] font-mono font-bold text-[11px] sm:text-xs px-5 py-2.5 rounded-2xl shadow-[2px_3px_8px_rgba(0,0,0,0.08),_-2px_-2px_6px_rgba(255,255,255,0.95)] border border-white/80 hover:bg-white active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {isUploading ? 'PROCESSING...' : 'BROWSE FILES'}
          </button>

          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            disabled={isUploading}
            className="bg-[#E62E6B] hover:bg-[#d8245f] text-white font-mono font-bold text-[11px] sm:text-xs px-5 py-2.5 rounded-2xl shadow-[0_6px_16px_rgba(230,46,107,0.35)] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
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
      </div>

      {/* Optional Paste Text Accordion Toggle below dashed container */}
      <div className="pt-1 flex items-center justify-between text-xs font-mono">
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
        <div className="mt-2 text-left">
          <textarea
            value={sourceText}
            onChange={(e) => onSourceTextChange && onSourceTextChange(e.target.value)}
            placeholder="Paste text notes, syllabus content, or exam directives directly..."
            rows={3}
            className="w-full p-3.5 bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl font-mono text-xs text-stone-900 placeholder-stone-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07)] focus:outline-hidden focus:border-[#E62E6B] transition-all resize-y"
          />
        </div>
      )}

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};
