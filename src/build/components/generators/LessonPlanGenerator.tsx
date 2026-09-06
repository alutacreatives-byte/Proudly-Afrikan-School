import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  Clock, 
  Target 
} from 'lucide-react';
import { LessonPlanResource } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface LessonPlanGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: LessonPlanResource;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 60);
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [plan, setPlan] = useState<LessonPlanResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingResource) {
      setPlan(existingResource);
      if (existingResource.subject) setSubject(existingResource.subject);
      if (existingResource.topic) setTopic(existingResource.topic);
      if (existingResource.gradeLevel) setGradeLevel(existingResource.gradeLevel);
      if (existingResource.durationMinutes) setDurationMinutes(existingResource.durationMinutes);
      if (existingResource.sourceDocName) setSourceFileName(existingResource.sourceDocName);
    }
  }, [existingResource]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a lesson plan topic.');
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
      const response = await fetch('/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          gradeLevel,
          durationMinutes,
          sourceMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson plan.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated: LessonPlanResource = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'lesson-plan',
        };
        setPlan(generated);
        saveResourceToStorage(generated);
        if (onSaved) onSaved();
        await consumeCredits('LESSON_PLAN', `Generated Lesson Plan: ${topic}`);
      } else {
        throw new Error(resData.error || 'Server returned invalid lesson plan format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!plan) return;
    saveResourceToStorage(plan);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!plan) return;
    let fullText = `${plan.title.toUpperCase()}\n`;
    fullText += `Subject: ${plan.subject} | Grade: ${plan.gradeLevel} | Duration: ${plan.durationMinutes} mins\n\n`;
    if (plan.objectives && plan.objectives.length > 0) {
      fullText += `LEARNING OBJECTIVES:\n${plan.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n`;
    }
    fullText += `PEDAGOGICAL PHASES:\n`;
    plan.phases.forEach((ph, i) => {
      fullText += `[Phase ${i + 1}: ${ph.phase} - ${ph.durationMinutes} mins]\n`;
      fullText += `Teacher: ${ph.teacherActivity}\n`;
      fullText += `Students: ${ph.studentActivity}\n\n`;
    });
    if (plan.assessmentStrategy) {
      fullText += `ASSESSMENT STRATEGY:\n${plan.assessmentStrategy}\n`;
    }

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
                GENERATOR 04 • LESSON PLANS
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Lesson Plan Generator
            </h1>
          </div>
        </div>

        {plan && (
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
            <span className="font-mono text-base text-stone-500">Lesson Parameters & Structure</span>
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
                  Lesson Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Newton's Laws, Cell Structure, Apartheid History"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {GRADE_LEVELS.map((gl) => (
                    <option key={gl} value={gl}>
                      {gl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min={30}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
                Attach Curriculum / Syllabus Notes (Optional)
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
              <span>{isGenerating ? 'Synthesizing Lesson Plan...' : 'Generate Lesson Plan'}</span>
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
            {plan && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Lesson Plan Ready
              </span>
            )}
          </div>

          {plan ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 text-center space-y-2">
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {plan.title}
                </h2>
                <div className="flex items-center justify-center flex-wrap gap-4 font-mono text-sm font-bold text-stone-700 pt-2">
                  <span>SUBJECT: {plan.subject}</span>
                  <span>•</span>
                  <span>GRADE: {plan.gradeLevel}</span>
                  <span>•</span>
                  <span>TIME: {plan.durationMinutes} MINS</span>
                </div>
              </div>

              {/* Objectives */}
              {plan.objectives && plan.objectives.length > 0 && (
                <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-mono text-sm font-black uppercase tracking-wider text-stone-800">
                    <Target className="w-5 h-5 text-[#E63956]" />
                    <span>LEARNING OBJECTIVES:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 font-mono text-base text-stone-700">
                    {plan.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Phases */}
              <div className="space-y-6">
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#161616] border-b border-stone-200 pb-3">
                  Pedagogical Phases & Activities
                </h3>
                <div className="space-y-5">
                  {plan.phases.map((ph, idx) => (
                    <div key={idx} className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-base uppercase text-[#161616]">
                          {ph.phase}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#E63956] flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {ph.durationMinutes} mins
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-1">
                          <div className="font-mono font-bold text-sm text-stone-500 uppercase">Teacher Activity</div>
                          <div className="text-stone-800 leading-relaxed font-sans">{ph.teacherActivity}</div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-1">
                          <div className="font-mono font-bold text-sm text-stone-500 uppercase">Student Activity</div>
                          <div className="text-stone-800 leading-relaxed font-sans">{ph.studentActivity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment */}
              {plan.assessmentStrategy && (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="font-mono text-sm font-black uppercase text-emerald-900">
                    Assessment & Formative Checks
                  </div>
                  <p className="text-base text-emerald-800 leading-relaxed font-sans">
                    {plan.assessmentStrategy}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Lesson Plan Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Enter your lesson topic above and click <strong>Generate Lesson Plan</strong> to synthesize instructional phases, teacher actions, student exercises, and assessment checks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
