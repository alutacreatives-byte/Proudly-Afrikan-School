import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Target,
  FileCode
} from 'lucide-react';
import { CourseBuildResult } from '../../types';
import { generateCourse } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface CourseBuilderGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: CourseBuildResult;
}

export const CourseBuilderGenerator: React.FC<CourseBuilderGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'PAN-AFRICAN STUDIES');
  const [title, setTitle] = useState<string>(existingResource?.title || '');
  const [targetAudience, setTargetAudience] = useState<string>(existingResource?.targetAudience || 'Senior Secondary / High School (Grades 9-12)');
  const [courseDuration, setCourseDuration] = useState<string>(existingResource?.totalWeeksOrHours || '8 Weeks (Standard)');
  const [pedagogicalStyle, setPedagogicalStyle] = useState<string>(existingResource?.pedagogicalStyle || 'Project-Based & Practical');
  const [assessmentStrategy, setAssessmentStrategy] = useState<string>(existingResource?.assessmentStrategy || 'Capstone Project + Quizzes');
  const [moduleCount, setModuleCount] = useState<number>(4);
  const [prerequisites, setPrerequisites] = useState<string>('');
  const [customFocus, setCustomFocus] = useState<string>('Highlight relevant African case studies, local contexts, and applied practical outcomes.');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseBuildResult | null>(
    existingResource && Array.isArray(existingResource.modules) && existingResource.modules.length > 0
      ? existingResource
      : null
  );
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    if (!course?.modules) return;
    const all: Record<number, boolean> = {};
    course.modules.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpandedModules(all);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const handleGenerate = async () => {
    if (!title.trim() && !sourceMaterial.trim()) {
      setError('Please provide a course title or upload curriculum specifications.');
      return;
    }

    if (!canAfford('COURSE')) {
      setError('Insufficient credits for Course Curriculum Builder. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateCourse({
        title: title.trim() || 'Comprehensive Curriculum Blueprint',
        topic: title.trim(),
        subject,
        targetAudience,
        courseDuration,
        pedagogicalStyle,
        assessmentStrategy,
        moduleCount,
        prerequisites: prerequisites.trim() || undefined,
        customFocus: customFocus.trim() || undefined,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setCourse(result);
      setExpandedModules({ 0: true });
      await consumeCredits('COURSE', `Generated Course Blueprint: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Course generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!course) return;
    saveResourceToStorage({
      id: course.id || `course-${Date.now()}`,
      toolType: 'course',
      title: course.title,
      subject: course.subject || subject,
      topic: course.title,
      createdAt: new Date().toISOString(),
      data: course,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!course) return;
    let text = `${course.title.toUpperCase()} - COURSE SYLLABUS\n`;
    text += `Subject: ${course.subject} | Target Audience: ${course.targetAudience}\n`;
    text += `Duration: ${course.totalWeeksOrHours} | Pedagogy: ${course.pedagogicalStyle}\n`;
    text += `Assessment: ${course.assessmentStrategy}\n\n`;

    text += `OVERVIEW:\n${course.courseOverview}\n\n`;

    text += `LEARNING OUTCOMES:\n`;
    (course.learningOutcomes || []).forEach((out, i) => {
      text += `${i + 1}. ${out}\n`;
    });
    text += `\n`;

    (course.modules || []).forEach((mod) => {
      text += `=========================================\n`;
      text += `MODULE ${mod.moduleNumber}: ${mod.title.toUpperCase()} (${mod.estimatedHours} Hours)\n`;
      text += `${mod.description}\n`;
      text += `Practical Task: ${mod.practicalProjectOrTask}\n`;
      text += `Lessons:\n`;
      (mod.lessons || []).forEach((les, lIdx) => {
        text += `  ${lIdx + 1}. ${les.lessonTitle} - Obj: ${les.learningObjective} [Activity: ${les.recommendedActivity}]\n`;
      });
      text += `\n`;
    });

    if (course.capstoneProject) {
      text += `CAPSTONE PROJECT:\n${course.capstoneProject}\n`;
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
            <span>75 Credits / Blueprint</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Curriculum Architecture
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <GraduationCap className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Curriculum Blueprint Studio</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          Curriculum Course Syllabus Builder
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Design multi-week academic syllabi, complete with learning outcomes, prerequisite competencies, weekly lesson units, practical laboratory/project tasks, and an integrative capstone project.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Configure Course Blueprint Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Academic Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="PAN-AFRICAN STUDIES">Pan-African History & Heritage</option>
              <option value="PHYSICAL & CHEMICAL SCIENCES">Physical & Chemical Sciences</option>
              <option value="LIFE SCIENCES & BIOTECH">Life Sciences & Biotechnology</option>
              <option value="MATHEMATICS & COMPUTATION">Mathematics & Computational Theory</option>
              <option value="AFRICAN ECONOMICS & TRADE">African Economics, Trade & Development</option>
              <option value="ENVIRONMENT & AGROECOLOGY">Environmental Systems & Agroecology</option>
              <option value="COMPUTER SCIENCE & SOFTWARE">Software Engineering & AI Architecture</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Course Title / Core Discipline *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pan-African Economic Integration & The AfCFTA"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Target Audience Level
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary / High School (Grades 9-12)</option>
              <option value="Undergraduate (Bachelor's Level)">Undergraduate (Bachelor's Level)</option>
              <option value="Postgraduate & Research">Postgraduate & Academic Research</option>
              <option value="Vocational & Industry Upskilling">Vocational & Industry Upskilling</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Course Duration & Format
            </label>
            <select
              value={courseDuration}
              onChange={(e) => setCourseDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="4 Weeks (Intensive Bootcamp)">4 Weeks (Intensive Bootcamp)</option>
              <option value="8 Weeks (Standard Term)">8 Weeks (Standard Term)</option>
              <option value="12 Weeks (Semester Blueprint)">12 Weeks (Semester Blueprint)</option>
              <option value="16 Weeks (Comprehensive Academic Year)">16 Weeks (Comprehensive Academic Year)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Pedagogical Methodology
            </label>
            <select
              value={pedagogicalStyle}
              onChange={(e) => setPedagogicalStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Project-Based & Practical">Project-Based & Practical (Hands-on execution)</option>
              <option value="Inquiry & Case-Study Driven">Inquiry & Case-Study Driven (African Contexts)</option>
              <option value="Academic Lecture & Seminar">Academic Lecture & Seminar</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Desired Number of Modules
            </label>
            <select
              value={moduleCount}
              onChange={(e) => setModuleCount(Number(e.target.value) || 4)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value={3}>3 Core Modules</option>
              <option value={4}>4 Core Modules (Recommended)</option>
              <option value={6}>6 Modules (Comprehensive)</option>
              <option value={8}>8 Modules (In-Depth)</option>
            </select>
          </div>
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Existing Curriculum Base / Source Notes (Optional)
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
              <span>Architecting Curriculum Course Syllabus & Modules...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Course Syllabus (75 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Syllabus Output */}
      {course && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-display font-bold uppercase cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-display font-bold uppercase cursor-pointer"
              >
                Collapse All
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Syllabus'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Syllabus</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Syllabus'}</span>
              </button>
            </div>
          </div>

          {/* Printable Course Syllabus */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-stone-900 pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#E05A2B] uppercase tracking-wider">
                  MASTER ACADEMIC COURSE SYLLABUS
                </span>
                <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                  {course.totalWeeksOrHours}
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-stone-900">
                {course.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-stone-600 uppercase">
                <span>SUBJECT: {course.subject}</span>
                <span>•</span>
                <span>AUDIENCE: {course.targetAudience}</span>
                <span>•</span>
                <span>PEDAGOGY: {course.pedagogicalStyle}</span>
              </div>
            </div>

            {/* Course Overview */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#E05A2B]" />
                <span>Course Overview & Learning Philosophy</span>
              </h3>
              <p className="text-stone-800 text-sm leading-relaxed font-medium">
                {course.courseOverview}
              </p>
            </div>

            {/* High-Level Learning Outcomes */}
            <div className="space-y-3">
              <h3 className="font-display font-black text-base uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E05A2B]" />
                <span>Terminal Course Competencies & Outcomes</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(course.learningOutcomes || []).map((out, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-stone-200 bg-white flex items-start gap-2.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-stone-800 font-medium leading-relaxed">
                      {out}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modules Accordion / List */}
            <div className="space-y-4">
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
                Curriculum Modules & Lesson Schedule
              </h3>

              <div className="space-y-4">
                {(course.modules || []).map((mod, mIdx) => {
                  const isExpanded = expandedModules[mIdx];
                  return (
                    <div
                      key={mod.moduleNumber || mIdx}
                      className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs"
                    >
                      {/* Module Header Bar */}
                      <button
                        type="button"
                        onClick={() => toggleModule(mIdx)}
                        className="w-full p-5 flex items-center justify-between text-left bg-stone-50/70 hover:bg-stone-100 transition-colors border-b border-stone-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {mod.moduleNumber}
                          </span>
                          <div>
                            <h4 className="font-display font-black text-sm uppercase text-stone-900">
                              {mod.title}
                            </h4>
                            <span className="font-mono text-xs text-stone-500 font-bold uppercase">
                              Est. {mod.estimatedHours} Hours of Study
                            </span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-stone-600" /> : <ChevronDown className="w-5 h-5 text-stone-600" />}
                      </button>

                      {/* Module Body */}
                      <div className={`p-6 space-y-5 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                        <p className="text-stone-800 text-xs leading-relaxed font-medium">
                          {mod.description}
                        </p>

                        {/* Practical Task */}
                        {mod.practicalProjectOrTask && (
                          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                            <div className="font-display font-black text-xs uppercase tracking-wider text-amber-900">
                              Applied Module Lab / Practical Task
                            </div>
                            <p className="text-xs text-amber-950 font-medium">
                              {mod.practicalProjectOrTask}
                            </p>
                          </div>
                        )}

                        {/* Lessons List */}
                        {mod.lessons && mod.lessons.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
                              Lessons & Instructional Breakdown:
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                              {mod.lessons.map((les, lIdx) => (
                                <div
                                  key={lIdx}
                                  className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-1 text-xs"
                                >
                                  <div className="font-display font-black uppercase text-stone-900">
                                    {les.lessonTitle}
                                  </div>
                                  <div className="text-stone-700">
                                    <strong>Objective:</strong> {les.learningObjective}
                                  </div>
                                  {les.recommendedActivity && (
                                    <div className="text-stone-600 italic">
                                      <strong>Activity:</strong> {les.recommendedActivity}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Capstone Project */}
            {course.capstoneProject && (
              <div className="p-6 rounded-2xl bg-[#18181B] text-white space-y-2">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase tracking-wider text-[#E05A2B]">
                  <Award className="w-4 h-4" />
                  <span>Integrative Capstone Final Project</span>
                </div>
                <p className="text-stone-200 text-xs sm:text-sm leading-relaxed font-medium">
                  {course.capstoneProject}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
