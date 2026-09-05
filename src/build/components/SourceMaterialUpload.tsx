import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, FileType, AlignLeft } from 'lucide-react';
import { AIService } from '../../study/services/aiService';

export interface SourceMaterialUploadProps {
  sourceMaterial?: string;
  sourceFileName?: string;
  currentFileName?: string;
  onTextExtracted: (text: string, fileName: string) => void;
  onClear: () => void;
  className?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  sourceMaterial,
  sourceFileName,
  currentFileName,
  onTextExtracted,
  onClear,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFileName = sourceFileName || currentFileName;
  const hasContent = Boolean(activeFileName || (sourceMaterial && sourceMaterial.trim().length > 0));

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await AIService.parseDocument(file);
      if (parsed && parsed.text) {
        onTextExtracted(parsed.text, file.name);
      } else {
        const text = await file.text();
        if (text && text.trim().length > 0) {
          onTextExtracted(text, file.name);
        } else {
          setError('Could not extract readable text from this file. Please try another file.');
        }
      }
    } catch (err: any) {
      console.warn('[SourceMaterialUpload] file parse issue:', err);
      setError('Unable to parse file. Try uploading as plain text or PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (hasContent) {
    return (
      <div className={`p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#18181B] text-white flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-[#E05A2B]" />
          </div>
          <div className="truncate">
            <p className="font-mono text-xs font-bold text-stone-900 truncate">
              {activeFileName || 'Pasted Study Material / Curriculum Notes'}
            </p>
            <p className="font-mono text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {sourceMaterial ? `${sourceMaterial.length.toLocaleString()} characters attached` : 'Document Attached'}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="p-2 rounded-xl hover:bg-amber-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer shrink-0"
          title="Remove attached material"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!isManualMode ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-[#E05A2B] bg-orange-50/50'
              : 'border-stone-300 hover:border-stone-400 bg-stone-50/70 hover:bg-stone-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#E05A2B] animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6 text-[#E05A2B]" />
            )}
            <span className="font-mono text-xs font-bold text-stone-800 uppercase">
              {isLoading ? 'Extracting text from document...' : 'Upload Syllabus, Curriculum PDF or Notes'}
            </span>
            <span className="font-mono text-[11px] text-stone-500">
              PDF, DOCX, TXT, Markdown, or image notes (up to 20MB)
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsManualMode(true);
              }}
              className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#E05A2B] hover:underline"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Or click here to paste text directly</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-stone-700 uppercase">
              Paste Curriculum or Study Text:
            </span>
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              className="font-mono text-[11px] text-stone-500 hover:text-stone-800 uppercase"
            >
              Switch to File Upload
            </button>
          </div>
          <textarea
            rows={4}
            placeholder="Paste syllabus guidelines, textbook excerpts, lecture notes, or standard competencies here..."
            onChange={(e) => {
              if (e.target.value.trim()) {
                onTextExtracted(e.target.value, 'Pasted_Notes.txt');
              }
            }}
            className="w-full p-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
          />
        </div>
      )}

      {error && (
        <p className="text-xs font-mono text-rose-600 px-1">{error}</p>
      )}
    </div>
  );
};
