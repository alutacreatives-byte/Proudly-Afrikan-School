import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Target,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { LearningPathBuildResult } from '../../types';
import { generateLearningPath } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface LearningPathGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: LearningPathBuildResult;
}

export const LearningPathGenerator: React.FC<LearningPathGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'DATA SCIENCE & AI');
  const [targetGoal, setTargetGoal] = useState<string>(existingResource?.targetGoal || existingResource?.title || '');
  const [estimatedWeeks, setEstimatedWeeks] = useState<number>(existingResource?.estimatedWeeks || 24);
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<LearningPathBuildResult | null>(
    existingResource && Array.isArray(existingResource.stages) && existingResource.stages.length > 0
      ? existingResource
      : null
  );
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!targetGoal.trim() && !sourceMaterial.trim()) {
      setError('Please provide a career or learning goal or upload background material.');
      return;
    }

    if (!canAfford('LEARNING_PATH')) {
      setError('Insufficient credits for Learning Path Roadmap. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateLearningPath({
        title: targetGoal.trim() || 'Comprehensive Career Mastery Roadmap',
        subject,
        targetGoal: targetGoal.trim() || 'Achieve domain competence and professional mastery',
        estimatedWeeks,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setRoadmap(result);
      await consumeCredits('LEARNING_PATH', `Generated Career Roadmap: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Learning path generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!roadmap) return;
    saveResourceToStorage({
      id: roadmap.id || `lp-road-${Date.now()}`,
      toolType: 'learning-path',
      title: roadmap.title,
      subject: roadmap.subject || subject,
      topic: roadmap.targetGoal || targetGoal,
      createdAt: new Date().toISOString(),
      data: roadmap,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!roadmap) return;
    let text = `${roadmap.title.toUpperCase()} - LEARNING PATH ROADMAP\n`;
    text += `Discipline: ${roadmap.subject} | Target Goal: ${roadmap.targetGoal}\n`;
    text += `Duration: ${roadmap.estimatedWeeks} Weeks\n\n`;

    text += `OVERVIEW:\n${roadmap.overview}\n\n`;

    (roadmap.stages || []).forEach((stg) => {
      text += `=========================================\n`;
      text += `STAGE ${stg.stageNumber}: ${stg.stageTitle.toUpperCase()} (${stg.estimatedWeeksOrHours})\n`;
      text += `${stg.description}\n\n`;
      text += `Competencies:\n`;
      (stg.coreCompetencies || []).forEach((c) => {
        text += `  • ${c}\n`;
      });
      text += `\nMilestone Project: ${stg.suggestedMilestoneProject}\n`;
      text += `Exit Criteria: ${stg.certificationOrExitCriteria}\n\n`;
    });

    if (roadmap.recommendedResources && roadmap.recommendedResources.length > 0) {
      text += `RECOMMENDED RESOURCES:\n`;
      roadmap.recommendedResources.forEach((res) => {
        text += `- ${res}\n`;
      });
    }

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
            <span>75 Credits / Roadmap</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Career Strategy
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <Compass className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Roadmap Architect</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          Career & Learning Path Roadmap Builder
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Formulate structured, milestone-driven learning roadmaps from foundational literacy to advanced mastery, complete with applied portfolio projects and industry exit criteria.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Configure Learning Path Specifications</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Discipline / Industry *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="DATA SCIENCE & AI">Data Science & African AI Architecture</option>
              <option value="RENEWABLE ENERGY & CLIMATE TECH">Renewable Energy & Solar Engineering</option>
              <option value="AGRITECH & FOOD SYSTEMS">Precision Agritech & Food Sovereignty</option>
              <option value="FINTECH & INCLUSIVE FINANCE">Fintech & Pan-African Trade Systems</option>
              <option value="HEALTHCARE & BIOMEDICAL">Healthcare & Telemedicine Systems</option>
              <option value="CIVIL INFRASTRUCTURE">Urban Planning & Sustainable Cities</option>
              <option value="ACADEMIC RESEARCH & POLICY">Public Policy & Diplomatic Strategy</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Target Career / Mastery Goal *
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. Become a Lead Agritech Sensor & IoT Specialist"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Total Roadmap Timeline
            </label>
            <select
              value={estimatedWeeks}
              onChange={(e) => setEstimatedWeeks(Number(e.target.value) || 24)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value={12}>12 Weeks (Accelerated Intensive)</option>
              <option value={24}>24 Weeks (Standard Comprehensive 6-Month)</option>
              <option value={36}>36 Weeks (Deep Competency 9-Month)</option>
              <option value={48}>48 Weeks (Complete Full-Year Mastery)</option>
            </select>
          </div>
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Industry Standards / Syllabus Material (Optional)
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
              <span>Architecting Progressive Learning Roadmap...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Career Roadmap (75 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Roadmap Output */}
      {roadmap && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <span className="font-mono text-xs font-bold text-stone-600 uppercase">
              {roadmap.stages?.length || 4} Developmental Stages Defined
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Roadmap'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Roadmap</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Roadmap'}</span>
              </button>
            </div>
          </div>

          {/* Printable Roadmap Sheet */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-stone-900 pb-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#E05A2B] uppercase tracking-wider">
                  PROFESSIONAL MASTERY & LEARNING PATH
                </span>
                <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                  {roadmap.estimatedWeeks} WEEKS
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-stone-900">
                {roadmap.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-stone-600 uppercase">
                <span>INDUSTRY: {roadmap.subject}</span>
                <span>•</span>
                <span>TARGET GOAL: {roadmap.targetGoal}</span>
              </div>
            </div>

            {/* Overview */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E05A2B]" />
                <span>Strategic Roadmap Overview</span>
              </h3>
              <p className="text-stone-800 text-sm leading-relaxed font-medium">
                {roadmap.overview}
              </p>
            </div>

            {/* Stages Pipeline */}
            <div className="space-y-6">
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
                Developmental Progression Stages
              </h3>

              <div className="space-y-6">
                {(roadmap.stages || []).map((stage, sIdx) => (
                  <div
                    key={stage.stageNumber || sIdx}
                    className="relative pl-6 sm:pl-8 border-l-2 border-stone-900 space-y-4"
                  >
                    {/* Stage number circle on border line */}
                    <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs">
                      {stage.stageNumber}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-[#E05A2B] uppercase">
                            Stage {stage.stageNumber}
                          </span>
                          <h4 className="font-display font-black text-base sm:text-lg uppercase text-stone-900">
                            {stage.stageTitle}
                          </h4>
                        </div>
                        <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-md">
                          {stage.estimatedWeeksOrHours}
                        </span>
                      </div>

                      <p className="text-stone-800 text-xs sm:text-sm leading-relaxed font-medium">
                        {stage.description}
                      </p>

                      {/* Core Competencies */}
                      <div className="space-y-2">
                        <div className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
                          Core Competencies Acquired:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(stage.coreCompetencies || []).map((comp, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-800 font-medium flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{comp}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestone Project & Exit Criteria Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {stage.suggestedMilestoneProject && (
                          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                            <div className="font-display font-black text-xs uppercase tracking-wider text-amber-900">
                              Applied Portfolio Milestone Project
                            </div>
                            <p className="text-xs text-amber-950 font-medium leading-relaxed">
                              {stage.suggestedMilestoneProject}
                            </p>
                          </div>
                        )}

                        {stage.certificationOrExitCriteria && (
                          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                            <div className="font-display font-black text-xs uppercase tracking-wider text-emerald-900">
                              Stage Exit & Certification Benchmark
                            </div>
                            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                              {stage.certificationOrExitCriteria}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Resources */}
            {roadmap.recommendedResources && roadmap.recommendedResources.length > 0 && (
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="font-display font-black text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#E05A2B]" />
                  <span>Curated Literature, Toolkits & Recommended Repositories</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {roadmap.recommendedResources.map((res, rIdx) => (
                    <li
                      key={rIdx}
                      className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 font-medium flex items-start gap-2 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B] mt-1.5 shrink-0" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
