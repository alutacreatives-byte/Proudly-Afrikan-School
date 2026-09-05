import React, { useState, useEffect } from 'react';
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
  Target,
  FileText
} from 'lucide-react';
import { LessonPlanData, SavedResource } from '../../types';
import { generateLessonPlanApi } from '../../services/buildService';
import { saveResourceToStorage } from '../../utils/storage';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface LessonPlanGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  initialResource?: SavedResource | null;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({
  onBack,
  onGoHome,
  initialResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [topic, setTopic] = useState<string>(initialResource?.topic || initialResource?.title || '');
  const [subject, setSubject] = useState<string>(initialResource?.subject || 'History & Geography');
  const [gradeLevel, setGradeLevel] = useState<string>(initialResource?.gradeLevel || 'Secondary / High School (Grades 9-12)');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [pedagogyStyle, setPedagogyStyle] = useState<string>('Inquiry-Based & African Centered');
  const [sourceMaterial, setSourceMaterial] = useState<string>(initialResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(initialResource?.documentName || '');

  // Active Result State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<LessonPlanData | null>(initialResource?.data || null);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialResource?.data) {
      setResult(initialResource.data);
    }
  }, [initialResource]);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a lesson topic or attach syllabus notes.');
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
      const data = await generateLessonPlanApi({
        subject,
        topic: topic.trim() || 'Classroom Pedagogical Lesson Plan',
        gradeLevel,
        durationMinutes,
        pedagogyStyle,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setResult(data);
      await consumeCredits('LESSON_PLAN', `Generated Lesson Plan: ${data.title}`);

      // Smooth scroll to generated lesson plan
      setTimeout(() => {
        const el = document.getElementById('generated-lessonplan-result');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lesson plan generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveResourceToStorage({
      id: result.id || `lesson-${Date.now()}`,
      toolType: 'lesson-plan',
      title: result.title,
      subject: result.subject || subject,
      topic: result.topic || topic,
      gradeLevel: result.gradeLevel || gradeLevel,
      createdAt: new Date().toISOString(),
      data: result,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `# ${result.title}\nSubject: ${result.subject} | Grade: ${result.gradeLevel} | Duration: ${result.totalDurationMinutes}m\n\n`;
    
    if (result.learningObjectives && result.learningObjectives.length > 0) {
      text += `LEARNING OBJECTIVES:\n${result.learningObjectives.map((o) => `• ${o}`).join('\n')}\n\n`;
    }

    (result.phases || []).forEach((p, idx) => {
      text += `### Phase ${idx + 1}: ${p.phaseName} (${p.durationMinutes}m)\n`;
      text += `Teacher: ${p.teacherActivity}\n`;
      text += `Students: ${p.studentActivity}\n`;
      text += `Assessment: ${p.assessmentStrategy}\n\n`;
    });

    if (result.homeworkOrExtension) {
      text += `HOMEWORK / EXTENSION:\n${result.homeworkOrExtension}\n\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
            <div>
              <span className="font-mono text-base font-bold text-[#E63956] uppercase tracking-wider block">
                BUILD TOOL 05 • TEACHING & PEDAGOGY
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
                LESSON PLAN GENERATOR
              </h1>
            </div>
          </div>

          {result && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] text-white font-mono text-base font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>{saved ? 'Saved' : 'Save Lesson Plan'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Sparkles className="w-5 h-5 text-[#E63956]" />
                <h2 className="font-display font-black text-lg uppercase text-[#161616] tracking-wider">
                  Lesson Parameters
                </h2>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Lesson Topic / Unit Goal *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Chinua Achebe's Things Fall Apart Literary Analysis"
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                >
                  <option value="Languages & Literature">Languages & Literature</option>
                  <option value="History & Geography">History & Geography</option>
                  <option value="Sciences & STEM">Sciences & STEM</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Civics & Economics">Civics & Economics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value="Primary (Grades 1-5)">Primary (1-5)</option>
                    <option value="Junior Sec (Grades 6-8)">Junior Sec (6-8)</option>
                    <option value="Senior Sec (Grades 9-12)">Senior Sec (9-12)</option>
                    <option value="Tertiary / University">Tertiary / Uni</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value={40}>40 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes (Double Period)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Optional Source Syllabus (PDF / Notes)
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
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-base font-mono">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-4 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isGenerating ? 'LESSON PLAN LOADING…' : 'Generate Lesson Plan →'}</span>
              </button>
            </div>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-8" id="generated-lessonplan-result">
            {isGenerating ? (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E63956]/10 text-[#E63956] flex items-center justify-center animate-bounce">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
                    LESSON PLAN LOADING…
                  </h3>
                  <p className="text-stone-600 text-base font-normal max-w-md">
                    Structuring learning outcomes, timing pedagogical phases, teacher prompts, and assessment checkpoints.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                
                {/* Lesson Plan Sheet */}
                <div className="p-8 sm:p-12 rounded-[2rem] bg-white border-2 border-stone-300/80 shadow-[0_15px_40px_rgba(0,0,0,0.06)] space-y-8">
                  
                  {/* Header */}
                  <div className="border-b-2 border-stone-800 pb-6 text-center space-y-2">
                    <span className="font-mono text-base font-black tracking-[0.25em] text-[#E63956] uppercase block">
                      PROUDLY AFRIKAN SCHOOL • PEDAGOGICAL LESSON PLAN
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
                      {result.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 text-base font-mono text-stone-700 pt-2">
                      <span><strong>SUBJECT:</strong> {result.subject}</span>
                      <span>•</span>
                      <span><strong>GRADE:</strong> {result.gradeLevel}</span>
                      <span>•</span>
                      <span><strong>DURATION:</strong> {result.totalDurationMinutes} MIN</span>
                    </div>
                  </div>

                  {/* Objectives & Prereqs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                      <strong className="text-stone-900 font-mono text-base uppercase block">
                        Target Learning Objectives:
                      </strong>
                      <ul className="space-y-1.5 text-base text-stone-700 list-disc list-inside">
                        {(result.learningObjectives || []).map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                      <strong className="text-stone-900 font-mono text-base uppercase block">
                        Materials & Prerequisites:
                      </strong>
                      <ul className="space-y-1.5 text-base text-stone-700 list-disc list-inside">
                        {(result.materialsRequired || []).map((mat, i) => (
                          <li key={i}>{mat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Phases Table */}
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-xl text-stone-900 uppercase tracking-wide">
                      Instructional Timeline & Phases
                    </h3>

                    <div className="space-y-4">
                      {(result.phases || []).map((phase, pIdx) => (
                        <div key={pIdx} className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-xs">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                            <span className="font-display font-black text-lg text-stone-900 uppercase">
                              Phase {pIdx + 1}: {phase.phaseName}
                            </span>
                            <span className="font-mono text-base font-bold text-[#E63956] px-3 py-1 bg-pink-50 rounded-full">
                              {phase.durationMinutes} min
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                            <div className="space-y-1">
                              <strong className="text-stone-900 font-mono uppercase text-base block text-[#E63956]">
                                Teacher Facilitation:
                              </strong>
                              <p className="text-stone-700 leading-relaxed font-normal">
                                {phase.teacherActivity}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <strong className="text-stone-900 font-mono uppercase text-base block text-emerald-700">
                                Student Engagement:
                              </strong>
                              <p className="text-stone-700 leading-relaxed font-normal">
                                {phase.studentActivity}
                              </p>
                            </div>
                          </div>

                          {phase.assessmentStrategy && (
                            <div className="pt-2 border-t border-stone-100 text-base font-mono text-stone-600">
                              <strong>Formative Check:</strong> {phase.assessmentStrategy}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Homework & Reflection */}
                  {result.homeworkOrExtension && (
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <strong className="text-amber-950 font-mono text-base uppercase block">
                        Homework / Extension Task:
                      </strong>
                      <p className="text-amber-900 text-base leading-relaxed">
                        {result.homeworkOrExtension}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-dashed border-stone-300 flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
                <BookOpen className="w-12 h-12 text-stone-300" />
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-stone-700 uppercase">
                    No Lesson Plan Active
                  </h3>
                  <p className="text-base text-stone-500 max-w-sm">
                    Configure your pedagogical parameters or upload notes on the left to generate timed lesson plans.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
