import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  BookOpen, 
  Calendar, 
  Layers, 
  Award, 
  Clock, 
  Target, 
  FileCheck, 
  CheckCircle2 
} from 'lucide-react';
import { CourseResource } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface CourseBuilderProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: CourseResource;
}

const DURATION_OPTIONS = [
  '4 Weeks (Accelerated / Intensive)',
  '6 Weeks (Modular Cohort)',
  '8 Weeks (Standard Semester)',
  '12 Weeks (Comprehensive Curriculum)',
  '16 Weeks (Full Academic Term)',
  'Self-Paced (Flexible Mastery)',
];

const PEDAGOGY_OPTIONS = [
  'Project-Based & Practical Application',
  'Academic Rigor & Theoretical Inquiry',
  'Case Study & Real-World Implementation',
  'Exam & Certification Prep',
  'Blended & Flipped Classroom',
];

const ASSESSMENT_OPTIONS = [
  'Capstone Project + Module Quizzes',
  'Midterm & Final Examination',
  'Continuous Practical Labs & Portfolio',
  'Peer Review & Viva Voce Defense',
];

export const CourseBuilder: React.FC<CourseBuilderProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [targetAudience, setTargetAudience] = useState<string>(existingResource?.targetAudience || 'Senior Secondary / High School (Grades 9-12)');
  const [courseDuration, setCourseDuration] = useState<string>(existingResource?.totalWeeksOrHours || '8 Weeks (Standard Semester)');
  const [pedagogicalStyle, setPedagogicalStyle] = useState<string>(existingResource?.pedagogicalStyle || 'Project-Based & Practical Application');
  const [assessmentStrategy, setAssessmentStrategy] = useState<string>(existingResource?.assessmentStrategy || 'Capstone Project + Module Quizzes');
  const [moduleCount, setModuleCount] = useState<number>(4);
  const [prerequisites, setPrerequisites] = useState<string>(
    Array.isArray(existingResource?.prerequisites) ? existingResource?.prerequisites.join(', ') : ''
  );
  const [customFocus, setCustomFocus] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingResource) {
      setCourse(existingResource);
      if (existingResource.subject) setSubject(existingResource.subject);
      if (existingResource.topic) setTopic(existingResource.topic);
      if (existingResource.targetAudience) setTargetAudience(existingResource.targetAudience);
      if (existingResource.totalWeeksOrHours) setCourseDuration(existingResource.totalWeeksOrHours);
      if (existingResource.pedagogicalStyle) setPedagogicalStyle(existingResource.pedagogicalStyle);
      if (existingResource.assessmentStrategy) setAssessmentStrategy(existingResource.assessmentStrategy);
      if (existingResource.sourceDocName) setSourceFileName(existingResource.sourceDocName);
      if (Array.isArray(existingResource.prerequisites)) {
        setPrerequisites(existingResource.prerequisites.join(', '));
      }
      if (existingResource.modules && existingResource.modules.length > 0) {
        setModuleCount(existingResource.modules.length);
      }
    }
  }, [existingResource]);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a course topic or attach syllabus notes.');
      return;
    }

    if (!canAfford('COURSE')) {
      setError('Insufficient credits for Course generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic: topic.trim() || 'Curriculum Course',
          targetAudience,
          moduleCount,
          courseDuration,
          pedagogicalStyle,
          assessmentStrategy,
          prerequisites: prerequisites.trim() || undefined,
          customFocus: customFocus.trim() || undefined,
          sourceMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate course syllabus.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generatedCourse: CourseResource = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'course',
        };
        setCourse(generatedCourse);
        saveResourceToStorage(generatedCourse);
        if (onSaved) onSaved();
        await consumeCredits('COURSE', `Generated Course: ${topic}`);

        // Smoothly scroll down to generated result
        setTimeout(() => {
          const el = document.getElementById('generated-course-result');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else {
        throw new Error(resData.error || 'Server returned invalid course format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!course) return;
    saveResourceToStorage(course);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!course) return;
    let fullText = `${course.title.toUpperCase()}\n`;
    fullText += `Subject: ${course.subject} | Audience: ${course.targetAudience} | Duration: ${course.totalWeeksOrHours}\n`;
    fullText += `Pedagogy: ${course.pedagogicalStyle} | Assessment: ${course.assessmentStrategy}\n\n`;
    const overviewText = course.courseOverview || (course as any).courseDescription;
    if (overviewText) {
      fullText += `COURSE OVERVIEW:\n${overviewText}\n\n`;
    }
    const objectives = (course as any).learningObjectives;
    if (objectives && objectives.length > 0) {
      fullText += `LEARNING OBJECTIVES:\n${objectives.map((o: any, i: number) => `${i + 1}. ${o}`).join('\n')}\n\n`;
    }
    course.modules.forEach((m) => {
      const title = m.title || (m as any).moduleTitle || `Module ${m.moduleNumber}`;
      const duration = m.estimatedHours ? `${m.estimatedHours} hrs` : (m as any).durationOrHours || '';
      fullText += `=== MODULE ${m.moduleNumber}: ${title.toUpperCase()} ${duration ? `(${duration})` : ''} ===\n`;
      fullText += `${m.description || (m as any).moduleDescription || ''}\n`;
      if (m.lessons && m.lessons.length > 0) {
        fullText += `Lessons:\n`;
        m.lessons.forEach((les, li) => {
          fullText += `  ${li + 1}. ${les.lessonTitle}\n`;
          if (les.learningObjective) fullText += `     Objective: ${les.learningObjective}\n`;
        });
      }
      if (m.practicalProjectOrTask) {
        fullText += `Practical Task: ${m.practicalProjectOrTask}\n`;
      }
      fullText += '\n';
    });

    if (course.capstoneProject) {
      fullText += `CAPSTONE PROJECT:\n${course.capstoneProject}\n`;
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
                BUILDER 06 • FULL COURSE SYLLABUS
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Course Curriculum Architect
            </h1>
          </div>
        </div>

        {course && (
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
            <span className="font-mono text-base text-stone-500">Course Architecture & Specifications</span>
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
                  Course Title / Subject *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Modern African Economic History & Digital Trade"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
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
                  Module Count
                </label>
                <select
                  value={moduleCount}
                  onChange={(e) => setModuleCount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  <option value={3}>3 Modules (Concise)</option>
                  <option value={4}>4 Modules (Quarter)</option>
                  <option value={5}>5 Modules (Standard)</option>
                  <option value={6}>6 Modules (Semester)</option>
                  <option value={8}>8 Modules (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Course Duration & Pacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#E63956]" />
                  <span>Course Duration & Timeline</span>
                </label>
                <select
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#E63956]" />
                  <span>Pedagogical Methodology</span>
                </label>
                <select
                  value={pedagogicalStyle}
                  onChange={(e) => setPedagogicalStyle(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {PEDAGOGY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assessment Strategy */}
            <div className="space-y-2">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#E63956]" />
                <span>Assessment & Evaluation Strategy</span>
              </label>
              <select
                value={assessmentStrategy}
                onChange={(e) => setAssessmentStrategy(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {ASSESSMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Prerequisites & Special Focus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Prerequisites (Optional)
                </label>
                <input
                  type="text"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="e.g. Basic secondary math, introductory economics"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700">
                  Special Focus / African Case Studies (Optional)
                </label>
                <input
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="e.g. Highlight AfCFTA trade pact, local innovators"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-sans text-base text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            {/* Source Material Upload */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-mono text-base font-bold uppercase tracking-wider text-stone-700 block">
                Attach Curriculum / Source Notes (Optional)
              </label>
              <SourceMaterialUpload
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
              <span>{isGenerating ? 'COURSE CURRICULUM LOADING…' : 'Generate Course Syllabus'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: GENERATED RESULT */}
        <div id="generated-course-result" className="w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
            <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              GENERATED RESULT
            </h2>
            {course && (
              <span className="font-mono text-base text-emerald-700 font-bold">
                Course Syllabus Ready
              </span>
            )}
          </div>

          {course ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Top Banner */}
              <div className="border-b-2 border-stone-800 pb-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-stone-100 rounded-full font-mono text-base font-bold text-stone-700 uppercase">
                    {course.subject}
                  </span>
                  <span className="px-3.5 py-1.5 bg-pink-50 border border-pink-200 rounded-full font-mono text-base font-bold text-[#E63956] uppercase">
                    {course.totalWeeksOrHours}
                  </span>
                  <span className="px-3.5 py-1.5 bg-stone-100 rounded-full font-mono text-base font-bold text-stone-700 uppercase">
                    {course.targetAudience}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {course.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-base font-mono text-stone-600 pt-1">
                  <div><strong>Pedagogy:</strong> {course.pedagogicalStyle || 'Applied Learning'}</div>
                  <div><strong>Assessment:</strong> {course.assessmentStrategy || 'Capstone & Quizzes'}</div>
                </div>
              </div>

              {/* Course Overview */}
              {(course.courseOverview || (course as any).courseDescription) && (
                <div className="p-6 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-mono text-base font-black uppercase tracking-wider text-stone-800">
                    <BookOpen className="w-5 h-5 text-[#E63956]" />
                    <span>COURSE OVERVIEW & PHILOSOPHY:</span>
                  </div>
                  <p className="font-sans text-base text-stone-800 leading-relaxed">
                    {course.courseOverview || (course as any).courseDescription}
                  </p>
                </div>
              )}

              {/* Learning Objectives */}
              {(course as any).learningObjectives && (course as any).learningObjectives.length > 0 && (
                <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-mono text-base font-black uppercase tracking-wider text-stone-800">
                    <Target className="w-5 h-5 text-[#E63956]" />
                    <span>PROGRAM LEARNING OBJECTIVES:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 font-mono text-base text-stone-700">
                    {((course as any).learningObjectives as string[]).map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modules List */}
              <div className="space-y-6">
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#161616] border-b border-stone-200 pb-3">
                  Curricular Modules & Lessons
                </h3>
                {course.modules.map((mod) => (
                  <div key={mod.moduleNumber} className="p-6 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                      <div>
                        <span className="font-mono text-base font-bold text-[#E63956] uppercase">
                          MODULE {mod.moduleNumber} • {mod.estimatedHours ? `${mod.estimatedHours} hrs` : (mod as any).durationOrHours || ''}
                        </span>
                        <h4 className="font-display font-black text-xl sm:text-2xl uppercase text-[#161616]">
                          {mod.title || (mod as any).moduleTitle}
                        </h4>
                      </div>
                    </div>

                    <p className="font-sans text-base text-stone-700 leading-relaxed">
                      {mod.description || (mod as any).moduleDescription}
                    </p>

                    {mod.lessons && mod.lessons.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="font-mono text-base font-bold uppercase tracking-wider text-stone-600">
                          Lessons Breakdown:
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {mod.lessons.map((les, lIdx) => (
                            <div key={lIdx} className="p-4 bg-white border border-stone-200/80 rounded-xl text-base space-y-1.5">
                              <div className="font-bold text-stone-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#E63956]"></span>
                                <span>{les.lessonTitle}</span>
                              </div>
                              {les.learningObjective && (
                                <p className="text-stone-600 text-base pl-4">
                                  <strong>Objective:</strong> {les.learningObjective}
                                </p>
                              )}
                              {les.recommendedActivity && (
                                <p className="text-stone-600 text-base pl-4">
                                  <strong>Activity:</strong> {les.recommendedActivity}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mod.practicalProjectOrTask && (
                      <div className="p-4 bg-pink-50/50 border border-pink-200/80 rounded-xl text-base space-y-1">
                        <div className="font-mono text-base font-bold text-[#E63956] uppercase">
                          Module Practical Task / Lab:
                        </div>
                        <p className="font-sans text-stone-800 text-base">
                          {mod.practicalProjectOrTask}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Capstone Project / Final Assessment */}
              {course.capstoneProject && (
                <div className="p-6 bg-gradient-to-br from-[#161616] to-stone-900 text-white rounded-3xl space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-[#E63956] font-mono text-base font-bold uppercase tracking-wider">
                    <Award className="w-5 h-5" />
                    <span>Integrative Capstone Defense & Project</span>
                  </div>
                  <h4 className="font-display font-black text-xl uppercase">
                    Comprehensive Culminating Assessment
                  </h4>
                  <p className="font-sans text-base text-stone-300 leading-relaxed">
                    {course.capstoneProject}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  Course Syllabus Preview
                </h3>
                <p className="font-sans text-base text-stone-500 leading-relaxed">
                  Configure your course parameters above and click <strong>Generate Course Syllabus</strong> to synthesize a complete academic curriculum with modules, lessons, and capstones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
