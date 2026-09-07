import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shuffle,
  Eye,
  Download
} from 'lucide-react';
import { FlashcardResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface FlashcardGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: FlashcardResult;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [count, setCount] = useState<number>(existingResource?.cards?.length || 8);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Generation & Active Play State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<FlashcardResult | null>(
    existingResource && Array.isArray(existingResource.cards) && existingResource.cards.length > 0
      ? existingResource
      : null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source notes.');
      return;
    }

    if (!canAfford('QUIZ_FLASHCARDS')) {
      setError('Insufficient credits for Flashcards. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(0);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Active Recall Flashcards',
        category,
        gradeLevel,
        count,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('flashcards', input)) as FlashcardResult;
      setFlashcards(result);
      await consumeCredits('QUIZ_FLASHCARDS', `Generated Flashcards: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.cards.length);
  };

  const handlePrev = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.cards.length) % flashcards.cards.length);
  };

  const handleShuffle = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length === 0) return;
    const shuffled = [...flashcards.cards].sort(() => Math.random() - 0.5);
    setFlashcards({ ...flashcards, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  };

  const handleCopy = () => {
    if (!flashcards || !Array.isArray(flashcards.cards)) return;
    const text = flashcards.cards
      .map((c, i) => `Card ${i + 1}\nFront: ${c.front}\nBack: ${c.back}\n${c.hint ? `Hint: ${c.hint}\n` : ''}`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!flashcards) return;
    const blob = new Blob([JSON.stringify(flashcards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flashcards.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flashcards.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCard = flashcards?.cards?.[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                STUDY TOOL 03
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              FLASHCARD GENERATOR
            </h1>
          </div>
        </div>

        {flashcards && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleShuffle}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
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
      );
    };
