import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  BookOpen,
  Zap,
  HelpCircle,
  Key,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudyPackResource, ConceptualPillar, GlossaryTerm, SelfCheckQuestion } from '../../types';
import { GRADE_LEVELS, STUDY_PACK_FORMATS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface PdfStudyPackGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: StudyPackResource;
}

export const PdfStudyPackGenerator: React.FC<PdfStudyPackGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  // Form State
  const [sourceDocName, setSourceDocName] = useState<string>(existingResource?.sourceDocumentName || '');
  const [extractedText, setExtractedText] = useState<string>(existingResource?.extractedText || '');
  const [format, setFormat] = useState<string>(existingResource?.format || STUDY_PACK_FORMATS[0]);
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [focusArea, setFocusArea] = useState<string>(existingResource?.focusArea || '');

  // UI & Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [studyPack, setStudyPack] = useState<StudyPackResource | null>(
    existingResource || {
      id: 'sp-default',
      title: 'Human Energy Field & Biofield Science',
      sourceDocumentName: '01_Hands_of_Light__A_Guide_to_Healing_through_the_Human_Energy_Field.pdf',
      gradeLevel: 'Senior Secondary / High School (Grades 9-12)',
      format: STUDY_PACK_FORMATS[0],
      toolType: 'pdf-studypack',
      createdAt: new Date().toISOString(),
      overview: 'This comprehensive study pack synthesizes the core principles of the human biofield, auric layers, chakric energetic centers, and their physiological correlates as documented in the source text.',
      highYieldTakeaways: [
        'The human energy field (HEF) consists of seven distinct layers, each vibrating at successively higher frequencies.',
        'Chakras serve as dynamic transducers converting environmental and subtle energies into somatic and physiological responses.',
        'Distortions or blockages in the auric field precede somatic pathology, forming the theoretical basis of subtle body assessment.',
        'Observational and sensory calibration exercises allow practitioners to detect energetic boundaries and charge variations.',
      ],
      highYieldRevisionPoints: [
        'Layer 1 (Etheric Body): Directly interfaces with the physical cellular matrix and nervous system.',
        'Layer 2 (Emotional Body): Associated with feelings and emotional processing.',
        'Layer 3 (Mental Body): Governs linear thought, concepts, and belief structures.',
        'Layer 4 (Astral Body): Bridge between physical and higher spiritual planes; linked to relationship chords.',
      ],
      conceptualPillars: [
        {
          title: 'Anatomy of the Auric Field & Seven Layers',
          content: 'The source document establishes that the subtle anatomy consists of stratified energy layers surrounding and permeating the physical vehicle. Each alternating layer possesses either a structured grid or an unstructured fluid matrix.',
          subPoints: [
            'Structured odd-numbered layers (1, 3, 5, 7) provide the scaffolding for physical form.',
            'Unstructured even-numbered layers (2, 4, 6) hold fluid emotional and intuitive currents.',
          ],
        },
        {
          title: 'Chakra Vortices & Energy Transduction',
          content: 'Seven primary chakras along the central vertical axis spin clockwise to absorb universal energy fields, nourishing major endocrine glands and nerve plexuses.',
          subPoints: [
            'Base Chakra: Root grounding, survival instinct, and adrenal function.',
            'Heart Chakra: Core integration point mediating personal and transpersonal awareness.',
          ],
        },
      ],
      essentialGlossary: [
        {
          term: 'Biofield',
          definition: 'A complex organizing field of subtle energy and information that regulates biological homeostasis.',
          context: 'Section 2.1 on Energy Matrix',
        },
        {
          term: 'Chakra',
          definition: 'An energetic center or vortex responsible for drawing in and distributing vital energy currents.',
          context: 'Chapter 4 Diagnostic Framework',
        },
        {
          term: 'Aura',
          definition: 'The luminous radiation of the subtle bodies surrounding living organisms.',
          context: 'Introductory Taxonomy',
        },
      ],
      selfCheckQuestions: [
        {
          question: 'How do structured layers differ from unstructured layers in the auric field?',
          answer: 'Structured layers (1, 3, 5, 7) contain lines of light forming anatomical blueprints, while unstructured layers (2, 4, 6) consist of fluid clouds of colored energy.',
          hint: 'Think about odd vs. even numbered layers.',
        },
        {
          question: 'What is the primary function of the major chakra vortices according to the text?',
          answer: 'To intake subtle universal life energy and transduce it into biological, hormonal, and psychological systems.',
          hint: 'Energy intake and regulation.',
        },
      ],
    }
  );

  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRevealAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedText.trim()) {
      setError('Please upload a source document (PDF / DOCX / TXT) with readable text content.');
      return;
    }

    const creditCheck = await consumeCredits('PDF_STUDY_PACK', `Generated PDF Study Pack: ${sourceDocName.slice(0, 30)}`);
    if (!creditCheck.success) {
      if (!user) {
        openAuthModal();
      } else {
        setError(creditCheck.error || 'Insufficient credits. Please upgrade or refill credits.');
      }
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/pdf-studypack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDocName: sourceDocName || 'Uploaded_Document.pdf',
          extractedText,
          gradeLevel,
          format,
          focusArea,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generatedPack: StudyPackResource = {
          ...json.data,
          toolType: 'pdf-studypack',
          sourceDocumentName: sourceDocName || 'Source_Document.pdf',
          format,
          gradeLevel,
          focusArea,
          extractedText,
        };
        setStudyPack(generatedPack);
        saveResourceToStorage(generatedPack);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to synthesize study pack.');
      }
    } catch (err: any) {
      console.error('Study Pack Generation Error:', err);
      setError(err.message || 'An error occurred while building the study pack.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!studyPack) return;
    let fullText = `PROUDLY AFRIKAN STUDY PACK\n`;
    fullText += `TITLE: ${studyPack.title.toUpperCase()}\n`;
    fullText += `SOURCE DOCUMENT: ${studyPack.sourceDocumentName}\n`;
    fullText += `LEVEL: ${studyPack.gradeLevel}\n\n`;
    fullText += `EXECUTIVE SUMMARY & OVERVIEW:\n${studyPack.overview}\n\n`;

    if (studyPack.highYieldTakeaways?.length > 0) {
      fullText += `HIGH-YIELD REVISION POINTS:\n`;
      studyPack.highYieldTakeaways.forEach((pt, i) => {
        fullText += `${i + 1}. ${pt}\n`;
      });
      fullText += `\n`;
    }

    if (studyPack.conceptualPillars?.length) {
      fullText += `CORE CONCEPTUAL PILLARS:\n`;
      studyPack.conceptualPillars.forEach((p) => {
        fullText += `[${p.title}]\n${p.content}\n`;
        if (p.subPoints) {
          p.subPoints.forEach(sp => fullText += `  • ${sp}\n`);
        }
        fullText += `\n`;
      });
    }

    if (studyPack.essentialGlossary?.length) {
      fullText += `ESSENTIAL GLOSSARY:\n`;
      studyPack.essentialGlossary.forEach(g => {
        fullText += `• ${g.term}: ${g.definition}\n`;
      });
      fullText += `\n`;
    }

    if (studyPack.selfCheckQuestions?.length) {
      fullText += `SELF-CHECK QUESTIONS:\n`;
      studyPack.selfCheckQuestions.forEach((q, i) => {
        fullText += `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}\n\n`;
      });
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!studyPack) return;
    saveResourceToStorage(studyPack);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D8] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#161616] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Build
        </button>

        <div className="px-4 py-1.5 bg-[#161616] text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
          Tool 05: PDF → Study Pack
        </div>
      </div>

      {/* Main Grid: Form Left (38%) + Paper Right (62%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                PDF → Study Pack
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Synthesize structured study material
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Document Upload */}
            <SourceMaterialUpload
              label="Document Upload (PDF / DOC / DOCX)"
              required
              currentFileName={sourceDocName}
              onTextExtracted={(text, name) => {
                setExtractedText(text);
                setSourceDocName(name);
              }}
              onClear={() => {
                setExtractedText('');
                setSourceDocName('');
              }}
            />

            {/* Study Pack Format */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Study Pack Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              >
                {STUDY_PACK_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>{fmt}</option>
                ))}
              </select>
            </div>

            {/* Target Learner Level */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Target Learner Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              >
                {GRADE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Specific Focus Area */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Specific Focus Area (Optional)
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g. Chapter 3, Core Equations, High-Yield Definitions"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              />
            </div>

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
                  <span>Synthesizing Study Pack...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Study Pack From PDF ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Structured Study Pack Preview */}
        <div className="lg:col-span-7 space-y-4">
          {studyPack ? (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-700">
                    Source: {studyPack.sourceDocumentName ? (studyPack.sourceDocumentName.length > 25 ? `${studyPack.sourceDocumentName.slice(0, 25)}...` : studyPack.sourceDocumentName) : 'Document'}
                  </span>
                </div>

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

              {/* Study Pack Document Paper */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
                {/* Title and Metadata */}
                <div className="space-y-2 border-b border-stone-200 pb-5">
                  <p className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[#D92B8A]">
                    PROUDLY AFRIKAN SYNTHESIZED STUDY PACK
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616] leading-tight">
                    {studyPack.title.replace(/^Study Pack:\s*/i, '')}
                  </h1>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono text-stone-600">
                    <span className="bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                      Level: {studyPack.gradeLevel}
                    </span>
                    {studyPack.format && (
                      <span className="bg-pink-50 text-[#D92B8A] px-3 py-1 rounded-full border border-pink-200 font-bold">
                        {studyPack.format}
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. Executive Summary & Overview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#161616]">
                    <BookOpen className="w-4 h-4 text-[#D92B8A]" />
                    Executive Summary & Overview
                  </div>
                  <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-5 text-sm font-sans text-stone-800 leading-relaxed">
                    {studyPack.overview}
                  </div>
                </div>

                {/* 2. High-Yield Revision Flashpoints */}
                {((studyPack.highYieldTakeaways && studyPack.highYieldTakeaways.length > 0) ||
                  (studyPack.highYieldRevisionPoints && studyPack.highYieldRevisionPoints.length > 0)) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#161616]">
                      <Zap className="w-4 h-4 text-amber-500" />
                      High-Yield Revision Flashpoints
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {(studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints || []).map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="bg-white border border-[#E5E0D8] rounded-2xl p-4 flex items-start gap-3 shadow-2xs"
                        >
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {pIdx + 1}
                          </div>
                          <p className="text-xs sm:text-sm font-sans text-stone-900 leading-relaxed">
                            {pt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Core Conceptual Pillars */}
                {studyPack.conceptualPillars && studyPack.conceptualPillars.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#161616]">
                      <Layers className="w-4 h-4 text-[#2563EB]" />
                      Core Conceptual Pillars
                    </div>
                    <div className="space-y-3">
                      {studyPack.conceptualPillars.map((pillar, pIdx) => (
                        <div
                          key={pIdx}
                          className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-3 shadow-2xs"
                        >
                          <h4 className="font-display font-black text-sm uppercase text-[#161616]">
                            {pillar.title}
                          </h4>
                          <p className="text-xs sm:text-sm font-sans text-stone-700 leading-relaxed">
                            {pillar.content}
                          </p>
                          {pillar.subPoints && pillar.subPoints.length > 0 && (
                            <ul className="pl-4 space-y-1.5 list-disc text-xs font-sans text-stone-800 border-t border-stone-100 pt-2.5">
                              {pillar.subPoints.map((sp, spIdx) => (
                                <li key={spIdx}>{sp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Essential Glossary & Taxonomy */}
                {studyPack.essentialGlossary && studyPack.essentialGlossary.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#161616]">
                      <Key className="w-4 h-4 text-[#059669]" />
                      Essential Glossary & Taxonomy
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studyPack.essentialGlossary.map((term, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5"
                        >
                          <p className="font-bold text-xs font-mono text-[#D92B8A] uppercase">
                            {term.term}
                          </p>
                          <p className="text-xs font-sans text-stone-800 leading-snug">
                            {term.definition}
                          </p>
                          {term.context && (
                            <p className="text-[10px] font-mono text-stone-500 pt-1">
                              Ref: {term.context}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Self-Assessment & Comprehension Checkpoints */}
                {studyPack.selfCheckQuestions && studyPack.selfCheckQuestions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#161616]">
                      <HelpCircle className="w-4 h-4 text-[#9333EA]" />
                      Self-Assessment & Comprehension Checkpoints
                    </div>
                    <div className="space-y-3">
                      {studyPack.selfCheckQuestions.map((q, qIdx) => {
                        const isRevealed = revealedAnswers[qIdx];
                        return (
                          <div
                            key={qIdx}
                            className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 sm:p-5 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs sm:text-sm font-semibold text-[#161616] font-sans">
                                <span className="font-mono text-stone-500 mr-2">Q{qIdx + 1}:</span>
                                {q.question}
                              </p>
                              <button
                                type="button"
                                onClick={() => toggleRevealAnswer(qIdx)}
                                className="px-3 py-1 rounded-full bg-white border border-stone-300 text-[11px] font-mono font-bold text-stone-700 hover:text-black shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                              >
                                {isRevealed ? (
                                  <>
                                    <ChevronUp className="w-3 h-3" /> Hide Answer
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3" /> Reveal Answer
                                  </>
                                )}
                              </button>
                            </div>

                            {q.hint && !isRevealed && (
                              <p className="text-xs font-mono text-stone-500 italic">
                                Hint: {q.hint}
                              </p>
                            )}

                            {isRevealed && (
                              <div className="bg-white border border-emerald-200 rounded-xl p-3 text-xs font-mono text-stone-800 space-y-1 animate-in fade-in duration-150">
                                <p className="font-bold text-emerald-800">
                                  ✓ Model Answer:
                                </p>
                                <p className="font-normal text-stone-900 leading-relaxed font-sans text-xs">
                                  {q.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  PDF Study Pack Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Upload any textbook, lecture slides, or syllabus PDF to generate executive summaries, high-yield flashpoints, glossaries, and self-test checkpoints.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
