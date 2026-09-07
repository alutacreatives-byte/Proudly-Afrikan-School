import React, { useState } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileText,
  Download
} from 'lucide-react';
import { PresentationResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyPresentationGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: PresentationResult;
}

export const StudyPresentationGenerator: React.FC<StudyPresentationGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [count, setCount] = useState<number>(existingResource?.slides?.length || 6);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Generation & Active Deck State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [presentation, setPresentation] = useState<PresentationResult | null>(
    existingResource && Array.isArray(existingResource.slides) && existingResource.slides.length > 0
      ? existingResource
      : null
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a presentation topic or upload source notes.');
      return;
    }

    if (!canAfford('PRESENTATION')) {
      setError('Insufficient credits for Presentation generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setActiveSlideIndex(0);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Academic Presentation',
        category,
        gradeLevel,
        count,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('presentation', input)) as PresentationResult;
      setPresentation(result);
      await consumeCredits('PRESENTATION', `Generated Presentation: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextSlide = () => {
    if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % presentation.slides.length);
  };

  const handlePrevSlide = () => {
    if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + presentation.slides.length) % presentation.slides.length);
  };

  };

  const handleCopy = () => {
    if (!presentation || !Array.isArray(presentation.slides)) return;
    let text = `# ${presentation.title}\nSubtitle: ${presentation.subtitle || ''}\nSubject: ${presentation.subject || category}\n\n`;
    presentation.slides.forEach((s, idx) => {
      text += `## Slide ${idx + 1}: ${s.title}\n`;
      s.bullets.forEach((b) => (text += `- ${b}\n`));
      if (s.speakerNotes) text += `\nSpeaker Notes: ${s.speakerNotes}\n`;
      if (s.discussionPrompt) text += `Discussion Prompt: ${s.discussionPrompt}\n`;
      text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!presentation) return;
    const blob = new Blob([JSON.stringify(presentation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-slides.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentSlide = presentation?.slides?.[activeSlideIndex];

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#161616] p-8 max-w-none overflow-y-auto' : ''}`}>
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b ${isFullscreen ? 'border-stone-800' : 'border-stone-200'}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
              isFullscreen ? 'bg-stone-900 border-stone-800 text-white hover:bg-stone-800' : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                STUDY TOOL 06
              </span>
            </div>
            <h1 className={`font-display font-black text-2xl sm:text-3xl uppercase tracking-tight ${isFullscreen ? 'text-white' : 'text-[#161616]'}`}>
              PRESENTATION SLIDE GENERATOR
            </h1>
          </div>
        </div>

        {presentation && Array.isArray(presentation.slides) && presentation.slides.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Present'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFullscreen ? 'bg-stone-800 text-white border-stone-700' : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
