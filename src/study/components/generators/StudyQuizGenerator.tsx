import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Award,
  AlertCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { QuizResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyQuizGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: QuizResult;
}

export const StudyQuizGenerator: React.FC<StudyQuizGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>((existingResource?.difficulty as any) || 'Medium');
  const [count, setCount] = useState<number>(existingResource?.questions?.length || 5);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Execution state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<QuizResult | null>(
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
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source notes.');
      return;
    }

    if (!canAfford('QUIZ_FLASHCARDS')) {
      setError('Insufficient credits for Quiz generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Mastery Practice Quiz',
        category,
        difficulty,
        count,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('quiz', input)) as QuizResult;
      setQuiz(result);
      await consumeCredits('QUIZ_FLASHCARDS', `Generated Practice Quiz: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
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
    let text = `# ${quiz.title}\nSubject: ${quiz.subject || category}\n\n`;
    quiz.questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.prompt}\n`;
      q.options.forEach((opt, oIdx) => {
        text += `  ${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
      });
      text += `Correct Answer: ${String.fromCharCode(65 + (Number(q.correctAnswer) || 0))} - ${q.options[Number(q.correctAnswer) || 0]}\n`;
      if (q.explanation) text += `Explanation: ${q.explanation}\n`;
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
    a.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-quiz.json`;
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
                STUDY TOOL 04
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              PRACTICE QUIZ GENERATOR
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
