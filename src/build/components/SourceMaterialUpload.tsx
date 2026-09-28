import React, { useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface SourceMaterialUploadProps {
  currentFileName?: string;
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  onTextExtracted?: (text: string, fileName: string) => void;
  onContentExtracted?: (text: string, fileName: string) => void;
  onClear?: () => void;
  accentColor?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  currentFileName,
  sourceText,
  onSourceTextChange,
  onTextExtracted,
  onContentExtracted,
  onClear,
  accentColor = '#E62E6B',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const text = await file.text();
      if (onTextExtracted) onTextExtracted(text, file.name);
      if (onContentExtracted) onContentExtracted(text, file.name);
      if (onSourceTextChange) onSourceTextChange(text);
    } catch (e: any) {
      setError('Could not read file. Please try pasting text or uploading a valid text file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase tracking-wider">
        Source Material / Reference Text <span className="text-stone-400 font-normal">(Optional)</span>
      </label>

      {currentFileName ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-mono font-bold text-emerald-900">{currentFileName}</p>
              <p className="text-[10px] font-mono text-emerald-700">Source material successfully loaded & ready</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              if (onSourceTextChange) onSourceTextChange('');
            }}
            className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-xl transition-colors"
            title="Remove source"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-[#E4DCD0] bg-[#EFE8DE]/50 hover:bg-[#EFE8DE] hover:border-stone-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv,.json,.html"
            className="hidden"
            onChange={handleFileChange}
          />
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-stone-600">Processing source file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-stone-600">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono font-bold text-stone-700">
                Click to upload reference file or drag & drop
              </p>
              <p className="text-[10px] font-mono text-stone-500">
                Supports TXT, MD, CSV, JSON (or paste text directly below)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-xs font-mono text-rose-600 p-2 bg-rose-50 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
