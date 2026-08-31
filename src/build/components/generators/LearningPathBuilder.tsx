import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Milestone,
  CheckCircle2
} from 'lucide-react';
import { LearningPathResource, MilestonePhase } from '../../types';
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
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Technology & Computer Science');
  const [goal, setGoal] = useState<string>(existingResource?.title || 'Full Stack React & Cloud Developer');
  const [totalWeeks, setTotalWeeks] = useState<number>(existingResource?.estimatedTotalWeeks || 12);
  const [currentLevel, setCurrentLevel] = useState<string>('Foundational / Beginner');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [learningPath, setLearningPath] = useState<LearningPathResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      setError('Please provide a learning goal.');
      return;
    }

    const creditCheck = await consumeCredits('LEARNING_PATH', `Generated Learning Path: ${goal.slice(0, 30)}`);
    if (!creditCheck.success) {
      if (!user) {
        openAuthModal();
      } else {
        setError(creditCheck.error || 'Insufficient credits.');
      }
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
          goal,
          targetGoal: goal,
          totalWeeks,
          currentLevel,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generated: LearningPathResource = {
          ...json.data,
          toolType: 'learning-path',
          estimatedTotalWeeks: totalWeeks,
        };
        setLearningPath(generated);
        saveResourceToStorage(generated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to synthesize learning roadmap.');
      }
    } catch (err: any) {
      console.error('Learning Path Error:', err);
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!learningPath) return;
    let text = `LEARNING ROADMAP: ${learningPath.title.toUpperCase()}\n`;
    text += `Target Goal: ${learningPath.targetGoal} | Total Duration: ${learningPath.estimatedTotalWeeks} Weeks\n\n`;
    text += `MILESTONES:\n`;
    learningPath.milestones.forEach((m) => {
      text += `\nMilestone ${m.milestoneNumber}: ${m.phaseName} (${m.targetWeeks})\n`;
      m.keyObjectives.forEach(obj => text += `• ${obj}\n`);
      if (m.milestoneProject) text += `Project: ${m.milestoneProject}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const handleSave = () => {
    if (!learningPath) return;
    saveResourceToStorage(learningPath);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D8] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#161616] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Build
        </button>
        <div className="px-4 py-1.5 bg-[#161616] text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
          Tool 08: Learning Path Builder
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                Learning Path
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Milestone roadmap from beginner to mastery
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Domain / Field *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Target Mastery Goal *
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Modern Full-Stack Web Development & APIs"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Starting Level
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  <option value="Foundational / Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced / Specialization">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Total Weeks
                </label>
                <input
                  type="number"
                  min={4}
                  max={52}
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(Number(e.target.value))}
                  className="w-full py-2 px-2 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-sans p-2 rounded-xl bg-red-50 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-display font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Learning Path ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          {learningPath ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-700">
                  {learningPath.milestones.length} Strategic Milestones
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {saved ? 'Saved' : 'Save to My Builds ↗'}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 sm:p-10 shadow-sm space-y-7 print:border-none print:shadow-none print:p-0">
                <div className="space-y-2 border-b border-stone-200 pb-5">
                  <p className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[#D92B8A]">
                    PROUDLY AFRIKAN LEARNING PATHWAY
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                    {learningPath.title.replace(/^Learning Path:\s*/i, '')}
                  </h1>
                  <p className="text-xs font-mono text-stone-600">
                    Target: {learningPath.targetGoal} • Estimated Timeline: {learningPath.estimatedTotalWeeks} Weeks
                  </p>
                </div>

                <div className="space-y-4">
                  {learningPath.milestones.map((m, mIdx) => (
                    <div key={mIdx} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-[#161616] text-white font-mono font-bold text-xs flex items-center justify-center">
                            {m.milestoneNumber}
                          </span>
                          <h4 className="font-display font-black text-sm uppercase text-[#161616]">
                            {m.phaseName}
                          </h4>
                        </div>
                        <span className="px-2.5 py-0.5 bg-pink-50 text-[#D92B8A] rounded-full text-xs font-mono font-bold">
                          {m.targetWeeks}
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-2">
                        {m.keyObjectives.map((obj, oIdx) => (
                          <div key={oIdx} className="flex items-start gap-2 text-xs font-sans text-stone-800">
                            <span className="text-[#D92B8A] font-bold">✓</span>
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>

                      {m.milestoneProject && (
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-mono text-stone-700">
                          <strong className="text-[#161616]">Milestone Capstone: </strong>
                          {m.milestoneProject}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Learning Roadmap Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Enter your learning objective to generate an actionable step-by-step roadmap with checkpoints, projects, and milestones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
