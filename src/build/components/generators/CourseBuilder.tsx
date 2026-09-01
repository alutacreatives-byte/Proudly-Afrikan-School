import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Layers,
  Award
} from 'lucide-react';
import { CourseResource } from '../../types';
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
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [targetAudience, setTargetAudience] = useState<string>(existingResource?.targetAudience || 'Senior Secondary / High School (Grades 9-12)');
  const [moduleCount, setModuleCount] = useState<number>(4);
  const [sourceMaterial, setSourceMaterial] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // Output States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseResource | null>(existingResource || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a course topic.');
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
          topic,
          targetAudience,
          moduleCount,
          sourceMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate course syllabus.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated: CourseResource = {
          ...resData.data,
          sourceDocName: sourceFileName || undefined,
          toolType: 'course',
        };
        setCourse(generated);
        await consumeCredits('COURSE', `Generated Course: ${topic}`);
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
    const text = `# ${course.title}\nSubject: ${course.subject} | Audience: ${course.targetAudience}\nDuration: ${course.totalWeeksOrHours}\n\n` +
      `### COURSE OVERVIEW\n${course.courseOverview}\n\n` +
      `### MODULES\n` +
      course.modules.map(m => 
        `#### Module ${m.moduleNumber}: ${m.title}\n${m.description}\n` +
        `Outcomes:\n${m.learningOutcomes.map(o => `- ${o}`).join('\n')}\n` +
        `Topics: ${m.keyTopics.join(', ')}\n`
      ).join('\n') +
      (course.capstoneProject ? `\n### CAPSTONE PROJECT\n${course.capstoneProject}` : '');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63956]"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956]">
                GENERATOR 06 • FULL COURSE SYLLABUS
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              Comprehensive Course Builder
            </h1>
          </div>
        </div>

        {course && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200 font-mono text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-[#E63956]" />}
              <span>{saved ? 'Saved!' : 'Save Build'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#E63956]" />
              <span>Course Structure</span>
            </h2>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Subject Domain
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                Course Title / Subject *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Full-Stack Web Development, African Economic History"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-sans text-sm text-stone-900 focus:outline-none focus:border-[#E63956]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Audience Level
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-800 focus:outline-none focus:border-[#E63956]"
                >
                  {GRADE_LEVELS.map((gl) => (
                    <option key={gl} value={gl}>
                      {gl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                  Module Count
                </label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={moduleCount}
                  onChange={(e) => setModuleCount(Number(e.target.value) || 4)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-[#E63956]"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Attach Curriculum / Source Notes (Optional)
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
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:opacity-95 text-white font-display text-sm font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(230,57,86,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Architecting Curriculum...' : 'Generate Course Syllabus'}</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          {course ? (
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-stone-800 pb-5 space-y-2">
                <div className="font-mono text-xs font-bold text-stone-500 uppercase">
                  DURATION: {course.totalWeeksOrHours}
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
                  {course.title}
                </h2>
              </div>

              <div className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2">
                <div className="font-mono text-xs font-black uppercase tracking-wider text-stone-800">
                  COURSE OVERVIEW:
                </div>
                <p className="font-sans text-xs sm:text-sm text-stone-800 leading-relaxed">
                  {course.courseOverview}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-[#161616] border-b border-stone-200 pb-2">
                  Course Modules & Outcomes
                </h3>
                {course.modules.map((mod) => (
                  <div key={mod.moduleNumber} className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#E63956]">
                        MODULE {mod.moduleNumber}
                      </span>
                      <h4 className="font-display font-black text-base uppercase text-[#161616]">
                        {mod.title}
                      </h4>
                    </div>

                    <p className="font-sans text-xs text-stone-700 leading-relaxed">
                      {mod.description}
                    </p>

                    <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1">
                      <div className="font-mono text-[11px] font-bold text-stone-500 uppercase">
                        Learning Outcomes:
                      </div>
                      <ul className="list-disc list-inside space-y-1 font-sans text-xs text-stone-800">
                        {mod.learningOutcomes.map((o, oIdx) => (
                          <li key={oIdx}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
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
                  Enter your course subject on the left and click <strong>Generate Course Syllabus</strong> to synthesize multi-week modules, competencies, and capstone projects.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
