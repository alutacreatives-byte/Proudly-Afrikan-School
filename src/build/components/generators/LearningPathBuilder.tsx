import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  CheckCircle2, 
  Target 
} from 'lucide-react';
import { LearningPathResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface LearningPathBuilderProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: LearningPathResource;
}

export const LearningPathBuilder: React.FC<LearningPathBuilderProps> = ({
  onBack,
  onGoHome,
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

  useEffect(() => {
    if (existingResource) {
      setLearningPath(existingResource);
      if (existingResource.subject) setSubject(existingResource.subject);
      if (existingResource.targetGoal) setTargetGoal(existingResource.targetGoal);
      if (existingResource.startingLevel) setStartingLevel(existingResource.startingLevel);
      if (existingResource.targetLevel) setTargetLevel(existingResource.targetLevel);
      if (existingResource.sourceDocName) setSourceFileName(existingResource.sourceDocName);
    }
  }, [existingResource]);

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
        saveResourceToStorage(generated);
        if (onSaved) onSaved();
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
    let fullText = `${learningPath.title.toUpperCase()}\n`;
    fullText += `Path: ${learningPath.startingLevel} -> ${learningPath.targetLevel}\n\n`;
    learningPath.milestones.forEach((m) => {
      fullText += `Step ${m.stepNumber}: ${m.title} (~${m.estimatedHours} hrs)\n`;
      fullText += `${m.description}\n`;
      fullText += `Skills: ${m.skillsAcquired.join(', ')}\n\n`;
    });
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
            <span className="font-mono text-base text-stone-500">Goal & Pathway Parameters</span>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Target Mastery Goal *
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Master African Geopolitics, Become a Python Developer"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Current Starting Level
                </label>
                <select
                  value={startingLevel}
                  onChange={(e) => setStartingLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  <option value="Absolute Beginner">Absolute Beginner</option>
                  <option value="Basic Knowledge">Basic Knowledge</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Target Outcome Level
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  <option value="Intermediate Competence">Intermediate Competence</option>
                  <option value="Advanced Fluency">Advanced Fluency</option>
                  <option value="Professional Mastery">Professional Mastery</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
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
              <span>{isGenerating ? 'Mapping Learning Path...' : 'Generate Learning Path'}</span>
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
            {learningPath && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Learning Pathway Ready
              </span>
            )}
          </div>

          {learningPath ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 space-y-2">
                <div className="font-mono text-base font-bold text-stone-500 uppercase">
                  PATHWAY: {learningPath.startingLevel} → {learningPath.targetLevel}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {learningPath.title}
                </h2>
              </div>

              <div className="space-y-6">
                {learningPath.milestones.map((milestone) => (
                  <div key={milestone.stepNumber} className="p-6 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-[#E63956] text-white font-mono text-base font-bold flex items-center justify-center">
                          {milestone.stepNumber}
                        </span>
                        <h4 className="font-display font-black text-xl sm:text-2xl uppercase text-[#161616]">
                          {milestone.title}
                        </h4>
                      </div>
                      <span className="font-mono text-base font-bold text-stone-600 bg-stone-100 px-4 py-1.5 rounded-full">
                        ~{milestone.estimatedHours} hrs
                      </span>
                    </div>

                    <p className="font-sans text-base text-stone-700 leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                      <div className="font-mono text-base font-bold text-stone-500 uppercase">
                        Skills to Acquire:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {milestone.skillsAcquired.map((skill, sIdx) => (
                          <span key={sIdx} className="px-3.5 py-1.5 bg-stone-100 rounded-full font-mono text-base text-stone-800 font-medium">
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
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Learning Path Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Enter your learning goal above and click <strong>Generate Learning Path</strong> to synthesize progressive milestones, skill checkpoints, and practical activities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
