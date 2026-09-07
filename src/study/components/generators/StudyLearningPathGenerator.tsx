import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  Lightbulb,
  Download
} from 'lucide-react';
import { LearningPathResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyLearningPathGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: LearningPathResult;
}

export const StudyLearningPathGenerator: React.FC<StudyLearningPathGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [targetGoal, setTargetGoal] = useState<string>(existingResource?.targetGoal || 'Comprehensive Academic Fluency');
  const [startingLevel, setStartingLevel] = useState<string>('Beginner / Intermediate');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Path Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [path, setPath] = useState<LearningPathResult | null>(
    existingResource && Array.isArray(existingResource.stages) && existingResource.stages.length > 0
      ? existingResource
      : null
  );
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a learning roadmap topic or upload notes.');
      return;
    }

    if (!canAfford('LEARNING_PATH')) {
      setError('Insufficient credits for Learning Roadmap generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setCompletedStages({});

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Mastery Learning Roadmap',
        category,
        targetGoal,
        startingLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('learning-path', input)) as LearningPathResult;
      setPath(result);
      await consumeCredits('LEARNING_PATH', `Generated Learning Roadmap: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStageCompleted = (idx: number) => {
    setCompletedStages((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  };

  const handleCopy = () => {
    if (!path) return;
    let text = `# ${path.title}\nTarget Goal: ${path.targetGoal || targetGoal}\nEstimated Duration: ${path.totalEstimatedWeeks || 8} Weeks\n\n`;
    path.stages.forEach((st) => {
      text += `## Stage ${st.stepNumber}: ${st.title} (~${st.estimatedHours || 15} hours)\n${st.description}\n`;
      if (st.skillsAcquired) text += 'Skills Acquired: ' + st.skillsAcquired.join(', ') + '\n';
      if (st.suggestedActivities) text += 'Activities:\n' + st.suggestedActivities.map((a) => `  - ${a}`).join('\n') + '\n';
      if (st.checkpointAssessment) text += `Checkpoint Assessment: ${st.checkpointAssessment}\n`;
      text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!path) return;
    const blob = new Blob([JSON.stringify(path, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${path.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-path.json`;
    a.click();
    URL.revokeObjectURL(url);
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
                STUDY TOOL 01
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              LEARNING ROADMAP BUILDER
            </h1>
          </div>
        </div>

        {path && Array.isArray(path.stages) && path.stages.length > 0 && (
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