import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Quote
} from 'lucide-react';
import { PdfQuizBuildResult } from '../../types';
import { generatePdfQuiz } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface PdfQuizBuildGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: PdfQuizBuildResult;
}

export const PdfQuizBuildGenerator: React.FC<PdfQuizBuildGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [totalQuestions, setTotalQuestions] = useState<number>(existingResource?.totalQuestions || 5);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || existingResource?.sourceDocumentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<PdfQuizBuildResult | null>(
    existingResource && Array.isArray(existingResource.questions) && existingResource.questions.length > 0
      ? existingResource
      : null
  );
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!sourceMaterial.trim() || sourceMaterial.trim().length < 20) {
      setError('Please upload a PDF document or paste at least 20 characters of study text.');
      return;
    }

    if (!canAfford('QUIZ_FLASHCARDS')) {
      setError('Insufficient credits for PDF Quiz generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generatePdfQuiz({
        sourceDocName: sourceFileName || 'Document_Assessment.pdf',
        extractedText: sourceMaterial.trim(),
        totalQuestions,
        difficulty,
        gradeLevel,
      });

      setQuiz(result);
      await consumeCredits('QUIZ_FLASHCARDS', `Generated PDF Assessment Quiz: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'PDF Quiz generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!quiz) return;
    saveResourceToStorage({
      id: quiz.id || `quiz-doc-${Date.now()}`,
      toolType: 'pdf-quiz',
      title: quiz.title,
      subject: 'Document Assessment',
      topic: sourceFileName || 'Document Quiz',
      createdAt: new Date().toISOString(),
      data: quiz,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!quiz) return;
    let text = `${quiz.title.toUpperCase()}\n`;
    text += `Source Document: ${quiz.sourceDocumentName || quiz.sourceDocName || 'Uploaded File'}\n`;
    text += `Grade Level: ${quiz.gradeLevel} | Rigor: ${quiz.difficulty}\n\n`;

    (quiz.questions || []).forEach((q) => {
      text += `Q${q.number}: ${q.question}\n`;
      (q.options || []).forEach((opt) => {
        text += `  ${opt}\n`;
      });
      if (showAnswers) {
        text += `  >> Correct Answer: ${q.correctAnswer}\n`;
        text += `  >> Explanation: ${q.explanation}\n`;
        if (q.sourceReferenceQuote) {
          text += `  >> Cited Quote: "${q.sourceReferenceQuote}"\n`;
        }
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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05A2B]/10 text-[#E05A2B] font-mono text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>10 Credits / Quiz</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Document Assessment
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <FileQuestion className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Grounded Assessment</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          PDF & Document to Grounded Quiz
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Upload any PDF or document to generate assessment questions grounded strictly in the source text, accompanied by exact source quotes, answer choices, and thorough pedagogical explanations.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Upload Document & Set Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Junior Secondary / Middle School (Grades 6-8)">Junior Secondary (Grades 6-8)</option>
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
              <option value="Undergraduate / Tertiary">Undergraduate / Tertiary</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Standard">Standard Comprehension</option>
              <option value="Intermediate">Intermediate Analytical</option>
              <option value="Challenging">Challenging Critical Evaluation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Total Questions
            </label>
            <select
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value) || 5)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value={5}>5 Questions (Quick Check)</option>
              <option value={10}>10 Questions (Standard Quiz)</option>
              <option value={15}>15 Questions (Thorough Assessment)</option>
            </select>
          </div>
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Source PDF Document or Notes *
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
              <span>Extracting Concepts & Formulating Grounded Quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate PDF Assessment Quiz (10 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Quiz Output Display */}
      {quiz && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAnswers(!showAnswers)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  showAnswers
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAnswers ? 'Hide Answers & Citations' : 'Show Answers & Citations'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Quiz'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Quiz</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Quiz'}</span>
              </button>
            </div>
          </div>

          {/* Printable Sheet */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-stone-900 pb-5 space-y-2">
              <div className="font-mono font-bold text-xs text-[#E05A2B] uppercase tracking-wider">
                GROUNDED DOCUMENT ASSESSMENT
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
                {quiz.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-stone-600 uppercase">
                <span>DOCUMENT: {quiz.sourceDocumentName || quiz.sourceDocName}</span>
                <span>•</span>
                <span>LEVEL: {quiz.gradeLevel}</span>
                <span>•</span>
                <span>QUESTIONS: {quiz.questions?.length || 0}</span>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {(quiz.questions || []).map((q) => (
                <div
                  key={q.id || q.number}
                  className="p-6 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {q.number}
                    </span>
                    <span className="text-sm font-semibold text-stone-900 leading-relaxed">
                      {q.question}
                    </span>
                  </div>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-9">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] text-xs text-stone-800 font-medium"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer, Explanation & Quoted Citation */}
                  {showAnswers && (
                    <div className="mt-3 ml-9 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2 animate-fadeIn text-xs">
                      <div className="flex items-center gap-1.5 font-display font-bold uppercase tracking-wider text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct Answer: {q.correctAnswer}</span>
                      </div>
                      <p className="text-emerald-950 font-medium leading-relaxed">
                        {q.explanation}
                      </p>
                      {q.sourceReferenceQuote && (
                        <div className="p-3 rounded-lg bg-emerald-100/60 border border-emerald-200/60 text-emerald-900 flex items-start gap-2 italic">
                          <Quote className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>"{q.sourceReferenceQuote}"</span>
                        </div>
                      )}
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
