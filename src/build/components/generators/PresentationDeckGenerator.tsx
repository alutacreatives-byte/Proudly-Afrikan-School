import React, { useState } from 'react';
import {
  Presentation,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  ArrowLeft,
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Image as ImageIcon,
  Grid
} from 'lucide-react';
import { PresentationBuildResult, PresentationBuildSlide } from '../../types';
import { generatePresentation } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface PresentationDeckGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: PresentationBuildResult;
}

export const PresentationDeckGenerator: React.FC<PresentationDeckGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [audienceLevel, setAudienceLevel] = useState<string>(existingResource?.targetAudience || 'Senior Secondary / High School (Grades 9-12)');
  const [slidesCount, setSlidesCount] = useState<number>(existingResource?.slidesCount || 6);
  const [presentationStyle, setPresentationStyle] = useState<string>(existingResource?.themeOrColorMood || 'Educational Lecture & Discussion');
  const [keyPoints, setKeyPoints] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [deck, setDeck] = useState<PresentationBuildResult | null>(
    existingResource && Array.isArray(existingResource.slides) && existingResource.slides.length > 0
      ? existingResource
      : null
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please provide a presentation topic or upload curriculum source material.');
      return;
    }

    if (!canAfford('PRESENTATION')) {
      setError('Insufficient credits for Presentation Slide Deck. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generatePresentation({
        subject,
        topic: topic.trim() || 'Curriculum Slide Presentation',
        audienceLevel,
        slidesCount,
        presentationStyle,
        keyPoints: keyPoints.trim() || undefined,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setDeck(result);
      setCurrentSlideIndex(0);
      await consumeCredits('PRESENTATION', `Generated Slide Deck: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Presentation generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!deck) return;
    saveResourceToStorage({
      id: deck.id || `pres-${Date.now()}`,
      toolType: 'presentation',
      title: deck.title,
      subject: deck.subject || subject,
      topic: deck.topic || topic,
      createdAt: new Date().toISOString(),
      data: deck,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!deck) return;
    let text = `${deck.title.toUpperCase()}\n`;
    if (deck.subtitle) text += `${deck.subtitle}\n`;
    text += `Subject: ${deck.subject} | Audience: ${deck.targetAudience}\n\n`;

    (deck.slides || []).forEach((s) => {
      text += `=========================================\n`;
      text += `SLIDE ${s.slideNumber}: ${s.title.toUpperCase()}\n`;
      if (s.subtitle) text += `${s.subtitle}\n`;
      text += `-----------------------------------------\n`;
      (s.bulletPoints || []).forEach((bp) => {
        text += `• ${bp}\n`;
      });
      if (s.speakerNotes) {
        text += `\nSPEAKER NOTES: ${s.speakerNotes}\n`;
      }
      if (s.suggestedVisualOrDiagram) {
        text += `VISUAL CUE: ${s.suggestedVisualOrDiagram}\n`;
      }
      if (s.discussionOrEngagementPrompt) {
        text += `DISCUSSION PROMPT: ${s.discussionOrEngagementPrompt}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSlide: PresentationBuildSlide | undefined = deck?.slides?.[currentSlideIndex];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05A2B]/10 text-[#E05A2B] font-mono text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>50 Credits / Deck</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Slide Design
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <Presentation className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Presentation Designer</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          Presentation Slide Deck Generator
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Create complete, modular classroom lecture slides with structured bullet points, speaker guidance notes, visual/diagram suggestions, and interactive audience inquiry prompts.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Configure Slide Deck Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="AFRICAN HISTORY">African History & Archaeology</option>
              <option value="PAN-AFRICAN GEOPOLITICS">Pan-African Geopolitics & Governance</option>
              <option value="PHYSICAL SCIENCES">Physical Sciences & Renewable Energy</option>
              <option value="LIFE SCIENCES">Life Sciences & Biodiversity</option>
              <option value="MATHEMATICS & COMPUTING">Mathematics & Computing</option>
              <option value="AFRICAN LITERATURE">African Literature & Cultural Philosophy</option>
              <option value="ECONOMICS & INNOVATION">Economics & Pan-African Innovation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Presentation Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Mansa Musa & The Mali Empire's Trade Networks"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Target Audience Level
            </label>
            <select
              value={audienceLevel}
              onChange={(e) => setAudienceLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Junior Secondary (Grades 6-8)">Junior Secondary (Grades 6-8)</option>
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
              <option value="Undergraduate / University Seminar">Undergraduate / University Seminar</option>
              <option value="Educator / Teacher Training Workshop">Educator / Teacher Training Workshop</option>
              <option value="Community & Public Lecture">Community & Public Lecture</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Total Slides
            </label>
            <select
              value={slidesCount}
              onChange={(e) => setSlidesCount(Number(e.target.value) || 6)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value={4}>4 Slides (Executive Summary)</option>
              <option value={6}>6 Slides (Standard Lecture Deck)</option>
              <option value={8}>8 Slides (Detailed Module)</option>
              <option value={10}>10 Slides (Comprehensive Masterclass)</option>
            </select>
          </div>
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Source Material / Notes / Article (Optional)
          </label>
          <SourceMaterialUpload
            sourceMaterial={sourceMaterial}
            sourceFileName={sourceFileName}
            onTextExtracted={(text, filename) => {
              setSourceMaterial(text);
              if (filename) setSourceFileName(filename);
            }}
            onClear={() => {
              setSourceMaterial('');
              setSourceFileName('');
            }}
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-[#E05A2B] hover:bg-[#c94d22] text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Designing Presentation Deck & Speaker Notes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Presentation Deck (50 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Deck Display View */}
      {deck && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              {/* Toggle Carousel vs Grid */}
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Presenter View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All Slides Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-display font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                {showSpeakerNotes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSpeakerNotes ? 'Hide Notes' : 'Show Notes'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Deck'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slides</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Deck'}</span>
              </button>
            </div>
          </div>

          {/* Carousel Mode */}
          {viewMode === 'carousel' && currentSlide && (
            <div className="space-y-4 print:hidden">
              {/* Slide Screen (16:9 Aspect Ratio Frame) */}
              <div className="relative w-full rounded-3xl bg-[#18181B] text-white p-8 sm:p-14 shadow-xl border border-stone-800 min-h-[400px] sm:min-h-[480px] flex flex-col justify-between overflow-hidden">
                {/* Decorative background badge */}
                <div className="absolute top-6 right-8 font-mono text-xs font-bold text-stone-500 uppercase tracking-widest">
                  SLIDE {currentSlide.slideNumber} OF {deck.slides?.length || 1}
                </div>

                {/* Slide content top */}
                <div className="space-y-3 max-w-3xl">
                  <span className="font-mono text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#E05A2B]/20 text-[#E05A2B]">
                    {deck.subject}
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-white">
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle && (
                    <p className="text-stone-400 text-sm sm:text-base font-medium">
                      {currentSlide.subtitle}
                    </p>
                  )}
                </div>

                {/* Slide bullet points */}
                <div className="my-8 space-y-3 max-w-3xl">
                  {(currentSlide.bulletPoints || []).map((bp, bpIdx) => (
                    <div key={bpIdx} className="flex items-start gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E05A2B] mt-2 shrink-0" />
                      <span className="text-base sm:text-lg text-stone-200 font-medium leading-relaxed">
                        {bp}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Slide footer */}
                <div className="pt-6 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400 uppercase">
                  <span>PROUDLY AFRIKAN EDUCATIONAL SUITE</span>
                  <span>{deck.title}</span>
                </div>
              </div>

              {/* Slide Navigation Controls */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-bold uppercase flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Slide</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {(deck.slides || []).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                        idx === currentSlideIndex
                          ? 'bg-[#E05A2B] w-6'
                          : 'bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlideIndex((prev) => Math.min((deck.slides?.length || 1) - 1, prev + 1))
                  }
                  disabled={currentSlideIndex === (deck.slides?.length || 1) - 1}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-bold uppercase flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Speaker Notes & Visual Cue Details */}
              {showSpeakerNotes && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Speaker Notes */}
                  <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 font-display font-black text-xs uppercase tracking-wider text-amber-900">
                      <MessageSquare className="w-4 h-4 text-amber-700" />
                      <span>Speaker Delivery Notes (Slide {currentSlide.slideNumber})</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-medium">
                      {currentSlide.speakerNotes || 'Speak clearly, allowing scholars to absorb the core bullet items before initiating discussion.'}
                    </p>
                  </div>

                  {/* Visual Cues & Discussion */}
                  <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3">
                    {currentSlide.suggestedVisualOrDiagram && (
                      <div className="space-y-1">
                        <div className="font-display font-bold text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Visual Cue</span>
                        </div>
                        <p className="text-xs text-indigo-950 font-medium">
                          {currentSlide.suggestedVisualOrDiagram}
                        </p>
                      </div>
                    )}
                    {currentSlide.discussionOrEngagementPrompt && (
                      <div className="space-y-1 pt-1 border-t border-indigo-200/60">
                        <div className="font-display font-bold text-xs uppercase tracking-wider text-indigo-900">
                          Inquiry Prompt:
                        </div>
                        <p className="text-xs text-indigo-950 italic">
                          "{currentSlide.discussionOrEngagementPrompt}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grid / Handout View (Always used for printing!) */}
          <div className={`space-y-6 ${viewMode === 'grid' ? 'block' : 'hidden print:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
              {(deck.slides || []).map((slide) => (
                <div
                  key={slide.id || slide.slideNumber}
                  className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm space-y-4 print:border-stone-800 print:shadow-none"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-mono font-bold text-xs text-[#E05A2B]">
                      SLIDE {slide.slideNumber}
                    </span>
                    <span className="font-mono text-xs text-stone-500 uppercase">
                      {deck.subject}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-black text-lg uppercase text-stone-900">
                      {slide.title}
                    </h3>
                    {slide.subtitle && (
                      <p className="text-xs text-stone-600 font-medium">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {(slide.bulletPoints || []).map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-stone-800 font-medium leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B] mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {slide.speakerNotes && (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-700">
                      <strong>Notes:</strong> {slide.speakerNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
