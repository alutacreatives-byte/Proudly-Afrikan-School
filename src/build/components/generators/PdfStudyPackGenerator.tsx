import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PdfStudyPackResult } from '../../types';
import { generatePdfStudyPack } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface PdfStudyPackGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: PdfStudyPackResult;
}

export const PdfStudyPackGenerator: React.FC<PdfStudyPackGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || existingResource?.sourceDocumentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [studyPack, setStudyPack] = useState<PdfStudyPackResult | null>(
    existingResource && (existingResource.highYieldTakeaways || existingResource.highYieldRevisionPoints)
      ? existingResource
      : null
  );
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGenerate = async () => {
    if (!sourceMaterial.trim() || sourceMaterial.trim().length < 20) {
      setError('Please upload a PDF document or paste at least 20 characters of study text.');
      return;
    }

    if (!canAfford('PDF_STUDY_PACK')) {
      setError('Insufficient credits for PDF Study Pack generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generatePdfStudyPack({
        sourceDocName: sourceFileName || 'Curriculum_Document.pdf',
        extractedText: sourceMaterial.trim(),
        gradeLevel,
      });

      setStudyPack(result);
      await consumeCredits('PDF_STUDY_PACK', `Generated Study Pack from ${sourceFileName || 'Document'}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Study pack synthesis failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!studyPack) return;
    saveResourceToStorage({
      id: studyPack.id || `sp-${Date.now()}`,
      toolType: 'pdf-studypack',
      title: studyPack.title,
      subject: 'PDF Study Pack',
      topic: sourceFileName || 'Document Analysis',
      createdAt: new Date().toISOString(),
      data: studyPack,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!studyPack) return;
    let text = `${studyPack.title.toUpperCase()}\n`;
    text += `Source Document: ${studyPack.sourceDocumentName || studyPack.sourceDocName || 'Document'}\n`;
    text += `Grade Level: ${studyPack.gradeLevel}\n\n`;

    text += `EXECUTIVE OVERVIEW:\n${studyPack.overview || studyPack.documentOverview}\n\n`;

    const points = studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints || [];
    text += `HIGH-YIELD REVISION POINTS:\n`;
    points.forEach((p, i) => {
      text += `${i + 1}. ${p}\n`;
    });
    text += `\n`;

    text += `ESSENTIAL GLOSSARY:\n`;
    (studyPack.essentialGlossary || []).forEach((item) => {
      text += `- ${item.term}: ${item.definition} (${item.context || ''})\n`;
    });
    text += `\n`;

    text += `SELF-CHECK QUESTIONS:\n`;
    (studyPack.selfCheckQuestions || []).forEach((q, i) => {
      text += `Q${i + 1}: ${q.question}\nAnswer: ${q.answer}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05A2B]/10 text-[#E05A2B] font-mono text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>40 Credits / Pack</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Document Intelligence
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <FileText className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Document Architecture</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          PDF & Document High-Yield Study Pack
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Upload any PDF, textbook chapter, or curriculum paper to automatically generate a structured executive synopsis, high-yield revision points, an essential domain glossary, and interactive self-check questions.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Upload Document & Select Target Level</span>
        </h2>

        <div className="space-y-1.5">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Target Grade / Reader Level
          </label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
          >
            <option value="Junior Secondary / Middle School (Grades 6-8)">Junior Secondary (Grades 6-8)</option>
            <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
            <option value="Undergraduate / Tertiary Level">Undergraduate / Tertiary Level</option>
            <option value="Professional & Scholar">Professional & Academic Scholar</option>
          </select>
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            PDF Document or Text Source *
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
              <span>Analyzing Document & Synthesizing Study Pack...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate High-Yield Study Pack (40 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Study Pack Output */}
      {studyPack && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <span className="font-mono text-xs font-bold text-stone-600 uppercase">
              Document: {studyPack.sourceDocumentName || studyPack.sourceDocName || 'Processed File'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Pack'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pack</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Study Pack'}</span>
              </button>
            </div>
          </div>

          {/* Printable Sheet */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-stone-900 pb-5 space-y-2">
              <div className="font-mono font-bold text-xs text-[#E05A2B] uppercase tracking-wider">
                COMPREHENSIVE CURRICULUM STUDY PACK
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
                {studyPack.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-stone-600 uppercase">
                <span>SOURCE: {studyPack.sourceDocumentName || studyPack.sourceDocName}</span>
                <span>•</span>
                <span>TARGET LEVEL: {studyPack.gradeLevel}</span>
              </div>
            </div>

            {/* Overview / Synopsis */}
            <div className="space-y-3">
              <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#E05A2B]" />
                <span>Executive Overview & Synopsis</span>
              </h3>
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-stone-800 text-sm leading-relaxed font-medium">
                {studyPack.overview || studyPack.documentOverview}
              </div>
            </div>

            {/* High-Yield Takeaways */}
            <div className="space-y-3">
              <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E05A2B]" />
                <span>High-Yield Core Revision Takeaways</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(studyPack.highYieldTakeaways || studyPack.highYieldRevisionPoints || []).map((point, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-stone-200 bg-white flex items-start gap-3 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-stone-800 text-xs font-medium leading-relaxed">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Essential Glossary */}
            {studyPack.essentialGlossary && studyPack.essentialGlossary.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-stone-900">
                  Essential Terminology & Conceptual Glossary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studyPack.essentialGlossary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-1"
                    >
                      <div className="font-display font-black text-xs uppercase tracking-wider text-stone-900">
                        {item.term}
                      </div>
                      <div className="text-xs text-stone-700 font-medium leading-relaxed">
                        {item.definition}
                      </div>
                      {item.context && (
                        <div className="text-[11px] text-stone-500 italic pt-0.5">
                          Context: {item.context}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self-Check Questions */}
            {studyPack.selfCheckQuestions && studyPack.selfCheckQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-stone-900">
                  Self-Check Mastery Questions
                </h3>
                <div className="space-y-3">
                  {studyPack.selfCheckQuestions.map((q, idx) => {
                    const isRevealed = revealedAnswers[idx];
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono font-black text-xs text-[#E05A2B] shrink-0 mt-0.5">
                              Q{idx + 1}.
                            </span>
                            <span className="text-sm font-medium text-stone-900">
                              {q.question}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleAnswer(idx)}
                            className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold flex items-center gap-1 shrink-0 print:hidden cursor-pointer"
                          >
                            <span>{isRevealed ? 'Hide Answer' : 'Show Answer'}</span>
                            {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Answer block */}
                        {(isRevealed || true) && (
                          <div
                            className={`p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium ${
                              isRevealed ? 'block' : 'hidden print:block'
                            }`}
                          >
                            <strong>Model Answer:</strong> {q.answer}
                            {q.hint && (
                              <div className="text-emerald-800 text-[11px] italic mt-1">
                                Hint: {q.hint}
                              </div>
                            )}
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
      )}
    </div>
  );
};
