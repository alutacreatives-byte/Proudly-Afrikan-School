import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Camera, X, Sparkles } from 'lucide-react';
import { extractTextFromFile } from '../../quiz/utils/pdfExtractor';
import { CameraCaptureModal } from '../../study/components/CameraCaptureModal';

interface SourceMaterialUploadProps {
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  currentFileName?: string;
  onTextExtracted?: (text: string, name?: string) => void;
  onContentExtracted?: (text: string, name?: string) => void;
  onClear?: () => void;
  accentColor?: string; // Optional accent color for branding (e.g., #FF7A00 or #E63956)
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  sourceText = '',
  onSourceTextChange,
  currentFileName,
  onTextExtracted,
  onContentExtracted,
  onClear,
  accentColor = '#FF7A00',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(currentFileName || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFileName = fileName || currentFileName;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    <div className="space-y-3.5 bg-stone-50/80 border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-stone-700" style={{ color: accentColor }} />
          <span className="font-mono text-[13px] font-bold text-stone-800 uppercase tracking-wider">
            Source Material & Camera Capture (Optional)
          </span>
        </div>
        {activeFileName && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[220px]">{activeFileName}</span>
            <button
              type="button"
              onClick={handleClearFile}
              className="ml-1 text-stone-400 hover:text-stone-700 p-0.5 rounded-full transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <textarea
        value={sourceText}
        onChange={(e) => onSourceTextChange && onSourceTextChange(e.target.value)}
        placeholder="Paste textbook excerpt, lecture notes, syllabus content, or exam directives..."
        rows={3}
        className="w-full p-3.5 bg-white border border-stone-200 rounded-xl font-sans text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Upload File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-mono text-xs font-bold rounded-xl transition-colors border border-stone-200/90 shadow-xs cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-stone-600" style={{ color: accentColor }} />
            <span>{isUploading ? 'Processing File...' : 'Upload PDF / DOC / File'}</span>
          </button>

          {/* 2. Camera Snap Button */}
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-mono text-xs font-bold rounded-xl transition-colors border border-stone-200/90 shadow-xs cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-stone-600" style={{ color: accentColor }} />
            <span>Camera / Snap Photo</span>
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

        <span className="font-mono text-[11px] text-stone-500 font-medium">
          {sourceText.length > 0 ? `${sourceText.length} chars grounded` : 'No text grounded'}
        </span>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};

