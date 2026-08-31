import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { CourseResource, CourseModule } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface CourseBuilderProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: CourseResource;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Business & Economics');
  const [courseTitle, setCourseTitle] = useState<string>(existingResource?.title || 'AfCFTA & Intra-African Trade Dynamics');
  const [targetAudience, setTargetAudience] = useState<string>(existingResource?.targetAudience || 'Tertiary / Undergraduate');
  const [durationWeeks, setDurationWeeks] = useState<number>(existingResource?.durationWeeks || 8);
  const [courseGoal, setCourseGoal] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      setError('Please provide a course title.');
      return;
    }

    const creditCheck = await consumeCredits('COURSE', `Generated Course: ${courseTitle.slice(0, 30)}`);
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
      const response = await fetch('/api/generate/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic: courseTitle,
          targetAudience,
          durationWeeks,
          courseGoal,
          sourceMaterial,
          sourceDocName: sourceFileName,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generated: CourseResource = {
          ...json.data,
          toolType: 'course-builder',
          durationWeeks,
          sourceDocName: sourceFileName,
        };
        setCourse(generated);
        saveResourceToStorage(generated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to synthesize course curriculum.');
      }
    } catch (err: any) {
      console.error('Course Builder Error:', err);
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!course) return;
    let text = `COURSE CURRICULUM: ${course.title.toUpperCase()}\n`;
    text += `Target: ${course.targetAudience} | Duration: ${course.durationWeeks} Weeks\n\n`;
    text += `DESCRIPTION:\n${course.description}\n\n`;
    text += `MODULES:\n`;
    course.modules.forEach((m) => {
      text += `\nModule ${m.moduleNumber}: ${m.title} (${m.estimatedHours} Hours)\n`;
      m.lessons.forEach((l, idx) => {
        text += `  Lesson ${idx + 1}: ${l.lessonTitle}\n    Objective: ${l.learningObjective}\n`;
      });
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const handleSave = () => {
    if (!course) return;
    saveResourceToStorage(course);
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
          Tool 07: Course Builder
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                Build A Course
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Modular multi-week syllabus & lesson breakdown
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
                Course Title or Topic *
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. AfCFTA & Cross-Border African Logistics"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Target Level
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Duration (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="w-full py-2 px-2 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Target Learning Outcomes (Optional)
              </label>
              <textarea
                rows={2}
                value={courseGoal}
                onChange={(e) => setCourseGoal(e.target.value)}
                placeholder="e.g. Master tariff policies, rules of origin, and transport corridors..."
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
                  <span>Synthesizing Course Syllabus...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Course Syllabus ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          {course ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-700">
                  {course.modules.length} Course Modules ({course.durationWeeks} Weeks)
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
                    PROUDLY AFRIKAN COURSE SYLLABUS
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                    {course.title.replace(/^Course:\s*/i, '')}
                  </h1>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono text-stone-600">
                    <span className="bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                      Level: {course.targetAudience}
                    </span>
                    <span className="bg-pink-50 text-[#D92B8A] px-3 py-1 rounded-full border border-pink-200 font-bold">
                      {course.durationWeeks} Weeks
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 text-xs font-sans text-stone-800 leading-relaxed">
                  {course.description}
                </div>

                <div className="space-y-4">
                  {course.modules.map((mod, mIdx) => (
                    <div key={mod.id || mIdx} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <h4 className="font-display font-black text-sm uppercase text-[#161616]">
                          Module {mod.moduleNumber}: {mod.title}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-full text-xs font-mono font-bold">
                          {mod.estimatedHours} Hours
                        </span>
                      </div>
                      <div className="space-y-2 pl-1">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div key={lesson.id || lIdx} className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1 text-xs font-sans">
                            <p className="font-bold text-[#161616]">
                              Lesson {lIdx + 1}: {lesson.lessonTitle}
                            </p>
                            <p className="text-stone-600">
                              <span className="font-mono text-[#D92B8A] font-bold">Outcome: </span>
                              {lesson.learningObjective}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Course Syllabus Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Enter your subject and target timeframe to generate a multi-module syllabus with granular lesson objectives and learning activities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
