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
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { StudyPackResource } from '../../types';
import { GRADE_LEVELS } from '../../data/subjects';
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
    const text = `# ${studyPack.title}\nSource: ${studyPack.sourceDocumentName || studyPack.sourceDocName}\n\n` +
      `### OVERVIEW\n${studyPack.overview || studyPack.documentOverview}\n\n` +
      `### HIGH-YIELD TAKEAWAYS\n${(studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints || []).map(t => `- ${t}`).join('\n')}\n\n` +
      `### ESSENTIAL GLOSSARY\n${studyPack.essentialGlossary?.map(g => `**${g.term}**: ${g.definition}`).join('\n')}\n\n` +
      `### SELF-CHECK QUESTIONS\n${studyPack.selfCheckQuestions?.map((q, idx) => `${idx + 1}. ${q.question}\n> Answer: ${q.answer}`).join('\n\n')}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
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
              <span className="w-2 h-2 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956]">
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
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-[#E63956]" />}
              <span>{saved ? 'Saved!' : 'Save Build'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E63956]" />
              <span>Upload Document</span>
            </h2>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 block">
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

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Target Grade / Comprehension Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {GRADE_LEVELS.map((gl) => (
                  <option key={gl} value={gl}>
                    {gl}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-sm font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Analyzing & Synthesizing...' : 'Generate Study Pack'}</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          {studyPack ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 space-y-2">
                <div className="font-mono text-xs font-bold text-stone-500 uppercase">
                  SOURCE: {studyPack.sourceDocumentName || studyPack.sourceDocName}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {studyPack.title}
                </h2>
              </div>

              {/* Overview */}
              <div className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider text-stone-800">
                  <BookOpen className="w-4 h-4 text-[#E63956]" />
                  <span>EXECUTIVE OVERVIEW:</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-stone-800 leading-relaxed">
                  {studyPack.overview || studyPack.documentOverview}
                </p>
              </div>

              {/* High Yield Takeaways */}
              {((studyPack.highYieldTakeaways && studyPack.highYieldTakeaways.length > 0) || (studyPack.highYieldRevisionPoints && studyPack.highYieldRevisionPoints.length > 0)) && (
                <div className="space-y-3">
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span>High-Yield Revision Points</span>
                  </h3>
                  <div className="space-y-2">
                    {(studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints || []).map((point, idx) => (
                      <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl font-sans text-xs sm:text-sm text-stone-800 flex items-start gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#E63956]">{idx + 1}.</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glossary */}
              {studyPack.essentialGlossary && studyPack.essentialGlossary.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#161616]">
                    Key Terms & Essential Glossary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studyPack.essentialGlossary.map((g, idx) => (
                      <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                        <div className="font-mono text-xs font-black text-stone-900 uppercase">
                          {g.term}
                        </div>
                        <div className="font-sans text-xs text-stone-700 leading-relaxed">
                          {g.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Self Check Questions */}
              {studyPack.selfCheckQuestions && studyPack.selfCheckQuestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <span>Self-Check Verification Questions</span>
                  </h3>
                  <div className="space-y-3">
                    {studyPack.selfCheckQuestions.map((q, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="font-sans text-xs font-bold text-stone-900">
                          {idx + 1}. {q.question}
                        </div>
                        <div className="p-2.5 bg-white border border-emerald-200 rounded-lg font-sans text-xs text-emerald-900">
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
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Study Pack Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Upload any textbook excerpt, lecture document, or syllabus on the left and click <strong>Generate Study Pack</strong> to synthesize an executive overview, glossary, and review items.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
