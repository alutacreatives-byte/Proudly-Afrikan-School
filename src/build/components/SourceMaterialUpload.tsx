import React, { useState, useRef } from 'react';
import { FileUp, FileText, X, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import { extractTextFromFile } from '../../quiz/utils/pdfExtractor';
import { CameraCaptureModal } from '../../study/components/CameraCaptureModal';

interface SourceMaterialUploadProps {
  onContentExtracted?: (text: string, fileName: string) => void;
  onTextExtracted?: (text: string, fileName: string) => void;
  onClear: () => void;
  currentFileName?: string;
  sourceFileName?: string;
  sourceMaterial?: string;
  extractedPreview?: string;
  className?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  onContentExtracted,
  onTextExtracted,
  onClear,
  currentFileName,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const result = await extractTextFromFile(file);
      if (onContentExtracted) onContentExtracted(result.text, file.name);
      if (onTextExtracted) onTextExtracted(result.text, file.name);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract text from file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoCaptured = async (photoBlob: Blob, photoDataUrl: string, fileName: string) => {
    setIsCameraModalOpen(false);
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const file = new File([photoBlob], fileName, { type: photoBlob.type || 'image/jpeg' });
      const result = await extractTextFromFile(file);
      if (onContentExtracted) onContentExtracted(result.text, fileName);
      if (onTextExtracted) onTextExtracted(result.text, fileName);
    } catch (err: any) {
      if (onContentExtracted) onContentExtracted('Captured study material photo.', fileName);
      if (onTextExtracted) onTextExtracted('Captured study material photo.', fileName);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  if (currentFileName) {
    return (
      <div className={`flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl ${className}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="font-mono text-xs font-bold text-emerald-900 truncate">
              {currentFileName}
            </div>
            <div className="font-mono text-[10px] text-emerald-600">
              Attached source document
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="p-1.5 hover:bg-emerald-200/50 rounded-full text-emerald-700 transition-colors"
          title="Remove document"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.doc,.docx"
        onChange={onFileChange}
        className="hidden"
      />
      <div className="space-y-2">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-[#E63956] bg-pink-50/60 scale-[0.99]'
              : 'border-stone-200 hover:border-[#E63956]/60 hover:bg-stone-50/60 bg-white'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-[#E63956] animate-spin" />
              <span className="font-mono text-xs font-bold text-stone-600">
                Extracting document text...
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <FileUp className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-bold text-stone-800">
                Drop PDF / DOC or click to browse
              </div>
              <div className="font-mono text-[11px] text-stone-500">
                PDF, TXT, DOCX up to 25 pages
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCameraModalOpen(true);
            }}
            className="w-full py-2.5 px-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Capture It (Camera)</span>
          </button>
        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />

      {errorMessage && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
