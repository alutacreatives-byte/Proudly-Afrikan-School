import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Bookmark, 
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shuffle,
  Eye,
  Download,
  PlusCircle,
  SlidersHorizontal
} from 'lucide-react';
import { FlashcardResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { SourceMaterialUpload } from '../../../build/components/SourceMaterialUpload';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { exportFlashcards } from '../../../utils/exportUtils';
import { useScrollToResult } from '../../../utils/useScrollToResult';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';
import { StackedFlashcardDeck } from '../StackedFlashcardDeck';

const DEFAULT_INITIAL_FLASHCARDS: FlashcardResult = {
  id: 'fc-default-african-history-stem',
  title: 'African History, STEM & Civilizations',
  subject: 'AFRICAN HISTORY',
  topic: 'African Civilizations & Scientific Innovations',
  cards: [
    {
      front: 'Kingdom of Kush & Ancient Iron Metallurgy',
      back: 'An ancient Nubian civilization renowned for advanced iron smelting blast furnaces in Meroë, independent hieroglyphic script, and royal pyramid necropolises along the Middle Nile.',
      hint: 'Located along the Nile south of Egypt; major industrial iron smelting capital.',
      category: 'AFRICAN HISTORY',
    },
    {
      front: 'Great Zimbabwe Dry-Stone Architecture',
      back: 'A medieval Shona stone city spanning 1,800 acres constructed entirely without mortar, showcasing sophisticated structural engineering, curved granite walls, and soapstone bird totems.',
      hint: 'Constructed between the 11th and 15th centuries without any bonding mortar.',
      category: 'AFRICAN HISTORY',
    },
    {
      front: 'Timbuktu Manuscripts & Astronomical Calculations',
      back: 'Hundreds of thousands of medieval scholarly texts housed at the University of Sankore covering planetary orbits, optics, mathematics, and Islamic jurisprudence.',
      hint: 'Intellectual capital of the Mali and Songhai empires.',
      category: 'SCIENCES & STEM',
    },
    {
      front: 'Axumite Coinage & Ge\'ez Script Development',
      back: 'The ancient Ethiopian empire of Axum was among the first in the ancient world to mint its own gold, silver, and bronze currency, and developed the Ge\'ez abugida writing system.',
      hint: 'Dominant trade power linking the Mediterranean and Indian Ocean.',
      category: 'CIVICS & ECONOMICS',
    },
    {
      front: 'Trans-Saharan Gold & Salt Commodity Equilibrium',
      back: 'The economic trade system where West African gold from Bambuk and Bure was exchanged weight-for-weight with desert salt slabs from Taghaza across camel caravan routes.',
      hint: 'Critical mineral balance essential for human biology and state wealth.',
      category: 'CIVICS & ECONOMICS',
    },
    {
      front: 'Nok Terracotta & Lost-Wax Casting Origins',
      back: 'Central Nigerian civilization (1500 BCE – 500 CE) that pioneered large-scale terracotta sculptures with distinctive pierced pupils and early sub-Saharan iron metallurgy.',
      hint: 'Discovered in Kaduna State, Nigeria.',
      category: 'LITERATURE & ARTS',
    },
    {
      front: 'The Nile Inundation Hydrological Cycle',
      back: 'Annual seasonal flooding driven by Ethiopian summer monsoons depositing millions of tons of nutrient-rich volcanic silt onto the Egyptian floodplains.',
      hint: 'Governed the ancient agricultural calendar and tax surveys.',
      category: 'GEOGRAPHY & ENVIRONMENT',
    },
    {
      front: 'Hypatia of Alexandria & Conic Sections',
      back: 'Leading Hellenistic philosopher, astronomer, and mathematician in Alexandria, Egypt who authored commentaries on Apollonius\'s Conics and Ptolemy\'s Almagest.',
      hint: 'Renowned Alexandria mathematician and astronomer.',
      category: 'MATHEMATICS',
    },
  ],
};

interface FlashcardGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: FlashcardResult;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  onBack,
  onGoHome,
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
  const [flashcards, setFlashcards] = useState<FlashcardResult>(() => {
    if (existingResource && Array.isArray(existingResource.cards) && existingResource.cards.length > 0) {
      return existingResource;
    }
    return DEFAULT_INITIAL_FLASHCARDS;
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const resultRef = useScrollToResult(flashcards, isGenerating);

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
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShuffle = () => {
    if (!flashcards || !Array.isArray(flashcards.cards) || flashcards.cards.length <= 1) return;
    const allCards = [...flashcards.cards];
    // Find candidate indices that are different from current index
    const candidateIndices = allCards.map((_, i) => i).filter(i => i !== currentIndex);
    const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    const chosenCard = allCards[chosenIndex];

    // Fisher-Yates shuffle the remaining cards
    const remaining = allCards.filter((_, i) => i !== chosenIndex);
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    // Set new deck with the chosen new complete card at index 0
    setFlashcards({ ...flashcards, cards: [chosenCard, ...remaining] });
    setCurrentIndex(0);
  };

  const handleSave = () => {
    if (!flashcards) return;
    saveResourceToStorage({
      id: flashcards.id || `fc-${Date.now()}`,
      toolType: 'flashcards' as any,
      title: flashcards.title,
      subject: flashcards.subject || category,
      topic: flashcards.topic || topic,
      createdAt: flashcards.createdAt || new Date().toISOString(),
      data: flashcards,
    } as any);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportDoc = () => {
    if (!flashcards) return;
    exportFlashcards(flashcards, 'doc');
  };

  const handleExportPdf = () => {
    if (!flashcards) return;
    exportFlashcards(flashcards, 'pdf');
  };

  const currentCard = flashcards?.cards?.[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
              STUDY TOOL 02
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
            FLASHCARD GENERATOR
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {flashcards && Array.isArray(flashcards.cards) && flashcards.cards.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={handleExportDoc}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download Word Document (.doc)"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                DOC
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download PDF Document (.pdf)"
              >
                <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                PDF
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {saved ? 'Saved' : 'Save Set'}
              </button>
            </div>
          )}
          <GlobalNavigationButtons
            onBack={onBack}
            onGoHome={onGoHome}
            backLabel="Back"
            homeLabel="Home"
          />
        </div>
      </div>

      {/* DOMINANT HERO ELEMENT: PHYSICAL STACKED FLASHCARDS DECK */}
      <div ref={resultRef} className="w-full flex flex-col items-center">
        <StackedFlashcardDeck
          cards={flashcards.cards}
          currentIndex={currentIndex}
          onIndexChange={(idx) => setCurrentIndex(idx)}
          onShuffle={handleShuffle}
          deckTitle={flashcards.title}
          deckCategory={flashcards.subject || category}
        />
      </div>

      {/* Quick Action Bar & Deck Creator Toggle */}
      <div className="w-full max-w-[760px] mx-auto flex items-center justify-between pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-stone-600" />
          <span>{isFormOpen ? 'Hide Deck Settings' : 'Customize & Generate New Deck'}</span>
        </button>

        <span className="font-mono text-xs text-stone-500 font-bold uppercase">
          {flashcards.title || 'Active Flashcard Set'}
        </span>
      </div>

      {/* Collapsible / Expandable Deck Customization & Generator Form */}
      {isFormOpen && (
        <div className="w-full max-w-[760px] mx-auto">
          <div className="p-6 sm:p-8 rounded-[2rem] bg-[#FAF4EC] border border-[#EFE5DA] shadow-[0_2px_10px_rgba(100,80,60,0.04),_0_12px_30px_rgba(100,80,60,0.08)] space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
              <h3 className="font-display font-black text-sm uppercase text-stone-900 tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E62E6B]" />
                <span>Customize & Generate New Deck</span>
              </h3>
              <span className="font-mono text-[11px] text-stone-500 uppercase">AI-Powered Active Recall</span>
            </div>

            <div>
              <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                Study Topic / Terminology *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Ancient Carthage Trade Networks or Molecular Biology"
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Subject
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all cursor-pointer"
                >
                  <option value="AFRICAN HISTORY">African History</option>
                  <option value="SCIENCES & STEM">Sciences & STEM</option>
                  <option value="MATHEMATICS">Mathematics</option>
                  <option value="LITERATURE & ARTS">Literature & Arts</option>
                  <option value="GEOGRAPHY & ENVIRONMENT">Geography & Environment</option>
                  <option value="CIVICS & ECONOMICS">Civics & Economics</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] sm:text-xs font-bold text-stone-600 uppercase mb-2 tracking-wider">
                  Card Count
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all cursor-pointer"
                >
                  <option value={6}>6 Flashcards (Quick Drill)</option>
                  <option value={8}>8 Flashcards (Standard Review)</option>
                  <option value={12}>12 Flashcards (Comprehensive)</option>
                  <option value={16}>16 Flashcards (Deep Recall)</option>
                </select>
              </div>
            </div>

            <div>
              <SourceMaterialUpload
                currentFileName={sourceFileName}
                onTextExtracted={(text, name) => {
                  setSourceMaterial(text);
                  setSourceFileName(name);
                }}
                onClear={() => {
                  setSourceMaterial('');
                  setSourceFileName('');
                }}
                accentColor="#E62E6B"
              />
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 bg-[#E62E6B] hover:bg-[#d8245f] text-white font-display text-sm font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>{isGenerating ? 'Generating New Flashcards...' : 'GENERATE FLASHCARD DECK'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
