import React, { useState, useRef } from 'react';
import { FileUp, FileText, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { extractTextFromFile } from '../../quiz/utils/pdfExtractor';

interface SourceMaterialUploadProps {
  toolName?: string;
  onProcessingChange?: (isProcessing: boolean) => void;
  onDocumentExtracted: (text: string, docName?: string) => void;
  onDocumentRemoved: () => void;
  accept?: string;
  required?: boolean;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  toolName,
  onProcessingChange,
  onDocumentExtracted,
  onDocumentRemoved,
  accept = '.pdf,.txt,.md,.doc,.docx',
  required = false,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    if (onProcessingChange) onProcessingChange(true);

    try {
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      setFileName(file.name);
      setFileSize(sizeStr);

      const result = await extractTextFromFile(file);
      if (!result.text || result.text.trim().length < 15) {
        throw new Error('Extracted text is too short or empty. Please ensure the document has readable text.');
      }

      setCharCount(result.text.length);
      if (result.pageCount) {
        setPageCount(result.pageCount);
      }

      onDocumentExtracted(result.text, file.name);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err?.message || 'Failed to extract text from document. Please try another file or paste text.');
      setFileName(null);
      setFileSize(null);
      setCharCount(null);
      setPageCount(null);
      onDocumentRemoved();
    } finally {
      setIsProcessing(false);
      if (onProcessingChange) onProcessingChange(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setFileSize(null);
    setCharCount(null);
    setPageCount(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onDocumentRemoved();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-stone-900 uppercase text-xs sm:text-sm">
          Source Material / Document {required ? '*' : '(Optional)'}
        </label>
        {fileName && (
          <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Loaded
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${toolName || 'source'}`}
      />

      {!fileName ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#D63651] bg-[#D63651]/5'
              : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 text-stone-600">
              <Loader2 className="w-6 h-6 animate-spin text-[#D63651]" />
              <span className="font-mono text-xs font-bold">Extracting document text...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center">
                <FileUp className="w-5 h-5" />
              </div>
              <p className="font-mono text-xs font-bold text-stone-900">
                Click or drag & drop PDF / text document
              </p>
              <p className="font-mono text-[11px] text-stone-500">
                Supports .PDF, .TXT, .MD (Up to 25 pages extracted)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold text-stone-900 truncate">{fileName}</p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                {fileSize && <span>{fileSize}</span>}
                {pageCount && <span>• {pageCount} pages</span>}
                {charCount && <span>• ~{Math.round(charCount / 5)} words</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            title="Remove document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
