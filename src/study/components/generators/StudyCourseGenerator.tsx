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
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Download
} from 'lucide-react';
import { CourseResult, StudyToolInput } from '../../types';
import { generateStudyTool } from '../../services/aiService';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface StudyCourseGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: CourseResult;
}

export const StudyCourseGenerator: React.FC<StudyCourseGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form Config
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [category, setCategory] = useState<string>(existingResource?.subject || 'AFRICAN HISTORY');
  const [gradeLevel, setGradeLevel] = useState<string>('Undergraduate / Professional');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Course generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseResult | null>(
    existingResource && Array.isArray(existingResource.modules) && existingResource.modules.length > 0
      ? existingResource
      : null
  );
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a course topic or upload curriculum notes.');
      return;
    }

    if (!canAfford('COURSE')) {
      setError('Insufficient credits for Course Curriculum generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setActiveModuleIdx(0);

    try {
      const input: StudyToolInput = {
        topic: topic.trim() || 'Comprehensive Curriculum',
        category,
        gradeLevel,
        sourceMaterial: sourceMaterial.trim() || undefined,
        fileName: sourceFileName || undefined,
      };

      const result = (await generateStudyTool('course', input)) as CourseResult;
      setCourse(result);
      await consumeCredits('COURSE', `Generated Course: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  };

  const handleCopy = () => {
    if (!course) return;
    let text = `# ${course.title}\nSubject: ${course.subject || category}\nDuration: ${course.durationWeeks || 6} Weeks\n\n`;
    text += `## Course Overview\n${course.courseOverview}\n\n`;
    if (course.learningOutcomes) {
      text += '## Learning Outcomes\n' + course.learningOutcomes.map((lo) => `- ${lo}`).join('\n') + '\n\n';
    }
    course.modules.forEach((mod) => {
      text += `### Module ${mod.moduleNumber}: ${mod.title}\n${mod.description}\n`;
      if (mod.keyTopics) text += 'Key Topics: ' + mod.keyTopics.join(', ') + '\n';
      if (mod.practicalProjectOrTask) text += `Practical Capstone: ${mod.practicalProjectOrTask}\n`;
      text += '\nLessons:\n';
      mod.lessons.forEach((l) => {
        text += `- ${l.lessonTitle} (${l.estimatedMinutes || 45} mins): ${l.summary || l.learningObjective}\n`;
      });
      text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!course) return;
    const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-course.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
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
              <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                STUDY TOOL 06
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
              COURSE CURRICULUM GENERATOR
            </h1>
          </div>
        </div>

        {course && Array.isArray(course.modules) && course.modules.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      );
    };
