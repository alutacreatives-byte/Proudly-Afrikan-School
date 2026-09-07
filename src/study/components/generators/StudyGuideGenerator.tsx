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
  Key,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { StudyGuideResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyGuideGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: StudyGuideResult;
}

export const StudyGuideGenerator: React.FC<StudyGuideGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Secondary / High School');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [guide, setGuide] = useState<StudyGuideResult | null>(
    existingResource && Array.isArray(existingResource.sections) && existingResource.sections.length > 0
      ? existingResource
      : null
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a topic or upload source material.');
      return;
    }

    if (!canAfford('STUDY_GUIDE')) {
      setError('Insufficient credits for Study Guide generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Comprehensive Study Material',
        category,
        gradeLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('study-guide', input)) as StudyGuideResult;
      setGuide(result);
      await consumeCredits('STUDY_GUIDE', `Generated Study Guide: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  };

  const handleCopy = () => {
    if (!guide) return;
    let text = `# ${guide.title}\nSubject: ${guide.subject || category}\n\n`;
    text += `## Executive Overview\n${guide.overview}\n\n`;
    guide.sections.forEach((sec) => {
      text += `### ${sec.heading}\n${sec.content}\n`;
      if (sec.bulletPoints && sec.bulletPoints.length > 0) {
        text += sec.bulletPoints.map((b) => `- ${b}`).join('\n') + '\n';
      }
      if (sec.keyTerms && sec.keyTerms.length > 0) {
        text += '\nKey Terms:\n' + sec.keyTerms.map((kt) => `* **${kt.term}**: ${kt.definition}`).join('\n') + '\n';
      }
      text += '\n';
    });

    if (guide.importantTakeaways && guide.importantTakeaways.length > 0) {
      text += '## Key Takeaways\n' + guide.importantTakeaways.map((t) => `- ${t}`).join('\n') + '\n\n';
    }

    if (guide.reviewQuestions && guide.reviewQuestions.length > 0) {
      text += '## Review Questions\n' + guide.reviewQuestions.map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.answer}`).join('\n\n');
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!guide) return;
    const blob = new Blob([JSON.stringify(guide, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

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
                STUDY TOOL 02
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              STUDY GUIDE GENERATOR
            </h1>
          </div>
        </div>

        {guide && Array.isArray(guide.sections) && guide.sections.length > 0 && (
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
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
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
