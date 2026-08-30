import React, { useState } from 'react';
import {
  Presentation,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Printer,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { PresentationResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface PresentationGeneratorProps {
  initialTopic?: string;
  onBack: () => void;
  onSave: (pres: PresentationResource) => void;
  existingResource?: PresentationResource;
}

export const PresentationGenerator: React.FC<PresentationGeneratorProps> = ({
  initialTopic = '',
  onBack,
  onSave,
  existingResource,
}) => {
  const [subject, setSubject] = useState(existingResource?.subject || 'Mathematics & Science');
  const [topic, setTopic] = useState(existingResource?.topic || initialTopic);
  const [audienceLevel, setAudienceLevel] = useState(
    existingResource?.targetAudience || existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)'
  );
  const [slidesCount, setSlidesCount] = useState(existingResource?.slidesCount || 6);
  const [presentationStyle, setPresentationStyle] = useState(
    existingResource?.themeOrColorMood || 'Educational Lecture & Discussion'
  );
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPres, setGeneratedPres] = useState<PresentationResource | null>(
    existingResource || null
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      setValidationError('Please select a Subject and provide a Presentation Topic.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          audienceLevel,
          slidesCount,
          presentationStyle,
          sourceMaterial,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedPres(resData.data);
        setActiveSlideIndex(0);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Presentation fallback used:', err);
      const fallback: PresentationResource = {
        id: `pres-${Date.now()}`,
        toolType: 'presentation',
        title: `Mastery Presentation: ${topic}`,
        subtitle: `Pedagogical insights and practical frameworks for ${topic}`,
        subject,
        topic,
        targetAudience: audienceLevel,
        gradeLevel: audienceLevel,
        themeOrColorMood: presentationStyle,
        slidesCount: Number(slidesCount) || 6,
        slides: [
          {
            id: 's-1',
            slideNumber: 1,
            title: `Introduction to ${topic}`,
            subtitle: 'Core Foundations & Historical Context',
            bulletPoints: [
              `Defining the scope and importance of ${topic}`,
              'Historical trajectory and evolution of fundamental theories',
              'Key inquiry question driving today’s session',
            ],
            speakerNotes: 'Begin by engaging the audience with the central dilemma before diving into technical terminology.',
            suggestedVisualOrDiagram: 'Timeline infographic illustrating evolutionary milestones',
            discussionOrEngagementPrompt: 'What preconceptions do you hold regarding this topic?',
          },
          {
            id: 's-2',
            slideNumber: 2,
            title: 'Mechanisms and Theoretical Frameworks',
            subtitle: 'Underlying Laws & Dynamics',
            bulletPoints: [
              'System components and their mathematical/relational dependencies',
              'Feedback loops and stability conditions',
              'Primary equations or domain models',
            ],
            speakerNotes: 'Highlight the distinction between open and closed systems when analyzing these dependencies.',
            suggestedVisualOrDiagram: 'Block diagram with arrows representing interactive force vectors',
            discussionOrEngagementPrompt: 'How does an external perturbation shift system equilibrium?',
          },
          {
            id: 's-3',
            slideNumber: 3,
            title: 'Applied Case Studies & Future Horizons',
            subtitle: 'African & Global Contexts',
            bulletPoints: [
              'Real-world implementation in regional development',
              'Technological and economic scalability',
              'Summary takeaway and collaborative reflection',
            ],
            speakerNotes: 'Close by summarizing the 3 core pillars and inviting peer questions.',
            suggestedVisualOrDiagram: 'Comparative matrix table',
            discussionOrEngagementPrompt: 'How would you apply this model in your community?',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      setGeneratedPres(fallback);
      setActiveSlideIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPres) return;
    let text = `${generatedPres.title.toUpperCase()}\n`;
    if (generatedPres.subtitle) text += `${generatedPres.subtitle}\n`;
    text += `SUBJECT: ${generatedPres.subject} | AUDIENCE: ${generatedPres.targetAudience || generatedPres.gradeLevel}\n\n`;

    generatedPres.slides.forEach((s) => {
      text += `=== SLIDE ${s.slideNumber}: ${s.title.toUpperCase()} ===\n`;
      if (s.subtitle) text += `Subtitle: ${s.subtitle}\n`;
      s.bulletPoints.forEach((bp) => (text += `  • ${bp}\n`));
      if (s.speakerNotes) text += `\nSpeaker Notes: ${s.speakerNotes}\n`;
      if (s.discussionOrEngagementPrompt) text += `Discussion: ${s.discussionOrEngagementPrompt}\n`;
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <button
          onClick={onBack}
          className="clay-pill-3d px-4 py-2 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-stone-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#D63651]" />
          <span>BACK TO BUILD</span>
        </button>

        <span className="clay-btn-dark px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
          TOOL 06: PRESENTATION GENERATOR
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedPres ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <Presentation className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">Presentation</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">Slides with speaker notes & visuals</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs sm:text-sm">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-[#D63651] text-[#D63651] flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Discipline Category *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                >
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Presentation Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Clean Energy Transition, Neural Networks, African Trade..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Audience Level</label>
                  <select
                    value={audienceLevel}
                    onChange={(e) => setAudienceLevel(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary</option>
                    <option value="Tertiary / Undergraduate">Undergraduate</option>
                    <option value="Executive / Professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Slide Count</label>
                  <select
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(Number(e.target.value))}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value={4}>4 Slides (Brief)</option>
                    <option value={6}>6 Slides (Standard)</option>
                    <option value={8}>8 Slides (Detailed)</option>
                    <option value={10}>10 Slides (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <SourceMaterialUpload
                toolName="presentation"
                onProcessingChange={(p) => setIsProcessingDoc(p)}
                onDocumentExtracted={(txt) => setSourceMaterial(txt)}
                onDocumentRemoved={() => setSourceMaterial('')}
              />

              <button
                type="submit"
                disabled={isGenerating || isProcessingDoc}
                className="w-full clay-btn-crimson py-3.5 px-5 font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'GENERATING SLIDES...' : 'BUILD PRESENTATION'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-8 ${!generatedPres ? 'hidden lg:block' : ''}`}>
          {generatedPres ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 print:hidden">
                <span className="font-mono text-xs font-bold text-stone-600">
                  {generatedPres.slides.length} SLIDES GENERATED
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1 font-mono text-xs font-bold"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotification ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSave(generatedPres)}
                    className="clay-btn-crimson px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE TO VAULT</span>
                  </button>
                </div>
              </div>

              {/* Active Slide Viewer */}
              {generatedPres.slides[activeSlideIndex] && (
                <div className="space-y-6">
                  {/* Slide Container (16:9 aspect styling) */}
                  <div className="bg-[#181716] text-[#FAF7F0] rounded-3xl p-6 sm:p-10 min-h-[340px] flex flex-col justify-between shadow-xl relative overflow-hidden border border-stone-900">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D63651]/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div>
                      <div className="flex justify-between items-center pb-4 mb-4 border-b border-stone-800 text-xs font-mono text-[#D63651] font-bold">
                        <span>SLIDE {generatedPres.slides[activeSlideIndex].slideNumber} OF {generatedPres.slides.length}</span>
                        <span className="text-stone-400">{generatedPres.subject}</span>
                      </div>

                      <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-1">
                        {generatedPres.slides[activeSlideIndex].title}
                      </h2>
                      {generatedPres.slides[activeSlideIndex].subtitle && (
                        <p className="font-mono text-xs sm:text-sm text-stone-400 mb-6 font-semibold">
                          {generatedPres.slides[activeSlideIndex].subtitle}
                        </p>
                      )}

                      <ul className="space-y-3 font-mono text-xs sm:text-sm text-stone-200">
                        {generatedPres.slides[activeSlideIndex].bulletPoints.map((bp, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#D63651] mt-1.5 shrink-0"></span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {generatedPres.slides[activeSlideIndex].suggestedVisualOrDiagram && (
                      <div className="mt-6 pt-4 border-t border-stone-800 text-stone-400 font-mono text-[11px]">
                        <span className="text-[#D63651] font-bold">Visual Cue:</span> {generatedPres.slides[activeSlideIndex].suggestedVisualOrDiagram}
                      </div>
                    )}
                  </div>

                  {/* Navigation Slider Pills */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      disabled={activeSlideIndex === 0}
                      onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                      className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {generatedPres.slides.map((s, idx) => (
                        <button
                          key={s.id || idx}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                            activeSlideIndex === idx
                              ? 'bg-[#D63651] text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={activeSlideIndex === generatedPres.slides.length - 1}
                      onClick={() => setActiveSlideIndex((prev) => Math.min(generatedPres.slides.length - 1, prev + 1))}
                      className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Speaker Notes & Discussion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedPres.slides[activeSlideIndex].speakerNotes && (
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-1 font-mono text-xs">
                        <span className="font-bold text-stone-900 uppercase">Speaker Talking Points</span>
                        <p className="text-stone-700">{generatedPres.slides[activeSlideIndex].speakerNotes}</p>
                      </div>
                    )}

                    {generatedPres.slides[activeSlideIndex].discussionOrEngagementPrompt && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 font-mono text-xs">
                        <span className="font-bold text-amber-900 uppercase">Audience Discussion Prompt</span>
                        <p className="text-amber-800">{generatedPres.slides[activeSlideIndex].discussionOrEngagementPrompt}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <Presentation className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Configure slide presentation
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                Build educational lecture decks with visual suggestions, speaker scripts, and engagement triggers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
