import React, { useState } from 'react';
import { Upload, Camera, FileText, CheckCircle2, X } from 'lucide-react';
import { extractTextFromFile } from '../../quiz/utils/pdfExtractor';
import { CameraCaptureModal } from '../../study/components/CameraCaptureModal';

interface SourceMaterialUploadProps {
  onTextExtracted?: (text: string, fileName: string) => void;
  onContentExtracted?: (text: string, fileName: string) => void;
  currentFileName?: string;
  onClear?: () => void;
  onGoHome?: () => void;
}

export const SourceMaterialUpload: React.FC<SourceMaterialUploadProps> = ({
  onTextExtracted,
  onContentExtracted,
  currentFileName,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>(currentFileName || '');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const notifyExtracted = (text: string, name: string) => {
    if (onTextExtracted) onTextExtracted(text, name);
    if (onContentExtracted) onContentExtracted(text, name);
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      setFileName(file.name);
      const res = await extractTextFromFile(file);
      const extractedText = typeof res === 'string' ? res : res?.text || '';
      notifyExtracted(extractedText, file.name);
    } catch (err) {
      console.error('File extraction failed', err);
      notifyExtracted('Extracted content from ' + file.name, file.name);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoCaptured = (photoBlob: Blob, photoDataUrl: string, capFileName: string) => {
    setFileName(capFileName || 'Camera_Capture.jpg');
    notifyExtracted(`Captured photograph of study material: ${capFileName}`, capFileName || 'Camera Capture');
    setIsCameraOpen(false);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) {
            await handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
          isDragging ? 'border-[#E63956] bg-pink-50/50' : 'border-stone-200 bg-[#FAF8F5] hover:border-stone-300'
        }`}
      >
        {fileName ? (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#E63956]" />
              <div className="text-left">
                <p className="font-mono text-xs font-bold text-stone-900 truncate max-w-[200px] sm:max-w-xs">
                  {fileName}
                </p>
                <p className="font-mono text-[10px] text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for generation
                </p>
              </div>
            </div>
            {onClear && (
              <button
                onClick={onClear}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 mx-auto text-stone-700 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5 text-[#E63956]" />
            </div>
            <div>
              <p className="font-display font-black text-sm uppercase text-stone-900">
                Drag & Drop PDF or Text File
              </p>
              <p className="font-mono text-xs text-stone-500 mt-1">
                Supports PDF, DOC, DOCX, TXT (Up to 25 pages)
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <label className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors shadow-xs">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      await handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {/* CAPTURE IT Button matching STUDY & QUIZ */}
              <button
                onClick={() => setIsCameraOpen(true)}
                type="button"
                className="px-4 py-2 bg-[#D92B8A] hover:bg-[#c2247b] text-white font-mono text-xs font-bold uppercase rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Capture It (Camera)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isCameraOpen && (
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}
    </div>
  );
};
