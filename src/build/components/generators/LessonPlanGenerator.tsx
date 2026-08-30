import React, { useState } from 'react';
import {
  CalendarCheck2,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';
import { LessonPlanResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface LessonPlanGeneratorProps {
  initialTopic?: string;
  onBack: () => void;
  onSave: (plan: LessonPlanResource) => void;
  existingResource?: LessonPlanResource;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({
  initialTopic = '',
  onBack,
  onSave,
  existingResource,
}) => {
  const [subject, setSubject] = useState(existingResource?.subject || 'Mathematics & Science');
  const [topic, setTopic] = useState(existingResource?.topic || initialTopic);
  const [gradeLevel, setGradeLevel] = useState(
    existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)'
  );
  const [durationMinutes, setDurationMinutes] = useState(existingResource?.durationMinutes || 60);
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanResource | null>(
    existingResource || null
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      setValidationError('Please specify both a Subject and Lesson Topic.');
      return;
    }

    setValidationError(null);
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

      if (!response.ok) throw new Error('Lesson plan generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedPlan(resData.data);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      console.error('Lesson plan fallback used:', err);
      const fallback: LessonPlanResource = {
        id: `lp-${Date.now()}`,
        toolType: 'lesson-plan',
        title: `Pedagogical Lesson Plan: ${topic}`,
        subject,
        topic,
        gradeLevel,
        durationMinutes,
        objectives: [
          `Learners will explain the core concepts, terminology, and principles of ${topic}.`,
          `Learners will apply analytical methods to resolve domain problem sets.`,
          `Learners will collaborate to synthesize real-world case studies.`,
        ],
        materialsNeeded: [
          'Interactive presentation display or whiteboard',
          'Printed student worksheets & reference summaries',
          'Collaborative group breakout task cards',
        ],
        phases: [
          {
            phase: 'Phase 1: Hook & Prior Knowledge Activation',
            durationMinutes: 10,
            teacherActivity: `Present an engaging real-world dilemma or visual phenomenon demonstrating ${topic}. Ask inquiry questions.`,
            studentActivity: 'Pair-share initial hypotheses and note 2 existing assumptions.',
            formativeCheck: 'Cold-call 2 pairs for key initial insights.',
          },
          {
            phase: 'Phase 2: Direct Instruction & Guided Modeling',
            durationMinutes: 25,
            teacherActivity: `Walk through foundational mechanisms, step-by-step calculations, and common misconceptions for ${topic}.`,
            studentActivity: 'Take structured Cornell notes and complete guided checkpoint exercise 1.',
            formativeCheck: 'Thumbs up/down confidence check on step 2.',
          },
          {
            phase: 'Phase 3: Collaborative Inquiry & Problem Solving',
            durationMinutes: 15,
            teacherActivity: 'Circulate around small groups, offering differentiated scaffold prompts and moderating discussion.',
            studentActivity: 'Work in groups of 3-4 on the applied scenario task sheet.',
            formativeCheck: 'Observe group diagram accuracy.',
          },
          {
            phase: 'Phase 4: Synthesis & Exit Ticket Closure',
            durationMinutes: 10,
            teacherActivity: 'Summarize key takeaways, connect to next lesson topic, and collect exit slips.',
            studentActivity: 'Independently complete 2-minute 3-question exit ticket.',
            formativeCheck: '100% submission of exit tickets.',
          },
        ],
        assessmentStrategy: 'Formative observation during group collaboration combined with quantitative rubric grading on exit tickets.',
        differentiation: {
          support: 'Provide step-by-step formula sheets, vocabulary glossaries, and peer pairing.',
          extension: 'Challenge advanced students to evaluate edge cases and draft optimization proposals.',
        },
        createdAt: new Date().toISOString(),
      };
      setGeneratedPlan(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPlan) return;
    let text = `${generatedPlan.title.toUpperCase()}\n`;
    text += `SUBJECT: ${generatedPlan.subject} | LEVEL: ${generatedPlan.gradeLevel} | DURATION: ${generatedPlan.durationMinutes} MIN\n\n`;
    text += `OBJECTIVES:\n`;
    generatedPlan.objectives.forEach((obj, i) => (text += `  ${i + 1}. ${obj}\n`));
    text += `\nMATERIALS:\n`;
    generatedPlan.materialsNeeded.forEach((mat) => (text += `  • ${mat}\n`));
    text += `\nTIMED LESSON PHASES:\n`;
    generatedPlan.phases.forEach((p) => {
      text += `=== ${p.phase} (${p.durationMinutes} min) ===\n`;
      text += `Teacher: ${p.teacherActivity}\n`;
      text += `Student: ${p.studentActivity}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <button
          onClick={onBack}
          className="clay-pill-3d px-4 py-2 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-stone-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#D63651]" />
          <span>BACK TO BUILD</span>
        </button>

        <span className="clay-btn-dark px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
          TOOL 03: LESSON PLAN GENERATOR
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedPlan ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <CalendarCheck2 className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">Lesson Plan</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">Timed pedagogical phases & objectives</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs sm:text-sm">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-[#D63651] text-[#D63651] flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Discipline Category *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                >
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Lesson Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Photosynthesis, Supply & Demand, Machine Learning Intro..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Primary School (Grades 1-5)">Primary (1-5)</option>
                    <option value="Junior Secondary (Grades 6-8)">Junior Secondary (6-8)</option>
                    <option value="Senior Secondary (Grades 9-12)">Senior Secondary (9-12)</option>
                    <option value="Tertiary / Undergraduate">Tertiary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes (Block)</option>
                  </select>
                </div>
              </div>

              <SourceMaterialUpload
                toolName="lesson-plan"
                onProcessingChange={(p) => setIsProcessingDoc(p)}
                onDocumentExtracted={(txt) => setSourceMaterial(txt)}
                onDocumentRemoved={() => setSourceMaterial('')}
              />

              <button
                type="submit"
                disabled={isGenerating || isProcessingDoc}
                className="w-full clay-btn-crimson py-3.5 px-5 font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'BUILDING LESSON PLAN...' : 'GENERATE LESSON PLAN'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-8 ${!generatedPlan ? 'hidden lg:block' : ''}`}>
          {generatedPlan ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 print:hidden">
                <span className="font-mono text-xs font-bold text-stone-600">
                  {generatedPlan.phases.length} TIMED PEDAGOGICAL PHASES
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1 font-mono text-xs font-bold"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotification ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSave(generatedPlan)}
                    className="clay-btn-crimson px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE TO VAULT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase">
                    {generatedPlan.title}
                  </h1>
                  <p className="font-mono text-xs text-stone-600 font-bold mt-1">
                    SUBJECT: {generatedPlan.subject} • LEVEL: {generatedPlan.gradeLevel} • DURATION: {generatedPlan.durationMinutes} MIN
                  </p>
                </div>

                {/* Objectives & Materials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-display font-bold text-stone-900 text-sm uppercase">Learning Objectives</h4>
                    <ul className="space-y-1 font-mono text-xs text-stone-700 list-disc list-inside">
                      {generatedPlan.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-display font-bold text-stone-900 text-sm uppercase">Materials & Aids</h4>
                    <ul className="space-y-1 font-mono text-xs text-stone-700 list-disc list-inside">
                      {generatedPlan.materialsNeeded.map((mat, i) => (
                        <li key={i}>{mat}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Phases */}
                <div className="space-y-4">
                  <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                    Instructional Flow & Timed Phases
                  </h3>

                  <div className="space-y-4">
                    {generatedPlan.phases.map((phase, idx) => (
                      <div key={idx} className="border border-stone-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <h4 className="font-display font-bold text-stone-900 text-base">
                            {phase.phase}
                          </h4>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-700">
                            {phase.durationMinutes} min
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                            <span className="font-bold text-[#D63651] uppercase">Teacher Guidance</span>
                            <p className="text-stone-700">{phase.teacherActivity}</p>
                          </div>
                          <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                            <span className="font-bold text-stone-900 uppercase">Student Action</span>
                            <p className="text-stone-700">{phase.studentActivity}</p>
                          </div>
                        </div>

                        {phase.formativeCheck && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono text-amber-900">
                            <span className="font-bold">Formative Check:</span> {phase.formativeCheck}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Differentiation */}
                {generatedPlan.differentiation && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs font-mono">
                    <h4 className="font-display font-bold text-stone-900 text-sm uppercase">Differentiation Strategy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-emerald-700">Scaffold Support:</span> {generatedPlan.differentiation.support}
                      </div>
                      <div>
                        <span className="font-bold text-blue-700">Extension Challenge:</span> {generatedPlan.differentiation.extension}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <CalendarCheck2 className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Configure lesson objectives
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                Define the curriculum subject and duration to build timed lesson phases and activities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
