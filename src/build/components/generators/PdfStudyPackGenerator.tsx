import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2 
} from 'lucide-react';
import { StudyPackResource } from '../../types';
import { GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface PdfStudyPackGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: StudyPackResource;
}

export const PdfStudyPackGenerator: React.FC<PdfStudyPackGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [sourceDocName, setSourceDocName] = useState<string>(existingResource?.sourceDocumentName || existingResource?.sourceDocName || '');
  const [extractedText, setExtractedText] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [studyPack, setStudyPack] = useState<StudyPackResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingResource) {
      setStudyPack(existingResource);
      if (existingResource.sourceDocumentName || existingResource.sourceDocName) {
        setSourceDocName(existingResource.sourceDocumentName || existingResource.sourceDocName || '');
      }
      if (existingResource.gradeLevel) setGradeLevel(existingResource.gradeLevel);
    }
  }, [existingResource]);

  const handleGenerate = async () => {
    if (!extractedText.trim() && !sourceDocName) {
      setError('Please upload or provide a source PDF/document.');
      return;
    }

    if (!canAfford('PDF_STUDY_PACK')) {
      setError('Insufficient credits for Study Pack generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
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
          extractedText: extractedText || 'Document content provided for analysis',
          gradeLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Study Pack.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated: StudyPackResource = {
          ...resData.data,
          toolType: 'pdf-studypack',
        };
        setStudyPack(generated);
        saveResourceToStorage(generated);
        if (onSaved) onSaved();
        await consumeCredits('PDF_STUDY_PACK', `Generated Study Pack: ${sourceDocName || 'Document'}`);
      } else {
        throw new Error(resData.error || 'Server returned invalid study pack format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!studyPack) return;
    saveResourceToStorage(studyPack);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!studyPack) return;
    let fullText = `${studyPack.title.toUpperCase()}\n`;
    fullText += `Source: ${studyPack.sourceDocumentName || studyPack.sourceDocName} | Grade: ${studyPack.gradeLevel}\n\n`;
    fullText += `OVERVIEW:\n${studyPack.overview || studyPack.documentOverview}\n\n`;
    const takeaways = studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints;
    if (takeaways && takeaways.length > 0) {
      fullText += `HIGH-YIELD REVISION POINTS:\n${takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`;
    }
    if (studyPack.essentialGlossary && studyPack.essentialGlossary.length > 0) {
      fullText += `ESSENTIAL GLOSSARY:\n${studyPack.essentialGlossary.map((g) => `• ${g.term}: ${g.definition}`).join('\n')}\n\n`;
    }
    if (studyPack.selfCheckQuestions && studyPack.selfCheckQuestions.length > 0) {
      fullText += `SELF-CHECK QUESTIONS:\n${studyPack.selfCheckQuestions.map((q, i) => `${i + 1}. ${q.question}\n   Answer: ${q.answer}`).join('\n')}\n`;
    }
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-base font-bold uppercase tracking-wider text-[#E63956]">
                GENERATOR 08 • PDF & DOC STUDY PACK
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Document Study Pack Builder
            </h1>
          </div>
        </div>

        {studyPack && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-base font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-base font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-base font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-[#E63956]" />}
              <span>{saved ? 'Saved!' : 'Save Build'}</span>
            </button>
          </div>
        )}
      </div>

      {/* STACKED LAYOUT: TOOL OPTIONS on top, GENERATED RESULT directly underneath */}
      <div className="flex flex-col gap-10 w-full">
        {/* Section 1: TOOL OPTIONS */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
            <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E63956]"></span>
              TOOL OPTIONS
            </h2>
            <span className="font-mono text-base text-stone-500">Document Upload & Target Level</span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
                Source Document (PDF, TXT, DOCX) *
              </label>
              <SourceMaterialUpload
                currentFileName={sourceDocName}
                onContentExtracted={(text, name) => {
                  setExtractedText(text);
                  setSourceDocName(name);
                }}
                onClear={() => {
                  setExtractedText('');
                  setSourceDocName('');
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                Target Grade / Comprehension Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {GRADE_LEVELS.map((gl) => (
                  <option key={gl} value={gl}>
                    {gl}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl font-mono text-base text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-base font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isGenerating ? 'Analyzing & Synthesizing...' : 'Generate Study Pack'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: GENERATED RESULT */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
            <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              GENERATED RESULT
            </h2>
            {studyPack && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Study Pack Ready
              </span>
            )}
          </div>

          {studyPack ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 space-y-2">
                <div className="font-mono text-sm font-bold text-stone-500 uppercase">
                  SOURCE: {studyPack.sourceDocumentName || studyPack.sourceDocName}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {studyPack.title}
                </h2>
              </div>

              {/* Overview */}
              <div className="p-6 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-sm font-black uppercase tracking-wider text-stone-800">
                  <BookOpen className="w-5 h-5 text-[#E63956]" />
                  <span>EXECUTIVE OVERVIEW:</span>
                </div>
                <p className="font-sans text-base text-stone-800 leading-relaxed">
                  {studyPack.overview || studyPack.documentOverview}
                </p>
              </div>

              {/* High Yield Takeaways */}
              {((studyPack.highYieldTakeaways && studyPack.highYieldTakeaways.length > 0) || (studyPack.highYieldRevisionPoints && studyPack.highYieldRevisionPoints.length > 0)) && (
                <div className="space-y-4">
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#161616] flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    <span>High-Yield Revision Points</span>
                  </h3>
                  <div className="space-y-3">
                    {(studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints || []).map((point, idx) => (
                      <div key={idx} className="p-4 bg-white border border-stone-200 rounded-xl font-sans text-base text-stone-800 flex items-start gap-3">
                        <span className="font-mono text-base font-bold text-[#E63956]">{idx + 1}.</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glossary */}
              {studyPack.essentialGlossary && studyPack.essentialGlossary.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#161616]">
                    Key Terms & Essential Glossary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {studyPack.essentialGlossary.map((g, idx) => (
                      <div key={idx} className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                        <div className="font-mono text-sm font-black text-stone-900 uppercase">
                          {g.term}
                        </div>
                        <div className="font-sans text-sm text-stone-700 leading-relaxed">
                          {g.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Self Check Questions */}
              {studyPack.selfCheckQuestions && studyPack.selfCheckQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#161616] flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-indigo-500" />
                    <span>Self-Check Verification Questions</span>
                  </h3>
                  <div className="space-y-4">
                    {studyPack.selfCheckQuestions.map((q, idx) => (
                      <div key={idx} className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                        <div className="font-sans text-base font-bold text-stone-900">
                          {idx + 1}. {q.question}
                        </div>
                        <div className="p-3.5 bg-white border border-emerald-200 rounded-lg font-sans text-sm text-emerald-900">
                          <span className="font-mono font-bold uppercase mr-1">Answer:</span>
                          {q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Study Pack Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Upload any textbook excerpt, lecture document, or syllabus above and click <strong>Generate Study Pack</strong> to synthesize an executive overview, glossary, and review items.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
