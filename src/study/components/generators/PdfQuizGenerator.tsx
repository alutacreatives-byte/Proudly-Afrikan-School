import React, { useState } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  RotateCcw,
  Award,
  Download,
  FileText
} from 'lucide-react';
import { PdfQuizResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface PdfQuizGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: PdfQuizResult;
}

export const PdfQuizGenerator: React.FC<PdfQuizGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Uploaded Source state
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');
  const [count, setCount] = useState<number>(existingResource?.questions?.length || 5);

  // Active quiz state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<PdfQuizResult | null>(
    existingResource && Array.isArray(existingResource.questions) && existingResource.questions.length > 0
      ? existingResource
      : null
  );
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!sourceMaterial.trim()) {
      setError('Please upload a PDF or paste your study document first.');
      return;
    }

    if (!canAfford('PDF_STUDY_PACK')) {
      setError('Insufficient credits for Document Quiz generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const input: StudyToolInput = {
        topic: sourceFileName || 'Uploaded Document Notes',
        sourceMaterial: sourceMaterial.trim(),
        fileName: sourceFileName || 'Document.pdf',
        count,
      };

      const result = (await generateStudyTool('pdf-quiz', input)) as PdfQuizResult;
      setQuiz(result);
      await consumeCredits('PDF_STUDY_PACK', `Generated PDF Quiz: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate document quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleGradeQuiz = () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) return { correct: 0, total: 0, percent: 0 };
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.questions.length,
      percent: Math.round((correct / quiz.questions.length) * 100),
    };
  };

  };

  const handleCopy = () => {
    if (!quiz || !Array.isArray(quiz.questions)) return;
    let text = `# ${quiz.title}\nDocument: ${quiz.documentName || 'Uploaded Document'}\n\n`;
    quiz.questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.prompt}\n`;
      q.options.forEach((opt, oIdx) => {
        text += `  ${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
      });
      text += `Correct Answer: ${String.fromCharCode(65 + (Number(q.correctAnswer) || 0))} - ${q.options[Number(q.correctAnswer) || 0]}\n`;
      if (q.explanation) text += `Grounded Explanation: ${q.explanation}\n`;
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!quiz) return;
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const score = calculateScore();

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
                STUDY TOOL 05
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              PDF & DOCUMENT QUIZ GENERATOR
            </h1>
          </div>
        </div>

        {quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
