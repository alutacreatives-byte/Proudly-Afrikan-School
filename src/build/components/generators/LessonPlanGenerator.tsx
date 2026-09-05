import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Layers,
  FileText
} from 'lucide-react';
import { LessonPlanResult } from '../../types';
import { generateLessonPlan } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface LessonPlanGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: LessonPlanResult;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 60);
  const [learningObjectives, setLearningObjectives] = useState<string>('');
  const [keyConcepts, setKeyConcepts] = useState<string>('');
  const [assessmentApproach, setAssessmentApproach] = useState<string>('Formative inquiry + Exit ticket');
  const [requiredResources, setRequiredResources] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanResult | null>(
    existingResource && Array.isArray(existingResource.phases) && existingResource.phases.length > 0
      ? existingResource
      : null
  );
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please provide a lesson topic or upload curriculum notes.');
      return;
    }

    if (!canAfford('LESSON_PLAN')) {
      setError('Insufficient credits for Lesson Plan generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const objectivesList = learningObjectives
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);

      const result = await generateLessonPlan({
        subject,
        topic: topic.trim() || 'Core Curriculum Lesson Unit',
        gradeLevel,
        durationMinutes,
        learningObjectives: objectivesList.length > 0 ? objectivesList : undefined,
        keyConcepts: keyConcepts.trim() || undefined,
        assessmentApproach,
        requiredResources: requiredResources.trim() || undefined,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setLessonPlan(result);
      await consumeCredits('LESSON_PLAN', `Generated Lesson Plan: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lesson Plan generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!lessonPlan) return;
    saveResourceToStorage({
      id: lessonPlan.id || `lp-${Date.now()}`,
      toolType: 'lesson-plan',
      title: lessonPlan.title,
      subject: lessonPlan.subject || subject,
      topic: lessonPlan.topic || topic,
      createdAt: new Date().toISOString(),
      data: lessonPlan,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!lessonPlan) return;
    let text = `${lessonPlan.title.toUpperCase()}\n`;
    text += `Subject: ${lessonPlan.subject} | Grade Level: ${lessonPlan.gradeLevel}\n`;
    text += `Lesson Duration: ${lessonPlan.durationMinutes} minutes\n\n`;

    text += `LEARNING OBJECTIVES:\n`;
    (lessonPlan.objectives || []).forEach((obj, i) => {
      text += `${i + 1}. ${obj}\n`;
    });
    text += `\n`;

    text += `MATERIALS & RESOURCES:\n`;
    (lessonPlan.materialsNeeded || []).forEach((mat) => {
      text += `- ${mat}\n`;
    });
    text += `\n`;

    text += `PEDAGOGICAL PHASES & TIMELINE:\n`;
    (lessonPlan.phases || []).forEach((phase, idx) => {
      text += `Phase ${idx + 1}: ${phase.phase} (${phase.durationMinutes} mins)\n`;
      text += `  Teacher Action: ${phase.teacherActivity}\n`;
      text += `  Learner Action: ${phase.studentActivity}\n\n`;
    });

    if (lessonPlan.assessmentStrategy) {
      text += `ASSESSMENT STRATEGY:\n${lessonPlan.assessmentStrategy}\n\n`;
    }

    if (lessonPlan.differentiation) {
      text += `DIFFERENTIATION & INCLUSION:\n`;
      text += `  Support / Scaffolding: ${lessonPlan.differentiation.support}\n`;
      text += `  Extension / Challenge: ${lessonPlan.differentiation.extension}\n`;
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
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05A2B]/10 text-[#E05A2B] font-mono text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>30 Credits / Plan</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Pedagogy Suite
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <BookOpen className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Lesson Architecture</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          Pedagogical Lesson Plan Generator
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Formulate structured, evidence-based lesson plans with explicit learning objectives, 4-phase pedagogical timelines (Hook, Direct Instruction, Guided Practice, Closure/Exit Ticket), materials checklists, and tiered differentiation.
        </p>
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Configure Lesson Specifications</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="AFRICAN HISTORY">African History & Heritage</option>
              <option value="PHYSICAL SCIENCES">Physical Sciences & Chemistry</option>
              <option value="LIFE SCIENCES">Life Sciences & Ecology</option>
              <option value="MATHEMATICS">Mathematics & Geometry</option>
              <option value="GEOGRAPHY & CLIMATE">Geography & Climatology</option>
              <option value="CIVICS & CITIZENSHIP">Civics & Leadership</option>
              <option value="LITERATURE & RHETORIC">African Literature & Rhetoric</option>
              <option value="ECONOMICS">Economics & Enterprise</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Lesson Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Great Zimbabwe: Architecture, Trade & Social Structure"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Primary School (Grades 4-5)">Primary School (Grades 4-5)</option>
              <option value="Junior Secondary (Grades 6-8)">Junior Secondary (Grades 6-8)</option>
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
              <option value="Undergraduate / Tertiary">Undergraduate / Tertiary</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Allocated Class Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value={45}>45 Minutes (Single Period)</option>
              <option value={60}>60 Minutes (Standard Hour)</option>
              <option value={90}>90 Minutes (Double Block Period)</option>
              <option value={120}>120 Minutes (Extended Workshop / Seminar)</option>
            </select>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-1.5">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Desired Learning Objectives (Optional, one per line)
          </label>
          <textarea
            rows={2}
            value={learningObjectives}
            onChange={(e) => setLearningObjectives(e.target.value)}
            placeholder="e.g. Learners will explain the engineering methods of dry-stone wall construction;&#10;Learners will evaluate Indian Ocean gold and ivory trade routes."
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
          />
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Curriculum Documents / Scheme of Work (Optional)
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
              <span>Architecting Pedagogical Lesson Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Lesson Plan (30 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Lesson Plan Output Display */}
      {lessonPlan && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-600 uppercase px-3 py-1.5 bg-stone-100 rounded-xl">
                4-Phase Sequence Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Plan'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Plan</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Plan'}</span>
              </button>
            </div>
          </div>

          {/* Printable Lesson Plan Doc */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-stone-900 pb-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#E05A2B] uppercase tracking-wider">
                  MASTER LESSON PLAN • PROUDLY AFRIKAN
                </span>
                <span className="font-mono text-xs font-black text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                  {lessonPlan.durationMinutes} MINUTES
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
                {lessonPlan.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-stone-600 uppercase">
                <span>SUBJECT: {lessonPlan.subject}</span>
                <span>•</span>
                <span>GRADE: {lessonPlan.gradeLevel}</span>
              </div>
            </div>

            {/* Objectives & Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Objectives */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase tracking-wider text-stone-900">
                  <Target className="w-4 h-4 text-[#E05A2B]" />
                  <span>Curriculum Learning Objectives</span>
                </div>
                <ul className="space-y-2">
                  {(lessonPlan.objectives || []).map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-800 font-medium leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Materials */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase tracking-wider text-stone-900">
                  <Layers className="w-4 h-4 text-[#E05A2B]" />
                  <span>Required Resources & Materials</span>
                </div>
                <ul className="space-y-2">
                  {(lessonPlan.materialsNeeded || []).map((mat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-800 font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-900 shrink-0 mt-1.5" />
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4-Phase Pedagogical Timeline */}
            <div className="space-y-4">
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
                Pedagogical Delivery Timeline
              </h3>

              <div className="space-y-4">
                {(lessonPlan.phases || []).map((phase, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-400 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs">
                          {pIdx + 1}
                        </span>
                        <h4 className="font-display font-black text-sm uppercase tracking-wide text-stone-900">
                          {phase.phase}
                        </h4>
                      </div>
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#E05A2B]/10 text-[#E05A2B]">
                        {phase.durationMinutes} mins
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="font-display font-bold uppercase tracking-wider text-stone-700">
                          Teacher Facilitation:
                        </div>
                        <p className="text-stone-800 leading-relaxed font-medium">
                          {phase.teacherActivity}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="font-display font-bold uppercase tracking-wider text-stone-700">
                          Learner Active Engagement:
                        </div>
                        <p className="text-stone-800 leading-relaxed font-medium">
                          {phase.studentActivity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Strategy & Differentiation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Assessment */}
              {lessonPlan.assessmentStrategy && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="font-display font-black text-xs uppercase tracking-wider text-amber-900">
                    Formative Assessment & Exit Check
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {lessonPlan.assessmentStrategy}
                  </p>
                </div>
              )}

              {/* Differentiation */}
              {lessonPlan.differentiation && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="font-display font-black text-xs uppercase tracking-wider text-indigo-900">
                    Tiered Differentiation & Scaffolding
                  </div>
                  <div className="space-y-1.5 text-xs text-indigo-950">
                    <div>
                      <strong>Support / Scaffolding:</strong> {lessonPlan.differentiation.support}
                    </div>
                    <div>
                      <strong>Extension / Challenge:</strong> {lessonPlan.differentiation.extension}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
