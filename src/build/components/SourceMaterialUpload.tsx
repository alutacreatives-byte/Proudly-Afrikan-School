import React, { useState } from 'react';
import { Upload, FileText, Check, Sparkles } from 'lucide-react';

interface SourceMaterialUploadProps {
  onContentExtracted?: (content: string, title: string) => void;
  sourceText?: string;
  onSourceTextChange?: (text: string) => void;
  currentFileName?: string;
  onTextExtracted?: (text: string, name: string) => void;
  onClear?: () => void;
  accentColor?: string;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  onContentExtracted,
  sourceText = '',
  onSourceTextChange,
  currentFileName,
  onTextExtracted,
  onClear,
  accentColor = '#E05A2B'
}) => {
  const [textInput, setTextInput] = useState(sourceText);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = () => {
    const text = onSourceTextChange ? sourceText : textInput;
    if (!text.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      if (onContentExtracted) onContentExtracted(text, currentFileName || 'Uploaded Source Material');
      if (onTextExtracted) onTextExtracted(text, currentFileName || 'Uploaded Source Material');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4" style={{ color: accentColor }} />
        <h3 className="font-display font-black text-sm uppercase text-stone-900">
          Source Material Upload / Paste {currentFileName ? `(${currentFileName})` : ''}
        </h3>
      </div>

      <textarea
        value={onSourceTextChange ? sourceText : textInput}
        onChange={(e) => {
          if (onSourceTextChange) onSourceTextChange(e.target.value);
          else setTextInput(e.target.value);
        }}
        placeholder="Paste lecture notes, article text, or source material here..."
        rows={5}
        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 resize-none"
      />

      <div className="flex justify-between items-center">
        {onClear && currentFileName && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-mono text-stone-500 hover:text-rose-600"
          >
            Clear file
          </button>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleProcess}
            disabled={(!sourceText && !textInput.trim()) || isProcessing}
            className={`px-5 py-2.5 text-white font-display text-xs font-bold uppercase rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer ${
              isProcessing
                ? 'bg-gradient-to-r from-[#E05A2B] via-[#D99B00] to-[#E05A2B] bg-[length:200%_200%] animate-gradient-flow'
                : 'bg-stone-900 hover:bg-black'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Processing source...' : 'Use Source Material →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
