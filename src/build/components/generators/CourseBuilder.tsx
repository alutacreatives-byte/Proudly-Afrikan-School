import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CourseBuilderResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface CourseBuilderProps {
  initialTopic?: string;
  onBack: () => void;
  onSave: (course: CourseBuilderResource) => void;
  existingResource?: CourseBuilderResource;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({
  initialTopic = '',
  onBack,
  onSave,
  existingResource,
}) => {
  const [subject, setSubject] = useState(existingResource?.subject || 'Engineering & Technology');
  const [topic, setTopic] = useState(existingResource?.topic || initialTopic);
  const [targetAudience, setTargetAudience] = useState(
    existingResource?.targetAudience || 'Tertiary / Undergraduate'
  );
  const [weeksCount, setWeeksCount] = useState(existingResource?.totalWeeks || 8);
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<CourseBuilderResource | null>(
    existingResource || null
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      setValidationError('Please specify both Subject and Course Topic.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/course-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          targetAudience,
          weeksCount,
          sourceMaterial,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedCourse(resData.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Course builder fallback used:', err);
      const fallback: CourseBuilderResource = {
        id: `course-${Date.now()}`,
        toolType: 'course-builder',
        title: `Comprehensive Syllabus: ${topic}`,
        courseCode: 'AFR-301',
        subject,
        topic,
        targetAudience,
        prerequisites: ['Basic introductory knowledge in quantitative reasoning', 'General science foundation'],
        courseOverview: `A rigorous multi-week curriculum exploring the foundational, computational, and practical implementations of ${topic}.`,
        totalWeeks: Number(weeksCount) || 8,
        weeklySyllabus: [
          {
            weekNumber: 1,
            title: 'Week 1: Foundations, History & Theoretical Paradigms',
            description: 'Introduction to foundational axioms, nomenclature, and developmental context.',
            lectureTopics: ['Origins & Definition', 'Core Mathematical/Structural Models', 'Domain Terminology'],
            requiredReadings: ['Chapter 1: Foundational Frameworks', 'Regional Case Study #1'],
            assignmentOrMilestone: 'Diagnostic reflection paper (500 words)',
          },
          {
            weekNumber: 2,
            title: 'Week 2: Quantitative Mechanics & Systems Analysis',
            description: 'Deep dive into deterministic and stochastic modeling.',
            lectureTopics: ['System Dynamics', 'Equilibrium Criteria', 'Computational Simulation'],
            requiredReadings: ['Technical Paper: Systemic Interventions in Africa'],
            assignmentOrMilestone: 'Problem Set 1 (10 computational questions)',
          },
          {
            weekNumber: 3,
            title: 'Week 3: Practical Implementation & Capstone Project Formulation',
            description: 'Translating theory into scalable industrial or community solutions.',
            lectureTopics: ['Scalability Constraints', 'Policy & Ethics', 'Capstone Proposal Workshop'],
            requiredReadings: ['Industry Whitepaper: Future Horizons'],
            assignmentOrMilestone: 'Capstone Project Proposal Submission',
          },
        ],
        gradingCriteria: [
          { item: 'Weekly Problem Sets', percentage: 30 },
          { item: 'Midterm Examination', percentage: 25 },
          { item: 'Collaborative Capstone Project', percentage: 35 },
          { item: 'Participation & Engagement', percentage: 10 },
        ],
        createdAt: new Date().toISOString(),
      };
      setGeneratedCourse(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCourse) return;
    let text = `${generatedCourse.title.toUpperCase()}\n`;
    text += `CODE: ${generatedCourse.courseCode} | SUBJECT: ${generatedCourse.subject} | DURATION: ${generatedCourse.totalWeeks} WEEKS\n\n`;
    text += `OVERVIEW:\n${generatedCourse.courseOverview}\n\n`;
    text += `WEEKLY SYLLABUS:\n`;
    generatedCourse.weeklySyllabus.forEach((w) => {
      text += `=== ${w.title} ===\n`;
      text += `${w.description}\n`;
      w.lectureTopics.forEach((lt) => (text += `  • Lecture: ${lt}\n`));
      if (w.assignmentOrMilestone) text += `  • Milestone: ${w.assignmentOrMilestone}\n`;
      text += `\n`;
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
          TOOL 07: COURSE BUILDER
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedCourse ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">Course Builder</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">Multi-week university-grade syllabi</p>
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
                <label className="block font-bold text-stone-900 uppercase mb-1">Academic Discipline *</label>
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
                <label className="block font-bold text-stone-900 uppercase mb-1">Course Topic / Scope *</label>
                <input
                  type="text"
                  placeholder="e.g. Applied Machine Learning, Pan-African Economics..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Senior Secondary / Advanced Placement">Advanced High School</option>
                    <option value="Tertiary / Undergraduate">Undergraduate</option>
                    <option value="Postgraduate / Professional">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Duration</label>
                  <select
                    value={weeksCount}
                    onChange={(e) => setWeeksCount(Number(e.target.value))}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value={4}>4 Weeks (Short)</option>
                    <option value={8}>8 Weeks (Standard)</option>
                    <option value={12}>12 Weeks (Semester)</option>
                  </select>
                </div>
              </div>

              <SourceMaterialUpload
                toolName="course-builder"
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
                <span>{isGenerating ? 'DESIGNING SYLLABUS...' : 'BUILD COMPLETE COURSE'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-8 ${!generatedCourse ? 'hidden lg:block' : ''}`}>
          {generatedCourse ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 print:hidden">
                <span className="font-mono text-xs font-bold text-stone-600">
                  {generatedCourse.weeklySyllabus.length} ACADEMIC MODULES
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
                    onClick={() => onSave(generatedCourse)}
                    className="clay-btn-crimson px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE TO VAULT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#D63651] font-bold uppercase mb-1">
                    <span>{generatedCourse.courseCode || 'AFR-COURSE'}</span>
                    <span>•</span>
                    <span>{generatedCourse.totalWeeks} WEEKS</span>
                  </div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase">
                    {generatedCourse.title}
                  </h1>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
                  <h3 className="font-display font-bold text-stone-900 text-base uppercase">Course Scope & Overview</h3>
                  <p className="font-mono text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {generatedCourse.courseOverview}
                  </p>
                </div>

                {/* Grading Weight Breakdown */}
                {generatedCourse.gradingCriteria && (
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2">
                    <h4 className="font-display font-bold text-stone-900 text-sm uppercase">Assessment Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {generatedCourse.gradingCriteria.map((gc, i) => (
                        <div key={i} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-center font-mono text-xs">
                          <span className="font-bold text-stone-900 block">{gc.percentage}%</span>
                          <span className="text-[11px] text-stone-500">{gc.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Modules */}
                <div className="space-y-4">
                  <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                    Weekly Curriculum & Lecture Sequence
                  </h3>

                  <div className="space-y-4">
                    {generatedCourse.weeklySyllabus.map((week, idx) => (
                      <div key={idx} className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <h4 className="font-display font-bold text-stone-900 text-base">
                            {week.title}
                          </h4>
                          <span className="font-mono text-xs font-bold text-[#D63651]">
                            Week {week.weekNumber}
                          </span>
                        </div>

                        <p className="font-mono text-xs text-stone-600">{week.description}</p>

                        <div className="space-y-2 pt-1 font-mono text-xs">
                          <div>
                            <span className="font-bold text-stone-800 uppercase block mb-1">Lecture Topics:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                              {week.lectureTopics.map((lt, i) => (
                                <li key={i}>{lt}</li>
                              ))}
                            </ul>
                          </div>

                          {week.assignmentOrMilestone && (
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 mt-2">
                              <span className="font-bold">Milestone / Deliverable:</span> {week.assignmentOrMilestone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Configure syllabus structure
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                Generate university-standard multi-week courses complete with lecture schedules, milestones, and grading rubrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
