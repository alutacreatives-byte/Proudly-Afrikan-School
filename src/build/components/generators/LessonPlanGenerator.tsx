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
  Target,
  Users,
  CheckCircle2
} from 'lucide-react';
import { LessonPlanResource, LessonPhase } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface LessonPlanGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: LessonPlanResource;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'History & Geography');
  const [topic, setTopic] = useState<string>(existingResource?.topic || 'The Great Zimbabwe & Monomotapa Empire');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 60);
  const [customObjectives, setCustomObjectives] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceDocName ? '' : '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a lesson topic.');
      return;
    }

    const creditCheck = await consumeCredits('LESSON_PLAN', `Generated Lesson Plan: ${topic.slice(0, 30)}`);
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
      const response = await fetch('/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          gradeLevel,
          durationMinutes,
          objectives: customObjectives ? customObjectives.split('\n').filter(Boolean) : [],
          sourceMaterial,
          sourceDocName: sourceFileName,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generated: LessonPlanResource = {
          ...json.data,
          toolType: 'lesson-plan',
          durationMinutes,
          sourceDocName: sourceFileName,
        };
        setLessonPlan(generated);
        saveResourceToStorage(generated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to synthesize lesson plan.');
      }
    } catch (err: any) {
      console.error('Lesson Plan Generation Error:', err);
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!lessonPlan) return;
    let text = `LESSON PLAN: ${lessonPlan.title.toUpperCase()}\n`;
    text += `Subject: ${lessonPlan.subject} | Grade: ${lessonPlan.gradeLevel} | Duration: ${lessonPlan.durationMinutes} Mins\n\n`;
    text += `OBJECTIVES:\n${lessonPlan.objectives.map(o => `• ${o}`).join('\n')}\n\n`;
    text += `LESSON PHASES:\n`;
    lessonPlan.phases.forEach((p, i) => {
      text += `Phase ${i + 1}: ${p.phase} (${p.durationMinutes} mins)\n`;
      text += `Teacher: ${p.teacherActivity}\n`;
      text += `Student: ${p.studentActivity}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const handleSave = () => {
    if (!lessonPlan) return;
    saveResourceToStorage(lessonPlan);
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
          Tool 04: Lesson Plan Generator
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                Build A Lesson Plan
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Pedagogical phased plans & assessments
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Subject Category *
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
                Lesson Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Great Zimbabwe Architecture & Trade"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min={20}
                  max={180}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full py-2 px-2 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Key Learning Objectives (Optional)
              </label>
              <textarea
                rows={2}
                value={customObjectives}
                onChange={(e) => setCustomObjectives(e.target.value)}
                placeholder="e.g. Understand dry stone masonry without mortar..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] resize-none"
              />
            </div>

            <SourceMaterialUpload
              label="Source Material"
              optionalTag="OPTIONAL"
              currentFileName={sourceFileName}
              onTextExtracted={(text, name) => {
                setSourceMaterial(text);
                setSourceFileName(name);
              }}
              onClear={() => {
                setSourceMaterial('');
                setSourceFileName('');
              }}
            />

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
                  <span>Synthesizing Lesson Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Lesson Plan ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          {lessonPlan ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-700">
                  {lessonPlan.durationMinutes} Minutes Framework
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
                    PROUDLY AFRIKAN CURRICULUM LESSON PLAN
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                    {lessonPlan.title.replace(/^Lesson Plan:\s*/i, '')}
                  </h1>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono text-stone-600">
                    <span className="bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                      Subject: {lessonPlan.subject}
                    </span>
                    <span className="bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                      Grade: {lessonPlan.gradeLevel}
                    </span>
                    <span className="bg-pink-50 text-[#D92B8A] px-3 py-1 rounded-full border border-pink-200 font-bold">
                      {lessonPlan.durationMinutes} Mins
                    </span>
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-2">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#161616] flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#D92B8A]" />
                    Learning Objectives
                  </h4>
                  <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 space-y-1.5">
                    {lessonPlan.objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-sans text-stone-800">
                        <span className="text-[#D92B8A] font-bold">✓</span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phased Sequence */}
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#161616] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#2563EB]" />
                    Instructional Phases
                  </h4>
                  <div className="space-y-3">
                    {lessonPlan.phases.map((phase, pIdx) => (
                      <div key={pIdx} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <h5 className="font-display font-black text-sm uppercase text-[#161616]">
                            Phase {pIdx + 1}: {phase.phase}
                          </h5>
                          <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-full text-xs font-mono font-bold">
                            {phase.durationMinutes} Mins
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans pt-1">
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                            <p className="font-bold text-stone-900 font-mono text-[11px] uppercase">Teacher Activity:</p>
                            <p className="text-stone-700 leading-relaxed">{phase.teacherActivity}</p>
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                            <p className="font-bold text-stone-900 font-mono text-[11px] uppercase">Student Activity:</p>
                            <p className="text-stone-700 leading-relaxed">{phase.studentActivity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment & Differentiation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                    <h5 className="font-mono font-bold text-xs uppercase text-[#D92B8A]">Assessment Strategy</h5>
                    <p className="text-xs font-sans text-stone-700">{lessonPlan.assessmentStrategy}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                    <h5 className="font-mono font-bold text-xs uppercase text-[#D92B8A]">Differentiation Support</h5>
                    <p className="text-xs font-sans text-stone-700">{lessonPlan.differentiation?.support || 'Scaffolded questions and peer discussion'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Lesson Plan Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Configure your curriculum topic and duration to build a complete lesson plan with objectives, timed instructional phases, and assessment checkpoints.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
