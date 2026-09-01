import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  CheckCircle2,
  Target
} from 'lucide-react';
import { LearningPathResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface LearningPathBuilderProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: LearningPathResource;
}

export const LearningPathBuilder: React.FC<LearningPathBuilderProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [targetGoal, setTargetGoal] = useState<string>(existingResource?.targetGoal || '');
  const [startingLevel, setStartingLevel] = useState<string>(existingResource?.startingLevel || 'Absolute Beginner');
  const [targetLevel, setTargetLevel] = useState<string>(existingResource?.targetLevel || 'Advanced Professional Mastery');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [learningPath, setLearningPath] = useState<LearningPathResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!targetGoal.trim()) {
      setError('Please enter your learning goal.');
      return;
    }

    if (!canAfford('LEARNING_PATH')) {
      setError('Insufficient credits for Learning Path generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          targetGoal,
          startingLevel,
          targetLevel,
          sourceMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate learning path.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated: LearningPathResource = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'learning-path',
        };
        setLearningPath(generated);
        await consumeCredits('LEARNING_PATH', `Generated Learning Path: ${targetGoal}`);
      } else {
        throw new Error(resData.error || 'Server returned invalid learning path format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!learningPath) return;
    saveResourceToStorage(learningPath);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!learningPath) return;
    const text = `# ${learningPath.title}\nSubject: ${learningPath.subject}\nGoal: ${learningPath.targetGoal}\nLevel: ${learningPath.startingLevel} -> ${learningPath.targetLevel}\n\n` +
      `### ROADMAP MILESTONES\n` +
      learningPath.milestones.map(m => 
        `#### Step ${m.stepNumber}: ${m.title} (~${m.estimatedHours} hrs)\n${m.description}\n` +
        `Skills: ${m.skillsAcquired.join(', ')}\n` +
        `Checkpoint: ${m.checkpointAssessment}\n`
      ).join('\n');

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
                GENERATOR 07 • CUSTOM LEARNING PATH
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Personalized Learning Path Builder
            </h1>
          </div>
        </div>

        {learningPath && (
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
              <Compass className="w-5 h-5 text-[#E63956]" />
              <span>Goal & Pathway</span>
            </h2>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Subject Domain
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Target Mastery Goal *
              </label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="e.g. Master African Geopolitics, Become a Python Developer"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-sans text-sm text-stone-900 focus:outline-none focus:border-[#E63956]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Current Level
                </label>
                <select
                  value={startingLevel}
                  onChange={(e) => setStartingLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  <option value="Absolute Beginner">Absolute Beginner</option>
                  <option value="Basic Knowledge">Basic Knowledge</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Target Level
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  <option value="Intermediate Competence">Intermediate</option>
                  <option value="Advanced Fluency">Advanced Fluency</option>
                  <option value="Professional Mastery">Professional Mastery</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Attach Diagnostic Notes (Optional)
              </label>
              <SourceMaterialUpload
                currentFileName={sourceFileName}
                onContentExtracted={(text, name) => {
                  setSourceMaterial(text);
                  setSourceFileName(name);
                }}
                onClear={() => {
                  setSourceMaterial('');
                  setSourceFileName('');
                }}
              />
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
              <span>{isGenerating ? 'Mapping Learning Path...' : 'Generate Learning Path'}</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          {learningPath ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 space-y-2">
                <div className="font-mono text-xs font-bold text-stone-500 uppercase">
                  PATHWAY: {learningPath.startingLevel} → {learningPath.targetLevel}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {learningPath.title}
                </h2>
              </div>

              <div className="space-y-6">
                {learningPath.milestones.map((milestone) => (
                  <div key={milestone.stepNumber} className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#E63956] text-white font-mono text-xs font-bold flex items-center justify-center">
                          {milestone.stepNumber}
                        </span>
                        <h4 className="font-display font-black text-base uppercase text-[#161616]">
                          {milestone.title}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-stone-500">
                        ~{milestone.estimatedHours} hrs
                      </span>
                    </div>

                    <p className="font-sans text-xs text-stone-700 leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1.5">
                      <div className="font-mono text-[11px] font-bold text-stone-500 uppercase">
                        Skills to Acquire:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.skillsAcquired.map((skill, sIdx) => (
                          <span key={sIdx} className="px-2.5 py-0.5 bg-stone-100 rounded-full font-mono text-[11px] text-stone-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Learning Path Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Enter your learning goal on the left and click <strong>Generate Learning Path</strong> to synthesize progressive milestones, skill checkpoints, and practical activities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
