import React, { useState } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PresentationResource, SlideItem } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface PresentationGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: PresentationResource;
}

export const PresentationGenerator: React.FC<PresentationGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'History & Geography');
  const [topic, setTopic] = useState<string>(existingResource?.topic || 'The Kingdom of Aksum & Ancient Trade Networks');
  const [targetAudience, setTargetAudience] = useState<string>(existingResource?.targetAudience || 'Senior Secondary / High School (Grades 9-12)');
  const [slidesCount, setSlidesCount] = useState<number>(existingResource?.slidesCount || 6);
  const [keyPoints, setKeyPoints] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [presentation, setPresentation] = useState<PresentationResource | null>(existingResource || null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a presentation topic.');
      return;
    }

    const creditCheck = await consumeCredits('PRESENTATION', `Generated Slide Deck: ${topic.slice(0, 30)}`);
    if (!creditCheck.success) {
      if (!user) {
        openAuthModal();
      } else {
        setError(creditCheck.error || 'Insufficient credits.');
      }
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          audienceLevel: targetAudience,
          slidesCount,
          keyPoints,
          sourceMaterial,
          sourceDocName: sourceFileName,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generated: PresentationResource = {
          ...json.data,
          toolType: 'presentation',
          slidesCount,
          sourceDocName: sourceFileName,
        };
        setPresentation(generated);
        setActiveSlideIndex(0);
        saveResourceToStorage(generated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to synthesize slide deck.');
      }
    } catch (err: any) {
      console.error('Presentation Generation Error:', err);
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!presentation) return;
    let text = `SLIDE DECK: ${presentation.title.toUpperCase()}\n`;
    presentation.slides.forEach((s) => {
      text += `\n--- SLIDE ${s.slideNumber}: ${s.title.toUpperCase()} ---\n`;
      if (s.subtitle) text += `${s.subtitle}\n`;
      s.bulletPoints.forEach(bp => text += `• ${bp}\n`);
      if (s.speakerNotes) text += `\nSpeaker Notes: ${s.speakerNotes}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const handleSave = () => {
    if (!presentation) return;
    saveResourceToStorage(presentation);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D8] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#161616] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Build
        </button>
        <div className="px-4 py-1.5 bg-[#161616] text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
          Tool 06: Presentation Deck
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                Build Slide Deck
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Educational slide decks with speaker notes
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Subject Category *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Presentation Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Kingdom of Aksum & Ge'ez Civilization"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Slide Count
                </label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={slidesCount}
                  onChange={(e) => setSlidesCount(Number(e.target.value))}
                  className="w-full py-2 px-2 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Key Points to Emphasize (Optional)
              </label>
              <textarea
                rows={2}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="e.g. Emphasize coinage, Red Sea trade, and obelisks..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] resize-none"
              />
            </div>

            <SourceMaterialUpload
              label="Source Material"
              optionalTag="OPTIONAL"
              currentFileName={sourceFileName}
              onTextExtracted={(text, name) => {
                setSourceMaterial(text);
                setSourceFileName(name);
              }}
              onClear={() => {
                setSourceMaterial('');
                setSourceFileName('');
              }}
            />

            {error && (
              <p className="text-xs text-red-600 font-sans p-2 rounded-xl bg-red-50 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-display font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Slide Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Slide Deck ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          {presentation ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-700">
                  {presentation.slides.length} Slide Presentation Deck
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {saved ? 'Saved' : 'Save to My Builds ↗'}
                  </button>
                </div>
              </div>

              {/* Active Slide Display Card */}
              {presentation.slides[activeSlideIndex] && (
                <div className="bg-[#161616] text-white border-4 border-stone-800 rounded-3xl p-8 sm:p-10 shadow-xl min-h-[360px] flex flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span className="text-[#D92B8A] font-bold">PROUDLY AFRIKAN LECTURE DECK</span>
                    <span>SLIDE {activeSlideIndex + 1} OF {presentation.slides.length}</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight">
                      {presentation.slides[activeSlideIndex].title}
                    </h3>
                    {presentation.slides[activeSlideIndex].subtitle && (
                      <p className="text-sm font-sans text-stone-300 font-medium">
                        {presentation.slides[activeSlideIndex].subtitle}
                      </p>
                    )}
                    <ul className="space-y-2.5 pt-2 text-sm font-sans text-stone-200">
                      {presentation.slides[activeSlideIndex].bulletPoints.map((bp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D92B8A] mt-2 shrink-0" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={activeSlideIndex === 0}
                      onClick={() => setActiveSlideIndex(prev => prev - 1)}
                      className="px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="text-xs font-mono text-stone-400">
                      {presentation.slides[activeSlideIndex].title}
                    </span>
                    <button
                      type="button"
                      disabled={activeSlideIndex === presentation.slides.length - 1}
                      onClick={() => setActiveSlideIndex(prev => prev + 1)}
                      className="px-3.5 py-1.5 rounded-full bg-[#D92B8A] hover:bg-[#c22079] disabled:opacity-30 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Speaker Notes */}
              {presentation.slides[activeSlideIndex]?.speakerNotes && (
                <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 text-xs font-sans text-stone-700 space-y-1">
                  <p className="font-mono font-bold text-[#161616] uppercase text-[11px]">
                    Speaker Discussion Notes:
                  </p>
                  <p className="leading-relaxed">
                    {presentation.slides[activeSlideIndex].speakerNotes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <Presentation className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Presentation Deck Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Enter a lecture topic to build high-impact presentation slides with speaker notes and visual discussion prompts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
